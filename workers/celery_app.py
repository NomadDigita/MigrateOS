"""Celery application configuration for durable MigrateOS worker tasks."""

from celery import Celery

from backend.app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "migrateos",
    broker=str(settings.redis_url),
    backend=str(settings.redis_url),
    include=["workers.tasks"],
)
celery_app.conf.update(
    task_default_queue="migrateos.default",
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)
