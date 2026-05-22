"""Student and skill-state ORM models."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, UniqueConstraint, func

from aim.infrastructure.database.base import Base


class StudentORM(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class StudentSkillStateORM(Base):
    __tablename__ = "student_skill_states"
    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    skill_id = Column(String, nullable=False, index=True)

    mastery = Column(Float, nullable=False, default=0.0)
    confidence = Column(Float, nullable=False, default=0.0)
    attempts = Column(Integer, nullable=False, default=0)
    avg_speed = Column(Float, nullable=False, default=0.0)
    retry_rate = Column(Float, nullable=False, default=0.0)
    hint_usage_rate = Column(Float, nullable=False, default=0.0)
    skip_rate = Column(Float, nullable=False, default=0.0)
    reliability = Column(Float, nullable=False, default=0.0)
    consistency = Column(Float, nullable=False, default=100.0)
    current_difficulty = Column(Integer, nullable=False, default=1)
    retention = Column(Float, nullable=False, default=100.0)
    hesitation_index = Column(Float, nullable=False, default=0.0)
    retention_lambda = Column(Float, nullable=False, default=0.15)
    review_due = Column(Boolean, nullable=False, default=False)
    retention_history = Column(JSON, nullable=False, default=list)

    weakness_score = Column(Float, nullable=False, default=0.0)
    frustration_score = Column(Float, nullable=False, default=0.0)

    learning_style = Column(String, nullable=True)
    learning_response_pattern = Column(String, nullable=True)
    session_performance = Column(JSON, nullable=False, default=list)
    context_memory = Column(JSON, nullable=False, default=dict)

    last_reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

