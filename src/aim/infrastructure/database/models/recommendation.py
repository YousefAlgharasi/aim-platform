"""Recommendation log ORM model."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


class RecommendationLogORM(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    action_type = Column(String, nullable=False, index=True)
    skill_id = Column(String, nullable=True, index=True)
    difficulty = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    inputs_snapshot = Column(JSON, nullable=False, default=dict)

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

