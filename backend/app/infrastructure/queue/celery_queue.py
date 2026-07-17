"""Celery adapter exposing application-level queue commands."""

from uuid import UUID

from celery import Celery

from backend.app.application.ports import JobQueue


class CeleryJobQueue(JobQueue):
    """Queues named, typed workflow tasks without exposing arbitrary task execution."""

    def __init__(self, celery_app: Celery) -> None:
        self._celery_app = celery_app

    def enqueue_discovery(self, job_id: UUID) -> str:
        result = self._celery_app.send_task("migrateos.discovery", args=[str(job_id)])
        return result.id
