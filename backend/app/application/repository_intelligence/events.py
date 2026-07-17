"""Structured event collector shared by synchronous and worker execution."""

from datetime import UTC, datetime

from backend.app.application.repository_intelligence.models import AnalysisEvent


class EventCollector:
    """Captures ordered, redaction-safe events for UI streaming and audit storage."""

    def __init__(self) -> None:
        self._events: list[AnalysisEvent] = []

    def emit(self, event_type: str, message: str, **attributes: str | int | float | bool) -> None:
        self._events.append(
            AnalysisEvent(
                sequence=len(self._events) + 1,
                event_type=event_type,
                message=message,
                timestamp=datetime.now(UTC),
                attributes=attributes,
            )
        )

    @property
    def events(self) -> list[AnalysisEvent]:
        return list(self._events)
