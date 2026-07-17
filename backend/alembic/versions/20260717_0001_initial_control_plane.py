"""Create initial MigrateOS control-plane tables.

Revision ID: 20260717_0001
Revises:
Create Date: 2026-07-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260717_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps() -> list[sa.Column[object]]:
    return [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    uuid_type = postgresql.UUID(as_uuid=True)
    op.create_table(
        "users",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        *_timestamps(),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_table(
        "projects",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_by_id", uuid_type, sa.ForeignKey("users.id"), nullable=False),
        *_timestamps(),
    )
    op.create_table(
        "repositories",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("project_id", uuid_type, sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("provider", sa.String(length=40), nullable=False),
        sa.Column("external_id", sa.String(length=255), nullable=False),
        sa.Column("default_branch", sa.String(length=255), nullable=False),
        sa.Column(
            "connection_status", sa.String(length=32), nullable=False, server_default="connected"
        ),
        *_timestamps(),
        sa.UniqueConstraint("project_id", "provider", "external_id"),
    )
    op.create_index("ix_repositories_project_id", "repositories", ["project_id"])
    op.create_table(
        "migration_jobs",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("project_id", uuid_type, sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("repository_id", uuid_type, sa.ForeignKey("repositories.id"), nullable=False),
        sa.Column("source_ref", sa.String(length=255), nullable=False),
        sa.Column("source_commit_sha", sa.String(length=64)),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="queued"),
        sa.Column("requested_target", sa.JSON(), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("correlation_id", uuid_type, nullable=False),
        *_timestamps(),
        sa.UniqueConstraint("project_id", "idempotency_key"),
    )
    op.create_index("ix_migration_jobs_project_id", "migration_jobs", ["project_id"])
    op.create_index(
        "ix_migration_jobs_repository_status", "migration_jobs", ["repository_id", "status"]
    )
    op.create_table(
        "migration_plans",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("plan", sa.JSON(), nullable=False),
        sa.Column("risk_assessment", sa.JSON(), nullable=False),
        *_timestamps(),
        sa.UniqueConstraint("job_id", "version"),
    )
    op.create_index("ix_migration_plans_job_id", "migration_plans", ["job_id"])
    op.create_table(
        "executions",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False),
        sa.Column("plan_id", uuid_type, sa.ForeignKey("migration_plans.id"), nullable=False),
        sa.Column("attempt", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("workspace_locator", sa.String(length=512)),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        *_timestamps(),
        sa.UniqueConstraint("job_id", "attempt"),
    )
    op.create_index("ix_executions_job_id", "executions", ["job_id"])
    op.create_table(
        "reports",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column(
            "job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False, unique=True
        ),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("summary", sa.JSON(), nullable=False),
        sa.Column("artifact_locator", sa.String(length=512)),
        *_timestamps(),
    )
    op.create_table(
        "agent_logs",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False),
        sa.Column("execution_id", uuid_type, sa.ForeignKey("executions.id")),
        sa.Column("agent_type", sa.String(length=80), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_agent_logs_job_id", "agent_logs", ["job_id"])
    op.create_index("ix_agent_logs_job_created", "agent_logs", ["job_id", "created_at"])


def downgrade() -> None:
    op.drop_table("agent_logs")
    op.drop_table("reports")
    op.drop_table("executions")
    op.drop_table("migration_plans")
    op.drop_table("migration_jobs")
    op.drop_table("repositories")
    op.drop_table("projects")
    op.drop_table("users")
