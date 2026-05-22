"""SQLAlchemy repository for weakness detection output."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.weakness_detector import SkillWeakness
from aim.infrastructure.database.models.student import StudentSkillStateORM
from aim.infrastructure.database.models.weakness import WeaknessRecordORM


class SQLWeaknessRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_record(
        self,
        *,
        student_id: int,
        weakness: SkillWeakness,
    ) -> WeaknessRecordORM:
        row = WeaknessRecordORM(
            student_id=student_id,
            skill_id=weakness.skill_id,
            weakness_score=weakness.weakness_score,
            error_frequency=weakness.error_frequency,
            difficulty_weight=weakness.difficulty_weight,
            hint_usage_rate=weakness.hint_usage_rate,
            retry_rate=weakness.retry_rate,
            skip_rate=weakness.skip_rate,
            hesitation_index=weakness.hesitation_index,
            retention_drop=weakness.retention_drop,
            prerequisite_gap_score=weakness.prerequisite_gap_score,
            main_weaknesses=list(weakness.main_weaknesses),
            weakness_evidence=dict(weakness.weakness_evidence),
            severity=weakness.severity,
            repeated_mistakes=weakness.repeated_mistakes,
        )
        self._db.add(row)
        self._db.flush()
        return row

    def update_skill_state_score(
        self,
        *,
        student_id: int,
        skill_id: str,
        weakness_score: float,
    ) -> None:
        state = (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.weakness_score = weakness_score
        self._db.flush()

    def save_and_update_state(
        self,
        *,
        student_id: int,
        weakness: SkillWeakness,
    ) -> WeaknessRecordORM:
        row = self.add_record(student_id=student_id, weakness=weakness)
        self.update_skill_state_score(
            student_id=student_id,
            skill_id=weakness.skill_id,
            weakness_score=weakness.weakness_score,
        )
        return row
