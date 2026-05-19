"""SQLAlchemy adapters for recommendations."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.recommendation_engine import (
    RecommendationAttempt,
    RecommendationContext,
    RecommendationResult,
    RecommendationSkillState,
)
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.student import StudentSkillStateORM


class SQLRecommendationContextProvider:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_context(self, student_id: int) -> RecommendationContext:
        states = (
            self._db.query(StudentSkillStateORM)
            .filter(StudentSkillStateORM.student_id == student_id)
            .all()
        )
        skill_states = [
            RecommendationSkillState(
                skill_id=state.skill_id,
                mastery=state.mastery,
                confidence=state.confidence,
                consistency=self._consistency_from_session_history(
                    state.session_performance or []
                ),
                current_difficulty=self._difficulty_from_mastery(state.mastery),
                retention=state.retention,
                review_due=state.review_due,
                weakness_score=state.weakness_score,
            )
            for state in states
        ]

        current_skill_id = None
        if skill_states:
            current_skill_id = min(skill_states, key=lambda state: state.mastery).skill_id

        rows = (
            self._db.query(QuestionAttemptORM)
            .filter(QuestionAttemptORM.student_id == student_id)
            .order_by(QuestionAttemptORM.created_at.desc())
            .limit(20)
            .all()
        )
        recent_attempts = [
            RecommendationAttempt(
                student_id=row.student_id,
                skill_id=row.skill_id,
                question_id=row.question_id,
                is_correct=row.is_correct,
                response_time=row.response_time,
                difficulty=row.difficulty,
                question_subtype=row.question_id.split(":")[0]
                if ":" in row.question_id
                else None,
                is_timed=False,
                session_position=row.session_position,
                previously_correct=False,
                skip=row.skip,
            )
            for row in reversed(rows)
        ]

        avg_speeds = [state.avg_speed for state in states if state.avg_speed > 0]
        historical_avg_speed = (
            sum(avg_speeds) / len(avg_speeds)
            if avg_speeds
            else None
        )
        last_frustration = max(
            [state.frustration_score for state in states],
            default=None,
        )
        if last_frustration is not None:
            last_frustration = last_frustration / 100.0

        return RecommendationContext(
            student_id=student_id,
            current_skill_id=current_skill_id,
            skill_states=skill_states,
            recent_attempts=recent_attempts,
            historical_avg_speed=historical_avg_speed,
            last_session_frustration_score=last_frustration,
        )

    @staticmethod
    def _difficulty_from_mastery(mastery: float) -> int:
        if mastery >= 85:
            return 5
        if mastery >= 70:
            return 4
        if mastery >= 50:
            return 3
        if mastery >= 30:
            return 2
        return 1

    @staticmethod
    def _consistency_from_session_history(history: list[float]) -> float:
        if len(history) < 2:
            return 100.0
        mean = sum(history) / len(history)
        avg_abs_delta = sum(abs(value - mean) for value in history) / len(history)
        return max(0.0, round(100.0 - avg_abs_delta, 2))


class SQLRecommendationLogger:
    def __init__(self, db: Session) -> None:
        self._db = db

    def log(self, result: RecommendationResult) -> RecommendationLogORM:
        mastery_before = None
        if result.skill_id is not None:
            state = (
                self._db.query(StudentSkillStateORM)
                .filter(
                    StudentSkillStateORM.student_id == result.student_id,
                    StudentSkillStateORM.skill_id == result.skill_id,
                )
                .first()
            )
            if state is not None:
                mastery_before = state.mastery

        row = RecommendationLogORM(
            student_id=result.student_id,
            action_type=result.action_type.value,
            skill_id=result.skill_id,
            difficulty=result.difficulty,
            reason=result.reason,
            mastery_before=mastery_before,
        )
        self._db.add(row)
        self._db.flush()
        self._db.refresh(row)
        return row

