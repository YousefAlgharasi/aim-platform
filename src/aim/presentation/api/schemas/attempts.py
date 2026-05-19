"""Question attempt API schemas."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class TimeOfDay(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"


class QuestionAttemptCreate(BaseModel):
    student_id: int
    skill_id: str
    question_id: str
    session_id: str

    is_correct: bool
    response_time: float = Field(..., gt=0, description="Time in seconds")
    attempts: int = Field(1, ge=1)
    difficulty: int = Field(..., ge=1, le=5)

    hint_used: bool = False
    skip: bool = False
    answer_changed: bool = False

    time_of_day: TimeOfDay
    session_position: int = Field(..., ge=1)


class QuestionAttemptRead(QuestionAttemptCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class BatchAttemptRequest(BaseModel):
    attempts: list[QuestionAttemptCreate]
