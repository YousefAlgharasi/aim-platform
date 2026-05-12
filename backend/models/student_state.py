"""
T-03: Student State Model
────────────────────────────────────────────────────────────────────────────────
Two tables:
  - students              → one row per student (identity + profile)
  - student_skill_states  → one row per (student, skill) pair

All fields from the architecture doc are included — frustration_score,
learning_style, session_performance are NOT optional.
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field
from sqlalchemy import (
    JSON,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# ══════════════════════════════════════════════
# ORM MODELS
# ══════════════════════════════════════════════

class StudentORM(Base):
    """
    Core identity table — one row per student.
    """
    __tablename__ = "students"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class StudentSkillStateORM(Base):
    """
    One row per (student_id, skill_id) pair.
    Tracks everything AIM knows about this student's relationship with this skill.
    """
    __tablename__ = "student_skill_states"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id   = Column(String,  nullable=False, index=True)

    # ── Core performance metrics ───────────────
    mastery        = Column(Float,   nullable=False, default=0.0)   # 0–100
    confidence     = Column(Float,   nullable=False, default=0.0)   # 0–100
    attempts       = Column(Integer, nullable=False, default=0)
    avg_speed      = Column(Float,   nullable=False, default=0.0)   # seconds
    retention      = Column(Float,   nullable=False, default=100.0) # 0–100

    # ── Weakness & frustration ─────────────────
    weakness_score    = Column(Float,  nullable=False, default=0.0)  # 0–100
    frustration_score = Column(Float,  nullable=False, default=0.0)  # ⭐ 0–100

    # ── Learning style ─────────────────────────
    # ⭐ Auto-detected: "example-first" | "rule-first" | "repetition" | "inductive"
    learning_style = Column(String, nullable=True)

    # ── Session performance history ────────────
    # ⭐ JSON array of last N session scores, e.g. [72.0, 68.5, 80.0]
    session_performance = Column(JSON, nullable=False, default=list)

    # ── Timestamps ─────────────────────────────
    last_reviewed_at = Column(DateTime, nullable=True)
    created_at       = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at       = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ══════════════════════════════════════════════
# PYDANTIC SCHEMAS
# ══════════════════════════════════════════════

# ── Student ────────────────────────────────────

class StudentCreate(BaseModel):
    name:  str
    email: str


class StudentRead(StudentCreate):
    id:         int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── StudentSkillState ──────────────────────────

class StudentSkillStateCreate(BaseModel):
    """Used when initialising a student's state for a new skill."""
    student_id: int
    skill_id:   str

    mastery:        float = Field(0.0,   ge=0.0, le=100.0)
    confidence:     float = Field(0.0,   ge=0.0, le=100.0)
    attempts:       int   = Field(0,     ge=0)
    avg_speed:      float = Field(0.0,   ge=0.0)
    retention:      float = Field(100.0, ge=0.0, le=100.0)

    weakness_score:    float = Field(0.0, ge=0.0, le=100.0)
    frustration_score: float = Field(0.0, ge=0.0, le=100.0)   # ⭐

    learning_style:      Optional[str]         = None           # ⭐
    session_performance: list[float]           = Field(default_factory=list)  # ⭐

    last_reviewed_at: Optional[datetime] = None


class StudentSkillStateUpdate(BaseModel):
    """
    Partial update — all fields optional so callers only send what changed.
    PUT /students/{id}/skills/{skill_id}/state
    """
    mastery:        Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence:     Optional[float] = Field(None, ge=0.0, le=100.0)
    attempts:       Optional[int]   = Field(None, ge=0)
    avg_speed:      Optional[float] = Field(None, ge=0.0)
    retention:      Optional[float] = Field(None, ge=0.0, le=100.0)

    weakness_score:    Optional[float] = Field(None, ge=0.0, le=100.0)
    frustration_score: Optional[float] = Field(None, ge=0.0, le=100.0)  # ⭐

    learning_style:      Optional[str]       = None                       # ⭐
    session_performance: Optional[list[float]] = None                     # ⭐

    last_reviewed_at: Optional[datetime] = None


class StudentSkillStateRead(StudentSkillStateCreate):
    id:         int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
