"""SQLAlchemy repository for error pattern classification output."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.domain.services.error_pattern_classifier import (
    ErrorPatternResult,
    ErrorPatternType,
)
from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM


ARCHITECTURE_PATTERN_TYPES = {
    ErrorPatternType.TYPE_1_RANDOM: "guessing",
    ErrorPatternType.TYPE_2_CONSISTENT: "misunderstood_concept",
    ErrorPatternType.TYPE_3_PRESSURE: "rushing",
    ErrorPatternType.TYPE_4_WARMUP: "needs_warmup",
    ErrorPatternType.NO_DOMINANT_PATTERN: "unknown",
}


class SQLErrorPatternRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def add_record(
        self,
        *,
        student_id: int,
        skill_id: str,
        result: ErrorPatternResult,
    ) -> ErrorPatternRecordORM:
        row = ErrorPatternRecordORM(
            student_id=student_id,
            skill_id=skill_id,
            pattern_type=ARCHITECTURE_PATTERN_TYPES[result.pattern_type],
            evidence_json=dict(result.evidence),
            treatment_recommendation=result.treatment_recommendation,
        )
        self._db.add(row)
        self._db.flush()
        return row
