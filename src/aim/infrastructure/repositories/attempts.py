"""SQLAlchemy attempt repository."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy.orm import Session

from aim.domain.services.mastery_calculator import SkillState
from aim.domain.services.performance_analyzer import AttemptRecord
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.student import StudentSkillStateORM


class SQLAttemptRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def save_attempts(self, attempts: Sequence[AttemptRecord]) -> None:
        self._db.add_all(
            [
                QuestionAttemptORM(
                    student_id=attempt.student_id,
                    skill_id=attempt.skill_id,
                    question_id=attempt.question_id,
                    session_id=attempt.session_id,
                    is_correct=attempt.is_correct,
                    response_time=attempt.response_time,
                    attempts=attempt.attempts,
                    difficulty=attempt.difficulty,
                    hint_used=attempt.hint_used,
                    skip=attempt.skip,
                    answer_changed=attempt.answer_changed,
                    time_of_day=attempt.time_of_day,
                    session_position=attempt.session_position,
                )
                for attempt in attempts
            ]
        )
        self._db.flush()

    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> list[AttemptRecord]:
        query = (
            self._db.query(QuestionAttemptORM)
            .filter(
                QuestionAttemptORM.student_id == student_id,
                QuestionAttemptORM.skill_id == skill_id,
            )
            .order_by(QuestionAttemptORM.created_at.desc())
        )
        if limit is not None:
            query = query.limit(limit)

        return [
            AttemptRecord(
                student_id=row.student_id,
                skill_id=row.skill_id,
                question_id=row.question_id,
                session_id=row.session_id,
                is_correct=row.is_correct,
                response_time=row.response_time,
                attempts=row.attempts,
                difficulty=row.difficulty,
                hint_used=row.hint_used,
                skip=row.skip,
                answer_changed=row.answer_changed,
                time_of_day=row.time_of_day,
                session_position=row.session_position,
            )
            for row in query.all()
        ]

    def update_skill_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        accuracy: float,
        avg_speed: float,
        retry_rate: float,
        hint_usage_rate: float,
        skip_rate: float,
        hesitation_index: float,
        difficulty_performance: float,
        consistency: float,
    ) -> None:
        state = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.avg_speed = avg_speed
        state.retry_rate = retry_rate
        state.hint_usage_rate = hint_usage_rate
        state.skip_rate = skip_rate
        state.hesitation_index = hesitation_index
        state.consistency = consistency
        self._db.flush()

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> SkillState | None:
        state = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if state is None:
            return None
        return SkillState(
            retention=state.retention,
            confidence=state.confidence,
            mastery=state.mastery,
        )

    def update_mastery(
        self,
        student_id: int,
        skill_id: str,
        mastery: float,
    ) -> None:
        state = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.mastery = mastery
        self._db.flush()

