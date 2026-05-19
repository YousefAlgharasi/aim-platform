"""
T-07: Error Pattern Recognition

Classifies why a student is failing from the last 20 attempts on a skill.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
from typing import Iterable


class ErrorPatternType(str, Enum):
    TYPE_1_RANDOM = "TYPE_1_RANDOM"
    TYPE_2_CONSISTENT = "TYPE_2_CONSISTENT"
    TYPE_3_PRESSURE = "TYPE_3_PRESSURE"
    TYPE_4_WARMUP = "TYPE_4_WARMUP"
    NO_DOMINANT_PATTERN = "NO_DOMINANT_PATTERN"


TREATMENT_RECOMMENDATIONS = {
    ErrorPatternType.TYPE_1_RANDOM: (
        "Reteach the concept from scratch and use guided examples before drills."
    ),
    ErrorPatternType.TYPE_2_CONSISTENT: (
        "Give a targeted explanation for the repeated sub-skill mistake."
    ),
    ErrorPatternType.TYPE_3_PRESSURE: (
        "Use slower reflection-based practice before timed drills."
    ),
    ErrorPatternType.TYPE_4_WARMUP: (
        "Start the next session with easy warm-up questions before assessment."
    ),
    ErrorPatternType.NO_DOMINANT_PATTERN: (
        "Continue normal practice and collect more attempts before intervention."
    ),
}


@dataclass(frozen=True)
class ErrorAttempt:
    student_id: int
    skill_id: str
    question_id: str
    is_correct: bool
    question_subtype: str | None = None
    is_timed: bool = False
    session_position: int = 1
    skip: bool = False


@dataclass(frozen=True)
class ErrorPatternResult:
    pattern_type: ErrorPatternType
    treatment_recommendation: str
    accuracy: float
    attempts_analyzed: int
    evidence: dict[str, float | str | int | None]


class ErrorPatternClassifier:
    """
    Looks at the last 20 non-skipped attempts and returns the strongest
    recognized error pattern.
    """

    WINDOW_SIZE = 20

    def classify(
        self,
        attempts: Iterable[ErrorAttempt],
    ) -> ErrorPatternResult:
        window = [a for a in list(attempts)[-self.WINDOW_SIZE:] if not a.skip]
        total = len(window)
        accuracy = self._accuracy(window)

        if total == 0:
            return self._result(
                ErrorPatternType.NO_DOMINANT_PATTERN,
                accuracy=0.0,
                attempts_analyzed=0,
                evidence={"reason": "no attempts"},
            )

        warmup = self._warmup_pattern(window)
        if warmup is not None:
            return self._result(
                ErrorPatternType.TYPE_4_WARMUP,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=warmup,
            )

        pressure = self._pressure_pattern(window)
        if pressure is not None:
            return self._result(
                ErrorPatternType.TYPE_3_PRESSURE,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=pressure,
            )

        consistent = self._consistent_pattern(window)
        if consistent is not None:
            return self._result(
                ErrorPatternType.TYPE_2_CONSISTENT,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=consistent,
            )

        if accuracy < 40.0:
            return self._result(
                ErrorPatternType.TYPE_1_RANDOM,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence={"accuracy": accuracy},
            )

        return self._result(
            ErrorPatternType.NO_DOMINANT_PATTERN,
            accuracy=accuracy,
            attempts_analyzed=total,
            evidence={"accuracy": accuracy},
        )

    def _consistent_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | str | int] | None:
        by_subtype: dict[str, list[ErrorAttempt]] = defaultdict(list)
        for attempt in attempts:
            if attempt.question_subtype:
                by_subtype[attempt.question_subtype].append(attempt)

        strongest: dict[str, float | str | int] | None = None
        for subtype, subtype_attempts in by_subtype.items():
            if len(subtype_attempts) < 3:
                continue
            wrong = sum(1 for a in subtype_attempts if not a.is_correct)
            error_rate = wrong / len(subtype_attempts)
            if error_rate > 0.60 and wrong >= 2:
                candidate = {
                    "question_subtype": subtype,
                    "subtype_error_rate": round(error_rate, 4),
                    "wrong_count": wrong,
                    "subtype_attempts": len(subtype_attempts),
                }
                if strongest is None or error_rate > float(strongest["subtype_error_rate"]):
                    strongest = candidate

        return strongest

    def _pressure_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        timed = [a for a in attempts if a.is_timed]
        untimed = [a for a in attempts if not a.is_timed]
        if not timed or not untimed:
            return None

        timed_accuracy = self._accuracy(timed)
        untimed_accuracy = self._accuracy(untimed)
        drop = untimed_accuracy - timed_accuracy

        if drop > 25.0:
            return {
                "timed_accuracy": timed_accuracy,
                "untimed_accuracy": untimed_accuracy,
                "accuracy_drop": round(drop, 2),
                "timed_attempts": len(timed),
                "untimed_attempts": len(untimed),
            }
        return None

    def _warmup_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        first_five = [a for a in attempts if a.session_position <= 5]
        rest = [a for a in attempts if a.session_position > 5]
        if len(first_five) < 3 or len(rest) < 3:
            return None

        first_error_rate = self._error_rate(first_five)
        rest_error_rate = self._error_rate(rest)
        if rest_error_rate == 0.0:
            is_warmup = first_error_rate > 0.0
        else:
            is_warmup = first_error_rate > (rest_error_rate * 2.0)

        if is_warmup:
            return {
                "first_5_error_rate": round(first_error_rate, 4),
                "rest_error_rate": round(rest_error_rate, 4),
                "first_5_attempts": len(first_five),
                "rest_attempts": len(rest),
            }
        return None

    @staticmethod
    def _accuracy(attempts: list[ErrorAttempt]) -> float:
        if not attempts:
            return 0.0
        correct = sum(1 for a in attempts if a.is_correct)
        return round((correct / len(attempts)) * 100.0, 2)

    @staticmethod
    def _error_rate(attempts: list[ErrorAttempt]) -> float:
        if not attempts:
            return 0.0
        wrong = sum(1 for a in attempts if not a.is_correct)
        return wrong / len(attempts)

    @staticmethod
    def _result(
        pattern_type: ErrorPatternType,
        *,
        accuracy: float,
        attempts_analyzed: int,
        evidence: dict[str, float | str | int | None],
    ) -> ErrorPatternResult:
        return ErrorPatternResult(
            pattern_type=pattern_type,
            treatment_recommendation=TREATMENT_RECOMMENDATIONS[pattern_type],
            accuracy=accuracy,
            attempts_analyzed=attempts_analyzed,
            evidence=evidence,
        )
