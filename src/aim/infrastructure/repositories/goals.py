"""SQLAlchemy micro-goal repository."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.models.student import StudentSkillStateORM


class SQLGoalRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def list_active_goals(self, student_id: int) -> list[MicroGoalORM]:
        goals = (
            self._db.query(MicroGoalORM)
            .filter(
                MicroGoalORM.student_id == student_id,
                MicroGoalORM.is_active.is_(True),
            )
            .all()
        )
        order = {"daily": 0, "weekly": 1, "monthly": 2}
        return sorted(goals, key=lambda goal: (order.get(goal.goal_type, 99), goal.id))

    def list_skill_states(self, student_id: int) -> list[StudentSkillStateORM]:
        return (
            self._db.query(StudentSkillStateORM)
            .filter(StudentSkillStateORM.student_id == student_id)
            .all()
        )

    def deactivate_active_goals(self, student_id: int) -> None:
        (
            self._db.query(MicroGoalORM)
            .filter(
                MicroGoalORM.student_id == student_id,
                MicroGoalORM.is_active.is_(True),
            )
            .update({"is_active": False}, synchronize_session=False)
        )

    def add_goals(self, goals: list[MicroGoalORM]) -> None:
        self._db.add_all(goals)
        self._db.flush()

    def refresh_goals(self, goals: list[MicroGoalORM]) -> None:
        for goal in goals:
            self._db.refresh(goal)

