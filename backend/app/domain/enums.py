"""Domain enums shared by policy, persistence adapters, and API schemas."""

from enum import StrEnum


class MigrationJobStatus(StrEnum):
    QUEUED = "queued"
    DISCOVERING = "discovering"
    ANALYZED = "analyzed"
    PLANNING = "planning"
    AWAITING_APPROVAL = "awaiting_approval"
    EXECUTING = "executing"
    VALIDATING = "validating"
    REPORTED = "reported"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    NEEDS_ATTENTION = "needs_attention"


class AgentRunStatus(StrEnum):
    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"
