"""Question quality ORM model."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


# Stores aggregated question quality stats and review flags.
class QuestionQualityStatsORM(Base):
    """Persisted question quality score used to reduce unfair evidence impact."""

    __tablename__ = "question_quality_stats"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String, nullable=False, unique=True, index=True)
    question_error_rate = Column(Float, nullable=False, default=0.0)
    avg_response_time = Column(Float, nullable=False, default=0.0)
    hint_usage_rate = Column(Float, nullable=False, default=0.0)
    skip_rate = Column(Float, nullable=False, default=0.0)
    discrimination_index = Column(Float, nullable=False, default=0.0)
    quality_score = Column(Float, nullable=False, default=100.0)
    flag_for_review = Column(Boolean, nullable=False, default=False)
    evidence = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
