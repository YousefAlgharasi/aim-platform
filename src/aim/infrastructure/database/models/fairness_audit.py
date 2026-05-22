"""Fairness audit ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


# Stores fairness audit outputs for explainability and review.
class FairnessAuditLogORM(Base):
    """Persisted fairness warning log for adaptive decisions."""

    __tablename__ = "fairness_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)
    fairness_risk_level = Column(String, nullable=False)
    fairness_warnings = Column(JSON, nullable=False, default=list)
    suggested_correction = Column(String, nullable=False)
    evidence = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
