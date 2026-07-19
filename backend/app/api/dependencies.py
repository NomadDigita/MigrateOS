"""Authentication and request dependencies with secure development behavior."""

from dataclasses import dataclass
from uuid import UUID

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.core.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True, slots=True)
class AuthenticatedPrincipal:
    """A principal supplied by an authentication adapter."""

    subject: str
    authentication_method: str
    email: str | None = None
    display_name: str | None = None

    @property
    def user_id(self) -> UUID:
        return UUID(self.subject)


async def authenticate_access_token(
    credentials: HTTPAuthorizationCredentials | None,
    settings: Settings | None = None,
) -> AuthenticatedPrincipal:
    """Validate a Supabase access token and return its trusted user identity."""

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

    if (
        credentials is not None
        and credentials.scheme.lower() == "bearer"
        and resolved_settings.supabase_url
        and resolved_settings.supabase_publishable_key
    ):
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.get(
                    f"{resolved_settings.supabase_url.rstrip('/')}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {credentials.credentials}",
                        "apikey": resolved_settings.supabase_publishable_key,
                    },
                )
            response.raise_for_status()
            user = response.json()
            subject = str(UUID(str(user["id"])))
        except (httpx.HTTPError, KeyError, ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your sign-in session is invalid or has expired.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from None

        metadata = user.get("user_metadata") or {}
        display_name = metadata.get("full_name") or metadata.get("name") or metadata.get("user_name")
        return AuthenticatedPrincipal(
            subject=subject,
            authentication_method="supabase_oauth",
            email=user.get("email"),
            display_name=display_name if isinstance(display_name, str) else None,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication is required.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def require_authenticated_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedPrincipal:
    """FastAPI dependency that exposes only HTTP authentication inputs to OpenAPI."""

    return await authenticate_access_token(credentials)
