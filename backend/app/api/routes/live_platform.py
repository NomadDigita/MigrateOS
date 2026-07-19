"""Live dashboard, SSE replay, and WebSocket delivery backed by PostgreSQL."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.responses import StreamingResponse
from sqlalchemy.exc import SQLAlchemyError

from backend.app.services.workflow import WorkflowNotFoundError, WorkflowService
from backend.app.api.dependencies import (
    AuthenticatedPrincipal,
    authenticate_access_token,
    require_authenticated_principal,
)

router = APIRouter(tags=["live platform"])


def _storage_unavailable(error: SQLAlchemyError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Workflow storage is unavailable. Retry after the database is ready.",
    )


@router.get("/platform/overview")
async def overview(
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
) -> dict[str, object]:
    """Return dashboard metrics, historical jobs, and durable recent activity."""

    try:
        return WorkflowService().platform_overview(principal)
    except SQLAlchemyError as error:
        raise _storage_unavailable(error) from error


@router.get("/migration-jobs/{job_id}")
async def migration_job(
    job_id: UUID,
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
) -> dict[str, object]:
    """Read a job's persisted plan, report, artifacts, agent history, and events."""

    try:
        return WorkflowService().job_detail(job_id, principal)
    except WorkflowNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except SQLAlchemyError as error:
        raise _storage_unavailable(error) from error


def _cursor(last_event_id: str | None, after_sequence: int) -> int:
    if last_event_id is None:
        return after_sequence
    try:
        return max(after_sequence, int(last_event_id))
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Last-Event-ID must be an event sequence number.",
        ) from error


@router.get("/migration-jobs/{job_id}/events")
async def event_stream(
    job_id: UUID,
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
    after_sequence: int = 0,
    last_event_id: Annotated[str | None, Header(alias="Last-Event-ID")] = None,
) -> StreamingResponse:
    """Stream persisted events and replay missed records after refresh/reconnect."""

    cursor = _cursor(last_event_id, after_sequence)
    service = WorkflowService()
    try:
        await asyncio.to_thread(service.events_after, job_id, cursor, principal)
    except WorkflowNotFoundError as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error)) from error
    except SQLAlchemyError as error:
        raise _storage_unavailable(error) from error

    async def stream() -> AsyncIterator[str]:
        nonlocal cursor
        while True:
            events = await asyncio.to_thread(service.events_after, job_id, cursor, principal)
            for event in events:
                cursor = int(event["sequence"])
                yield (
                    f"id: {cursor}\n"
                    f"event: {event['event_type']}\n"
                    f"data: {json.dumps(event, separators=(',', ':'))}\n\n"
                )
            yield ": keep-alive\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.websocket("/migration-jobs/{job_id}/events/ws")
async def websocket_event_stream(
    websocket: WebSocket, job_id: UUID, after_sequence: int = 0
) -> None:
    """Deliver the same durable event stream over WebSockets for interactive clients."""

    requested_protocols = [
        value.strip() for value in (websocket.headers.get("sec-websocket-protocol") or "").split(",")
    ]
    if len(requested_protocols) != 2 or requested_protocols[0] != "migrateos":
        await websocket.close(code=1008, reason="Authentication is required")
        return
    from fastapi.security import HTTPAuthorizationCredentials

    try:
        principal = await authenticate_access_token(
            HTTPAuthorizationCredentials(scheme="Bearer", credentials=requested_protocols[1])
        )
    except HTTPException:
        await websocket.close(code=1008, reason="Authentication is required")
        return

    service = WorkflowService()
    cursor = after_sequence
    await websocket.accept(subprotocol="migrateos")
    try:
        while True:
            events = await asyncio.to_thread(service.events_after, job_id, cursor, principal)
            for event in events:
                cursor = int(event["sequence"])
                await websocket.send_json(event)
            await asyncio.sleep(1)
    except WorkflowNotFoundError:
        await websocket.close(code=1008, reason="Migration job not found")
    except SQLAlchemyError:
        await websocket.close(code=1011, reason="Workflow storage unavailable")
    except WebSocketDisconnect:
        return
