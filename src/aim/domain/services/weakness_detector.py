"""
T-07: Weakness Detection

Calculates weakness scores per skill and returns the student's weakest skills.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class WeaknessAttempt:
    student_id: int
    skill_id: str
    is_correct: bool
    difficulty: int
    skip: bool = False


@dataclass(frozen=True)
class SkillWeakness:
    skill_id: str
    weakness_score: float
    error_frequency: float
    difficulty_weight: float
    total_attempts: int
    repeated_mistakes: int


class WeaknessDetector:
    """
    WeaknessScore = ErrorFrequency * DifficultyWeight

    ErrorFrequency is wrong non-skipped attempts divided by total non-skipped
    attempts. DifficultyWeight is the average difficulty of wrong attempts,
    normalized onto a 0-100 scale.
    """

    MAX_DIFFICULTY = 5

    def calculate_by_skill(
        self,
        attempts: Iterable[WeaknessAttempt],
    ) -> list[SkillWeakness]:
        grouped: dict[str, list[WeaknessAttempt]] = defaultdict(list)
        for attempt in attempts:
            if attempt.skip:
                continue
            self._validate_difficulty(attempt.difficulty)
            grouped[attempt.skill_id].append(attempt)

        results = []
        for skill_id, skill_attempts in grouped.items():
            total = len(skill_attempts)
            wrong = [a for a in skill_attempts if not a.is_correct]
            repeated_mistakes = len(wrong)
            error_frequency = repeated_mistakes / total if total else 0.0

            if wrong:
                avg_wrong_difficulty = sum(a.difficulty for a in wrong) / len(wrong)
                difficulty_weight = (avg_wrong_difficulty / self.MAX_DIFFICULTY) * 100.0
            else:
                difficulty_weight = 0.0

            weakness_score = round(error_frequency * difficulty_weight, 2)
            results.append(
                SkillWeakness(
                    skill_id=skill_id,
                    weakness_score=weakness_score,
                    error_frequency=round(error_frequency, 4),
                    difficulty_weight=round(difficulty_weight, 2),
                    total_attempts=total,
                    repeated_mistakes=repeated_mistakes,
                )
            )

        return sorted(
            results,
            key=lambda w: (w.weakness_score, w.repeated_mistakes),
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
    ) -> SkillWeakness:
        for weakness in self.calculate_by_skill(attempts):
            if weakness.skill_id == skill_id:
                return weakness

        return SkillWeakness(
            skill_id=skill_id,
            weakness_score=0.0,
            error_frequency=0.0,
            difficulty_weight=0.0,
            total_attempts=0,
            repeated_mistakes=0,
        )

    def _validate_difficulty(self, value: int) -> None:
        if not isinstance(value, int) or not 1 <= value <= self.MAX_DIFFICULTY:
            raise ValueError(
                f"difficulty must be an integer from 1 to {self.MAX_DIFFICULTY}, "
                f"got {value}"
            )
