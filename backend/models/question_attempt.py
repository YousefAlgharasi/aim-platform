"""
T-04: QuestionAttempt Model
Records every interaction between a student and a question.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"


# ──────────────────────────────────────────────
# SQLAlchemy ORM Model
# ──────────────────────────────────────────────

class QuestionAttemptORM(Base):
    """
    Stores every question attempt for every student.
    One row = one attempt on one question in one session.
    """
    __tablename__ = "question_attempts"

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, nullable=False, index=True)
    skill_id         = Column(String, nullable=False, index=True)
    question_id      = Column(String, nullable=False)
    session_id       = Column(String, nullable=False, index=True)

    # Core answer data
    is_correct       = Column(Boolean, nullable=False)
    response_time    = Column(Float, nullable=False)        # seconds
    attempts         = Column(Integer, nullable=False, default=1)
    difficulty       = Column(Integer, nullable=False)      # 1–5

    # Behavioral signals
    hint_used        = Column(Boolean, nullable=False, default=False)
    skip             = Column(Boolean, nullable=False, default=False)
    answer_changed   = Column(Boolean, nullable=False, default=False)   # ⭐ new field

    # Context fields
    time_of_day      = Column(String, nullable=False)       # ⭐ morning/afternoon/evening/night
    session_position = Column(Integer, nullable=False)      # ⭐ position within the session (1-based)

    created_at       = Column(DateTime, server_default=func.now(), nullable=False)


# ──────────────────────────────────────────────
# Pydantic Schemas
# ──────────────────────────────────────────────

class QuestionAttemptCreate(BaseModel):
    """Schema for recording a new attempt (inbound from API)."""
    student_id:       int
    skill_id:         str
    question_id:      str
    session_id:       str

    is_correct:       bool
    response_time:    float = Field(..., gt=0, description="Time in seconds")
    attempts:         int   = Field(1, ge=1)
    difficulty:       int   = Field(..., ge=1, le=5)

    hint_used:        bool  = False
    skip:             bool  = False
    answer_changed:   bool  = False          # ⭐

    time_of_day:      TimeOfDay
    session_position: int  = Field(..., ge=1)


class QuestionAttemptRead(QuestionAttemptCreate):
    """Schema for reading an attempt (outbound from API)."""
    id:         int
    created_at: datetime

    class Config:
        from_attributes = True


class BatchAttemptRequest(BaseModel):
    """Schema for POST /sessions/{session_id}/attempts."""
    attempts: list[QuestionAttemptCreate]
