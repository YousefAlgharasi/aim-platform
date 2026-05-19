"""Prerequisite gap logging ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class PrerequisiteGapRecordORM(Base):
    __tablename__ = "prerequisite_gap_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)
    missing_prerequisite_skill_id = Column(String, nullable=False, index=True)
    severity = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="open", index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    resolved_at = Column(DateTime, nullable=True)
