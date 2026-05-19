"""Long-term lesson and assessment history ORM models."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class LessonAttemptORM(Base):
    __tablename__ = "lesson_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    lesson_id = Column(String, nullable=False, index=True)
    course_id = Column(String, nullable=True, index=True)

    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=False)
    completed = Column(Boolean, nullable=False, default=True)
    early_exit = Column(Boolean, nullable=False, default=False)
    score = Column(Float, nullable=False, default=0.0)
    frustration_score = Column(Float, nullable=False, default=0.0)
    recommendation_id = Column(Integer, nullable=True, index=True)


class AssessmentResultORM(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    assessment_id = Column(String, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    score = Column(Float, nullable=False)
    mastery_before = Column(Float, nullable=False)
    mastery_after = Column(Float, nullable=False)
    difficulty_level = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
