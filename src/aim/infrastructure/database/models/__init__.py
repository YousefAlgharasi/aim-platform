"""SQLAlchemy ORM models."""

from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM
from aim.infrastructure.database.models.explanation_log import ExplanationLogORM
from aim.infrastructure.database.models.fairness_audit import FairnessAuditLogORM
from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.models.learning_history import (
    AssessmentResultORM,
    LessonAttemptORM,
)
from aim.infrastructure.database.models.learning_response_pattern import (
    LearningResponsePatternORM,
)
from aim.infrastructure.database.models.mastery_history import SkillMasteryHistoryORM
from aim.infrastructure.database.models.outcome_record import OutcomeRecordORM
from aim.infrastructure.database.models.prerequisite_gap import PrerequisiteGapRecordORM
from aim.infrastructure.database.models.prompt_adaptation import (
    PromptAdaptationInstructionORM,
)
from aim.infrastructure.database.models.question_quality import QuestionQualityStatsORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.retention_schedule import RetentionScheduleORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.infrastructure.database.models.weakness import WeaknessRecordORM

__all__ = [
    "ErrorPatternRecordORM",
    "ExplanationLogORM",
    "FairnessAuditLogORM",
    "AssessmentResultORM",
    "LessonAttemptORM",
    "LearningResponsePatternORM",
    "MicroGoalORM",
    "OutcomeRecordORM",
    "PrerequisiteGapRecordORM",
    "PromptAdaptationInstructionORM",
    "QuestionQualityStatsORM",
    "QuestionAttemptORM",
    "RecommendationLogORM",
    "RetentionScheduleORM",
    "SkillMasteryHistoryORM",
    "StudentORM",
    "StudentSkillStateORM",
    "WeaknessRecordORM",
]

