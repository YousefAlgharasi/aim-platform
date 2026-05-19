"""Weakness detection ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class WeaknessRecordORM(Base):
    __tablename__ = "weakness_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    weakness_score = Column(Float, nullable=False)
    error_frequency = Column(Float, nullable=False)
    difficulty_weight = Column(Float, nullable=False)
    repeated_mistakes = Column(Integer, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
