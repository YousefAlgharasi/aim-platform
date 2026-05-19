"""Error pattern classification ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


class ErrorPatternRecordORM(Base):
    __tablename__ = "error_pattern_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    pattern_type = Column(String, nullable=False, index=True)
    evidence_json = Column(JSON, nullable=False, default=dict)
    treatment_recommendation = Column(String, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
