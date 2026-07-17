"""Worker task entrypoints. They dispatch only known application commands."""

from uuid import UUID

import structlog

from backend.app.services.workflow import WorkflowService
from workers.celery_app import celery_app

logger = structlog.get_logger(__name__)


@celery_app.task(
    name="migrateos.discovery", bind=True, autoretry_for=(ConnectionError,), retry_backoff=True
)
def discover_repository(self: object, job_id: str) -> dict[str, str]:
    """Run persisted repository discovery from the durable job identifier."""

    normalized_job_id = UUID(job_id)
    logger.info("discovery_task_received", job_id=str(normalized_job_id))
    WorkflowService().run_discovery(normalized_job_id)
    return {"job_id": str(normalized_job_id), "status": "processed"}


@celery_app.task(
    name="migrateos.execution", bind=True, autoretry_for=(ConnectionError,), retry_backoff=True
)
def execute_migration(self: object, job_id: str) -> dict[str, str]:
    """Run the approved, persisted execution workflow from a durable job identifier."""

    normalized_job_id = UUID(job_id)
    logger.info("execution_task_received", job_id=str(normalized_job_id))
    WorkflowService().run_execution(normalized_job_id)
    return {"job_id": str(normalized_job_id), "status": "processed"}
