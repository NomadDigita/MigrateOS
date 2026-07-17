"""Pluggable deterministic technology, manifest, architecture, and graph analyzers."""

import json
import re
from pathlib import Path

from backend.app.application.repository_intelligence.events import EventCollector
from backend.app.application.repository_intelligence.models import (
    ArchitectureSummary,
    DependencyRecord,
    FileRecord,
    GraphEdge,
    GraphNode,
    TechnologyRecord,
)


class TechnologyDetector:
    def analyze(
        self, root: Path, files: list[FileRecord], events: EventCollector
    ) -> list[TechnologyRecord]:
        paths = {file.path for file in files}
        findings: list[TechnologyRecord] = []
        for language in sorted({file.language for file in files if file.language}):
            evidence = [file.path for file in files if file.language == language][:5]
            findings.append(
                TechnologyRecord(
                    category="language", name=language, confidence=0.95, evidence_paths=evidence
                )
            )
        rules = {
            "package.json": ("package_manager", "npm"),
            "pnpm-lock.yaml": ("workspace", "pnpm workspaces"),
            "Dockerfile": ("container", "Docker"),
            "docker-compose.yml": ("container", "Docker Compose"),
            "compose.yaml": ("container", "Docker Compose"),
            ".github/workflows": ("ci", "GitHub Actions"),
            "terraform": ("iac", "Terraform"),
            "requirements.txt": ("package_manager", "pip"),
            "pyproject.toml": ("build_system", "Python packaging"),
            "Cargo.toml": ("package_manager", "Cargo"),
            "go.mod": ("package_manager", "Go modules"),
        }
        for marker, (category, name) in rules.items():
            evidence = [path for path in paths if path == marker or path.startswith(f"{marker}/")]
            if evidence:
                findings.append(
                    TechnologyRecord(
                        category=category, name=name, confidence=0.98, evidence_paths=evidence[:5]
                    )
                )
        package = root / "package.json"
        if package.is_file():
            content = package.read_text(encoding="utf-8", errors="ignore")
            for dependency, framework in {
                "next": "Next.js",
                "react": "React",
                "express": "Express",
                "fastify": "Fastify",
            }.items():
                if f'"{dependency}"' in content:
                    findings.append(
                        TechnologyRecord(
                            category="framework",
                            name=framework,
                            confidence=0.98,
                            evidence_paths=["package.json"],
                        )
                    )
        events.emit("technology.detected", "Technology stack detected", finding_count=len(findings))
        return findings


class DependencyAnalyzer:
    def analyze(self, root: Path, events: EventCollector) -> list[DependencyRecord]:
        dependencies: list[DependencyRecord] = []
        package = root / "package.json"
        if package.is_file():
            data = json.loads(package.read_text(encoding="utf-8"))
            for scope, key in (("production", "dependencies"), ("development", "devDependencies")):
                for name, version in data.get(key, {}).items():
                    dependencies.append(
                        DependencyRecord(
                            name=name,
                            version=str(version),
                            ecosystem="npm",
                            scope=scope,
                            manifest_path="package.json",
                        )
                    )
        requirements = root / "requirements.txt"
        if requirements.is_file():
            for line in requirements.read_text(encoding="utf-8", errors="ignore").splitlines():
                match = re.match(r"^([A-Za-z0-9_.-]+)(?:[=<>!~]+([^;\s]+))?", line.strip())
                if match:
                    dependencies.append(
                        DependencyRecord(
                            name=match.group(1),
                            version=match.group(2),
                            ecosystem="pypi",
                            scope="production",
                            manifest_path="requirements.txt",
                        )
                    )
        cargo = root / "Cargo.toml"
        if cargo.is_file():
            for name, version in re.findall(
                r"(?m)^([\w-]+)\s*=\s*\"([^\"]+)\"",
                cargo.read_text(encoding="utf-8", errors="ignore"),
            ):
                dependencies.append(
                    DependencyRecord(
                        name=name,
                        version=version,
                        ecosystem="cargo",
                        scope="production",
                        manifest_path="Cargo.toml",
                    )
                )
        events.emit(
            "dependency.graph_built",
            "Dependency inventory built",
            dependency_count=len(dependencies),
        )
        return sorted(dependencies, key=lambda dependency: (dependency.ecosystem, dependency.name))


class ArchitectureAnalyzer:
    def analyze(
        self, root: Path, files: list[FileRecord], events: EventCollector
    ) -> ArchitectureSummary:
        paths = [file.path for file in files]
        entrypoints = [
            path
            for path in paths
            if path.endswith(
                ("main.py", "main.ts", "main.tsx", "index.ts", "index.js", "manage.py")
            )
        ]
        configuration = [
            path
            for path in paths
            if Path(path).name
            in {
                "package.json",
                "pyproject.toml",
                "docker-compose.yml",
                "compose.yaml",
                "Dockerfile",
            }
        ]
        variables: set[str] = set()
        routes: list[str] = []
        for record in files:
            if (
                record.extension not in {".py", ".ts", ".tsx", ".js"}
                or record.size_bytes > 1_000_000
            ):
                continue
            content = (root / record.path).read_text(encoding="utf-8", errors="ignore")
            variables.update(
                re.findall(r"(?:os\.getenv\([\"']|process\.env\.)([A-Z][A-Z0-9_]+)", content)
            )
            routes.extend(
                re.findall(
                    r"(?:@\w+\.(?:get|post|put|delete)|router\.(?:get|post))\([\"']([^\"']+)",
                    content,
                )
            )
        layers = [
            name
            for name in ("api", "application", "domain", "infrastructure")
            if any(f"/{name}/" in f"/{path}" for path in paths)
        ]
        summary = ArchitectureSummary(
            entrypoints=sorted(entrypoints),
            api_routes=sorted(set(routes)),
            configuration_files=sorted(configuration),
            environment_variables=sorted(variables),
            layers=layers,
            monorepo=(
                (root / "pnpm-workspace.yaml").exists()
                or "workspaces"
                in (root / "package.json").read_text(encoding="utf-8", errors="ignore")
                if (root / "package.json").exists()
                else False
            ),
            workspace_managers=["pnpm"] if (root / "pnpm-lock.yaml").exists() else [],
        )
        events.emit(
            "architecture.analyzed",
            "Architecture summary generated",
            entrypoint_count=len(summary.entrypoints),
        )
        return summary


def build_graph(
    files: list[FileRecord],
    dependencies: list[DependencyRecord],
    architecture: ArchitectureSummary,
    events: EventCollector,
) -> tuple[list[GraphNode], list[GraphEdge]]:
    nodes = [
        GraphNode(
            id=f"file:{file.path}",
            kind="entrypoint" if file.path in architecture.entrypoints else "file",
            label=file.path,
            path=file.path,
        )
        for file in files
    ]
    nodes.extend(
        GraphNode(
            id=f"dependency:{dependency.ecosystem}:{dependency.name}",
            kind="dependency",
            label=dependency.name,
        )
        for dependency in dependencies
    )
    edges = [
        GraphEdge(
            source="file:package.json",
            target=f"dependency:npm:{dependency.name}",
            relationship="declares",
        )
        for dependency in dependencies
        if dependency.manifest_path == "package.json"
    ]
    events.emit(
        "knowledge_graph.built",
        "Repository knowledge graph built",
        node_count=len(nodes),
        edge_count=len(edges),
    )
    return nodes, edges
