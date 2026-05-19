"""
T-06: Goals Router

GET /students/{id}/goals returns the student's active micro-goals. If the
student has no active goals yet, it generates and stores a fresh set.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ai_core.micro_goal_generator import MicroGoalGenerator
from ai_core.skill_graph import SkillGraph
from backend.models.goal import MicroGoalORM, MicroGoalRead
from backend.models.student_state import StudentORM, StudentSkillStateORM

router = APIRouter(tags=["goals"])


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


def _active_goals(student_id: int, db: Session) -> list[MicroGoalORM]:
    goals = (
        db.query(MicroGoalORM)
        .filter(
            MicroGoalORM.student_id == student_id,
            MicroGoalORM.is_active.is_(True),
        )
        .all()
    )
    order = {"daily": 0, "weekly": 1, "monthly": 2}
    return sorted(goals, key=lambda g: (order.get(g.goal_type, 99), g.id))


def refresh_student_goals(
    db: Session,
    student_id: int,
    *,
    current_skill_id: str | None = None,
) -> list[MicroGoalORM]:
    """
    Deactivate old active goals and store a freshly generated set.
    """
    states = (
        db.query(StudentSkillStateORM)
        .filter(StudentSkillStateORM.student_id == student_id)
        .all()
    )
    state_dicts = [
        {
            "skill_id": state.skill_id,
            "mastery": state.mastery,
            "confidence": state.confidence,
            "weakness_score": state.weakness_score,
        }
        for state in states
    ]

    if current_skill_id is None and states:
        current_skill_id = min(states, key=lambda s: s.mastery).skill_id
    if current_skill_id is None:
        return []

    generator = MicroGoalGenerator(SkillGraph())
    generated = generator.generate(state_dicts, current_skill_id=current_skill_id)

    (
        db.query(MicroGoalORM)
        .filter(
            MicroGoalORM.student_id == student_id,
            MicroGoalORM.is_active.is_(True),
        )
        .update({"is_active": False}, synchronize_session=False)
    )

    goals = [
        MicroGoalORM(
            student_id=student_id,
            skill_id=goal.skill_id,
            goal_type=goal.goal_type.value,
            text=goal.text,
            is_active=True,
            is_completed=False,
        )
        for goal in generated
    ]
    db.add_all(goals)
    db.commit()
    for goal in goals:
        db.refresh(goal)
    return _active_goals(student_id, db)


@router.get(
    "/students/{student_id}/goals",
    response_model=list[MicroGoalRead],
    summary="Get current active micro-goals for a student",
)
def get_student_goals(
    student_id: int,
    db: Session = Depends(get_db),
) -> list[MicroGoalRead]:
    _get_student_or_404(student_id, db)

    goals = _active_goals(student_id, db)
    if goals:
        return goals

    return refresh_student_goals(db, student_id)
