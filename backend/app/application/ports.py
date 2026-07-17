"""Ports implemented by infrastructure adapters, keeping use cases provider-neutral."""

from dataclasses import dataclass
from typing import Protocol
from uuid import UUID


@dataclass(frozen=True, slots=True)
class RepositoryReference:
    """A source-control repository identity without credentials."""

    provider: str
    external_id: str
    default_branch: str


class RepositoryGateway(Protocol):
    """Reads repository metadata and immutable source snapshots."""

    def resolve_snapshot(self, repository: RepositoryReference, source_ref: str) -> str:
        """Resolve a user ref to an immutable commit SHA."""


class JobQueue(Protocol):
    """Schedules durable work by application command, not arbitrary task name."""

    def enqueue_discovery(self, job_id: UUID) -> str:
        """Queue repository discovery and return a provider task reference."""


class ModernizationModel(Protocol):
    """Provides validated structured analysis; implementations never expose secrets."""

    def analyze(self, *, instruction: str, repository_context: str) -> dict[str, object]:
        """Return a structured result validated by the calling use case."""


class GitService(Protocol):
    """Owns isolated source-control operations in a restricted workspace."""

    def create_worktree(self, *, snapshot_sha: str, workspace_id: UUID) -> str:
        """Create a disposable worktree and return its opaque locator."""
