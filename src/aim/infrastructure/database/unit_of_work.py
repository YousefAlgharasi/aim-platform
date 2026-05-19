"""SQLAlchemy unit of work."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.infrastructure.database.session import SessionLocal
from aim.infrastructure.repositories.attempts import SQLAttemptRepository
from aim.infrastructure.repositories.goals import SQLGoalRepository
from aim.infrastructure.repositories.recommendations import (
    SQLRecommendationContextProvider,
    SQLRecommendationLogger,
)
from aim.infrastructure.repositories.retention import SQLRetentionRepository
from aim.infrastructure.repositories.students import SQLStudentRepository


class SqlAlchemyUnitOfWork:
    def __init__(self, session: Session | None = None) -> None:
        self.session = session or SessionLocal()
        self._owns_session = session is None

        self.students = SQLStudentRepository(self.session)
        self.attempts = SQLAttemptRepository(self.session)
        self.goals = SQLGoalRepository(self.session)
        self.retention = SQLRetentionRepository(self.session)
        self.recommendation_context = SQLRecommendationContextProvider(self.session)
        self.recommendation_logger = SQLRecommendationLogger(self.session)

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

