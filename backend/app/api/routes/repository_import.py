"""Persisted repository import, analysis, and plan-generation workflow."""

import asyncio
from datetime import UTC, datetime
from urllib.parse import urlparse

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.application.migration_planning.planner import MigrationPlanner
from backend.app.application.repository_intelligence.models import AnalysisRequest
from backend.app.application.repository_intelligence.service import RepositoryIntelligenceService
from backend.app.core.config import get_settings
from backend.app.infrastructure.supabase.client import SupabaseClient
from backend.app.services.live_events import event_hub

router = APIRouter(prefix="/repositories", tags=["repository workflow"])


class ImportRequest(BaseModel):
    github_url: str
    branch: str | None = None


async def publish(client: SupabaseClient, project_id: str, event_type: str, payload: dict[str, object]) -> None:
    event = await client.emit(project_id, event_type, payload)
    await event_hub.publish(event_type, event)


@router.post("/import")
async def import_repository(request: ImportRequest) -> dict[str, object]:
    if not get_settings().supabase_configured:
        raise HTTPException(503, "Supabase is not configured.")
    parsed = urlparse(request.github_url)
    if parsed.scheme != "https" or parsed.hostname not in {"github.com", "www.github.com"}:
        raise HTTPException(422, "Only public HTTPS GitHub repository URLs are supported.")
    settings = get_settings()
    if not settings.default_project_id:
        raise HTTPException(503, "Repository onboarding is not configured.")
    client = SupabaseClient()
    try:
        project_id = settings.default_project_id
        repository = await client.insert("repositories", {"project_id": project_id, "provider": "github", "external_id": request.github_url, "default_branch": request.branch or "main"})
        await publish(client, project_id, "repository.imported", {"repository_id": repository["id"], "url": request.github_url})
        analysis = await asyncio.to_thread(RepositoryIntelligenceService().analyze, AnalysisRequest(github_url=request.github_url, branch=request.branch))
        snapshot = await client.insert("repository_snapshots", {"repository_id": repository["id"], "commit_sha": analysis.snapshot.commit_sha, "branch": analysis.snapshot.branch, "metadata": analysis.model_dump(mode="json")})
        await publish(client, project_id, "repository.snapshot_created", {"snapshot_id": snapshot["id"], "commit_sha": analysis.snapshot.commit_sha or ""})
        plan = MigrationPlanner().create(analysis)
        persisted_plan = await client.insert("migration_plans", {"snapshot_id": snapshot["id"], "status": "awaiting_approval", "version": 1, "summary": plan.model_dump(mode="json"), "risk_score": plan.risk_score})
        for step in plan.steps:
            await client.insert("migration_steps", {"plan_id": persisted_plan["id"], "step_key": step.id, "payload": step.model_dump(mode="json"), "priority": step.priority, "risk": step.risk.value, "required_approval": step.required_approval})
        await publish(client, project_id, "migration.plan_generated", {"plan_id": persisted_plan["id"], "risk_score": plan.risk_score})
        return {"repository": repository, "snapshot": snapshot, "analysis": analysis, "plan": persisted_plan}
    except Exception as error:
        raise HTTPException(502, "Repository workflow failed; inspect the live event stream.") from error
