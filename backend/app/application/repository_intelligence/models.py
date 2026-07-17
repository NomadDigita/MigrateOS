"""Stable contracts consumed by APIs, workers, and future migration agents."""

from datetime import datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AnalysisEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")
    sequence: int
    event_type: str
    message: str
    timestamp: datetime
    attributes: dict[str, str | int | float | bool] = Field(default_factory=dict)


class FileRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    path: str
    extension: str | None = None
    size_bytes: int
    language: str | None = None
    is_generated: bool = False


class DependencyRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    version: str | None = None
    ecosystem: str
    scope: Literal["production", "development", "unknown"] = "unknown"
    manifest_path: str
    outdated: bool | None = None
    deprecated: bool | None = None


class TechnologyRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")
    category: Literal[
        "language",
        "framework",
        "package_manager",
        "build_system",
        "database",
        "container",
        "cloud",
        "ci",
        "iac",
        "workspace",
    ]
    name: str
    confidence: float = Field(ge=0, le=1)
    evidence_paths: list[str]


class GraphNode(BaseModel):
    id: str
    kind: Literal["file", "module", "dependency", "entrypoint"]
    label: str
    path: str | None = None


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: Literal["imports", "declares", "contains", "entrypoint"]


class ArchitectureSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")
    entrypoints: list[str] = Field(default_factory=list)
    api_routes: list[str] = Field(default_factory=list)
    configuration_files: list[str] = Field(default_factory=list)
    environment_variables: list[str] = Field(default_factory=list)
    layers: list[str] = Field(default_factory=list)
    monorepo: bool = False
    workspace_managers: list[str] = Field(default_factory=list)


class RepositorySnapshot(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source: str
    root_path: str
    branch: str | None = None
    commit_sha: str | None = None
    captured_at: datetime


class RepositoryAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")
    snapshot: RepositorySnapshot
    files: list[FileRecord]
    technologies: list[TechnologyRecord]
    dependencies: list[DependencyRecord]
    architecture: ArchitectureSummary
    graph_nodes: list[GraphNode]
    graph_edges: list[GraphEdge]
    health_score: int = Field(ge=0, le=100)
    migration_opportunities: list[str]
    events: list[AnalysisEvent]


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    local_path: Path | None = None
    github_url: str | None = None
    branch: str | None = None

    def validate_source(self) -> None:
        if bool(self.local_path) == bool(self.github_url):
            raise ValueError("Provide exactly one of local_path or github_url.")
