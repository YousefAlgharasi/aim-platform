"""
T-06: Micro-goal persistence models.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from backend.models.student_state import Base


class MicroGoalORM(Base):
    """
    Stores generated micro-goals as display-ready text.
    """

    __tablename__ = "micro_goals"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=True, index=True)
    goal_type = Column(String, nullable=False, index=True)
    text = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class MicroGoalRead(BaseModel):
    id: int
    student_id: int
    skill_id: str | None
    goal_type: str
    text: str
    is_active: bool
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
