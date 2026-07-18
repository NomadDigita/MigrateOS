"""Pin every migration job to its exact immutable source snapshot.

Revision ID: 20260717_0003
Revises: 20260717_0002
Create Date: 2026-07-17
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260717_0003"
down_revision: str | None = "20260717_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "migration_jobs",
        sa.Column("source_snapshot_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_migration_jobs_source_snapshot_id_source_snapshots",
        "migration_jobs",
        "source_snapshots",
        ["source_snapshot_id"],
        ["id"],
    )
    op.create_index(
        "ix_migration_jobs_source_snapshot_id",
        "migration_jobs",
        ["source_snapshot_id"],
    )
    op.execute("""
        UPDATE migration_jobs AS job
        SET source_snapshot_id = snapshot.id
        FROM source_snapshots AS snapshot
        WHERE job.repository_id = snapshot.repository_id
          AND job.source_commit_sha = snapshot.commit_sha
        """)


def downgrade() -> None:
    op.drop_index("ix_migration_jobs_source_snapshot_id", table_name="migration_jobs")
    op.drop_constraint(
        "fk_migration_jobs_source_snapshot_id_source_snapshots",
        "migration_jobs",
        type_="foreignkey",
    )
    op.drop_column("migration_jobs", "source_snapshot_id")
