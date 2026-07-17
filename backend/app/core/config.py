"""Typed runtime configuration loaded exclusively from the environment."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated configuration shared by API and worker processes."""

    model_config = SettingsConfigDict(env_file=".env", env_prefix="MIGRATEOS_", extra="ignore")

    environment: Literal["development", "test", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    database_url: PostgresDsn = Field(
        default="postgresql+psycopg://migrateos:migrateos@localhost:5432/migrateos"
    )
    redis_url: RedisDsn = "redis://localhost:6379/0"
    cors_origins: str = ""
    dev_auth_token: str | None = None
    openai_model: str | None = None

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def allowed_cors_origins(self) -> list[str]:
        """Return a normalized allowlist from a comma-separated environment value."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a process-stable settings object after eager validation."""

    return Settings()
