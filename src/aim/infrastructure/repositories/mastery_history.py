"""SQLAlchemy repository for skill mastery history."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.mastery_calculator import MasteryResult
from aim.infrastructure.database.models.mastery_history import SkillMasteryHistoryORM


class SQLMasteryHistoryRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_from_result(self, result: MasteryResult) -> SkillMasteryHistoryORM:
        row = SkillMasteryHistoryORM(
            student_id=result.student_id,
            skill_id=result.skill_id,
            mastery=result.mastery,
            accuracy=result.accuracy_score,
            speed_score=result.speed_score,
            consistency=result.consistency_score,
            retention=result.retention_score,
            difficulty_performance=result.difficulty_score,
        )
        self._db.add(row)
        self._db.flush()
        return row
