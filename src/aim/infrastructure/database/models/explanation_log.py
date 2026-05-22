"""Explanation audit log ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


# Stores explainable AIM decisions for audit and debugging.
class ExplanationLogORM(Base):
    """Persisted explanation for an AIM pipeline decision."""

    __tablename__ = "explanation_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)
    decision_type = Column(String, nullable=False)
    explanation = Column(String, nullable=False)
    evidence = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
