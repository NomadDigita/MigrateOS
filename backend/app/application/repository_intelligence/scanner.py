"""Memory-bounded filesystem scanner with deterministic ignore policy."""

import fnmatch
from pathlib import Path

from backend.app.application.repository_intelligence.events import EventCollector
from backend.app.application.repository_intelligence.models import FileRecord

IGNORED_DIRECTORIES = {
    ".git",
    "node_modules",
    "vendor",
    "dist",
    "build",
    "coverage",
    ".cache",
    "__pycache__",
    ".next",
}
LANGUAGES = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".c": "C",
    ".cpp": "C++",
}


def _ignore_patterns(root: Path) -> list[str]:
    ignore_file = root / ".gitignore"
    if not ignore_file.is_file():
        return []
    return [
        line.strip().rstrip("/")
        for line in ignore_file.read_text(encoding="utf-8", errors="ignore").splitlines()
        if line.strip() and not line.startswith("#")
    ]


def _is_binary(path: Path) -> bool:
    try:
        return b"\0" in path.open("rb").read(8192)
    except OSError:
        return True


class RepositoryScanner:
    """Scans incrementally and never loads file contents beyond a binary sample."""

    def scan(self, root: Path, events: EventCollector) -> list[FileRecord]:
        patterns = _ignore_patterns(root)
        records: list[FileRecord] = []
        for current, directories, filenames in __import__("os").walk(root):
            current_path = Path(current)
            relative_directory = current_path.relative_to(root).as_posix()
            directories[:] = [
                directory
                for directory in directories
                if directory not in IGNORED_DIRECTORIES
                and not any(
                    fnmatch.fnmatch(f"{relative_directory}/{directory}".lstrip("/"), pattern)
                    for pattern in patterns
                )
            ]
            for filename in filenames:
                path = current_path / filename
                relative_path = path.relative_to(root).as_posix()
                if any(
                    fnmatch.fnmatch(relative_path, pattern) for pattern in patterns
                ) or _is_binary(path):
                    continue
                try:
                    size = path.stat().st_size
                except OSError:
                    continue
                extension = path.suffix.lower() or None
                records.append(
                    FileRecord(
                        path=relative_path,
                        extension=extension,
                        size_bytes=size,
                        language=LANGUAGES.get(extension),
                        is_generated="generated" in relative_path.lower(),
                    )
                )
        events.emit("repository.scanned", "Repository scan completed", file_count=len(records))
        return sorted(records, key=lambda record: record.path)
