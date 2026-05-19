"""
T-10: Recommendation endpoint.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai_core.recommendation_engine import RecommendationEngine
from backend.models.student_state import StudentORM
from backend.repositories.recommendation_repository import (
    SQLRecommendationContextProvider,
    SQLRecommendationLogger,
)

router = APIRouter(tags=["recommendations"])


class NextActionRead(BaseModel):
    recommendation_id: int
    student_id: int
    action_type: str
    skill_id: str | None
    difficulty: int
    reason: str


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
    "/students/{student_id}/next-action",
    response_model=NextActionRead,
    summary="Get AIM's next recommended learning action",
)
def get_next_action(
    student_id: int,
    db: Session = Depends(get_db),
) -> NextActionRead:
    _get_student_or_404(student_id, db)

    engine = RecommendationEngine(SQLRecommendationContextProvider(db))
    result = engine.get_next_action(student_id)
    log = SQLRecommendationLogger(db).log(result)

    return NextActionRead(
        recommendation_id=log.id,
        student_id=result.student_id,
        action_type=result.action_type.value,
        skill_id=result.skill_id,
        difficulty=result.difficulty,
        reason=result.reason,
    )
