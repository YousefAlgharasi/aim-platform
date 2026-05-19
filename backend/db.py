"""Compatibility wrapper for database imports."""

from __future__ import annotations

from aim.infrastructure.database.session import SessionLocal, engine, get_db

__all__ = ["SessionLocal", "engine", "get_db"]

