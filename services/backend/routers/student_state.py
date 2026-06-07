"""Compatibility wrapper for student-state routes."""

from __future__ import annotations

from aim.presentation.api.routers.student_state import get_db, router

__all__ = ["get_db", "router"]

