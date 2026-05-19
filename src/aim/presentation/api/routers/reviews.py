"""Review routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.reviews import ReviewUseCases
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.presentation.api.dependencies import get_db as _get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.reviews import DueReviewRead

router = APIRouter(tags=["reviews"])


def get_db():
    yield from _get_db()


@router.get(
    "/students/{student_id}/due-reviews",
    response_model=list[DueReviewRead],
    summary="Get skills due for retention review",
)
def get_due_reviews(student_id: int, db: Session = Depends(get_db)):
    try:
        return ReviewUseCases(SqlAlchemyUnitOfWork(db)).get_due_reviews(student_id)
    except ApplicationError as exc:
        raise_http_error(exc)

