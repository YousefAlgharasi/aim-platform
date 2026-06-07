"""Outcome tracking ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


# Stores whether prior recommendations improved learning outcomes.
class OutcomeRecordORM(Base):
    """Persisted before/after outcome for one recommendation."""

    __tablename__ = "outcome_records"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, nullable=False, index=True)
    mastery_before = Column(Float, nullable=False)
    mastery_after = Column(Float, nullable=False)
    retention_before = Column(Float, nullable=False)
    retention_after = Column(Float, nullable=False)
    weakness_before = Column(Float, nullable=False)
    weakness_after = Column(Float, nullable=False)
    outcome = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
