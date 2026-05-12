"""
T-04: SQLAttemptRepository
Concrete implementation of the AttemptRepository protocol using SQLAlchemy.
Lives in /backend so it can import ORM models and DB session — not in /ai-core.
"""

from __future__ import annotations

from typing import Sequence

from sqlalchemy.orm import Session

from backend.models.question_attempt import QuestionAttemptORM
from backend.models.student_state import StudentSkillStateORM      # from T-03
from ai_core.performance_analyzer import AttemptRecord


class SQLAttemptRepository:
    """Persists and retrieves AttemptRecord objects via SQLAlchemy."""

    def __init__(self, db: Session) -> None:
        self._db = db

    # ── Write ──────────────────────────────────

    def save_attempts(self, attempts: Sequence[AttemptRecord]) -> None:
        orm_objects = [
            QuestionAttemptORM(
                student_id=a.student_id,
                skill_id=a.skill_id,
                question_id=a.question_id,
                session_id=a.session_id,
                is_correct=a.is_correct,
                response_time=a.response_time,
                attempts=a.attempts,
                difficulty=a.difficulty,
                hint_used=a.hint_used,
                skip=a.skip,
                answer_changed=a.answer_changed,
                time_of_day=a.time_of_day,
                session_position=a.session_position,
            )
            for a in attempts
        ]
        self._db.bulk_save_objects(orm_objects)
        self._db.commit()

    # ── Read ───────────────────────────────────

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

        rows = query.all()
        return [
            AttemptRecord(
                student_id=r.student_id,
                skill_id=r.skill_id,
                question_id=r.question_id,
                session_id=r.session_id,
                is_correct=r.is_correct,
                response_time=r.response_time,
                attempts=r.attempts,
                difficulty=r.difficulty,
                hint_used=r.hint_used,
                skip=r.skip,
                answer_changed=r.answer_changed,
                time_of_day=r.time_of_day,
                session_position=r.session_position,
            )
            for r in rows
        ]

    # ── Update student_skill_states ────────────

    def update_skill_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        accuracy: float,
        avg_speed: float,
        retry_rate: float,
        hesitation_index: float,
    ) -> None:
        """
        Write recalculated performance metrics back into the
        student_skill_states table (created in T-03).
        hesitation_index is stored in the 'weakness_score' column until
        T-05 adds a dedicated column via migration.
        """
        state = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )

        if state is None:
            # Create a minimal state row if one doesn't exist yet
            state = StudentSkillStateORM(
                student_id=student_id,
                skill_id=skill_id,
            )
            self._db.add(state)

        state.mastery = accuracy          # seed mastery with raw accuracy until T-05
        state.avg_speed = avg_speed
        # hesitation_index stored as a dedicated field; T-03 migration must include it
        # If the column doesn't exist yet, this will raise — add it via Alembic first.
        state.hesitation_index = hesitation_index

        self._db.commit()
