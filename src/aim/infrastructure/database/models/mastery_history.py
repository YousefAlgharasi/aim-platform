"""Skill mastery history ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class SkillMasteryHistoryORM(Base):
    __tablename__ = "skill_mastery_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    mastery = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    speed_score = Column(Float, nullable=False)
    consistency = Column(Float, nullable=False)
    retention = Column(Float, nullable=False)
    difficulty_performance = Column(Float, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
