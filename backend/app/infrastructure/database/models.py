"""Relational models for the initial MigrateOS control-plane aggregate."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.domain.enums import AgentRunStatus, MigrationJobStatus
from backend.app.infrastructure.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    created_by_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Repository(Base):
    __tablename__ = "repositories"
    __table_args__ = (UniqueConstraint("project_id", "provider", "external_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(40), nullable=False)
    external_id: Mapped[str] = mapped_column(String(255), nullable=False)
    default_branch: Mapped[str] = mapped_column(String(255), nullable=False)
    connection_status: Mapped[str] = mapped_column(String(32), nullable=False, default="connected")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SourceSnapshot(Base):
    __tablename__ = "source_snapshots"
    __table_args__ = (UniqueConstraint("repository_id", "commit_sha"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("repositories.id"), nullable=False, index=True
    )
    commit_sha: Mapped[str | None] = mapped_column(String(64))
    tree_hash: Mapped[str | None] = mapped_column(String(64))
    analysis_metadata: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class MigrationJob(Base):
    __tablename__ = "migration_jobs"
    __table_args__ = (
        UniqueConstraint("project_id", "idempotency_key"),
        Index("ix_migration_jobs_repository_status", "repository_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id"), nullable=False, index=True
    )
    repository_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repositories.id"), nullable=False)
    source_ref: Mapped[str] = mapped_column(String(255), nullable=False)
    source_commit_sha: Mapped[str | None] = mapped_column(String(64))
    source_snapshot_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("source_snapshots.id"), index=True
    )
    status: Mapped[MigrationJobStatus] = mapped_column(
        String(32), nullable=False, default=MigrationJobStatus.QUEUED
    )
    requested_target: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(255), nullable=False)
    correlation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, default=uuid.uuid4
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class MigrationPlan(Base):
    __tablename__ = "migration_plans"
    __table_args__ = (UniqueConstraint("job_id", "version"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    plan: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    risk_assessment: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_plans.id"), nullable=False, index=True
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id"))
    decision: Mapped[str] = mapped_column(String(32), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    policy_version: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Execution(Base):
    __tablename__ = "executions"
    __table_args__ = (UniqueConstraint("job_id", "attempt"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), nullable=False, index=True
    )
    plan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("migration_plans.id"), nullable=False)
    attempt: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    workspace_locator: Mapped[str | None] = mapped_column(String(512))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), unique=True, nullable=False
    )
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    summary: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    artifact_locator: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Artifact(Base):
    __tablename__ = "artifacts"
    __table_args__ = (Index("ix_artifacts_job_created", "job_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), nullable=False, index=True
    )
    kind: Mapped[str] = mapped_column(String(80), nullable=False)
    schema_version: Mapped[str] = mapped_column(String(32), nullable=False)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class JobEvent(Base):
    __tablename__ = "job_events"
    __table_args__ = (
        UniqueConstraint("job_id", "sequence"),
        Index("ix_job_events_job_sequence", "job_id", "sequence"),
    )

    id: Mapped[int] = mapped_column(
        BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True
    )
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), nullable=False, index=True
    )
    sequence: Mapped[int] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(String(80), nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AgentLog(Base):
    __tablename__ = "agent_logs"
    __table_args__ = (Index("ix_agent_logs_job_created", "job_id", "created_at"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("migration_jobs.id"), nullable=False, index=True
    )
    execution_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("executions.id"))
    agent_type: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[AgentRunStatus] = mapped_column(String(32), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
