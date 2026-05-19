"""SQLAlchemy adapters for recommendations."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.recommendation_engine import (
    RecommendationAttempt,
    RecommendationContext,
    RecommendationResult,
    RecommendationSkillState,
)
from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.prerequisite_gap import PrerequisiteGapRecordORM
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
                consistency=state.consistency,
                current_difficulty=state.current_difficulty,
                retention=state.retention,
                review_due=state.review_due,
                weakness_score=state.weakness_score,
                frustration_score=state.frustration_score,
            )
            for state in states
        ]

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
        current_skill_id = None
        if recent_attempts:
            current_skill_id = recent_attempts[-1].skill_id
        elif skill_states:
            current_skill_id = min(skill_states, key=lambda state: state.mastery).skill_id

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
        latest_error_pattern = self._latest_error_pattern(
            student_id,
            current_skill_id,
        )
        prerequisite_gaps = self._open_prerequisite_gaps(
            student_id,
            current_skill_id,
        )

        return RecommendationContext(
            student_id=student_id,
            current_skill_id=current_skill_id,
            skill_states=skill_states,
            recent_attempts=recent_attempts,
            historical_avg_speed=historical_avg_speed,
            last_session_frustration_score=last_frustration,
            error_pattern_type=latest_error_pattern.pattern_type
            if latest_error_pattern is not None
            else None,
            error_pattern_evidence=latest_error_pattern.evidence_json
            if latest_error_pattern is not None
            else None,
            error_pattern_treatment_recommendation=(
                latest_error_pattern.treatment_recommendation
                if latest_error_pattern is not None
                else None
            ),
            prerequisite_gaps=prerequisite_gaps,
        )

    @staticmethod
    def _consistency_from_session_history(history: list[float]) -> float:
        if len(history) < 2:
            return 100.0
        mean = sum(history) / len(history)
        avg_abs_delta = sum(abs(value - mean) for value in history) / len(history)
        return max(0.0, round(100.0 - avg_abs_delta, 2))

    def _latest_error_pattern(
        self,
        student_id: int,
        current_skill_id: str | None,
    ) -> ErrorPatternRecordORM | None:
        query = self._db.query(ErrorPatternRecordORM).filter(
            ErrorPatternRecordORM.student_id == student_id,
        )
        if current_skill_id is not None:
            skill_match = (
                query.filter(ErrorPatternRecordORM.skill_id == current_skill_id)
                .order_by(ErrorPatternRecordORM.created_at.desc())
                .first()
            )
            if skill_match is not None:
                return skill_match

        return query.order_by(ErrorPatternRecordORM.created_at.desc()).first()

    def _open_prerequisite_gaps(
        self,
        student_id: int,
        current_skill_id: str | None,
    ) -> list[str]:
        query = self._db.query(PrerequisiteGapRecordORM).filter(
            PrerequisiteGapRecordORM.student_id == student_id,
            PrerequisiteGapRecordORM.status == "open",
        )
        if current_skill_id is not None:
            query = query.filter(PrerequisiteGapRecordORM.skill_id == current_skill_id)
        rows = query.order_by(PrerequisiteGapRecordORM.severity.desc()).all()
        return [row.missing_prerequisite_skill_id for row in rows]


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
            inputs_snapshot=dict(result.inputs_snapshot),
            mastery_before=mastery_before,
        )
        self._db.add(row)
        self._db.flush()
        self._db.refresh(row)
        return row

