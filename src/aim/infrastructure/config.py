"""Runtime configuration for AIM."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    database_url: str = "sqlite:///./aim_dev.db"
    api_title: str = "AIM Backend"
    api_description: str = "Adaptive Intelligence Module API"
    api_version: str = "0.1.0"


def get_settings() -> Settings:
    return Settings(
        database_url=os.getenv("DATABASE_URL", Settings.database_url),
        api_title=os.getenv("API_TITLE", Settings.api_title),
        api_description=os.getenv("API_DESCRIPTION", Settings.api_description),
        api_version=os.getenv("API_VERSION", Settings.api_version),
    )

