"""Recommendation use cases."""

from __future__ import annotations

from aim.application.errors import NotFoundError
from aim.domain.services.recommendation_engine import RecommendationEngine
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


class RecommendationUseCases:
    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow

    def get_next_action(self, student_id: int) -> tuple[int, object]:
        if self._uow.students.get_student(student_id) is None:
            raise NotFoundError(f"Student {student_id} not found.")

        engine = RecommendationEngine(self._uow.recommendation_context)
        result = engine.get_next_action(student_id)
        log = self._uow.recommendation_logger.log(result)
        self._uow.commit()
        return log.id, result

