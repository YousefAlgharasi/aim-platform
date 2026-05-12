"""
T-03: Student State Router
────────────────────────────────────────────────────────────────────────────────
Endpoints:
  POST /students                                   → Create a new student
  GET  /students/{student_id}                      → Get student profile
  GET  /students/{student_id}/state                → All skill states
  GET  /students/{student_id}/skills/{skill_id}/state  → One skill state
  POST /students/{student_id}/skills/{skill_id}/state  → Init skill state
  PUT  /students/{student_id}/skills/{skill_id}/state  → Update skill state
────────────────────────────────────────────────────────────────────────────────
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.models.student_state import (
    StudentCreate,
    StudentORM,
    StudentRead,
    StudentSkillStateCreate,
    StudentSkillStateORM,
    StudentSkillStateRead,
    StudentSkillStateUpdate,
)

router = APIRouter(tags=["student-state"])


# ──────────────────────────────────────────────
# DB dependency — imported lazily so tests can
# override it before the module is fully loaded
# ──────────────────────────────────────────────

def get_db():
    """
    Default dependency — delegates to backend.db.get_db.
    Tests override this via app.dependency_overrides[get_db].
    """
    from backend.db import get_db as _real_get_db
    yield from _real_get_db()


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _get_student_or_404(student_id: int, db: Session) -> StudentORM:
    student = db.query(StudentORM).filter(StudentORM.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student {student_id} not found.",
        )
    return student


def _get_skill_state_or_404(
    student_id: int, skill_id: str, db: Session
) -> StudentSkillStateORM:
    state = (
        db.query(StudentSkillStateORM)
        .filter(
            StudentSkillStateORM.student_id == student_id,
            StudentSkillStateORM.skill_id == skill_id,
        )
        .first()
    )
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No state found for student {student_id}, skill '{skill_id}'.",
        )
    return state


# ══════════════════════════════════════════════
# STUDENT ENDPOINTS
# ══════════════════════════════════════════════

@router.post(
    "/students",
    response_model=StudentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new student",
)
def create_student(
    body: StudentCreate, db: Session = Depends(get_db)
) -> StudentRead:
    existing = db.query(StudentORM).filter(StudentORM.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A student with email '{body.email}' already exists.",
        )
    student = StudentORM(name=body.name, email=body.email)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get(
    "/students/{student_id}",
    response_model=StudentRead,
    summary="Get student profile",
)
def get_student(
    student_id: int, db: Session = Depends(get_db)
) -> StudentRead:
    return _get_student_or_404(student_id, db)


# ══════════════════════════════════════════════
# SKILL STATE ENDPOINTS
# ══════════════════════════════════════════════

@router.get(
    "/students/{student_id}/state",
    response_model=list[StudentSkillStateRead],
    summary="Get all skill states for a student",
)
def get_student_state(
    student_id: int, db: Session = Depends(get_db)
) -> list[StudentSkillStateRead]:
    _get_student_or_404(student_id, db)
    return (
        db.query(StudentSkillStateORM)
        .filter(StudentSkillStateORM.student_id == student_id)
        .all()
    )


@router.get(
    "/students/{student_id}/skills/{skill_id}/state",
    response_model=StudentSkillStateRead,
    summary="Get state for one skill",
)
def get_skill_state(
    student_id: int, skill_id: str, db: Session = Depends(get_db)
) -> StudentSkillStateRead:
    _get_student_or_404(student_id, db)
    return _get_skill_state_or_404(student_id, skill_id, db)


@router.post(
    "/students/{student_id}/skills/{skill_id}/state",
    response_model=StudentSkillStateRead,
    status_code=status.HTTP_201_CREATED,
    summary="Initialise state for a new skill",
)
def create_skill_state(
    student_id: int,
    skill_id: str,
    body: StudentSkillStateCreate,
    db: Session = Depends(get_db),
) -> StudentSkillStateRead:
    _get_student_or_404(student_id, db)

    existing = (
        db.query(StudentSkillStateORM)
        .filter(
            StudentSkillStateORM.student_id == student_id,
            StudentSkillStateORM.skill_id == skill_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"State for student {student_id}, skill '{skill_id}' already exists. "
                "Use PUT to update it."
            ),
        )

    state = StudentSkillStateORM(
        student_id=student_id,
        skill_id=skill_id,
        mastery=body.mastery,
        confidence=body.confidence,
        attempts=body.attempts,
        avg_speed=body.avg_speed,
        retention=body.retention,
        weakness_score=body.weakness_score,
        frustration_score=body.frustration_score,
        learning_style=body.learning_style,
        session_performance=body.session_performance,
        last_reviewed_at=body.last_reviewed_at,
    )
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


@router.put(
    "/students/{student_id}/skills/{skill_id}/state",
    response_model=StudentSkillStateRead,
    summary="Update (partial) state for a skill",
)
def update_skill_state(
    student_id: int,
    skill_id: str,
    body: StudentSkillStateUpdate,
    db: Session = Depends(get_db),
) -> StudentSkillStateRead:
    _get_student_or_404(student_id, db)
    state = _get_skill_state_or_404(student_id, skill_id, db)

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(state, field, value)

    db.commit()
    db.refresh(state)
    return state
