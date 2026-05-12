"""
T-04: Sessions Router
POST /sessions/{session_id}/attempts  — batch-record all attempts from a session.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.db import get_db                                      # project-standard DB dependency
from backend.models.question_attempt import (
    BatchAttemptRequest,
    QuestionAttemptCreate,
    QuestionAttemptORM,
    QuestionAttemptRead,
)
from ai_core.performance_analyzer import AttemptRecord, PerformanceAnalyzer
from backend.repositories.attempt_repository import SQLAttemptRepository   # concrete impl

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ──────────────────────────────────────────────
# Helper: convert API schema → domain record
# ──────────────────────────────────────────────

def _to_domain(schema: QuestionAttemptCreate, session_id: str) -> AttemptRecord:
    return AttemptRecord(
        student_id=schema.student_id,
        skill_id=schema.skill_id,
        question_id=schema.question_id,
        session_id=session_id,
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


# ──────────────────────────────────────────────
# Endpoint
# ──────────────────────────────────────────────

@router.post(
    "/{session_id}/attempts",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Batch-record all attempts from a session",
    description=(
        "Accepts a list of question attempts from a completed session. "
        "Persists them and immediately recalculates performance metrics "
        "(accuracy, avg_speed, retry_rate, hesitation_index) for each "
        "affected student+skill pair, writing updated values back into "
        "student_skill_states."
    ),
)
def record_session_attempts(
    session_id: str,
    body: BatchAttemptRequest,
    db: Session = Depends(get_db),
) -> dict:
    if not body.attempts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No attempts provided.",
        )

    # Validate: all attempts reference the same session_id
    mismatched = [
        a for a in body.attempts if a.session_id != session_id
    ]
    if mismatched:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"{len(mismatched)} attempt(s) have a session_id that does not "
                f"match the URL parameter '{session_id}'."
            ),
        )

    repo = SQLAttemptRepository(db)
    analyzer = PerformanceAnalyzer(repo)

    domain_attempts = [_to_domain(a, session_id) for a in body.attempts]
    analyzer.record_session_attempts(domain_attempts)

    # Collect updated metrics to return to caller
    skills_updated = {(a.student_id, a.skill_id) for a in domain_attempts}
    metrics_summary = []
    for student_id, skill_id in skills_updated:
        m = analyzer.calculate_all_metrics(student_id, skill_id)
        metrics_summary.append({
            "student_id":        m.student_id,
            "skill_id":          m.skill_id,
            "accuracy":          m.accuracy,
            "avg_speed":         m.avg_speed,
            "retry_rate":        m.retry_rate,
            "hesitation_index":  m.hesitation_index,
        })

    return {
        "session_id":      session_id,
        "attempts_saved":  len(domain_attempts),
        "metrics_updated": metrics_summary,
    }
