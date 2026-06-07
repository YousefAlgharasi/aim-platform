"""Compatibility exports for micro-goal ORM models and schemas."""

from __future__ import annotations

from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.presentation.api.schemas.goals import MicroGoalRead

__all__ = ["MicroGoalORM", "MicroGoalRead"]

