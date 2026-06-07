"""Retention review schedule ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class RetentionScheduleORM(Base):
    __tablename__ = "retention_schedules"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    due_at = Column(DateTime, nullable=False, index=True)
    retention = Column(Float, nullable=False)
    retention_lambda = Column(Float, nullable=False)
    review_priority = Column(Float, nullable=False)
    completed_at = Column(DateTime, nullable=True, index=True)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
