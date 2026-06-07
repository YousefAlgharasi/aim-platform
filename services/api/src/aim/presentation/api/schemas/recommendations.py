"""Recommendation API schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NextActionRead(BaseModel):
    recommendation_id: int
    student_id: int
    action: str
    action_type: str
    target_skill_id: str | None
    skill_id: str | None
    difficulty: int
    reason: str
    evidence: dict
    confidence: str
    inputs_snapshot: dict


class RecommendationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    action_type: str
    skill_id: str | None
    difficulty: int
    reason: str
    evidence: dict
    confidence: str
    decision_priority: str
    fairness_risk_level: str
    inputs_snapshot: dict
    was_followed: bool | None
    mastery_before: float | None
    mastery_after: float | None
    mastery_improved_after: bool | None
    created_at: datetime
    updated_at: datetime

