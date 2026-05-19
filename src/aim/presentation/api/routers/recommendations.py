"""Recommendation routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.recommendations import RecommendationUseCases
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.presentation.api.dependencies import get_db as _get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.recommendations import NextActionRead

router = APIRouter(tags=["recommendations"])


def get_db():
    yield from _get_db()


@router.get(
    "/students/{student_id}/next-action",
    response_model=NextActionRead,
    summary="Get AIM's next recommended learning action",
)
def get_next_action(student_id: int, db: Session = Depends(get_db)) -> NextActionRead:
    try:
        recommendation_id, result = RecommendationUseCases(
            SqlAlchemyUnitOfWork(db)
        ).get_next_action(student_id)
        return NextActionRead(
            recommendation_id=recommendation_id,
            student_id=result.student_id,
            action_type=result.action_type.value,
            skill_id=result.skill_id,
            difficulty=result.difficulty,
            reason=result.reason,
        )
    except ApplicationError as exc:
        raise_http_error(exc)

