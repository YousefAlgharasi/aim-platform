from __future__ import annotations

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models import (
    AuditLogORM,
    CourseORM,
    LessonORM,
    QuestionChoiceORM,
    QuestionORM,
)


def test_content_models_register_pilot_tables() -> None:
    assert AuditLogORM.__tablename__ in Base.metadata.tables
    assert CourseORM.__tablename__ in Base.metadata.tables
    assert LessonORM.__tablename__ in Base.metadata.tables
    assert QuestionChoiceORM.__tablename__ in Base.metadata.tables
    assert QuestionORM.__tablename__ in Base.metadata.tables


def test_question_model_keeps_required_pilot_metadata() -> None:
    columns = QuestionORM.__table__.columns

    for name in (
        "question_id",
        "lesson_id",
        "skill_id",
        "concept",
        "difficulty",
        "question_type",
        "correct_answer",
        "choices",
        "explanation",
        "prerequisites",
        "common_error_tags",
    ):
        assert name in columns
