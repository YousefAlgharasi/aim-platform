"""SQLAlchemy unit of work."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.infrastructure.database.session import SessionLocal
from aim.infrastructure.repositories.adaptive_logs import (
    SQLExplanationLogRepository,
    SQLFairnessAuditRepository,
    SQLLearningResponsePatternRepository,
    SQLOutcomeRecordRepository,
    SQLQuestionQualityRepository,
)
from aim.infrastructure.repositories.attempts import SQLAttemptRepository
from aim.infrastructure.repositories.error_patterns import SQLErrorPatternRepository
from aim.infrastructure.repositories.goals import SQLGoalRepository
from aim.infrastructure.repositories.learning_history import SQLLearningHistoryRepository
from aim.infrastructure.repositories.mastery_history import SQLMasteryHistoryRepository
from aim.infrastructure.repositories.prerequisite_gaps import SQLPrerequisiteGapRepository
from aim.infrastructure.repositories.prompt_adaptations import (
    SQLPromptAdaptationRepository,
)
from aim.infrastructure.repositories.recommendations import (
    SQLRecommendationContextProvider,
    SQLRecommendationLogger,
)
from aim.infrastructure.repositories.retention import SQLRetentionRepository
from aim.infrastructure.repositories.students import SQLStudentRepository
from aim.infrastructure.repositories.weakness import SQLWeaknessRepository


class SqlAlchemyUnitOfWork:
    def __init__(self, session: Session | None = None) -> None:
        self.session = session or SessionLocal()
        self._owns_session = session is None

        self.students = SQLStudentRepository(self.session)
        self.attempts = SQLAttemptRepository(self.session)
        self.explanation_logs = SQLExplanationLogRepository(self.session)
        self.fairness_audits = SQLFairnessAuditRepository(self.session)
        self.error_patterns = SQLErrorPatternRepository(self.session)
        self.goals = SQLGoalRepository(self.session)
        self.learning_history = SQLLearningHistoryRepository(self.session)
        self.mastery_history = SQLMasteryHistoryRepository(self.session)
        self.learning_response_patterns = SQLLearningResponsePatternRepository(
            self.session
        )
        self.outcome_records = SQLOutcomeRecordRepository(self.session)
        self.prerequisite_gaps = SQLPrerequisiteGapRepository(self.session)
        self.prompt_adaptations = SQLPromptAdaptationRepository(self.session)
        self.question_quality = SQLQuestionQualityRepository(self.session)
        self.retention = SQLRetentionRepository(self.session)
        self.recommendation_context = SQLRecommendationContextProvider(self.session)
        self.recommendation_logger = SQLRecommendationLogger(self.session)
        self.weakness = SQLWeaknessRepository(self.session)

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def close(self) -> None:
        if self._owns_session:
            self.session.close()

    def __enter__(self) -> "SqlAlchemyUnitOfWork":
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        if exc_type is None:
            self.commit()
        else:
            self.rollback()
        self.close()

