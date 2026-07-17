"""Repository import and deterministic intelligence orchestration."""

from datetime import UTC, datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urlparse

from git import Repo

from backend.app.application.repository_intelligence.analyzers import (
    ArchitectureAnalyzer,
    DependencyAnalyzer,
    TechnologyDetector,
    build_graph,
)
from backend.app.application.repository_intelligence.events import EventCollector
from backend.app.application.repository_intelligence.models import (
    AnalysisRequest,
    RepositoryAnalysis,
    RepositorySnapshot,
)
from backend.app.application.repository_intelligence.scanner import RepositoryScanner


class RepositoryIntelligenceService:
    """Coordinates bounded repository analysis without executing repository code."""

    def analyze(self, request: AnalysisRequest) -> RepositoryAnalysis:
        request.validate_source()
        events = EventCollector()
        with self._materialize(request, events) as root:
            snapshot = self._snapshot(root, request, events)
            files = RepositoryScanner().scan(root, events)
            technologies = TechnologyDetector().analyze(root, files, events)
            dependencies = DependencyAnalyzer().analyze(root, events)
            architecture = ArchitectureAnalyzer().analyze(root, files, events)
            nodes, edges = build_graph(files, dependencies, architecture, events)
            opportunities = self._opportunities(technologies, dependencies)
            return RepositoryAnalysis(
                snapshot=snapshot,
                files=files,
                technologies=technologies,
                dependencies=dependencies,
                architecture=architecture,
                graph_nodes=nodes,
                graph_edges=edges,
                health_score=max(0, 100 - min(60, len(opportunities) * 8)),
                migration_opportunities=opportunities,
                events=events.events,
            )

    def _materialize(self, request: AnalysisRequest, events: EventCollector):
        if request.local_path:
            root = request.local_path.resolve()
            if not root.is_dir():
                raise ValueError("local_path must be an existing directory.")
            events.emit("repository.imported", "Local repository accepted", source="local")
            from contextlib import nullcontext

            return nullcontext(root)
        parsed = urlparse(request.github_url or "")
        if parsed.scheme != "https" or parsed.hostname not in {"github.com", "www.github.com"}:
            raise ValueError("Only public HTTPS GitHub URLs are supported.")
        temporary = TemporaryDirectory(prefix="migrateos-analysis-")
        destination = Path(temporary.name) / "repository"
        Repo.clone_from(
            request.github_url,
            destination,
            branch=request.branch,
            depth=1,
            single_branch=bool(request.branch),
        )
        events.emit("repository.imported", "Public GitHub repository cloned", source="github")
        from contextlib import nullcontext

        return (
            nullcontext(destination, enter_result=destination)
            if False
            else TemporaryContext(temporary, destination)
        )

    def _snapshot(
        self, root: Path, request: AnalysisRequest, events: EventCollector
    ) -> RepositorySnapshot:
        commit_sha = None
        try:
            commit_sha = Repo(root).head.commit.hexsha
        except Exception:
            events.emit(
                "repository.snapshot_unavailable", "No Git commit available for local directory"
            )
        snapshot = RepositorySnapshot(
            source=request.github_url or str(request.local_path),
            root_path=str(root),
            branch=request.branch,
            commit_sha=commit_sha,
            captured_at=datetime.now(UTC),
        )
        events.emit(
            "repository.snapshot_created",
            "Repository snapshot metadata recorded",
            commit_sha=commit_sha or "unavailable",
        )
        return snapshot

    @staticmethod
    def _opportunities(technologies, dependencies) -> list[str]:
        opportunities = [
            f"Review {dependency.name} {dependency.version or 'unversioned'}"
            for dependency in dependencies
            if dependency.version and dependency.version.startswith(("^0.", "~0."))
        ]
        if any(technology.name == "Next.js" for technology in technologies):
            opportunities.append("Assess Next.js runtime and framework upgrade path")
        return opportunities


class TemporaryContext:
    def __init__(self, temporary: TemporaryDirectory[str], root: Path) -> None:
        self.temporary, self.root = temporary, root

    def __enter__(self) -> Path:
        return self.root

    def __exit__(self, *_: object) -> None:
        self.temporary.cleanup()
