"""SQLAlchemy engine and session factory."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from aim.infrastructure.config import get_settings
from aim.infrastructure.database.base import Base

# Import models so Base.metadata is complete for tests and local SQLite setup.
from aim.infrastructure.database import models as _models  # noqa: F401


settings = get_settings()


def _engine_kwargs() -> dict:
    if settings.is_sqlite:
        return {
            "connect_args": {"check_same_thread": False},
            "pool_pre_ping": True,
            "echo": False,
        }

    return {
        "pool_pre_ping": True,
        "pool_size": settings.database_pool_size,
        "max_overflow": settings.database_max_overflow,
        "pool_recycle": settings.database_pool_recycle,
        "echo": False,
    }


engine = create_engine(settings.database_url, **_engine_kwargs())

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_database_schema() -> None:
    """Create tables for lightweight local SQLite development."""
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

