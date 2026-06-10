"""Configuration for the AIM Engine service skeleton."""

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class AimEngineSettings(BaseSettings):
    """Runtime settings for the AIM Engine service.

    Only safe operational settings belong here. Secrets and provider credentials
    must be added through explicit future tasks with validation and secret-safety
    rules.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="AIM_ENGINE_",
        extra="ignore",
    )

    app_name: str = Field(default="AIM Engine", min_length=1)
    env: Literal["local", "test", "development", "staging", "production"] = "local"
    host: str = Field(default="0.0.0.0", min_length=1)
    port: int = Field(default=8010, ge=1, le=65535)
    log_level: Literal["debug", "info", "warning", "error", "critical"] = "info"

    @property
    def enable_docs(self) -> bool:
        """Expose local docs outside production only."""
        return self.env != "production"


@lru_cache
def get_settings() -> AimEngineSettings:
    """Return cached AIM Engine settings."""
    return AimEngineSettings()
