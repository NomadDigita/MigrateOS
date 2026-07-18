"""Initial authenticated-principal endpoint."""

from typing import Annotated

from fastapi import APIRouter, Depends

from backend.app.api.dependencies import (
    AuthenticatedPrincipal,
    require_authenticated_principal,
)
from backend.app.api.schemas import CurrentUserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/me", response_model=CurrentUserResponse, summary="Read the authenticated principal")
def get_current_user(
    principal: Annotated[AuthenticatedPrincipal, Depends(require_authenticated_principal)],
) -> CurrentUserResponse:
    """Return the principal accepted by the configured authentication adapter."""

    return CurrentUserResponse(
        subject=principal.subject,
        authentication_method=principal.authentication_method,
    )
