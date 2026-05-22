"""Weakness detection ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


class WeaknessRecordORM(Base):
    __tablename__ = "weakness_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    weakness_score = Column(Float, nullable=False)
    error_frequency = Column(Float, nullable=False)
    difficulty_weight = Column(Float, nullable=False)
    hint_usage_rate = Column(Float, nullable=False, default=0.0)
    retry_rate = Column(Float, nullable=False, default=0.0)
    skip_rate = Column(Float, nullable=False, default=0.0)
    hesitation_index = Column(Float, nullable=False, default=0.0)
    retention_drop = Column(Float, nullable=False, default=0.0)
    prerequisite_gap_score = Column(Float, nullable=False, default=0.0)
    main_weaknesses = Column(JSON, nullable=False, default=list)
    weakness_evidence = Column(JSON, nullable=False, default=dict)
    severity = Column(String, nullable=False, default="low")
    repeated_mistakes = Column(Integer, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
