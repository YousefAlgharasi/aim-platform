"""Learning response pattern ORM model."""

from __future__ import annotations

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, func

from aim.infrastructure.database.base import Base


# Stores educational response patterns without fixed-trait labels.
class LearningResponsePatternORM(Base):
    """Persisted learning response pattern for a student-skill pair."""

    __tablename__ = "learning_response_patterns"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)
    learning_response_pattern = Column(String, nullable=False)
    confidence = Column(Float, nullable=False, default=0.0)
    evidence = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
