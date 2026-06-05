from __future__ import annotations

import pytest

from aim.infrastructure.config import DEFAULT_DATABASE_URL, get_settings


def clear_database_env(monkeypatch: pytest.MonkeyPatch) -> None:
    for name in (
        "APP_ENV",
        "DATABASE_URL",
        "SUPABASE_DATABASE_URL",
        "DATABASE_POOL_SIZE",
        "DATABASE_MAX_OVERFLOW",
        "DATABASE_POOL_RECYCLE_SECONDS",
    ):
        monkeypatch.delenv(name, raising=False)


def test_default_settings_keep_local_sqlite(monkeypatch: pytest.MonkeyPatch) -> None:
    clear_database_env(monkeypatch)

    settings = get_settings()

    assert settings.database_url == DEFAULT_DATABASE_URL
    assert settings.raw_database_url == DEFAULT_DATABASE_URL
    assert settings.is_sqlite is True
    assert settings.is_cloud is False


def test_supabase_database_url_overrides_database_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clear_database_env(monkeypatch)
    monkeypatch.setenv("DATABASE_URL", "sqlite:///./local.db")
    monkeypatch.setenv(
        "SUPABASE_DATABASE_URL",
        "postgres://postgres.project:secret@aws-0.pooler.supabase.com:5432/postgres",
    )
    monkeypatch.setenv("APP_ENV", "cloud")
    monkeypatch.setenv("DATABASE_POOL_SIZE", "3")
    monkeypatch.setenv("DATABASE_MAX_OVERFLOW", "7")
    monkeypatch.setenv("DATABASE_POOL_RECYCLE_SECONDS", "600")

    settings = get_settings()

    assert settings.raw_database_url.startswith("postgres://")
    assert settings.database_url.startswith("postgresql+psycopg://")
    assert settings.is_sqlite is False
    assert settings.is_cloud is True
    assert settings.database_pool_size == 3
    assert settings.database_max_overflow == 7
    assert settings.database_pool_recycle == 600


def test_database_url_postgresql_scheme_uses_psycopg_driver(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clear_database_env(monkeypatch)
    monkeypatch.setenv(
        "DATABASE_URL",
        "postgresql://postgres:secret@db.example.supabase.co:5432/postgres",
    )

    settings = get_settings()

    assert settings.database_url.startswith("postgresql+psycopg://")


def test_cloud_environment_rejects_sqlite(monkeypatch: pytest.MonkeyPatch) -> None:
    clear_database_env(monkeypatch)
    monkeypatch.setenv("APP_ENV", "production")

    with pytest.raises(ValueError, match="Cloud environments require"):
        get_settings()


def test_database_pool_settings_must_be_integers(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clear_database_env(monkeypatch)
    monkeypatch.setenv("DATABASE_POOL_SIZE", "many")

    with pytest.raises(ValueError, match="DATABASE_POOL_SIZE"):
        get_settings()
