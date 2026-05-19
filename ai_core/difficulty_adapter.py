"""
T-06: Difficulty Adaptation Engine

Decides whether the next question should be easier, the same, or harder.
The engine is intentionally rule-based for Phase 1 so it can run before any
ML calibration exists.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class DifficultyAction(str, Enum):
    INCREASE = "INCREASE"
    MAINTAIN = "MAINTAIN"
    DECREASE = "DECREASE"


@dataclass(frozen=True)
class DifficultyDecision:
    action: DifficultyAction
    score: float
    current_difficulty: int
    target_difficulty: int


class DifficultyAdapter:
    """
    Applies the T-06 difficulty formula:

        DifficultyScore = (Mastery * 0.50)
                        + (Confidence * 0.20)
                        + (Consistency * 0.30)

    Score > 80 increases difficulty.
    Score 50-80 maintains difficulty.
    Score < 50 decreases difficulty.
    """

    MIN_DIFFICULTY = 1
    MAX_DIFFICULTY = 5

    def decide(
        self,
        *,
        mastery: float,
        confidence: float,
        consistency: float,
        current_difficulty: int,
    ) -> DifficultyDecision:
        self._validate_score("mastery", mastery)
        self._validate_score("confidence", confidence)
        self._validate_score("consistency", consistency)
        self._validate_difficulty(current_difficulty)

        score = round(
            (mastery * 0.50)
            + (confidence * 0.20)
            + (consistency * 0.30),
            2,
        )

        if score > 80.0:
            action = DifficultyAction.INCREASE
            target = min(self.MAX_DIFFICULTY, current_difficulty + 1)
        elif score < 50.0:
            action = DifficultyAction.DECREASE
            target = max(self.MIN_DIFFICULTY, current_difficulty - 1)
        else:
            action = DifficultyAction.MAINTAIN
            target = current_difficulty

        return DifficultyDecision(
            action=action,
            score=score,
            current_difficulty=current_difficulty,
            target_difficulty=target,
        )

    @staticmethod
    def _validate_score(name: str, value: float) -> None:
        if not isinstance(value, (int, float)) or not 0.0 <= value <= 100.0:
            raise ValueError(f"{name} must be between 0 and 100, got {value}")

    def _validate_difficulty(self, value: int) -> None:
        if (
            not isinstance(value, int)
            or not self.MIN_DIFFICULTY <= value <= self.MAX_DIFFICULTY
        ):
            raise ValueError(
                f"current_difficulty must be an integer from "
                f"{self.MIN_DIFFICULTY} to {self.MAX_DIFFICULTY}, got {value}"
            )
