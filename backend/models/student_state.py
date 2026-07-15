from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import (
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    skill_states: Mapped[list[StudentSkillState]] = relationship(
        "StudentSkillState", back_populates="student", cascade="all, delete-orphan"
    )


class StudentSkillState(Base):
    __tablename__ = "student_skill_states"
    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(String(100), nullable=False)

    mastery: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    avg_speed: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    retention: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    weakness_score: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    frustration_score: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    learning_style: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="unknown"
    )

    _PYTHON_DEFAULTS: dict = {
        "mastery": 0.0,
        "confidence": 0.0,
        "attempts": 0,
        "avg_speed": 0.0,
        "retention": 0.0,
        "weakness_score": 0.0,
        "frustration_score": 0.0,
        "learning_style": "unknown",
    }

    def __init__(self, **kwargs: object) -> None:
        merged = {**self._PYTHON_DEFAULTS, **kwargs}
        super().__init__(**merged)
    last_reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    student: Mapped[Student] = relationship("Student", back_populates="skill_states")


class StudentSkillStateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: uuid.UUID
    skill_id: str
    mastery: float
    confidence: float
    attempts: int
    avg_speed: float
    retention: float
    weakness_score: float
    frustration_score: float
    learning_style: str
    last_reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class StudentSkillStateUpdate(BaseModel):
    mastery: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence: Optional[float] = Field(None, ge=0.0, le=100.0)
    attempts: Optional[int] = Field(None, ge=0)
    avg_speed: Optional[float] = Field(None, ge=0.0)
    retention: Optional[float] = Field(None, ge=0.0, le=100.0)
    weakness_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    frustration_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    learning_style: Optional[str] = Field(None, max_length=50)
    last_reviewed_at: Optional[datetime] = None


class StudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: str
    created_at: datetime
    updated_at: datetime
