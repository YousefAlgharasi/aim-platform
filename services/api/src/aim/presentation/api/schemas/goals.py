"""Micro-goal API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MicroGoalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    skill_id: str | None
    goal_type: str
    text: str
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime

