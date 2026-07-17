from pathlib import Path

from backend.app.application.repository_intelligence.models import AnalysisRequest
from backend.app.application.repository_intelligence.service import RepositoryIntelligenceService


def test_repository_intelligence_detects_typescript_fixture(tmp_path: Path) -> None:
    (tmp_path / "package.json").write_text('{"dependencies":{"react":"19.0.0","next":"15.2.4"}}')
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "main.ts").write_text("export const port = process.env.PORT;")
    result = RepositoryIntelligenceService().analyze(AnalysisRequest(local_path=tmp_path))
    assert any(item.name == "Next.js" for item in result.technologies)
    assert result.dependencies[0].name == "next"
    assert "PORT" in result.architecture.environment_variables
    assert any(event.event_type == "knowledge_graph.built" for event in result.events)
