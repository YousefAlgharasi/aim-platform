"""React web-pilot routes for lessons, sessions, and adaptive results."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.recommendations import RecommendationUseCases
from aim.application.use_cases.sessions import SessionUseCases
from aim.domain.services.performance_analyzer import AttemptRecord
from aim.infrastructure.database.models.content import (
    AuditLogORM,
    LessonORM,
    QuestionChoiceORM,
    QuestionORM,
)
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.presentation.api.auth import (
    SupabaseUser,
    get_current_supabase_user,
    require_student_access,
)
from aim.presentation.api.dependencies import get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.attempts import TimeOfDay

router = APIRouter(prefix="/students/{student_id}", tags=["web-pilot"])


class WebPilotAttempt(BaseModel):
    student_id: int
    skill_id: str
    question_id: str
    session_id: str

    selected_answer: str | None = None
    is_correct: bool | None = None
    confidence: float | None = Field(None, ge=0.0, le=100.0)

    response_time: float = Field(..., gt=0, description="Time in seconds")
    attempts: int = Field(1, ge=1)
    difficulty: int = Field(..., ge=1, le=5)

    hint_used: bool = False
    skip: bool = False
    answer_changed: bool = False

    time_of_day: TimeOfDay
    session_position: int = Field(..., ge=1)


class WebPilotBatchAttemptRequest(BaseModel):
    attempts: list[WebPilotAttempt]


def _to_domain(schema: WebPilotAttempt, *, is_correct: bool) -> AttemptRecord:
    return AttemptRecord(
        student_id=schema.student_id,
        skill_id=schema.skill_id,
        question_id=schema.question_id,
        session_id=schema.session_id,
        is_correct=is_correct,
        response_time=schema.response_time,
        attempts=schema.attempts,
        difficulty=schema.difficulty,
        hint_used=schema.hint_used,
        skip=schema.skip,
        answer_changed=schema.answer_changed,
        time_of_day=schema.time_of_day.value,
        session_position=schema.session_position,
    )


def _normalize_answer(value: str | None) -> str:
    return (value or "").strip().casefold()


def _score_attempt(db: Session, attempt: WebPilotAttempt) -> bool:
    if attempt.is_correct is not None:
        return attempt.is_correct
    if attempt.skip:
        return False

    question = (
        db.query(QuestionORM)
        .filter(QuestionORM.question_id == attempt.question_id)
        .first()
    )
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Question '{attempt.question_id}' was not found.",
        )

    return _normalize_answer(attempt.selected_answer) == _normalize_answer(
        question.correct_answer
    )


def _serialize_lesson(lesson: LessonORM, *, include_content: bool = False) -> dict:
    data = {
        "id": lesson.id,
        "lesson_id": lesson.lesson_id,
        "course_id": lesson.course_id,
        "chapter_id": lesson.chapter_id,
        "title": lesson.title,
        "lesson_order": lesson.lesson_order,
        "level": lesson.level,
        "skill_focus": list(lesson.skill_focus or []),
        "main_skill_id": lesson.main_skill_id,
        "prerequisites": list(lesson.prerequisites or []),
        "estimated_minutes": lesson.estimated_minutes,
        "difficulty": lesson.difficulty,
        "is_active": lesson.is_active,
    }
    if include_content:
        data["content"] = dict(lesson.content or {})
    return data


def _question_choices(db: Session, question: QuestionORM) -> list[dict]:
    rows = (
        db.query(QuestionChoiceORM)
        .filter(QuestionChoiceORM.question_id == question.question_id)
        .order_by(QuestionChoiceORM.choice_order.asc(), QuestionChoiceORM.id.asc())
        .all()
    )
    if rows:
        return [
            {
                "choice_order": row.choice_order,
                "choice_text": row.choice_text,
                "metadata": dict(row.metadata_json or {}),
            }
            for row in rows
        ]

    choices = question.choices or []
    return [
        {
            "choice_order": index,
            "choice_text": str(choice),
            "metadata": {},
        }
        for index, choice in enumerate(choices, start=1)
    ]


def _serialize_question(db: Session, question: QuestionORM) -> dict:
    return {
        "id": question.id,
        "question_id": question.question_id,
        "lesson_id": question.lesson_id,
        "skill_id": question.skill_id,
        "question_type": question.question_type,
        "prompt": question.prompt,
        "difficulty": question.difficulty,
        "points": question.points,
        "concept": question.concept,
        "choices": _question_choices(db, question),
        "prerequisites": list(question.prerequisites or []),
        "common_error_tags": list(question.common_error_tags or []),
        "metadata": dict(question.metadata_json or {}),
    }


def _active_lesson_or_404(db: Session, lesson_id: str) -> LessonORM:
    lesson = (
        db.query(LessonORM)
        .filter(LessonORM.lesson_id == lesson_id, LessonORM.is_active.is_(True))
        .first()
    )
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found.")
    return lesson


def _lesson_questions(db: Session, lesson_id: str) -> list[QuestionORM]:
    return (
        db.query(QuestionORM)
        .filter(QuestionORM.lesson_id == lesson_id, QuestionORM.is_active.is_(True))
        .order_by(QuestionORM.difficulty.asc(), QuestionORM.id.asc())
        .all()
    )


def _remember_result(
    db: Session,
    *,
    student_id: int,
    session_id: str,
    action: str,
    result: dict,
) -> None:
    db.add(
        AuditLogORM(
            actor_student_id=student_id,
            action=action,
            entity_type="web_session",
            entity_id=session_id,
            before_state={},
            after_state=result,
            metadata_json={"source": "react_web_pilot"},
        )
    )
    db.commit()


@router.get(
    "/lessons",
    response_model=dict,
    summary="List active pilot lessons for the authenticated student",
)
def list_lessons(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    lessons = (
        db.query(LessonORM)
        .filter(LessonORM.is_active.is_(True))
        .order_by(LessonORM.lesson_order.asc(), LessonORM.id.asc())
        .all()
    )
    return {
        "student_id": student_id,
        "lessons": [_serialize_lesson(lesson) for lesson in lessons],
    }


@router.get(
    "/lessons/{lesson_id}",
    response_model=dict,
    summary="Get one pilot lesson with quiz questions",
)
def get_lesson(
    student_id: int,
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    lesson = _active_lesson_or_404(db, lesson_id)
    questions = _lesson_questions(db, lesson_id)
    return {
        "student_id": student_id,
        "lesson": _serialize_lesson(lesson, include_content=True),
        "questions": [_serialize_question(db, question) for question in questions],
    }


@router.post(
    "/lessons/{lesson_id}/sessions",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Start a lesson session for the React pilot",
)
def start_lesson_session(
    student_id: int,
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    lesson = _active_lesson_or_404(db, lesson_id)
    questions = _lesson_questions(db, lesson_id)
    started_at = datetime.now(timezone.utc).replace(tzinfo=None)
    result = {
        "student_id": student_id,
        "lesson_id": lesson.lesson_id,
        "session_id": f"{lesson.lesson_id}:{uuid4().hex[:12]}",
        "started_at": started_at.isoformat(),
        "lesson": _serialize_lesson(lesson, include_content=True),
        "questions": [_serialize_question(db, question) for question in questions],
    }
    _remember_result(
        db,
        student_id=student_id,
        session_id=result["session_id"],
        action="start_session",
        result=result,
    )
    return result


@router.post(
    "/sessions/{session_id}/attempts",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a web-pilot session and receive the full AIM adaptive result",
)
def submit_session_attempts(
    student_id: int,
    session_id: str,
    body: WebPilotBatchAttemptRequest,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    if any(attempt.student_id != student_id for attempt in body.attempts):
        raise HTTPException(
            status_code=422,
            detail="All attempts must belong to the student in the URL.",
        )
    if any(attempt.session_id != session_id for attempt in body.attempts):
        raise HTTPException(
            status_code=422,
            detail="All attempts must belong to the session in the URL.",
        )

    try:
        scored_attempts = [
            _to_domain(attempt, is_correct=_score_attempt(db, attempt))
            for attempt in body.attempts
        ]
        result = SessionUseCases(SqlAlchemyUnitOfWork(db)).record_attempts(
            session_id,
            scored_attempts,
        )
    except ApplicationError as exc:
        raise_http_error(exc)

    _remember_result(
        db,
        student_id=student_id,
        session_id=session_id,
        action="adaptive_result",
        result=result,
    )
    return result


@router.get(
    "/sessions/{session_id}/adaptive-result",
    response_model=dict,
    summary="Get the latest stored AIM adaptive result for a web session",
)
def get_adaptive_result(
    student_id: int,
    session_id: str,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    row = (
        db.query(AuditLogORM)
        .filter(
            AuditLogORM.actor_student_id == student_id,
            AuditLogORM.entity_type == "web_session",
            AuditLogORM.entity_id == session_id,
            AuditLogORM.action == "adaptive_result",
        )
        .order_by(AuditLogORM.id.desc())
        .first()
    )
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adaptive result not found for this session.",
        )
    return dict(row.after_state or {})


@router.get(
    "/recommendation",
    response_model=dict,
    summary="Get AIM's next recommendation for the React pilot",
)
def get_web_recommendation(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        recommendation_id, result = RecommendationUseCases(
            SqlAlchemyUnitOfWork(db)
        ).get_next_action(student_id)
    except ApplicationError as exc:
        raise_http_error(exc)

    return {
        "recommendation_id": recommendation_id,
        "student_id": result.student_id,
        "action": result.action,
        "action_type": result.action_type.value,
        "target_skill_id": result.target_skill_id,
        "skill_id": result.skill_id,
        "difficulty": result.difficulty,
        "reason": result.reason,
        "evidence": dict(result.evidence),
        "confidence": result.confidence,
        "inputs_snapshot": dict(result.inputs_snapshot),
    }
