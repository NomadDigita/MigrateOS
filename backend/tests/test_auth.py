"""Authentication scaffold tests."""

from fastapi.testclient import TestClient

from backend.app.api.dependencies import require_authenticated_principal
from backend.app.core.config import Settings
from backend.app.main import create_app


def test_auth_endpoint_rejects_missing_bearer_token() -> None:
    response = TestClient(create_app()).get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_development_auth_accepts_explicit_configured_token() -> None:
    principal = require_authenticated_principal(
        credentials=type("Credentials", (), {"scheme": "Bearer", "credentials": "local-token"})(),
        settings=Settings(environment="development", dev_auth_token="local-token"),
    )

    assert principal.subject == "local-developer"
