"""Micro-goal routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.goals import GoalUseCases
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.presentation.api.dependencies import get_db as _get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.goals import MicroGoalRead

router = APIRouter(tags=["goals"])


def get_db():
    yield from _get_db()


def refresh_student_goals(
    db: Session,
    student_id: int,
    *,
    current_skill_id: str | None = None,
):
    return GoalUseCases(SqlAlchemyUnitOfWork(db)).refresh_goals(
        student_id,
        current_skill_id=current_skill_id,
    )


@router.get(
    "/students/{student_id}/goals",
    response_model=list[MicroGoalRead],
    summary="Get current active micro-goals for a student",
)
def get_student_goals(student_id: int, db: Session = Depends(get_db)):
    try:
        return GoalUseCases(SqlAlchemyUnitOfWork(db)).list_or_refresh_goals(student_id)
    except ApplicationError as exc:
        raise_http_error(exc)

