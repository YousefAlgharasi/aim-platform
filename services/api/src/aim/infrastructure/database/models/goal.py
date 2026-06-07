"""Micro-goal ORM model."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Integer, String, func

from aim.infrastructure.database.base import Base


class MicroGoalORM(Base):
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

