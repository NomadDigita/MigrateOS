"""Authentication and request dependencies with secure development behavior."""

from dataclasses import dataclass

from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.core.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class AuthenticatedPrincipal:
    """A principal supplied by an authentication adapter."""

    subject: str
    authentication_method: str


def require_authenticated_principal(
    credentials: HTTPAuthorizationCredentials | None,
    settings: Settings | None = None,
) -> AuthenticatedPrincipal:
    """Authenticate local development only when an explicit token is configured.

    Production intentionally rejects this scaffold until an OIDC adapter is installed.
    """

    resolved_settings = settings or get_settings()
    is_valid_development_token = (
        resolved_settings.is_development
        and bool(resolved_settings.dev_auth_token)
        and credentials is not None
        and credentials.scheme.lower() == "bearer"
        and credentials.credentials == resolved_settings.dev_auth_token
    )
    if is_valid_development_token:
        return AuthenticatedPrincipal(
            subject="local-developer", authentication_method="development_bearer"
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication is required.",
        headers={"WWW-Authenticate": "Bearer"},
    )
