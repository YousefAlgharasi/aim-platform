"""Pilot content and audit ORM models."""

from __future__ import annotations

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, JSON, String, Text, func

from aim.infrastructure.database.base import Base


class CourseORM(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, nullable=False, unique=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    level = Column(String, nullable=False, default="A1", index=True)
    language = Column(String, nullable=False, default="en")
    is_active = Column(Boolean, nullable=False, default=True)
    metadata_json = Column("metadata", JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class LessonORM(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(String, nullable=False, unique=True)
    course_id = Column(String, nullable=False, index=True)
    chapter_id = Column(String, nullable=True, index=True)
    title = Column(String, nullable=False)
    lesson_order = Column(Integer, nullable=False, default=0)
    level = Column(String, nullable=False, default="A1", index=True)
    skill_focus = Column(JSON, nullable=False, default=list)
    main_skill_id = Column(String, nullable=True, index=True)
    prerequisites = Column(JSON, nullable=False, default=list)
    estimated_minutes = Column(Integer, nullable=False, default=15)
    difficulty = Column(Integer, nullable=False, default=1, index=True)
    content = Column(JSON, nullable=False, default=dict)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class QuestionORM(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String, nullable=False, unique=True)
    lesson_id = Column(String, nullable=True, index=True)
    skill_id = Column(String, nullable=False, index=True)
    question_type = Column(String, nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    difficulty = Column(Integer, nullable=False, default=1, index=True)
    points = Column(Float, nullable=False, default=1.0)
    metadata_json = Column("metadata", JSON, nullable=False, default=dict)
    concept = Column(String, nullable=False, default="", index=True)
    choices = Column(JSON, nullable=False, default=list)
    prerequisites = Column(JSON, nullable=False, default=list)
    common_error_tags = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class QuestionChoiceORM(Base):
    __tablename__ = "question_choices"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(String, nullable=False, index=True)
    choice_order = Column(Integer, nullable=False, default=0)
    choice_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)
    metadata_json = Column("metadata", JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class AuditLogORM(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_student_id = Column(Integer, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)
    entity_type = Column(String, nullable=False, index=True)
    entity_id = Column(String, nullable=True, index=True)
    before_state = Column(JSON, nullable=False, default=dict)
    after_state = Column(JSON, nullable=False, default=dict)
    metadata_json = Column("metadata", JSON, nullable=False, default=dict)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
