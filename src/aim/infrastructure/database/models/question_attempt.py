"""Question attempt ORM model."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, func

from aim.infrastructure.database.base import Base


class QuestionAttemptORM(Base):
    __tablename__ = "question_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)
    question_id = Column(String, nullable=False)
    session_id = Column(String, nullable=False, index=True)

    is_correct = Column(Boolean, nullable=False)
    response_time = Column(Float, nullable=False)
    attempts = Column(Integer, nullable=False, default=1)
    difficulty = Column(Integer, nullable=False)

    hint_used = Column(Boolean, nullable=False, default=False)
    skip = Column(Boolean, nullable=False, default=False)
    answer_changed = Column(Boolean, nullable=False, default=False)

    time_of_day = Column(String, nullable=False)
    session_position = Column(Integer, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)

