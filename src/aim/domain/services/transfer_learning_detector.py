"""
T-11: Transfer Learning Detection

Detects whether mastery of one skill accelerates learning of a related skill.
Relationship coefficients come from skill_graph.json prerequisite edges.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Sequence

from aim.infrastructure.skill_graph.skill_graph import SkillGraph


class TransferCategory(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


@dataclass(frozen=True)
class TransferLearningRecord:
    student_id: int
    from_skill_id: str
    to_skill_id: str
    previous_skill_mastery: float  # 0-100
    time_to_mastery_days: float
    had_prerequisite_mastered: bool


@dataclass(frozen=True)
class TransferScoreResult:
    student_id: int
    from_skill_id: str
    to_skill_id: str
    relationship_coefficient: float
    previous_skill_mastery: float
    avg_time_to_learn_new_skill: float
    transfer_score: float
    category: TransferCategory
    recommendation_flag: str


@dataclass(frozen=True)
class TransferComparison:
    from_skill_id: str
    to_skill_id: str
    mastered_avg_time: float | None
    unmastered_avg_time: float | None
    acceleration_ratio: float | None


class TransferLearningDetector:
    HIGH_THRESHOLD = 0.70
    LOW_THRESHOLD = 0.30

    def __init__(self, skill_graph: SkillGraph | None = None) -> None:
        self._skill_graph = skill_graph or SkillGraph()

    def get_relationship_map(self) -> dict[tuple[str, str], float]:
        """
        Return prerequisite edge map: (from_skill, to_skill) -> coefficient.
        """
        relationships = {}
        for to_skill_id in self._skill_graph.get_all_skill_ids():
            for prereq in self._skill_graph.get_prerequisites(to_skill_id):
                relationships[(prereq["skill_id"], to_skill_id)] = prereq[
                    "relationship_coefficient"
                ]
        return relationships

    def calculate_transfer_score(
        self,
        *,
        from_skill_id: str,
        to_skill_id: str,
        previous_skill_mastery: float,
        avg_time_to_learn_new_skill: float,
    ) -> TransferScoreResult:
        if not 0.0 <= previous_skill_mastery <= 100.0:
            raise ValueError(
                f"previous_skill_mastery must be 0-100, got {previous_skill_mastery}"
            )
        if avg_time_to_learn_new_skill <= 0.0:
            raise ValueError("avg_time_to_learn_new_skill must be > 0")

        coefficient = self._relationship_coefficient(from_skill_id, to_skill_id)
        normalized_mastery = previous_skill_mastery / 100.0
        score = round(
            (normalized_mastery * coefficient) / avg_time_to_learn_new_skill,
            4,
        )
        category = self._category(score)

        return TransferScoreResult(
            student_id=0,
            from_skill_id=from_skill_id,
            to_skill_id=to_skill_id,
            relationship_coefficient=coefficient,
            previous_skill_mastery=previous_skill_mastery,
            avg_time_to_learn_new_skill=avg_time_to_learn_new_skill,
            transfer_score=score,
            category=category,
            recommendation_flag=self._recommendation_flag(category),
        )

    def detect_for_student(
        self,
        student_id: int,
        records: Sequence[TransferLearningRecord],
    ) -> TransferScoreResult | None:
        student_records = [record for record in records if record.student_id == student_id]
        if not student_records:
            return None

        scored = [
            self._score_record(record, self._avg_time(records, record.to_skill_id))
            for record in student_records
        ]
        return max(scored, key=lambda result: result.transfer_score)

    def compare_prerequisite_groups(
        self,
        records: Sequence[TransferLearningRecord],
        *,
        from_skill_id: str,
        to_skill_id: str,
    ) -> TransferComparison:
        related = [
            record for record in records
            if record.from_skill_id == from_skill_id
            and record.to_skill_id == to_skill_id
        ]
        mastered = [r.time_to_mastery_days for r in related if r.had_prerequisite_mastered]
        unmastered = [
            r.time_to_mastery_days for r in related if not r.had_prerequisite_mastered
        ]
        mastered_avg = self._safe_avg(mastered)
        unmastered_avg = self._safe_avg(unmastered)

        acceleration_ratio = None
        if mastered_avg is not None and unmastered_avg is not None and mastered_avg > 0:
            acceleration_ratio = round(unmastered_avg / mastered_avg, 4)

        return TransferComparison(
            from_skill_id=from_skill_id,
            to_skill_id=to_skill_id,
            mastered_avg_time=mastered_avg,
            unmastered_avg_time=unmastered_avg,
            acceleration_ratio=acceleration_ratio,
        )

    def _score_record(
        self,
        record: TransferLearningRecord,
        avg_time_to_learn_new_skill: float,
    ) -> TransferScoreResult:
        base = self.calculate_transfer_score(
            from_skill_id=record.from_skill_id,
            to_skill_id=record.to_skill_id,
            previous_skill_mastery=record.previous_skill_mastery,
            avg_time_to_learn_new_skill=avg_time_to_learn_new_skill,
        )
        return TransferScoreResult(
            student_id=record.student_id,
            from_skill_id=base.from_skill_id,
            to_skill_id=base.to_skill_id,
            relationship_coefficient=base.relationship_coefficient,
            previous_skill_mastery=base.previous_skill_mastery,
            avg_time_to_learn_new_skill=base.avg_time_to_learn_new_skill,
            transfer_score=base.transfer_score,
            category=base.category,
            recommendation_flag=base.recommendation_flag,
        )

    def _relationship_coefficient(self, from_skill_id: str, to_skill_id: str) -> float:
        coefficient = self._skill_graph.get_relationship_coefficient(
            from_skill_id,
            to_skill_id,
        )
        if coefficient is None:
            raise ValueError(
                f"No prerequisite relationship from {from_skill_id} to {to_skill_id}"
            )
        return coefficient

    def _avg_time(
        self,
        records: Sequence[TransferLearningRecord],
        to_skill_id: str,
    ) -> float:
        times = [
            record.time_to_mastery_days
            for record in records
            if record.to_skill_id == to_skill_id and record.time_to_mastery_days > 0
        ]
        avg = self._safe_avg(times)
        if avg is None:
            raise ValueError(f"No positive learning times for {to_skill_id}")
        return avg

    @staticmethod
    def _safe_avg(values: Sequence[float]) -> float | None:
        if not values:
            return None
        return round(sum(values) / len(values), 4)

    def _category(self, score: float) -> TransferCategory:
        if score > self.HIGH_THRESHOLD:
            return TransferCategory.HIGH
        if score < self.LOW_THRESHOLD:
            return TransferCategory.LOW
        return TransferCategory.MEDIUM

    @staticmethod
    def _recommendation_flag(category: TransferCategory) -> str:
        if category == TransferCategory.HIGH:
            return "ACCELERATED"
        if category == TransferCategory.LOW:
            return "TEACH_FROM_SCRATCH"
        return "STANDARD_SEQUENCE"
