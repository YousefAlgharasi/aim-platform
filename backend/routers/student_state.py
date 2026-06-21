import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.student_state import (
    StudentRead,
    StudentSkillState,
    StudentSkillStateRead,
    StudentSkillStateUpdate,
    Student,
)

router = APIRouter(prefix="/students", tags=["student-state"])


@router.get("/{student_id}/state", response_model=list[StudentSkillStateRead])
async def get_student_state(
    student_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> list[StudentSkillStateRead]:
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    result = await db.execute(
        select(StudentSkillState).where(StudentSkillState.student_id == student_id)
    )
    states = result.scalars().all()
    return [StudentSkillStateRead.model_validate(s) for s in states]


@router.get("/{student_id}/skills/{skill_id}/state", response_model=StudentSkillStateRead)
async def get_student_skill_state(
    student_id: uuid.UUID,
    skill_id: str,
    db: AsyncSession = Depends(get_db),
) -> StudentSkillStateRead:
    result = await db.execute(
        select(StudentSkillState).where(
            StudentSkillState.student_id == student_id,
            StudentSkillState.skill_id == skill_id,
        )
    )
    state = result.scalar_one_or_none()
    if state is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill state not found")
    return StudentSkillStateRead.model_validate(state)


@router.put(
    "/{student_id}/skills/{skill_id}/state",
    response_model=StudentSkillStateRead,
    status_code=status.HTTP_200_OK,
)
async def upsert_student_skill_state(
    student_id: uuid.UUID,
    skill_id: str,
    payload: StudentSkillStateUpdate,
    db: AsyncSession = Depends(get_db),
) -> StudentSkillStateRead:
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    result = await db.execute(
        select(StudentSkillState).where(
            StudentSkillState.student_id == student_id,
            StudentSkillState.skill_id == skill_id,
        )
    )
    state = result.scalar_one_or_none()

    if state is None:
        state = StudentSkillState(student_id=student_id, skill_id=skill_id)
        db.add(state)

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(state, field, value)

    await db.commit()
    await db.refresh(state)
    return StudentSkillStateRead.model_validate(state)
