"""Retention review use cases."""

from __future__ import annotations

from datetime import UTC, datetime

from aim.application.errors import NotFoundError
from aim.domain.services.retention_tracker import RetentionTracker
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


class ReviewUseCases:
    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow

    def get_due_reviews(self, student_id: int):
        if self._uow.students.get_student(student_id) is None:
            raise NotFoundError(f"Student {student_id} not found.")

        now = datetime.now(UTC).replace(tzinfo=None)
        tracker = RetentionTracker(self._uow.retention, now=now)
        due = tracker.get_skills_due_for_review(student_id)
        self._uow.commit()
        return due
