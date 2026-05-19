"""SQLAlchemy repositories for lesson and assessment history."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from aim.infrastructure.database.models.learning_history import (
    AssessmentResultORM,
    LessonAttemptORM,
)


class SQLLearningHistoryRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_lesson_attempt(
        self,
        *,
        student_id: int,
        lesson_id: str,
        course_id: str | None,
        started_at: datetime,
        ended_at: datetime,
        completed: bool,
        early_exit: bool,
        score: float,
        frustration_score: float,
        recommendation_id: int | None,
    ) -> LessonAttemptORM:
        row = LessonAttemptORM(
            student_id=student_id,
            lesson_id=lesson_id,
            course_id=course_id,
            started_at=started_at,
            ended_at=ended_at,
            completed=completed,
            early_exit=early_exit,
            score=score,
            frustration_score=frustration_score,
            recommendation_id=recommendation_id,
        )
        self._db.add(row)
        self._db.flush()
        return row

    def add_assessment_result(
        self,
        *,
        student_id: int,
        assessment_id: str,
        skill_id: str,
        score: float,
        mastery_before: float,
        mastery_after: float,
        difficulty_level: int,
    ) -> AssessmentResultORM:
        row = AssessmentResultORM(
            student_id=student_id,
            assessment_id=assessment_id,
            skill_id=skill_id,
            score=score,
            mastery_before=mastery_before,
            mastery_after=mastery_after,
            difficulty_level=difficulty_level,
        )
        self._db.add(row)
        self._db.flush()
        return row
