"""
T-08: Daily retention background job.
"""

from __future__ import annotations

from datetime import datetime
from typing import Callable

from sqlalchemy.orm import Session

from ai_core.retention_tracker import RetentionTracker
from backend.models.student_state import StudentORM
from backend.repositories.retention_repository import SQLRetentionRepository

try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ImportError:  # pragma: no cover - depends on optional local package install
    BackgroundScheduler = None


def run_retention_review_job(session_factory: Callable[[], Session]) -> int:
    """
    Recalculate retention for every active student skill state.

    Returns the number of skills flagged as due.
    """
    db = session_factory()
    try:
        student_ids = [row.id for row in db.query(StudentORM).all()]
        due_count = 0
        for student_id in student_ids:
            tracker = RetentionTracker(
                SQLRetentionRepository(db),
                now=datetime.utcnow(),
            )
            due_count += len(tracker.get_skills_due_for_review(student_id))
        return due_count
    finally:
        db.close()


def start_retention_scheduler(session_factory: Callable[[], Session]):
    """
    Start an APScheduler daily job.

    The project can still import this module without APScheduler installed; call
    this function only in an environment where the dependency is available.
    """
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
