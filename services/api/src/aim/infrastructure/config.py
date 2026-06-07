"""Runtime configuration for AIM."""

from __future__ import annotations

import os
from dataclasses import dataclass, field


DEFAULT_DATABASE_URL = "sqlite:///./database/aim_dev.db"
DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000")
CLOUD_ENVIRONMENTS = {"cloud", "staging", "production"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer.") from exc
    if value < 0:
        raise ValueError(f"{name} must be >= 0.")
    return value


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_csv(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = os.getenv(name)
    if raw is None or raw == "":
        return default
    values = tuple(value.strip() for value in raw.split(",") if value.strip())
    return values or default


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


@dataclass(frozen=True)
class Settings:
    database_url: str = DEFAULT_DATABASE_URL
    app_environment: str = "development"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_pool_recycle: int = 1800
    supabase_url: str | None = None
    supabase_jwt_secret: str | None = None
    supabase_jwt_audience: str = "authenticated"
    supabase_auth_required: bool = False
    cors_origins: tuple[str, ...] = field(default_factory=lambda: DEFAULT_CORS_ORIGINS)
    api_title: str = "AIM Backend"
    api_description: str = "Adaptive Intelligence Module API"
    api_version: str = "0.1.0"
    raw_database_url: str = field(default=DEFAULT_DATABASE_URL)

    def __post_init__(self) -> None:
        if self.is_cloud and self.is_sqlite:
            raise ValueError(
                "Cloud environments require a PostgreSQL DATABASE_URL or "
                "SUPABASE_DATABASE_URL."
            )

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def is_cloud(self) -> bool:
        return self.app_environment.lower() in CLOUD_ENVIRONMENTS


def get_settings() -> Settings:
    raw_database_url = (
        os.getenv("SUPABASE_DATABASE_URL")
        or os.getenv("DATABASE_URL")
        or DEFAULT_DATABASE_URL
    )
    return Settings(
        database_url=_normalize_database_url(raw_database_url),
        raw_database_url=raw_database_url,
        app_environment=os.getenv("APP_ENV", Settings.app_environment),
        database_pool_size=_env_int(
            "DATABASE_POOL_SIZE",
            Settings.database_pool_size,
        ),
        database_max_overflow=_env_int(
            "DATABASE_MAX_OVERFLOW",
            Settings.database_max_overflow,
        ),
        database_pool_recycle=_env_int(
            "DATABASE_POOL_RECYCLE_SECONDS",
            Settings.database_pool_recycle,
        ),
        supabase_url=os.getenv("SUPABASE_URL") or None,
        supabase_jwt_secret=os.getenv("SUPABASE_JWT_SECRET") or None,
        supabase_jwt_audience=os.getenv(
            "SUPABASE_JWT_AUDIENCE",
            Settings.supabase_jwt_audience,
        ),
        supabase_auth_required=_env_bool(
            "SUPABASE_AUTH_REQUIRED",
            Settings.supabase_auth_required,
        ),
        cors_origins=_env_csv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS),
        api_title=os.getenv("API_TITLE", Settings.api_title),
        api_description=os.getenv("API_DESCRIPTION", Settings.api_description),
        api_version=os.getenv("API_VERSION", Settings.api_version),
    )

