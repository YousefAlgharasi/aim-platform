"""Student state routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from aim.application.errors import ApplicationError
from aim.application.use_cases.students import StudentUseCases
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.infrastructure.database.models.student import StudentORM
from aim.presentation.api.auth import (
    SupabaseUser,
    auth_user_id_for_student_create,
    get_current_supabase_user,
    require_student_access,
)
from aim.presentation.api.dependencies import get_db as _get_db
from aim.presentation.api.errors import raise_http_error
from aim.presentation.api.schemas.students import (
    StudentCreate,
    StudentRead,
    StudentSkillStateCreate,
    StudentSkillStateRead,
    StudentSkillStateUpdate,
)

router = APIRouter(tags=["student-state"])


def get_db():
    yield from _get_db()


def _use_cases(db: Session) -> StudentUseCases:
    return StudentUseCases(SqlAlchemyUnitOfWork(db))


@router.get(
    "/students/me",
    response_model=StudentRead,
    summary="Get the student linked to the authenticated Supabase user",
)
def get_current_student(
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Supabase authentication is required for /students/me.",
        )

    student = (
        db.query(StudentORM)
        .filter(StudentORM.auth_user_id == current_user.user_id)
        .first()
    )
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No student is linked to this authenticated user.",
        )
    return student


@router.post(
    "/students",
    response_model=StudentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new student",
)
def create_student(
    body: StudentCreate,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    try:
        auth_user_id = auth_user_id_for_student_create(
            email=body.email,
            current_user=current_user,
        )
        return _use_cases(db).create_student(
            name=body.name,
            email=body.email,
            auth_user_id=auth_user_id,
        )
    except ApplicationError as exc:
        raise_http_error(exc)


@router.get(
    "/students/{student_id}",
    response_model=StudentRead,
    summary="Get student profile",
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        return _use_cases(db).get_student(student_id)
    except ApplicationError as exc:
        raise_http_error(exc)


@router.get(
    "/students/{student_id}/state",
    response_model=list[StudentSkillStateRead],
    summary="Get all skill states for a student",
)
def get_student_state(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        return _use_cases(db).list_skill_states(student_id)
    except ApplicationError as exc:
        raise_http_error(exc)


@router.get(
    "/students/{student_id}/skills/{skill_id}/state",
    response_model=StudentSkillStateRead,
    summary="Get state for one skill",
)
def get_skill_state(
    student_id: int,
    skill_id: str,
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        return _use_cases(db).get_skill_state(student_id, skill_id)
    except ApplicationError as exc:
        raise_http_error(exc)


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
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        return _use_cases(db).create_skill_state(
            student_id,
            skill_id,
            body.model_dump(),
        )
    except ApplicationError as exc:
        raise_http_error(exc)


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
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
):
    require_student_access(student_id=student_id, db=db, current_user=current_user)
    try:
        return _use_cases(db).update_skill_state(
            student_id,
            skill_id,
            body.model_dump(exclude_unset=True),
        )
    except ApplicationError as exc:
        raise_http_error(exc)

