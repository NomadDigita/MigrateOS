"""Add durable workflow snapshots, artifacts, approvals, and replayable events.

Revision ID: 20260717_0002
Revises: 20260717_0001
Create Date: 2026-07-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260717_0002"
down_revision: str | None = "20260717_0001"
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
        "source_snapshots",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("repository_id", uuid_type, sa.ForeignKey("repositories.id"), nullable=False),
        sa.Column("commit_sha", sa.String(length=64)),
        sa.Column("tree_hash", sa.String(length=64)),
        sa.Column("metadata", sa.JSON(), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False),
        *_timestamps(),
        sa.UniqueConstraint("repository_id", "commit_sha"),
    )
    op.create_index("ix_source_snapshots_repository_id", "source_snapshots", ["repository_id"])
    op.create_table(
        "approvals",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("plan_id", uuid_type, sa.ForeignKey("migration_plans.id"), nullable=False),
        sa.Column("actor_id", uuid_type, sa.ForeignKey("users.id")),
        sa.Column("decision", sa.String(length=32), nullable=False),
        sa.Column("comment", sa.Text()),
        sa.Column("policy_version", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_approvals_plan_id", "approvals", ["plan_id"])
    op.create_table(
        "artifacts",
        sa.Column("id", uuid_type, primary_key=True),
        sa.Column("job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False),
        sa.Column("kind", sa.String(length=80), nullable=False),
        sa.Column("schema_version", sa.String(length=32), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("checksum", sa.String(length=64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index("ix_artifacts_job_id", "artifacts", ["job_id"])
    op.create_index("ix_artifacts_job_created", "artifacts", ["job_id", "created_at"])
    op.create_table(
        "job_events",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("job_id", uuid_type, sa.ForeignKey("migration_jobs.id"), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(length=80), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("job_id", "sequence"),
    )
    op.create_index("ix_job_events_job_id", "job_events", ["job_id"])
    op.create_index("ix_job_events_job_sequence", "job_events", ["job_id", "sequence"])


def downgrade() -> None:
    op.drop_table("job_events")
    op.drop_table("artifacts")
    op.drop_table("approvals")
    op.drop_table("source_snapshots")
