"""Authentication dependency tests."""

import asyncio

from fastapi.testclient import TestClient

from backend.app.api.dependencies import authenticate_access_token
from backend.app.core.config import Settings
from backend.app.main import create_app


def test_auth_endpoint_rejects_missing_bearer_token() -> None:
    response = TestClient(create_app()).get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_development_auth_accepts_explicit_configured_token() -> None:
    principal = asyncio.run(
        authenticate_access_token(
            credentials=type("Credentials", (), {"scheme": "Bearer", "credentials": "local-token"})(),
            settings=Settings(environment="development", dev_auth_token="local-token"),
        )
    )

    assert principal.subject == "local-developer"


def test_import_contract_does_not_leak_auth_settings_into_request_body() -> None:
    schema = create_app().openapi()
    request_body = schema["paths"]["/api/v1/repositories/import"]["post"]["requestBody"]
    payload_schema = request_body["content"]["application/json"]["schema"]

    assert payload_schema["$ref"].endswith("/ImportRequest")
