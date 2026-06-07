"""Compatibility wrapper for goal routes."""

from __future__ import annotations

from aim.presentation.api.routers.goals import get_db, refresh_student_goals, router

__all__ = ["get_db", "refresh_student_goals", "router"]

