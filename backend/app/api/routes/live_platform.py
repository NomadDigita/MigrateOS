"""Live dashboard and WebSocket endpoints backed by Supabase data."""

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from backend.app.core.config import get_settings
from backend.app.infrastructure.supabase.client import SupabaseClient
from backend.app.services.live_events import event_hub

router = APIRouter(prefix="/platform", tags=["live platform"])

@router.get("/overview")
async def overview() -> dict[str, object]:
    if not get_settings().supabase_configured: raise HTTPException(503, "Supabase is not configured.")
    client = SupabaseClient()
    projects, repositories, plans, events = await __import__('asyncio').gather(client.select('projects', query={'select':'id,name,created_at','order':'created_at.desc','limit':'20'}), client.select('repositories', query={'select':'id,project_id,provider,external_id,default_branch,created_at','order':'created_at.desc','limit':'50'}), client.select('migration_plans', query={'select':'id,status,risk_score,created_at','order':'created_at.desc','limit':'50'}), client.select('events', query={'select':'id,event_type,payload,created_at','order':'created_at.desc','limit':'100'}))
    return {'projects': projects, 'repositories': repositories, 'plans': plans, 'events': events, 'metrics': {'project_count':len(projects),'repository_count':len(repositories),'plan_count':len(plans)}}

@router.websocket('/events')
async def event_stream(socket: WebSocket) -> None:
    await event_hub.connect(socket)
    try:
        while True: await socket.receive_text()
    except WebSocketDisconnect: event_hub.disconnect(socket)
