"""Weakness detection V2 for AIM learning signals."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Iterable, Literal

WeaknessSeverity = Literal["low", "medium", "high"]


# Attempt facts used by weakness scoring.
@dataclass(frozen=True)
class WeaknessAttempt:
    """Attempt evidence used to calculate explainable weakness."""

    student_id: int
    skill_id: str
    is_correct: bool
    difficulty: int
    skip: bool = False
    hint_used: bool = False
    attempts: int = 1


# Weakness result for one skill.
@dataclass(frozen=True)
class SkillWeakness:
    """Explainable weakness score and evidence for one skill."""

    skill_id: str
    weakness_score: float
    error_frequency: float
    hint_usage_rate: float
    retry_rate: float
    skip_rate: float
    hesitation_index: float
    retention_drop: float
    prerequisite_gap_score: float
    main_weaknesses: list[str] = field(default_factory=list)
    weakness_evidence: dict[str, float | int | list[str]] = field(default_factory=dict)
    severity: WeaknessSeverity = "low"
    total_attempts: int = 0
    repeated_mistakes: int = 0
    difficulty_weight: float = 0.0


# Core weakness detector.
class WeaknessDetector:
    """Calculates V2 weakness without using speed as mastery evidence."""

    MAX_DIFFICULTY = 5

    def calculate_by_skill(
        self,
        attempts: Iterable[WeaknessAttempt],
        *,
        hesitation_index_by_skill: dict[str, float] | None = None,
        retention_drop_by_skill: dict[str, float] | None = None,
        prerequisite_gap_by_skill: dict[str, float] | None = None,
    ) -> list[SkillWeakness]:
        grouped: dict[str, list[WeaknessAttempt]] = defaultdict(list)
        for attempt in attempts:
            self._validate_difficulty(attempt.difficulty)
            grouped[attempt.skill_id].append(attempt)

        results = [
            self._calculate_one(
                skill_id,
                skill_attempts,
                hesitation_index=(hesitation_index_by_skill or {}).get(skill_id, 0.0),
                retention_drop=(retention_drop_by_skill or {}).get(skill_id, 0.0),
                prerequisite_gap_score=(prerequisite_gap_by_skill or {}).get(
                    skill_id,
                    0.0,
                ),
            )
            for skill_id, skill_attempts in grouped.items()
        ]
        return sorted(
            results,
            key=lambda weakness: (weakness.weakness_score, weakness.repeated_mistakes),
            reverse=True,
        )

    def top_weakest_skills(
        self,
        attempts: Iterable[WeaknessAttempt],
        limit: int = 3,
    ) -> list[SkillWeakness]:
        if limit < 1:
            raise ValueError(f"limit must be >= 1, got {limit}")
        return self.calculate_by_skill(attempts)[:limit]

    def calculate_skill_weakness(
        self,
        attempts: Iterable[WeaknessAttempt],
        skill_id: str,
        *,
        hesitation_index: float = 0.0,
        retention_drop: float = 0.0,
        prerequisite_gap_score: float = 0.0,
    ) -> SkillWeakness:
        skill_attempts = [attempt for attempt in attempts if attempt.skill_id == skill_id]
        if not skill_attempts:
            return self._empty(skill_id)
        for attempt in skill_attempts:
            self._validate_difficulty(attempt.difficulty)

        return self._calculate_one(
            skill_id,
            skill_attempts,
            hesitation_index=hesitation_index,
            retention_drop=retention_drop,
            prerequisite_gap_score=prerequisite_gap_score,
        )

    def _calculate_one(
        self,
        skill_id: str,
        attempts: list[WeaknessAttempt],
        *,
        hesitation_index: float,
        retention_drop: float,
        prerequisite_gap_score: float,
    ) -> SkillWeakness:
        total_attempts = len(attempts)
        valid_attempts = [attempt for attempt in attempts if not attempt.skip]
        valid_count = len(valid_attempts)
        wrong = [attempt for attempt in valid_attempts if not attempt.is_correct]

        error_frequency = len(wrong) / valid_count if valid_count else 0.0
        hint_usage_rate = (
            sum(1 for attempt in valid_attempts if attempt.hint_used) / valid_count
            if valid_count
            else 0.0
        )
        retry_rate = (
            sum(max(0, attempt.attempts - 1) for attempt in valid_attempts) / valid_count
            if valid_count
            else 0.0
        )
        skip_rate = (
            sum(1 for attempt in attempts if attempt.skip) / total_attempts
            if total_attempts
            else 0.0
        )
        repeated_mistakes = len(wrong)
        difficulty_weight = self._difficulty_weight(wrong)

        # V2 weakness formula, normalized to 0-100.
        score = (
            error_frequency * 100.0 * 0.25
            + hint_usage_rate * 100.0 * 0.20
            + min(1.0, retry_rate) * 100.0 * 0.15
            + skip_rate * 100.0 * 0.15
            + hesitation_index * 100.0 * 0.10
            + retention_drop * 0.10
            + prerequisite_gap_score * 0.05
        )
        weakness_score = round(max(0.0, min(100.0, score)), 2)
        main_weaknesses = self._main_weaknesses(
            error_frequency=error_frequency,
            hint_usage_rate=hint_usage_rate,
            retry_rate=retry_rate,
            skip_rate=skip_rate,
            hesitation_index=hesitation_index,
            retention_drop=retention_drop,
            prerequisite_gap_score=prerequisite_gap_score,
        )

        return SkillWeakness(
            skill_id=skill_id,
            weakness_score=weakness_score,
            error_frequency=round(error_frequency, 4),
            hint_usage_rate=round(hint_usage_rate, 4),
            retry_rate=round(retry_rate, 4),
            skip_rate=round(skip_rate, 4),
            hesitation_index=round(hesitation_index, 4),
            retention_drop=round(retention_drop, 2),
            prerequisite_gap_score=round(prerequisite_gap_score, 2),
            main_weaknesses=main_weaknesses,
            weakness_evidence={
                "error_frequency": round(error_frequency, 4),
                "hint_usage_rate": round(hint_usage_rate, 4),
                "retry_rate": round(retry_rate, 4),
                "skip_rate": round(skip_rate, 4),
                "hesitation_index": round(hesitation_index, 4),
                "retention_drop": round(retention_drop, 2),
                "prerequisite_gap_score": round(prerequisite_gap_score, 2),
                "main_weaknesses": main_weaknesses,
            },
            severity=self._severity(weakness_score),
            total_attempts=valid_count,
            repeated_mistakes=repeated_mistakes,
            difficulty_weight=difficulty_weight,
        )

    def _difficulty_weight(self, wrong: list[WeaknessAttempt]) -> float:
        if not wrong:
            return 0.0
        avg_wrong_difficulty = sum(attempt.difficulty for attempt in wrong) / len(wrong)
        return round((avg_wrong_difficulty / self.MAX_DIFFICULTY) * 100.0, 2)

    @staticmethod
    def _main_weaknesses(
        *,
        error_frequency: float,
        hint_usage_rate: float,
        retry_rate: float,
        skip_rate: float,
        hesitation_index: float,
        retention_drop: float,
        prerequisite_gap_score: float,
    ) -> list[str]:
        weaknesses = []
        if error_frequency >= 0.40:
            weaknesses.append("frequent_errors")
        if hint_usage_rate >= 0.40:
            weaknesses.append("hint_dependency")
        if retry_rate >= 0.75:
            weaknesses.append("retry_dependency")
        if skip_rate >= 0.25:
            weaknesses.append("skipping")
        if hesitation_index >= 0.30:
            weaknesses.append("hesitation_signal")
        if retention_drop >= 25.0:
            weaknesses.append("retention_drop")
        if prerequisite_gap_score >= 50.0:
            weaknesses.append("prerequisite_gap")
        return weaknesses

    @staticmethod
    def _severity(score: float) -> WeaknessSeverity:
        if score >= 70.0:
            return "high"
        if score >= 35.0:
            return "medium"
        return "low"

    @staticmethod
    def _empty(skill_id: str) -> SkillWeakness:
        return SkillWeakness(
            skill_id=skill_id,
            weakness_score=0.0,
            error_frequency=0.0,
            hint_usage_rate=0.0,
            retry_rate=0.0,
            skip_rate=0.0,
            hesitation_index=0.0,
            retention_drop=0.0,
            prerequisite_gap_score=0.0,
            severity="low",
            total_attempts=0,
            repeated_mistakes=0,
            difficulty_weight=0.0,
        )

    def _validate_difficulty(self, value: int) -> None:
        if not isinstance(value, int) or not 1 <= value <= self.MAX_DIFFICULTY:
            raise ValueError(
                f"difficulty must be an integer from 1 to {self.MAX_DIFFICULTY}, "
                f"got {value}"
            )
