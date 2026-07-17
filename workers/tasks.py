"""Worker task entrypoints. They dispatch only known application commands."""

from uuid import UUID

import structlog

from workers.celery_app import celery_app

logger = structlog.get_logger(__name__)


@celery_app.task(name="migrateos.discovery", bind=True, autoretry_for=(ConnectionError,), retry_backoff=True)
def discover_repository(self: object, job_id: str) -> dict[str, str]:
    """Accept a validated discovery command at the asynchronous boundary."""

    normalized_job_id = UUID(job_id)
    logger.info("discovery_task_received", job_id=str(normalized_job_id))
    return {"job_id": str(normalized_job_id), "status": "accepted"}
