"""Repository onboarding commands for the durable modernization workflow."""

from __future__ import annotations

import secrets
from typing import Annotated
from urllib.parse import urlparse
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.exc import SQLAlchemyError

from backend.app.core.config import get_settings
from backend.app.api.dependencies import AuthenticatedPrincipal, require_authenticated_principal
from backend.app.services.workflow import (
    WorkflowConflictError,
    WorkflowNotFoundError,
    WorkflowService,
)

router = APIRouter(prefix="/repositories", tags=["repository workflow"])


class ImportRequest(BaseModel):
    """Public GitHub repository reference accepted by the onboarding flow."""

    model_config = ConfigDict(extra="forbid")

    github_url: str = Field(min_length=20, max_length=2048)
    branch: str | None = Field(default=None, min_length=1, max_length=255)


class ImportResponse(BaseModel):
    """The persisted job identity clients use for live status and replay."""

    model_config = ConfigDict(extra="forbid")

    job_id: UUID
    repository_id: UUID
    status: str


class ApprovalRequest(BaseModel):
    """Explicit plan approval comment retained in the audit record."""

    model_config = ConfigDict(extra="forbid")

    comment: str | None = Field(default=None, max_length=2_000)


def _validate_github_url(value: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme != "https" or parsed.hostname not in {"github.com", "www.github.com"}:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only public HTTPS GitHub repository URLs are supported.",
        )
    segments = [segment for segment in parsed.path.split("/") if segment]
    if len(segments) != 2 or parsed.query or parsed.fragment:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide a repository URL in the form https://github.com/owner/repository.",
        )
    return f"https://github.com/{segments[0]}/{segments[1].removesuffix('.git')}"


def _dispatch(background_tasks: BackgroundTasks, *, task_name: str, job_id: UUID) -> None:
    """Use Celery only when it is explicitly deployed; otherwise use an in-process task."""

    settings = get_settings()
    if settings.workflow_dispatch == "celery":
        from workers.celery_app import celery_app

        celery_app.send_task(task_name, args=[str(job_id)])
        return
    service = WorkflowService()
    if task_name == "migrateos.discovery":
        background_tasks.add_task(service.run_discovery, job_id)
    else:
        background_tasks.add_task(service.run_execution, job_id)


@router.post("/import", response_model=ImportResponse, status_code=status.HTTP_202_ACCEPTED)
async def import_repository(
    request: ImportRequest,
    background_tasks: BackgroundTasks,
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
    idempotency_key: Annotated[str | None, Header(alias="Idempotency-Key")] = None,
) -> ImportResponse:
    """Persist an import command and begin repository intelligence asynchronously."""

    normalized_url = _validate_github_url(request.github_url)
    try:
        result = WorkflowService().create_import(
            github_url=normalized_url,
            branch=request.branch,
            idempotency_key=idempotency_key or secrets.token_urlsafe(24),
            principal=principal,
        )
    except WorkflowConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except WorkflowNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)
        ) from error
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Workflow storage is unavailable. Retry after the database is ready.",
        ) from error

    job_id = UUID(result["job_id"])
    _dispatch(background_tasks, task_name="migrateos.discovery", job_id=job_id)
    return ImportResponse(
        job_id=job_id,
        repository_id=UUID(result["repository_id"]),
        status=result["status"],
    )


approval_router = APIRouter(prefix="/migration-jobs", tags=["migration workflow"])


@approval_router.post("/{job_id}/plans/{plan_id}/approval", status_code=status.HTTP_202_ACCEPTED)
async def approve_plan(
    job_id: UUID,
    plan_id: UUID,
    request: ApprovalRequest,
    background_tasks: BackgroundTasks,
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
) -> dict[str, str]:
    """Record user approval before scheduling the constrained execution stage."""

    try:
        result = WorkflowService().approve_plan(
            job_id=job_id, plan_id=plan_id, comment=request.comment, principal=principal
        )
    except WorkflowNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except WorkflowConflictError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error)) from error
    except SQLAlchemyError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Workflow storage is unavailable. Retry after the database is ready.",
        ) from error
    _dispatch(background_tasks, task_name="migrateos.execution", job_id=job_id)
    return result
