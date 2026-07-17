"""Process-local WebSocket event hub; durable records are stored in Supabase by callers."""

import asyncio
from typing import Any

from fastapi import WebSocket


class LiveEventHub:
    def __init__(self) -> None: self._connections: set[WebSocket] = set()
    async def connect(self, socket: WebSocket) -> None: await socket.accept(); self._connections.add(socket)
    def disconnect(self, socket: WebSocket) -> None: self._connections.discard(socket)
    async def publish(self, event_type: str, payload: dict[str, Any]) -> None:
        stale: list[WebSocket] = []
        for socket in self._connections:
            try: await socket.send_json({"type": event_type, "payload": payload})
            except Exception: stale.append(socket)
        for socket in stale: self.disconnect(socket)

event_hub = LiveEventHub()
