"""Compatibility wrapper for review routes."""

from __future__ import annotations

from aim.presentation.api.routers.reviews import get_db, router

__all__ = ["get_db", "router"]

