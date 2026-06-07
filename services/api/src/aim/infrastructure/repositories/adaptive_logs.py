"""SQLAlchemy repositories for AIM V2 audit and outcome records."""

from __future__ import annotations

from typing import Sequence

from sqlalchemy.orm import Session

from aim.domain.services.fairness_audit_engine import FairnessAuditResult
from aim.domain.services.learning_response_pattern_detector import LearningPatternResult
from aim.domain.services.outcome_tracker import OutcomeTrackingResult
from aim.domain.services.question_quality_analyzer import QuestionQualityResult
from aim.domain.services.question_quality_analyzer import HistoricalQuestionAttempt
from aim.infrastructure.database.models.explanation_log import ExplanationLogORM
from aim.infrastructure.database.models.fairness_audit import FairnessAuditLogORM
from aim.infrastructure.database.models.learning_response_pattern import (
    LearningResponsePatternORM,
)
from aim.infrastructure.database.models.outcome_record import OutcomeRecordORM
from aim.infrastructure.database.models.question_quality import QuestionQualityStatsORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.student import StudentSkillStateORM


# Persists question quality analysis output.
class SQLQuestionQualityRepository:
    """Stores question quality scores and review flags."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def upsert_result(self, result: QuestionQualityResult) -> QuestionQualityStatsORM:
        row = (
            self._db.query(QuestionQualityStatsORM)
            .filter(QuestionQualityStatsORM.question_id == result.question_id)
            .first()
        )
        if row is None:
            row = QuestionQualityStatsORM(question_id=result.question_id)
            self._db.add(row)

        row.quality_score = result.quality_score
        row.flag_for_review = result.flag_for_review
        row.evidence = dict(result.evidence)
        row.question_error_rate = float(result.evidence.get("question_error_rate", 0.0))
        row.avg_response_time = float(result.evidence.get("avg_response_time", 0.0))
        row.hint_usage_rate = float(result.evidence.get("hint_usage_rate", 0.0))
        row.skip_rate = float(result.evidence.get("skip_rate", 0.0))
        row.discrimination_index = float(result.evidence.get("discrimination_index", 0.0))
        self._db.flush()
        return row

    def get_historical_attempts(
        self,
        question_id: str,
    ) -> list[HistoricalQuestionAttempt]:
        return self.get_question_quality_stats([question_id]).get(question_id, [])

    def get_question_quality_stats(
        self,
        question_ids: Sequence[str],
    ) -> dict[str, list[HistoricalQuestionAttempt]]:
        attempts_by_question = {question_id: [] for question_id in question_ids}
        if not attempts_by_question:
            return attempts_by_question

        rows = (
            self._db.query(QuestionAttemptORM, StudentSkillStateORM.mastery)
            .outerjoin(
                StudentSkillStateORM,
                (StudentSkillStateORM.student_id == QuestionAttemptORM.student_id)
                & (StudentSkillStateORM.skill_id == QuestionAttemptORM.skill_id),
            )
            .filter(QuestionAttemptORM.question_id.in_(list(attempts_by_question)))
            .order_by(
                QuestionAttemptORM.question_id.asc(),
                QuestionAttemptORM.created_at.asc(),
                QuestionAttemptORM.id.asc(),
            )
            .all()
        )

        for attempt, mastery in rows:
            attempts_by_question[attempt.question_id].append(
                HistoricalQuestionAttempt(
                    student_id=attempt.student_id,
                    is_correct=attempt.is_correct,
                    response_time=attempt.response_time,
                    hint_used=attempt.hint_used,
                    skip=attempt.skip,
                    learner_mastery=mastery,
                )
            )
        return attempts_by_question


# Persists fairness audit results.
class SQLFairnessAuditRepository:
    """Stores fairness audit warnings for adaptive decisions."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def add_result(
        self,
        *,
        student_id: int,
        skill_id: str,
        result: FairnessAuditResult,
    ) -> FairnessAuditLogORM:
        row = FairnessAuditLogORM(
            student_id=student_id,
            skill_id=skill_id,
            fairness_risk_level=result.fairness_risk_level,
            fairness_warnings=list(result.fairness_warnings),
            suggested_correction=result.suggested_correction,
            evidence=dict(result.evidence),
        )
        self._db.add(row)
        self._db.flush()
        return row


# Persists learning response patterns.
class SQLLearningResponsePatternRepository:
    """Stores learning response pattern detections."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def add_result(
        self,
        *,
        student_id: int,
        skill_id: str,
        result: LearningPatternResult,
    ) -> LearningResponsePatternORM:
        row = LearningResponsePatternORM(
            student_id=student_id,
            skill_id=skill_id,
            learning_response_pattern=result.learning_response_pattern,
            confidence=result.confidence,
            evidence=dict(result.evidence),
        )
        self._db.add(row)
        self._db.flush()
        return row


# Persists recommendation outcome records.
class SQLOutcomeRecordRepository:
    """Stores before/after outcomes for recommendations."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def add_result(self, result: OutcomeTrackingResult) -> OutcomeRecordORM:
        row = OutcomeRecordORM(
            recommendation_id=result.recommendation_id,
            mastery_before=result.mastery_before,
            mastery_after=result.mastery_after,
            retention_before=result.retention_before,
            retention_after=result.retention_after,
            weakness_before=result.weakness_before,
            weakness_after=result.weakness_after,
            outcome=result.outcome,
        )
        self._db.add(row)
        self._db.flush()
        return row


# Persists explanation logs.
class SQLExplanationLogRepository:
    """Stores explainable AIM decision logs."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def add_log(
        self,
        *,
        student_id: int,
        skill_id: str,
        decision_type: str,
        explanation: str,
        evidence: dict,
    ) -> ExplanationLogORM:
        row = ExplanationLogORM(
            student_id=student_id,
            skill_id=skill_id,
            decision_type=decision_type,
            explanation=explanation,
            evidence=dict(evidence),
        )
        self._db.add(row)
        self._db.flush()
        return row
