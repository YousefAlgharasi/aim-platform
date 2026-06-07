"""Learning response pattern detection for adaptive teaching."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, Literal

LearningResponsePattern = Literal[
    "example_first_response",
    "rule_first_response",
    "repetition_sensitive",
    "slow_but_accurate",
    "fast_but_careless",
    "hint_dependent",
    "challenge_ready",
    "confidence_builder_needed",
]


@dataclass(frozen=True)
class LearningPatternAttempt:
    """Attempt facts used to infer how the student responded to instruction."""

    is_correct: bool
    response_time: float
    hint_used: bool
    attempts: int
    difficulty: int
    question_subtype: str | None = None


@dataclass(frozen=True)
class LearningPatternResult:
    """Educational response pattern with evidence, not a personality diagnosis."""

    learning_response_pattern: LearningResponsePattern
    confidence: float
    evidence: dict[str, float | int | str | bool] = field(default_factory=dict)


class LearningResponsePatternDetector:
    """Detects adaptive learning response patterns without fixed-trait labels."""

    def detect(
        self,
        attempts: Iterable[LearningPatternAttempt],
        *,
        mastery: float,
        confidence_score: float,
    ) -> LearningPatternResult:
        rows = list(attempts)
        if not rows:
            return self._result("confidence_builder_needed", 0.2, {"attempt_count": 0})

        accuracy = sum(1 for row in rows if row.is_correct) / len(rows)
        avg_time = sum(row.response_time for row in rows) / len(rows)
        hint_rate = sum(1 for row in rows if row.hint_used) / len(rows)
        retry_rate = sum(max(0, row.attempts - 1) for row in rows) / len(rows)
        avg_difficulty = sum(row.difficulty for row in rows) / len(rows)

        # Choose the strongest educational pattern from observable behavior.
        if hint_rate >= 0.50:
            pattern: LearningResponsePattern = "hint_dependent"
        elif mastery >= 85.0 and accuracy >= 0.85 and avg_difficulty >= 4.0:
            pattern = "challenge_ready"
        elif confidence_score >= 80.0 and mastery < 60.0:
            pattern = "confidence_builder_needed"
        elif accuracy >= 0.80 and avg_time >= 20.0:
            pattern = "slow_but_accurate"
        elif accuracy < 0.60 and avg_time <= 5.0:
            pattern = "fast_but_careless"
        elif retry_rate >= 1.0 and accuracy >= 0.60:
            pattern = "repetition_sensitive"
        elif self._dominant_subtype(rows) == "example":
            pattern = "example_first_response"
        else:
            pattern = "rule_first_response"

        return self._result(
            pattern,
            min(1.0, len(rows) / 10.0),
            {
                "attempt_count": len(rows),
                "accuracy": round(accuracy, 4),
                "avg_response_time": round(avg_time, 2),
                "hint_usage_rate": round(hint_rate, 4),
                "retry_rate": round(retry_rate, 4),
                "avg_difficulty": round(avg_difficulty, 2),
                "mastery": mastery,
                "confidence_score": confidence_score,
            },
        )

    @staticmethod
    def _dominant_subtype(rows: list[LearningPatternAttempt]) -> str | None:
        subtypes = [row.question_subtype for row in rows if row.question_subtype]
        if not subtypes:
            return None
        return max(set(subtypes), key=subtypes.count)

    @staticmethod
    def _result(
        pattern: LearningResponsePattern,
        confidence: float,
        evidence: dict[str, float | int | str | bool],
    ) -> LearningPatternResult:
        return LearningPatternResult(
            learning_response_pattern=pattern,
            confidence=round(confidence, 4),
            evidence=evidence,
        )
