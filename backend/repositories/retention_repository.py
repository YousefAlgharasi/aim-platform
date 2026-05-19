"""
T-08: SQLAlchemy adapter for RetentionTracker.
"""

from __future__ import annotations

from typing import Sequence

from sqlalchemy.orm import Session

from ai_core.retention_tracker import RetentionSkillState
from ai_core.skill_graph import SkillGraph
from backend.models.student_state import StudentSkillStateORM


class SQLRetentionRepository:
    def __init__(self, db: Session, skill_graph: SkillGraph | None = None) -> None:
        self._db = db
        self._skill_graph = skill_graph or SkillGraph()

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> RetentionSkillState | None:
        row = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if row is None:
            return None
        return self._to_domain(row)

    def get_student_skill_states(
        self,
        student_id: int,
    ) -> Sequence[RetentionSkillState]:
        rows = (
            self._db.query(StudentSkillStateORM)
            .filter(StudentSkillStateORM.student_id == student_id)
            .all()
        )
        return [self._to_domain(row) for row in rows]

    def update_retention(
        self,
        student_id: int,
        skill_id: str,
        retention: float,
        is_due: bool,
    ) -> None:
        row = self._row(student_id, skill_id)
        row.retention = retention
        row.review_due = is_due
        self._db.commit()

    def update_lambda(
        self,
        student_id: int,
        skill_id: str,
        retention_lambda: float,
        retention_history: Sequence[dict],
    ) -> None:
        row = self._row(student_id, skill_id)
        row.retention_lambda = retention_lambda
        row.retention_history = list(retention_history)
        self._db.commit()

    def _row(self, student_id: int, skill_id: str) -> StudentSkillStateORM:
        row = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if row is None:
            raise KeyError(
                f"No retention state for student {student_id}, skill '{skill_id}'"
            )
        return row

    def _to_domain(self, row: StudentSkillStateORM) -> RetentionSkillState:
        category = None
        if row.skill_id in self._skill_graph:
            category = self._skill_graph.get_skill(row.skill_id)["category"]

        return RetentionSkillState(
            student_id=row.student_id,
            skill_id=row.skill_id,
            mastery=row.mastery,
            retention=row.retention,
            retention_lambda=row.retention_lambda,
            last_reviewed_at=row.last_reviewed_at,
            category=category,
            retention_history=row.retention_history or [],
        )
