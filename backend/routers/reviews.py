"""
T-08: Due review endpoints.
"""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai_core.retention_tracker import RetentionTracker
from backend.models.student_state import StudentORM
from backend.repositories.retention_repository import SQLRetentionRepository

router = APIRouter(tags=["reviews"])


class DueReviewRead(BaseModel):
    student_id: int
    skill_id: str
    retention: float
    retention_lambda: float
    days_since_review: float
    is_due: bool


def get_db():
    """Default dependency delegated lazily so tests can override it."""
    from backend.db import get_db as _real_get_db
    yield from _real_get_db()


def _get_student_or_404(student_id: int, db: Session) -> StudentORM:
    student = db.query(StudentORM).filter(StudentORM.id == student_id).first()
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )
    return student


@router.get(
    "/students/{student_id}/due-reviews",
    response_model=list[DueReviewRead],
    summary="Get skills due for retention review",
)
def get_due_reviews(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[DueReviewRead]:
    _get_student_or_404(student_id, db)
    tracker = RetentionTracker(
        SQLRetentionRepository(db),
        now=datetime.utcnow(),
    )
    return tracker.get_skills_due_for_review(student_id)
