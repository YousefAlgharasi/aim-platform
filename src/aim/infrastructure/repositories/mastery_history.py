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
            previous_mastery=result.previous_mastery,
            mastery_raw=result.mastery_raw,
            mastery_adjusted=result.mastery_adjusted,
            final_mastery=result.final_mastery,
            accuracy=result.accuracy_score,
            speed_score=0.0,
            consistency=result.consistency_score,
            retention=result.retention_score,
            difficulty_performance=result.difficulty_performance_score,
            reliability=result.reliability,
            evidence_quality_score=result.evidence_quality_score,
            penalties_json=dict(result.penalties),
        )
        self._db.add(row)
        self._db.flush()
        return row
