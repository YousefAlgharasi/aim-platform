"""SQLAlchemy repository for prerequisite gap records."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from aim.infrastructure.database.models.prerequisite_gap import (
    PrerequisiteGapRecordORM,
)


class SQLPrerequisiteGapRepository:
    OPEN_STATUS = "open"
    RESOLVED_STATUS = "resolved"

    def __init__(self, db: Session) -> None:
        self._db = db

    def upsert_open_gap(
        self,
        *,
        student_id: int,
        skill_id: str,
        missing_prerequisite_skill_id: str,
        severity: float,
    ) -> PrerequisiteGapRecordORM:
        row = (
            self._db.query(PrerequisiteGapRecordORM)
            .filter(
                PrerequisiteGapRecordORM.student_id == student_id,
                PrerequisiteGapRecordORM.skill_id == skill_id,
                PrerequisiteGapRecordORM.missing_prerequisite_skill_id
                == missing_prerequisite_skill_id,
                PrerequisiteGapRecordORM.status == self.OPEN_STATUS,
            )
            .first()
        )
        if row is None:
            row = PrerequisiteGapRecordORM(
                student_id=student_id,
                skill_id=skill_id,
                missing_prerequisite_skill_id=missing_prerequisite_skill_id,
                status=self.OPEN_STATUS,
                severity=severity,
            )
            self._db.add(row)
        else:
            row.severity = severity
        self._db.flush()
        return row

    def resolve_gap(
        self,
        *,
        student_id: int,
        skill_id: str,
        missing_prerequisite_skill_id: str,
    ) -> None:
        row = (
            self._db.query(PrerequisiteGapRecordORM)
            .filter(
                PrerequisiteGapRecordORM.student_id == student_id,
                PrerequisiteGapRecordORM.skill_id == skill_id,
                PrerequisiteGapRecordORM.missing_prerequisite_skill_id
                == missing_prerequisite_skill_id,
                PrerequisiteGapRecordORM.status == self.OPEN_STATUS,
            )
            .first()
        )
        if row is None:
            return
        row.status = self.RESOLVED_STATUS
        row.resolved_at = datetime.now(timezone.utc).replace(tzinfo=None)
        self._db.flush()

    def list_open_gaps(
        self,
        student_id: int,
        skill_id: str | None = None,
    ) -> list[PrerequisiteGapRecordORM]:
        query = self._db.query(PrerequisiteGapRecordORM).filter(
            PrerequisiteGapRecordORM.student_id == student_id,
            PrerequisiteGapRecordORM.status == self.OPEN_STATUS,
        )
        if skill_id is not None:
            query = query.filter(PrerequisiteGapRecordORM.skill_id == skill_id)
        return query.order_by(PrerequisiteGapRecordORM.severity.desc()).all()
