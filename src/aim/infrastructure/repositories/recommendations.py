"""SQLAlchemy adapters for recommendations."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.recommendation_engine import (
    RecommendationAttempt,
    RecommendationContext,
    RecommendationResult,
    RecommendationSkillState,
)
from aim.domain.services.transfer_learning_detector import (
    TransferLearningDetector,
    TransferLearningRecord,
    TransferScoreResult,
)
from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.prerequisite_gap import PrerequisiteGapRecordORM
from aim.infrastructure.database.models.student import StudentSkillStateORM
from aim.infrastructure.skill_graph import SkillGraph


class SQLRecommendationContextProvider:
    def __init__(self, db: Session) -> None:
        self._db = db
        self._skill_graph = SkillGraph()
        self._transfer_detector = TransferLearningDetector(self._skill_graph)

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
                attempts=state.attempts,
                consistency=state.consistency,
                current_difficulty=state.current_difficulty,
                retention=state.retention,
                review_due=state.review_due,
                weakness_score=state.weakness_score,
                frustration_score=state.frustration_score,
                reliability=state.reliability,
                learning_response_pattern=state.learning_response_pattern,
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
                hint_used=row.hint_used,
                attempts=row.attempts,
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
        transfer_result = self._transfer_result(
            student_id,
            current_skill_id,
            states,
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
            transfer_result=transfer_result,
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

    def _transfer_result(
        self,
        student_id: int,
        current_skill_id: str | None,
        states: list[StudentSkillStateORM],
    ) -> TransferScoreResult | None:
        if current_skill_id is None or current_skill_id not in self._skill_graph:
            return None

        state_by_skill = {state.skill_id: state for state in states}
        current_state = state_by_skill.get(current_skill_id)
        if current_state is None:
            return None

        learning_days = self._learning_days_for_skill(student_id, current_skill_id)
        records = []
        for prereq in self._skill_graph.get_prerequisites(current_skill_id):
            from_skill_id = prereq["skill_id"]
            prereq_state = state_by_skill.get(from_skill_id)
            if prereq_state is None:
                continue
            if prereq_state.mastery < self._skill_graph.MASTERY_THRESHOLD:
                continue
            records.append(
                TransferLearningRecord(
                    student_id=student_id,
                    from_skill_id=from_skill_id,
                    to_skill_id=current_skill_id,
                    previous_skill_mastery=prereq_state.mastery,
                    time_to_mastery_days=learning_days,
                    had_prerequisite_mastered=True,
                )
            )

        if not records:
            return None

        return self._transfer_detector.detect_for_student(student_id, records)

    def _learning_days_for_skill(self, student_id: int, skill_id: str) -> float:
        rows = (
            self._db.query(QuestionAttemptORM)
            .filter(
                QuestionAttemptORM.student_id == student_id,
                QuestionAttemptORM.skill_id == skill_id,
            )
            .order_by(QuestionAttemptORM.created_at.asc())
            .all()
        )
        if len(rows) < 2:
            return 1.0

        duration_days = (
            rows[-1].created_at - rows[0].created_at
        ).total_seconds() / 86400
        return max(1.0, round(duration_days, 4))


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
            evidence=dict(result.evidence),
            confidence=result.confidence,
            decision_priority=result.decision_priority,
            fairness_risk_level=result.inputs_snapshot.get("fairness_risk_level", "low"),
            inputs_snapshot=dict(result.inputs_snapshot),
            mastery_before=mastery_before,
        )
        self._db.add(row)
        self._db.flush()
        self._db.refresh(row)
        return row

    def latest_unevaluated(
        self,
        *,
        student_id: int,
        skill_id: str,
    ) -> RecommendationLogORM | None:
        return (
            self._db.query(RecommendationLogORM)
            .filter(
                RecommendationLogORM.student_id == student_id,
                RecommendationLogORM.skill_id == skill_id,
                RecommendationLogORM.mastery_after.is_(None),
            )
            .order_by(RecommendationLogORM.created_at.desc(), RecommendationLogORM.id.desc())
            .first()
        )

    def mark_evaluated(
        self,
        row: RecommendationLogORM,
        *,
        mastery_after: float,
        mastery_improved_after: bool,
        was_followed: bool = True,
    ) -> RecommendationLogORM:
        row.mastery_after = mastery_after
        row.mastery_improved_after = mastery_improved_after
        row.was_followed = was_followed
        self._db.flush()
        return row

