"""Liveness endpoint."""

from datetime import UTC, datetime

from fastapi import APIRouter

from backend.app.api.schemas import HealthResponse
from backend.app.core.config import get_settings

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse, summary="Check API liveness")
def health_check() -> HealthResponse:
    """Return a dependency-free liveness signal for orchestrators."""

    settings = get_settings()
    return HealthResponse(
        status="ok",
        service="migrateos-api",
        environment=settings.environment,
        timestamp=datetime.now(UTC),
    )
