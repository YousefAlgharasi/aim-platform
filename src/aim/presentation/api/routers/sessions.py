"""Session routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.sessions import SessionUseCases
from aim.domain.services.performance_analyzer import AttemptRecord
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.presentation.api.dependencies import get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.attempts import BatchAttemptRequest, QuestionAttemptCreate

router = APIRouter(prefix="/sessions", tags=["sessions"])


def _to_domain(schema: QuestionAttemptCreate) -> AttemptRecord:
    return AttemptRecord(
        student_id=schema.student_id,
        skill_id=schema.skill_id,
        question_id=schema.question_id,
        session_id=schema.session_id,
        is_correct=schema.is_correct,
        response_time=schema.response_time,
        attempts=schema.attempts,
        difficulty=schema.difficulty,
        hint_used=schema.hint_used,
        skip=schema.skip,
        answer_changed=schema.answer_changed,
        time_of_day=schema.time_of_day.value,
        session_position=schema.session_position,
    )


@router.post(
    "/{session_id}/attempts",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Batch-record all attempts from a session",
)
def record_session_attempts(
    session_id: str,
    body: BatchAttemptRequest,
    db: Session = Depends(get_db),
) -> dict:
    try:
        return SessionUseCases(SqlAlchemyUnitOfWork(db)).record_attempts(
            session_id,
            [_to_domain(attempt) for attempt in body.attempts],
        )
    except ApplicationError as exc:
        raise_http_error(exc)
