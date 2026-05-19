"""Compatibility wrapper for recommendation routes."""

from __future__ import annotations

from aim.presentation.api.routers.recommendations import get_db, router

__all__ = ["get_db", "router"]

