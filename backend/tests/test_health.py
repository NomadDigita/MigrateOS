"""API liveness contract tests."""

from fastapi.testclient import TestClient

from backend.app.main import create_app


def test_health_check_exposes_liveness_contract() -> None:
    response = TestClient(create_app()).get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"] == "migrateos-api"
    assert "timestamp" in payload
