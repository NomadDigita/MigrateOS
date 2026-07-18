"""Workflow persistence and replay tests using a disposable relational database."""

from pathlib import Path
from uuid import UUID

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import backend.app.services.workflow as workflow_module
from backend.app.application.repository_intelligence.models import AnalysisRequest
from backend.app.application.repository_intelligence.service import RepositoryIntelligenceService
from backend.app.infrastructure.database import models  # noqa: F401
from backend.app.infrastructure.database.base import Base
from backend.app.services.workflow import WorkflowConflictError, WorkflowService


def _configure_disposable_store(monkeypatch) -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    monkeypatch.setattr(
        workflow_module,
        "SessionLocal",
        sessionmaker(bind=engine, expire_on_commit=False),
    )


def test_workflow_persists_plan_report_artifacts_and_replayable_events(
    tmp_path: Path, monkeypatch
) -> None:
    _configure_disposable_store(monkeypatch)
    (tmp_path / "package.json").write_text('{"dependencies":{"next":"15.2.4"}}')
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "main.ts").write_text("export const port = process.env.PORT;")

    class FixtureRepositoryIntelligence:
        def analyze(self, request: AnalysisRequest):
            assert request.github_url == "https://github.com/example/repository"
            return RepositoryIntelligenceService().analyze(AnalysisRequest(local_path=tmp_path))

    monkeypatch.setattr(
        workflow_module, "RepositoryIntelligenceService", FixtureRepositoryIntelligence
    )
    service = WorkflowService()
    created = service.create_import(
        github_url="https://github.com/example/repository",
        branch="main",
        idempotency_key="workflow-test",
    )
    job_id = UUID(created["job_id"])
    retried = service.create_import(
        github_url="https://github.com/example/repository",
        branch="main",
        idempotency_key="workflow-test",
    )
    assert retried["job_id"] == created["job_id"]
    with pytest.raises(WorkflowConflictError):
        service.create_import(
            github_url="https://github.com/example/repository",
            branch="release",
            idempotency_key="workflow-test",
        )

    service.run_discovery(job_id)
    detail = service.job_detail(job_id)

    assert detail["job"]["status"] == "awaiting_approval"
    assert detail["snapshot"]["summary"]["file_count"] == 2
    assert detail["plans"][0]["status"] == "awaiting_approval"
    assert detail["report"]["status"] == "awaiting_approval"
    assert len(detail["artifacts"]) >= 7
    assert [event["sequence"] for event in detail["events"]] == list(
        range(1, len(detail["events"]) + 1)
    )

    approved = service.approve_plan(
        job_id=job_id, plan_id=UUID(detail["plans"][0]["id"]), comment=None
    )
    assert approved["job_id"] == str(job_id)
    service.run_execution(job_id)

    completed = service.job_detail(job_id)
    assert completed["job"]["status"] == "needs_attention"
    assert completed["report"]["status"] == "needs_attention"
    assert {agent["status"] for agent in completed["agents"]} == {"succeeded", "blocked"}
    assert service.events_after(job_id, 0) == completed["events"]
