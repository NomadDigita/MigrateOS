"""Initial authenticated-principal endpoint."""

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials

from backend.app.api.dependencies import (
    AuthenticatedPrincipal,
    bearer_scheme,
    require_authenticated_principal,
)
from backend.app.api.schemas import CurrentUserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/me", response_model=CurrentUserResponse, summary="Read the authenticated principal")
def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> CurrentUserResponse:
    """Return the principal accepted by the configured authentication adapter."""

    principal: AuthenticatedPrincipal = require_authenticated_principal(credentials)
    return CurrentUserResponse(
        subject=principal.subject,
        authentication_method=principal.authentication_method,
    )
