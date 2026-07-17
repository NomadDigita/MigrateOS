"""Minimal typed Supabase PostgREST adapter with no browser credential exposure."""

from typing import Any

import httpx

from backend.app.core.config import get_settings


class SupabaseClient:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.supabase_configured:
            raise RuntimeError("Supabase is not configured for this environment.")
        self._base_url = f"{settings.supabase_url.rstrip('/')}/rest/v1"
        self._headers = {"apikey": settings.supabase_service_role_key or "", "Authorization": f"Bearer {settings.supabase_service_role_key or ''}", "Content-Type": "application/json"}

    async def select(self, table: str, *, query: dict[str, str] | None = None) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(f"{self._base_url}/{table}", headers=self._headers, params=query or {})
            response.raise_for_status()
            return response.json()

    async def insert(self, table: str, payload: dict[str, Any]) -> dict[str, Any]:
        headers = {**self._headers, "Prefer": "return=representation"}
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(f"{self._base_url}/{table}", headers=headers, json=payload)
            response.raise_for_status()
            return response.json()[0]

    async def emit(self, project_id: str, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        existing = await self.select("events", query={"select": "sequence", "project_id": f"eq.{project_id}", "order": "sequence.desc", "limit": "1"})
        sequence = int(existing[0]["sequence"]) + 1 if existing else 1
        return await self.insert("events", {"project_id": project_id, "sequence": sequence, "event_type": event_type, "payload": payload})
