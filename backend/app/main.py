"""FastAPI composition root. Business behavior stays outside this module."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.routes import auth, health
from backend.app.core.config import get_settings
from backend.app.core.logging import configure_logging

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize and stop process-level resources in one observable lifecycle."""

    settings = get_settings()
    configure_logging(settings.log_level)
    logger.info("api_started", environment=settings.environment)
    yield
    logger.info("api_stopped")


def create_app() -> FastAPI:
    """Create the HTTP application with versioned routes and explicit CORS policy."""

    settings = get_settings()
    app = FastAPI(
        title="MigrateOS API",
        version="0.1.0",
        description="Control-plane API for governed software modernization.",
        lifespan=lifespan,
        openapi_url="/api/openapi.json",
        docs_url="/api/docs" if settings.is_development else None,
        redoc_url=None,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
    )
    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    return app


app = create_app()
