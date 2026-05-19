"""Student API schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StudentCreate(BaseModel):
    name: str
    email: str


class StudentRead(StudentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class StudentSkillStateCreate(BaseModel):
    student_id: int
    skill_id: str

    mastery: float = Field(0.0, ge=0.0, le=100.0)
    confidence: float = Field(0.0, ge=0.0, le=100.0)
    attempts: int = Field(0, ge=0)
    avg_speed: float = Field(0.0, ge=0.0)
    retention: float = Field(100.0, ge=0.0, le=100.0)
    hesitation_index: float = Field(0.0, ge=0.0, le=1.0)
    retention_lambda: float = Field(0.15, ge=0.0)
    review_due: bool = False
    retention_history: list[dict] = Field(default_factory=list)

    weakness_score: float = Field(0.0, ge=0.0, le=100.0)
    frustration_score: float = Field(0.0, ge=0.0, le=100.0)

    learning_style: Optional[str] = None
    session_performance: list[float] = Field(default_factory=list)

    last_reviewed_at: Optional[datetime] = None


class StudentSkillStateUpdate(BaseModel):
    mastery: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence: Optional[float] = Field(None, ge=0.0, le=100.0)
    attempts: Optional[int] = Field(None, ge=0)
    avg_speed: Optional[float] = Field(None, ge=0.0)
    retention: Optional[float] = Field(None, ge=0.0, le=100.0)
    hesitation_index: Optional[float] = Field(None, ge=0.0, le=1.0)
    retention_lambda: Optional[float] = Field(None, ge=0.0)
    review_due: Optional[bool] = None
    retention_history: Optional[list[dict]] = None

    weakness_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    frustration_score: Optional[float] = Field(None, ge=0.0, le=100.0)

    learning_style: Optional[str] = None
    session_performance: Optional[list[float]] = None

    last_reviewed_at: Optional[datetime] = None


class StudentSkillStateRead(StudentSkillStateCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
