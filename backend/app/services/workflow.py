"""Durable repository workflow orchestration backed by PostgreSQL.

The workflow deliberately persists every externally visible transition before a
client can observe it. Repository content remains analysis input only; this
module stores structured summaries, evidence metadata, and redacted outcomes.
"""

from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import func, select

from backend.app.application.migration_planning.planner import MigrationPlanner
from backend.app.application.repository_intelligence.models import (
    AnalysisRequest,
    RepositoryAnalysis,
)
from backend.app.application.repository_intelligence.service import RepositoryIntelligenceService
from backend.app.core.config import get_settings
from backend.app.domain.enums import AgentRunStatus, MigrationJobStatus
from backend.app.infrastructure.database.models import (
    AgentLog,
    Approval,
    Artifact,
    Execution,
    JobEvent,
    MigrationJob,
    Project,
    Report,
    Repository,
    SourceSnapshot,
    User,
)
from backend.app.infrastructure.database.models import (
    MigrationPlan as PersistedMigrationPlan,
)
from backend.app.infrastructure.database.session import SessionLocal


class WorkflowNotFoundError(LookupError):
    """Raised when a requested durable workflow record does not exist."""


class WorkflowConflictError(ValueError):
    """Raised when a command conflicts with the durable workflow state."""


def _now() -> datetime:
    return datetime.now(UTC)


def _checksum(content: dict[str, Any]) -> str:
    encoded = json.dumps(content, sort_keys=True, separators=(",", ":"), default=str).encode()
    return hashlib.sha256(encoded).hexdigest()


def _event_payload(record: JobEvent) -> dict[str, Any]:
    return {
        "id": record.id,
        "job_id": str(record.job_id),
        "sequence": record.sequence,
        "event_type": record.type,
        "payload": record.payload,
        "created_at": record.created_at.isoformat(),
    }


def _analysis_payload(analysis: RepositoryAnalysis) -> dict[str, Any]:
    """Persist useful analysis data without retaining a disposable local path."""

    payload = analysis.model_dump(mode="json")
    payload["snapshot"].pop("root_path", None)
    return payload


def _analysis_summary(analysis: RepositoryAnalysis) -> dict[str, Any]:
    return {
        "health_score": analysis.health_score,
        "file_count": len(analysis.files),
        "dependency_count": len(analysis.dependencies),
        "technology_count": len(analysis.technologies),
        "migration_opportunity_count": len(analysis.migration_opportunities),
        "commit_sha": analysis.snapshot.commit_sha,
    }


class WorkflowService:
    """Coordinates the persisted import, planning, approval, and report flow."""

    def create_import(
        self,
        *,
        github_url: str,
        branch: str | None,
        idempotency_key: str,
    ) -> dict[str, str]:
        """Persist an import command before any repository analysis begins."""

        with SessionLocal.begin() as session:
            project = self._resolve_project(session)
            existing = session.scalar(
                select(MigrationJob).where(
                    MigrationJob.project_id == project.id,
                    MigrationJob.idempotency_key == idempotency_key,
                )
            )
            normalized_url = github_url.rstrip("/")
            if existing is not None:
                if existing.requested_target.get("github_url") != normalized_url:
                    raise WorkflowConflictError(
                        "The Idempotency-Key was already used for another repository."
                    )
                return {
                    "job_id": str(existing.id),
                    "repository_id": str(existing.repository_id),
                    "status": (
                        existing.status.value
                        if isinstance(existing.status, MigrationJobStatus)
                        else str(existing.status)
                    ),
                }

            repository = session.scalar(
                select(Repository).where(
                    Repository.project_id == project.id,
                    Repository.provider == "github",
                    Repository.external_id == normalized_url,
                )
            )
            now = _now()
            if repository is None:
                repository = Repository(
                    project_id=project.id,
                    provider="github",
                    external_id=normalized_url,
                    default_branch=branch or "HEAD",
                    connection_status="connected",
                    created_at=now,
                    updated_at=now,
                )
                session.add(repository)
                session.flush()

            job = MigrationJob(
                project_id=project.id,
                repository_id=repository.id,
                source_ref=branch or "HEAD",
                status=MigrationJobStatus.QUEUED,
                requested_target={"github_url": normalized_url, "branch": branch},
                idempotency_key=idempotency_key,
                created_at=now,
                updated_at=now,
            )
            session.add(job)
            session.flush()
            self._emit(
                session,
                job,
                "repository.imported",
                {"repository_id": str(repository.id), "provider": "github"},
            )
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.QUEUED.value},
            )
            return {
                "job_id": str(job.id),
                "repository_id": str(repository.id),
                "status": MigrationJobStatus.QUEUED.value,
            }

    def run_discovery(self, job_id: UUID) -> None:
        """Analyze a public repository and persist an approval-ready plan/report."""

        source = self._start_discovery(job_id)
        if source is None:
            return
        github_url, branch = source
        try:
            analysis = RepositoryIntelligenceService().analyze(
                AnalysisRequest(github_url=github_url, branch=branch)
            )
            plan = MigrationPlanner().create(analysis)
        except Exception:
            self._record_analysis_failure(job_id)
            return

        self._persist_analysis(job_id, analysis, plan.model_dump(mode="json"))

    def approve_plan(self, *, job_id: UUID, plan_id: UUID, comment: str | None) -> dict[str, str]:
        """Record an explicit approval and create a durable execution attempt."""

        with SessionLocal.begin() as session:
            job = self._job_or_raise(session, job_id)
            plan = session.get(PersistedMigrationPlan, plan_id)
            if plan is None or plan.job_id != job.id:
                raise WorkflowNotFoundError(
                    "The requested migration plan does not belong to this job."
                )
            if (
                plan.status != "awaiting_approval"
                or job.status != MigrationJobStatus.AWAITING_APPROVAL
            ):
                raise WorkflowConflictError("This plan is not awaiting approval.")

            now = _now()
            plan.status = "approved"
            plan.updated_at = now
            session.add(
                Approval(
                    plan_id=plan.id,
                    decision="approved",
                    comment=comment,
                    policy_version="1.0",
                    created_at=now,
                )
            )
            attempt = (
                int(
                    session.scalar(
                        select(func.count())
                        .select_from(Execution)
                        .where(Execution.job_id == job.id)
                    )
                    or 0
                )
                + 1
            )
            execution = Execution(
                job_id=job.id,
                plan_id=plan.id,
                attempt=attempt,
                status=MigrationJobStatus.QUEUED.value,
                started_at=None,
                ended_at=None,
                created_at=now,
                updated_at=now,
            )
            session.add(execution)
            job.status = MigrationJobStatus.EXECUTING
            job.updated_at = now
            self._emit(
                session,
                job,
                "plan.approved",
                {"plan_id": str(plan.id), "execution_id": str(execution.id)},
            )
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.EXECUTING.value},
            )
            return {"job_id": str(job.id), "execution_id": str(execution.id)}

    def run_execution(self, job_id: UUID) -> None:
        """Persist safe execution artifacts without claiming unperformed repository mutations.

        The current platform has no configured patch provider or allow-listed
        runner. It therefore records the explicit, reviewable blocked outcome
        required by the approval policy instead of fabricating patch/test/PR
        results.
        """

        with SessionLocal.begin() as session:
            job = self._job_or_raise(session, job_id)
            execution = session.scalar(
                select(Execution)
                .where(Execution.job_id == job.id)
                .order_by(Execution.attempt.desc())
                .limit(1)
            )
            if execution is None or execution.status != MigrationJobStatus.QUEUED.value:
                return
            now = _now()
            execution.status = MigrationJobStatus.EXECUTING.value
            execution.started_at = now
            execution.updated_at = now
            self._emit(
                session,
                job,
                "execution.started",
                {"execution_id": str(execution.id), "attempt": execution.attempt},
            )

            plan = session.get(PersistedMigrationPlan, execution.plan_id)
            plan_steps = plan.plan.get("steps", []) if plan is not None else []
            blocked_agents = (
                ("Refactor Agent", "No patch provider is configured for this approved plan."),
                (
                    "Test Generator Agent",
                    "No allow-listed test generator is configured for this repository.",
                ),
                (
                    "Validation Agent",
                    "No validation adapter was selected, so no repository command ran.",
                ),
                (
                    "Pull Request Agent",
                    "No explicit pull-request authorization or GitHub App write scope exists.",
                ),
            )
            for agent_type, message in blocked_agents:
                artifact = self._artifact(
                    session,
                    job,
                    kind=agent_type.lower().replace(" ", "_"),
                    content={
                        "agent_type": agent_type,
                        "status": AgentRunStatus.BLOCKED.value,
                        "reason": message,
                        "plan_step_count": len(plan_steps),
                    },
                )
                self._agent_log(
                    session,
                    job,
                    execution,
                    agent_type,
                    AgentRunStatus.BLOCKED,
                    message,
                    {"artifact_id": str(artifact.id)},
                )

            now = _now()
            execution.status = MigrationJobStatus.NEEDS_ATTENTION.value
            execution.ended_at = now
            execution.updated_at = now
            job.status = MigrationJobStatus.NEEDS_ATTENTION
            job.updated_at = now
            report = session.scalar(select(Report).where(Report.job_id == job.id))
            summary = self._execution_report_summary(plan_steps)
            if report is None:
                report = Report(
                    job_id=job.id,
                    status="needs_attention",
                    summary=summary,
                    created_at=now,
                    updated_at=now,
                )
                session.add(report)
            else:
                report.status = "needs_attention"
                report.summary = summary
                report.updated_at = now
            report_artifact = self._artifact(session, job, kind="migration_report", content=summary)
            report.artifact_locator = str(report_artifact.id)
            self._emit(
                session,
                job,
                "validation.completed",
                {"status": "not_run", "reason": "No allow-listed validation adapter was selected."},
            )
            self._emit(session, job, "report.ready", {"report_id": str(report.id)})
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.NEEDS_ATTENTION.value},
            )

    def platform_overview(self) -> dict[str, Any]:
        """Return a dashboard projection sourced only from persisted workflow data."""

        with SessionLocal() as session:
            projects = session.scalars(
                select(Project).order_by(Project.created_at.desc()).limit(20)
            ).all()
            repositories = session.scalars(
                select(Repository).order_by(Repository.created_at.desc()).limit(50)
            ).all()
            jobs = session.scalars(
                select(MigrationJob).order_by(MigrationJob.created_at.desc()).limit(50)
            ).all()
            plans = session.scalars(
                select(PersistedMigrationPlan)
                .order_by(PersistedMigrationPlan.created_at.desc())
                .limit(50)
            ).all()
            events = session.scalars(
                select(JobEvent)
                .order_by(JobEvent.created_at.desc(), JobEvent.sequence.desc())
                .limit(100)
            ).all()
            active_count = sum(
                job.status
                in {
                    MigrationJobStatus.QUEUED,
                    MigrationJobStatus.DISCOVERING,
                    MigrationJobStatus.PLANNING,
                    MigrationJobStatus.EXECUTING,
                    MigrationJobStatus.VALIDATING,
                }
                for job in jobs
            )
            return {
                "projects": [
                    {
                        "id": str(project.id),
                        "name": project.name,
                        "created_at": project.created_at.isoformat(),
                    }
                    for project in projects
                ],
                "repositories": [
                    {
                        "id": str(repository.id),
                        "project_id": str(repository.project_id),
                        "provider": repository.provider,
                        "external_id": repository.external_id,
                        "default_branch": repository.default_branch,
                        "connection_status": repository.connection_status,
                        "created_at": repository.created_at.isoformat(),
                    }
                    for repository in repositories
                ],
                "jobs": [self._job_payload(job) for job in jobs],
                "plans": [
                    {
                        "id": str(plan.id),
                        "job_id": str(plan.job_id),
                        "status": plan.status,
                        "risk_score": plan.risk_assessment.get("risk_score", 0),
                        "created_at": plan.created_at.isoformat(),
                    }
                    for plan in plans
                ],
                "events": [_event_payload(event) for event in events],
                "metrics": {
                    "project_count": len(projects),
                    "repository_count": len(repositories),
                    "job_count": len(jobs),
                    "plan_count": len(plans),
                    "active_job_count": active_count,
                },
            }

    def job_detail(self, job_id: UUID) -> dict[str, Any]:
        """Return the durable history needed by the live job workspace."""

        with SessionLocal() as session:
            job = self._job_or_raise(session, job_id)
            repository = session.get(Repository, job.repository_id)
            snapshot = (
                session.get(SourceSnapshot, job.source_snapshot_id)
                if job.source_snapshot_id is not None
                else None
            )
            if snapshot is None and job.source_commit_sha is not None:
                snapshot = session.scalar(
                    select(SourceSnapshot).where(
                        SourceSnapshot.repository_id == job.repository_id,
                        SourceSnapshot.commit_sha == job.source_commit_sha,
                    )
                )
            plans = session.scalars(
                select(PersistedMigrationPlan)
                .where(PersistedMigrationPlan.job_id == job.id)
                .order_by(PersistedMigrationPlan.version.desc())
            ).all()
            report = session.scalar(select(Report).where(Report.job_id == job.id))
            agents = session.scalars(
                select(AgentLog)
                .where(AgentLog.job_id == job.id)
                .order_by(AgentLog.created_at.asc())
            ).all()
            artifacts = session.scalars(
                select(Artifact)
                .where(Artifact.job_id == job.id)
                .order_by(Artifact.created_at.asc())
            ).all()
            events = session.scalars(
                select(JobEvent).where(JobEvent.job_id == job.id).order_by(JobEvent.sequence.asc())
            ).all()
            return {
                "job": self._job_payload(job),
                "repository": (
                    None
                    if repository is None
                    else {
                        "id": str(repository.id),
                        "external_id": repository.external_id,
                        "provider": repository.provider,
                        "default_branch": repository.default_branch,
                    }
                ),
                "snapshot": (
                    None
                    if snapshot is None
                    else {
                        "id": str(snapshot.id),
                        "commit_sha": snapshot.commit_sha,
                        "tree_hash": snapshot.tree_hash,
                        "captured_at": snapshot.captured_at.isoformat(),
                        "summary": _analysis_summary_from_metadata(snapshot.analysis_metadata),
                    }
                ),
                "plans": [
                    {
                        "id": str(plan.id),
                        "status": plan.status,
                        "version": plan.version,
                        "plan": plan.plan,
                        "risk_assessment": plan.risk_assessment,
                        "created_at": plan.created_at.isoformat(),
                    }
                    for plan in plans
                ],
                "report": (
                    None
                    if report is None
                    else {
                        "id": str(report.id),
                        "status": report.status,
                        "summary": report.summary,
                        "artifact_id": report.artifact_locator,
                        "created_at": report.created_at.isoformat(),
                    }
                ),
                "agents": [
                    {
                        "id": str(agent.id),
                        "agent_type": agent.agent_type,
                        "status": agent.status,
                        "message": agent.message,
                        "payload": agent.payload,
                        "created_at": agent.created_at.isoformat(),
                    }
                    for agent in agents
                ],
                "artifacts": [
                    {
                        "id": str(artifact.id),
                        "kind": artifact.kind,
                        "checksum": artifact.checksum,
                        "created_at": artifact.created_at.isoformat(),
                    }
                    for artifact in artifacts
                ],
                "events": [_event_payload(event) for event in events],
            }

    def events_after(self, job_id: UUID, after_sequence: int) -> list[dict[str, Any]]:
        """Load durable events for SSE/WebSocket replay and polling."""

        with SessionLocal() as session:
            self._job_or_raise(session, job_id)
            events = session.scalars(
                select(JobEvent)
                .where(JobEvent.job_id == job_id, JobEvent.sequence > after_sequence)
                .order_by(JobEvent.sequence.asc())
            ).all()
            return [_event_payload(event) for event in events]

    def _resolve_project(self, session: Any) -> Project:
        configured_project_id = get_settings().default_project_id
        if configured_project_id:
            try:
                project = session.get(Project, UUID(configured_project_id))
            except ValueError as error:
                raise WorkflowConflictError(
                    "MIGRATEOS_DEFAULT_PROJECT_ID is not a valid UUID."
                ) from error
            if project is None:
                raise WorkflowNotFoundError("The configured default project does not exist.")
            return project

        existing = session.scalar(select(Project).order_by(Project.created_at.asc()).limit(1))
        if existing is not None:
            return existing
        now = _now()
        system_user = User(
            email="workflow-owner@migrateos.local",
            display_name="MigrateOS workflow owner",
            created_at=now,
            updated_at=now,
        )
        session.add(system_user)
        session.flush()
        project = Project(
            name="MigrateOS workspace",
            created_by_id=system_user.id,
            created_at=now,
            updated_at=now,
        )
        session.add(project)
        session.flush()
        return project

    def _start_discovery(self, job_id: UUID) -> tuple[str, str | None] | None:
        with SessionLocal.begin() as session:
            job = self._job_or_raise(session, job_id)
            if job.status != MigrationJobStatus.QUEUED:
                return None
            job.status = MigrationJobStatus.DISCOVERING
            job.updated_at = _now()
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.DISCOVERING.value},
            )
            return str(job.requested_target["github_url"]), job.requested_target.get("branch")

    def _persist_analysis(
        self,
        job_id: UUID,
        analysis: RepositoryAnalysis,
        plan_payload: dict[str, Any],
    ) -> None:
        with SessionLocal.begin() as session:
            job = self._job_or_raise(session, job_id)
            if job.status != MigrationJobStatus.DISCOVERING:
                return
            repository = session.get(Repository, job.repository_id)
            if repository is None:
                raise WorkflowNotFoundError("The repository for this job no longer exists.")
            now = _now()
            analysis_payload = _analysis_payload(analysis)
            snapshot = None
            if analysis.snapshot.commit_sha is not None:
                snapshot = session.scalar(
                    select(SourceSnapshot).where(
                        SourceSnapshot.repository_id == repository.id,
                        SourceSnapshot.commit_sha == analysis.snapshot.commit_sha,
                    )
                )
            if snapshot is None:
                snapshot = SourceSnapshot(
                    repository_id=repository.id,
                    commit_sha=analysis.snapshot.commit_sha,
                    tree_hash=_checksum({"files": [file.path for file in analysis.files]}),
                    analysis_metadata=analysis_payload,
                    captured_at=analysis.snapshot.captured_at,
                    created_at=now,
                    updated_at=now,
                )
                session.add(snapshot)
                session.flush()
            job.source_commit_sha = analysis.snapshot.commit_sha
            job.source_snapshot_id = snapshot.id
            job.status = MigrationJobStatus.PLANNING
            job.updated_at = now
            self._artifact(session, job, kind="repository_analysis", content=analysis_payload)
            self._emit(
                session,
                job,
                "repository.snapshot_created",
                {"commit_sha": analysis.snapshot.commit_sha or "unavailable"},
            )
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.PLANNING.value},
            )

            plan = PersistedMigrationPlan(
                job_id=job.id,
                version=1,
                status="awaiting_approval",
                plan=plan_payload,
                risk_assessment={
                    "overall_risk": plan_payload["overall_risk"],
                    "risk_score": plan_payload["risk_score"],
                    "confidence": plan_payload["confidence"],
                },
                created_at=now,
                updated_at=now,
            )
            session.add(plan)
            session.flush()
            self._artifact(session, job, kind="migration_plan", content=plan_payload)
            self._record_analysis_agents(session, job, analysis, plan.id)
            job.status = MigrationJobStatus.AWAITING_APPROVAL
            job.updated_at = _now()
            report_summary = self._planning_report_summary(analysis, plan_payload)
            report_artifact = self._artifact(
                session, job, kind="migration_report", content=report_summary
            )
            report = Report(
                job_id=job.id,
                status="awaiting_approval",
                summary=report_summary,
                artifact_locator=str(report_artifact.id),
                created_at=now,
                updated_at=now,
            )
            session.add(report)
            self._emit(
                session,
                job,
                "migration.plan_generated",
                {"plan_id": str(plan.id), "risk_score": plan_payload["risk_score"]},
            )
            self._emit(session, job, "report.ready", {"report_id": str(report.id)})
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.AWAITING_APPROVAL.value},
            )

    def _record_analysis_failure(self, job_id: UUID) -> None:
        with SessionLocal.begin() as session:
            job = self._job_or_raise(session, job_id)
            if job.status not in {MigrationJobStatus.DISCOVERING, MigrationJobStatus.PLANNING}:
                return
            now = _now()
            job.status = MigrationJobStatus.FAILED
            job.updated_at = now
            summary = {
                "outcome": "analysis_failed",
                "next_action": (
                    "Confirm the GitHub repository is public and reachable, then "
                    "start a new import."
                ),
            }
            artifact = self._artifact(session, job, kind="migration_report", content=summary)
            report = session.scalar(select(Report).where(Report.job_id == job.id))
            if report is None:
                session.add(
                    Report(
                        job_id=job.id,
                        status="failed",
                        summary=summary,
                        artifact_locator=str(artifact.id),
                        created_at=now,
                        updated_at=now,
                    )
                )
            self._emit(session, job, "job.failed", {"stage": "repository_analysis"})
            self._emit(
                session,
                job,
                "job.status_changed",
                {"status": MigrationJobStatus.FAILED.value},
            )

    def _record_analysis_agents(
        self,
        session: Any,
        job: MigrationJob,
        analysis: RepositoryAnalysis,
        plan_id: UUID,
    ) -> None:
        agent_artifacts = (
            (
                "Planner Agent",
                "Created an approval-ready migration plan from persisted repository evidence.",
                {"plan_id": str(plan_id), "step_count": len(analysis.dependencies)},
            ),
            (
                "Dependency Agent",
                "Recorded the dependency inventory from repository manifests.",
                {"dependency_count": len(analysis.dependencies)},
            ),
            (
                "Framework Agent",
                "Recorded detected languages, frameworks, and build tools.",
                {"technology_count": len(analysis.technologies)},
            ),
            (
                "Configuration Agent",
                "Recorded configuration files and environment-variable references.",
                {"configuration_file_count": len(analysis.architecture.configuration_files)},
            ),
            (
                "Security Agent",
                "Applied repository-content and command-execution safety policy to the analysis.",
                {
                    "repository_content_treated_as_untrusted": True,
                    "repository_commands_executed": False,
                },
            ),
        )
        for agent_type, message, payload in agent_artifacts:
            artifact = self._artifact(
                session,
                job,
                kind=agent_type.lower().replace(" ", "_"),
                content={"agent_type": agent_type, "status": "succeeded", **payload},
            )
            self._agent_log(
                session,
                job,
                None,
                agent_type,
                AgentRunStatus.SUCCEEDED,
                message,
                {"artifact_id": str(artifact.id)},
            )

    @staticmethod
    def _planning_report_summary(
        analysis: RepositoryAnalysis,
        plan_payload: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "outcome": "plan_ready_for_review",
            "summary": plan_payload["executive_summary"],
            "risk_score": plan_payload["risk_score"],
            "overall_risk": plan_payload["overall_risk"],
            "analysis": _analysis_summary(analysis),
            "manual_actions": plan_payload["human_tasks"],
            "validation": {
                "status": "not_started",
                "reason": "Validation is available only after explicit plan approval.",
            },
            "pull_request": {
                "status": "not_requested",
                "reason": "Pull-request creation requires explicit authorization after validation.",
            },
        }

    @staticmethod
    def _execution_report_summary(plan_steps: list[dict[str, Any]]) -> dict[str, Any]:
        return {
            "outcome": "needs_attention",
            "summary": (
                "The approved plan was preserved, but no patch, test, validation, "
                "or pull request was fabricated."
            ),
            "plan_step_count": len(plan_steps),
            "validation": {
                "status": "not_run",
                "reason": "No allow-listed validation adapter was configured for this repository.",
            },
            "pull_request": {
                "status": "not_created",
                "reason": "No explicit GitHub App authorization was recorded.",
            },
            "next_action": (
                "Configure a scoped patch provider and validation adapter, then create a new "
                "execution attempt."
            ),
        }

    @staticmethod
    def _job_payload(job: MigrationJob) -> dict[str, Any]:
        return {
            "id": str(job.id),
            "repository_id": str(job.repository_id),
            "status": (
                job.status.value if isinstance(job.status, MigrationJobStatus) else str(job.status)
            ),
            "source_ref": job.source_ref,
            "source_commit_sha": job.source_commit_sha,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
        }

    @staticmethod
    def _job_or_raise(session: Any, job_id: UUID) -> MigrationJob:
        job = session.get(MigrationJob, job_id)
        if job is None:
            raise WorkflowNotFoundError("The migration job does not exist.")
        return job

    @staticmethod
    def _emit(
        session: Any, job: MigrationJob, event_type: str, payload: dict[str, Any]
    ) -> JobEvent:
        next_sequence = (
            int(
                session.scalar(
                    select(func.coalesce(func.max(JobEvent.sequence), 0)).where(
                        JobEvent.job_id == job.id
                    )
                )
                or 0
            )
            + 1
        )
        event = JobEvent(
            job_id=job.id,
            sequence=next_sequence,
            type=event_type,
            payload=payload,
            created_at=_now(),
        )
        session.add(event)
        session.flush()
        return event

    @staticmethod
    def _artifact(
        session: Any, job: MigrationJob, *, kind: str, content: dict[str, Any]
    ) -> Artifact:
        artifact = Artifact(
            job_id=job.id,
            kind=kind,
            schema_version="1.0",
            content=content,
            checksum=_checksum(content),
            created_at=_now(),
        )
        session.add(artifact)
        session.flush()
        return artifact

    def _agent_log(
        self,
        session: Any,
        job: MigrationJob,
        execution: Execution | None,
        agent_type: str,
        status: AgentRunStatus,
        message: str,
        payload: dict[str, Any],
    ) -> None:
        session.add(
            AgentLog(
                job_id=job.id,
                execution_id=None if execution is None else execution.id,
                agent_type=agent_type,
                status=status,
                message=message,
                payload=payload,
                created_at=_now(),
            )
        )
        self._emit(
            session,
            job,
            "agent.status_changed",
            {"agent_type": agent_type, "status": status.value},
        )


def _analysis_summary_from_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    return {
        "health_score": metadata.get("health_score"),
        "file_count": len(metadata.get("files", [])),
        "dependency_count": len(metadata.get("dependencies", [])),
        "technology_count": len(metadata.get("technologies", [])),
        "migration_opportunity_count": len(metadata.get("migration_opportunities", [])),
    }
