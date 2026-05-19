"""
T-10: Recommendation log model.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func

from backend.models.student_state import Base


class RecommendationLogORM(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    action_type = Column(String, nullable=False, index=True)
    skill_id = Column(String, nullable=True, index=True)
    difficulty = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)

    was_followed = Column(Boolean, nullable=True)
    mastery_before = Column(Float, nullable=True)
    mastery_after = Column(Float, nullable=True)
    mastery_improved_after = Column(Boolean, nullable=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class RecommendationRead(BaseModel):
    id: int
    student_id: int
    action_type: str
    skill_id: str | None
    difficulty: int
    reason: str
    was_followed: bool | None
    mastery_before: float | None
    mastery_after: float | None
    mastery_improved_after: bool | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
