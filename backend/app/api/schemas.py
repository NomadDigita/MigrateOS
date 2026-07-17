"""Transport schemas shared by API routers."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    """Liveness response that avoids exposing infrastructure details."""

    model_config = ConfigDict(extra="forbid")

    status: Literal["ok"]
    service: Literal["migrateos-api"]
    environment: str
    timestamp: datetime


class CurrentUserResponse(BaseModel):
    """Minimum authenticated-principal projection for the initial API surface."""

    model_config = ConfigDict(extra="forbid")

    subject: str
    authentication_method: Literal["development_bearer"]
