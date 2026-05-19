"""Retention background job and scheduler adapter."""

from __future__ import annotations

from collections.abc import Callable

from sqlalchemy.orm import Session

from aim.application.use_cases.reviews import ReviewUseCases
from aim.infrastructure.database.models.student import StudentORM
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork

try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ImportError:  # pragma: no cover - optional dependency
    BackgroundScheduler = None


def run_retention_review_job(session_factory: Callable[[], Session]) -> int:
    db = session_factory()
    try:
        student_ids = [row.id for row in db.query(StudentORM).all()]
        due_count = 0
        uow = SqlAlchemyUnitOfWork(db)
        use_cases = ReviewUseCases(uow)
        for student_id in student_ids:
            due_count += len(use_cases.get_due_reviews(student_id))
        return due_count
    finally:
        db.close()


def start_retention_scheduler(session_factory: Callable[[], Session]):
    if BackgroundScheduler is None:
        raise RuntimeError(
            "APScheduler is not installed. Install apscheduler to run "
            "the retention background job."
        )

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_retention_review_job,
        trigger="interval",
        days=1,
        args=[session_factory],
        id="daily_retention_review",
        replace_existing=True,
    )
    scheduler.start()
    return scheduler

