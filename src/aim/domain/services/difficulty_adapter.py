"""Difficulty adaptation V2 for AIM sessions."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


# Allowed difficulty movement actions.
class DifficultyAction(str, Enum):
    """Difficulty action labels returned to the application layer."""

    INCREASE = "increase"
    MAINTAIN = "maintain"
    DECREASE = "decrease"


# Explainable difficulty decision.
@dataclass(frozen=True)
class DifficultyDecision:
    """Difficulty decision with reason and supporting evidence."""

    action: DifficultyAction
    score: float
    current_difficulty: int
    target_difficulty: int
    reason: str
    evidence: dict[str, float | int | bool] = field(default_factory=dict)


# Core difficulty adapter.
class DifficultyAdapter:
    """Adapts difficulty conservatively using reliability and risk signals."""

    MIN_DIFFICULTY = 1
    MAX_DIFFICULTY = 5

    def decide(
        self,
        *,
        mastery: float,
        consistency: float,
        current_difficulty: int,
        reliability: float = 1.0,
        weakness_score: float = 0.0,
        frustration_score: float = 0.0,
        retention: float = 100.0,
        repeated_failure_count: int = 0,
        confidence: float | None = None,
    ) -> DifficultyDecision:
        self._validate_score("mastery", mastery)
        self._validate_score("consistency", consistency)
        self._validate_score("weakness_score", weakness_score)
        self._validate_score("frustration_score", frustration_score)
        self._validate_score("retention", retention)
        self._validate_reliability(reliability)
        self._validate_difficulty(current_difficulty)
        if repeated_failure_count < 0:
            raise ValueError("repeated_failure_count must be >= 0")

        readiness_score = round(
            (mastery * 0.45)
            + (consistency * 0.25)
            + (retention * 0.20)
            + (reliability * 100.0 * 0.10),
            2,
        )
        evidence = {
            "mastery": mastery,
            "consistency": consistency,
            "reliability": reliability,
            "weakness_score": weakness_score,
            "frustration_score": frustration_score,
            "retention": retention,
            "repeated_failure_count": repeated_failure_count,
            "confidence": confidence if confidence is not None else 0.0,
        }

        # Decrease first when risk signals are strong.
        if (
            frustration_score >= 75.0
            or weakness_score >= 75.0
            or repeated_failure_count >= 3
            or (mastery < 50.0 and reliability >= 0.40)
        ):
            return self._decision(
                DifficultyAction.DECREASE,
                readiness_score,
                current_difficulty,
                "Decrease because risk or failure signals are high.",
                evidence,
            )

        # Increase only when the current evidence is strong and reliable.
        if (
            mastery >= 85.0
            and consistency >= 75.0
            and reliability >= 0.70
            and weakness_score < 50.0
            and frustration_score < 60.0
            and retention >= 70.0
        ):
            return self._decision(
                DifficultyAction.INCREASE,
                readiness_score,
                current_difficulty,
                "Increase because mastery, consistency, reliability, and retention are strong.",
                evidence,
            )

        return self._decision(
            DifficultyAction.MAINTAIN,
            readiness_score,
            current_difficulty,
            "Maintain because increase/decrease gates were not met.",
            evidence,
        )

    def _decision(
        self,
        action: DifficultyAction,
        score: float,
        current_difficulty: int,
        reason: str,
        evidence: dict[str, float | int | bool],
    ) -> DifficultyDecision:
        if action == DifficultyAction.INCREASE:
            target = min(self.MAX_DIFFICULTY, current_difficulty + 1)
        elif action == DifficultyAction.DECREASE:
            target = max(self.MIN_DIFFICULTY, current_difficulty - 1)
        else:
            target = current_difficulty

        return DifficultyDecision(
            action=action,
            score=score,
            current_difficulty=current_difficulty,
            target_difficulty=target,
            reason=reason,
            evidence=evidence,
        )

    @staticmethod
    def _validate_score(name: str, value: float) -> None:
        if not isinstance(value, (int, float)) or not 0.0 <= value <= 100.0:
            raise ValueError(f"{name} must be between 0 and 100, got {value}")

    @staticmethod
    def _validate_reliability(value: float) -> None:
        if not isinstance(value, (int, float)) or not 0.0 <= value <= 1.0:
            raise ValueError(f"reliability must be between 0 and 1, got {value}")

    def _validate_difficulty(self, value: int) -> None:
        if (
            not isinstance(value, int)
            or not self.MIN_DIFFICULTY <= value <= self.MAX_DIFFICULTY
        ):
            raise ValueError(
                f"current_difficulty must be an integer from "
                f"{self.MIN_DIFFICULTY} to {self.MAX_DIFFICULTY}, got {value}"
            )
