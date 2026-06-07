"""
T-07: Error Pattern Recognition

Classifies why a student is failing from the last 20 attempts on a skill.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
from typing import Iterable, Literal


PatternSeverity = Literal["low", "medium", "high"]


class ErrorPatternType(str, Enum):
    GUESSING = "guessing"
    MISUNDERSTOOD_CONCEPT = "misunderstood_concept"
    RUSHING = "rushing"
    NEEDS_WARMUP = "needs_warmup"
    HINT_DEPENDENCY = "hint_dependency"
    MEMORY_RETENTION_ISSUE = "memory_retention_issue"
    PREREQUISITE_GAP = "prerequisite_gap"
    LOW_CONFIDENCE_PATTERN = "low_confidence_pattern"
    SKIP_AVOIDANCE = "skip_avoidance"
    NO_DOMINANT_PATTERN = "unknown"

    TYPE_1_RANDOM = "guessing"
    TYPE_2_CONSISTENT = "misunderstood_concept"
    TYPE_3_PRESSURE = "rushing"
    TYPE_4_WARMUP = "needs_warmup"


TREATMENT_RECOMMENDATIONS = {
    ErrorPatternType.GUESSING: (
        "Reteach the concept from scratch and use explain-before-answer checks."
    ),
    ErrorPatternType.MISUNDERSTOOD_CONCEPT: (
        "Give a targeted explanation for the repeated sub-skill mistake."
    ),
    ErrorPatternType.RUSHING: (
        "Use slower reflection-based practice before timed drills."
    ),
    ErrorPatternType.NEEDS_WARMUP: (
        "Start the next session with easy warm-up questions before assessment."
    ),
    ErrorPatternType.HINT_DEPENDENCY: (
        "Fade hints gradually and ask the learner to explain each step."
    ),
    ErrorPatternType.MEMORY_RETENTION_ISSUE: (
        "Schedule spaced review and short retrieval practice for this skill."
    ),
    ErrorPatternType.PREREQUISITE_GAP: (
        "Review the missing prerequisite before continuing this skill."
    ),
    ErrorPatternType.LOW_CONFIDENCE_PATTERN: (
        "Use scaffolded practice and confidence-building checks."
    ),
    ErrorPatternType.SKIP_AVOIDANCE: (
        "Use smaller steps and require an attempt before allowing skips."
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
    hint_used: bool = False
    attempts: int = 1
    answer_changed: bool = False
    previously_correct: bool = False
    prerequisite_gap: bool = False
    missing_prerequisite_skill_id: str | None = None
    retention_drop: float = 0.0
    confidence: float | None = None


@dataclass(frozen=True)
class ErrorPatternResult:
    pattern_type: ErrorPatternType
    recommended_intervention: str
    severity: PatternSeverity
    confidence: float
    accuracy: float
    attempts_analyzed: int
    evidence: dict[str, float | str | int | bool | None]

    @property
    def treatment_recommendation(self) -> str:
        return self.recommended_intervention


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
        raw_window = list(attempts)[-self.WINDOW_SIZE:]
        window = [a for a in raw_window if not a.skip]
        total = len(window)
        accuracy = self._accuracy(window)

        if not raw_window:
            return self._result(
                ErrorPatternType.NO_DOMINANT_PATTERN,
                accuracy=0.0,
                attempts_analyzed=0,
                evidence={"reason": "no attempts"},
            )

        skip_avoidance = self._skip_avoidance_pattern(raw_window)
        if skip_avoidance is not None:
            return self._result(
                ErrorPatternType.SKIP_AVOIDANCE,
                accuracy=accuracy,
                attempts_analyzed=len(raw_window),
                evidence=skip_avoidance,
            )

        if total == 0:
            return self._result(
                ErrorPatternType.SKIP_AVOIDANCE,
                accuracy=0.0,
                attempts_analyzed=len(raw_window),
                evidence={
                    "skip_rate": 1.0,
                    "skipped_attempts": len(raw_window),
                    "attempts": len(raw_window),
                },
            )

        prerequisite = self._prerequisite_gap_pattern(window)
        if prerequisite is not None:
            return self._result(
                ErrorPatternType.PREREQUISITE_GAP,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=prerequisite,
            )

        memory = self._memory_retention_pattern(window)
        if memory is not None:
            return self._result(
                ErrorPatternType.MEMORY_RETENTION_ISSUE,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=memory,
            )

        hint_dependency = self._hint_dependency_pattern(window)
        if hint_dependency is not None:
            return self._result(
                ErrorPatternType.HINT_DEPENDENCY,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=hint_dependency,
            )

        low_confidence = self._low_confidence_pattern(window)
        if low_confidence is not None:
            return self._result(
                ErrorPatternType.LOW_CONFIDENCE_PATTERN,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=low_confidence,
            )

        warmup = self._warmup_pattern(window)
        if warmup is not None:
            return self._result(
                ErrorPatternType.NEEDS_WARMUP,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=warmup,
            )

        pressure = self._pressure_pattern(window)
        if pressure is not None:
            return self._result(
                ErrorPatternType.RUSHING,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=pressure,
            )

        consistent = self._consistent_pattern(window)
        if consistent is not None:
            return self._result(
                ErrorPatternType.MISUNDERSTOOD_CONCEPT,
                accuracy=accuracy,
                attempts_analyzed=total,
                evidence=consistent,
            )

        if accuracy < 40.0:
            return self._result(
                ErrorPatternType.GUESSING,
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

    def _hint_dependency_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        if len(attempts) < 3:
            return None

        hinted = [attempt for attempt in attempts if attempt.hint_used]
        if len(hinted) < 2:
            return None

        hint_rate = len(hinted) / len(attempts)
        hinted_accuracy = self._accuracy(hinted)
        independent = [attempt for attempt in attempts if not attempt.hint_used]
        independent_accuracy = self._accuracy(independent) if independent else 0.0

        if hint_rate >= 0.50 and hinted_accuracy >= max(50.0, independent_accuracy + 20.0):
            return {
                "hint_rate": round(hint_rate, 4),
                "hinted_accuracy": hinted_accuracy,
                "independent_accuracy": independent_accuracy,
                "hinted_attempts": len(hinted),
                "independent_attempts": len(independent),
            }
        return None

    def _memory_retention_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        previously_correct = [attempt for attempt in attempts if attempt.previously_correct]
        if len(previously_correct) < 3:
            return None

        errors_after_mastery = sum(1 for attempt in previously_correct if not attempt.is_correct)
        error_rate = errors_after_mastery / len(previously_correct)
        avg_retention_drop = (
            sum(max(0.0, attempt.retention_drop) for attempt in attempts) / len(attempts)
        )

        if error_rate >= 0.50 or avg_retention_drop >= 20.0:
            return {
                "previously_correct_attempts": len(previously_correct),
                "errors_after_previous_success": errors_after_mastery,
                "error_rate_after_previous_success": round(error_rate, 4),
                "avg_retention_drop": round(avg_retention_drop, 2),
            }
        return None

    def _prerequisite_gap_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | str | int | None] | None:
        gap_attempts = [
            attempt for attempt in attempts
            if attempt.prerequisite_gap
            or (attempt.question_subtype or "").startswith("prerequisite:")
        ]
        if len(gap_attempts) < 2:
            return None

        wrong = sum(1 for attempt in gap_attempts if not attempt.is_correct)
        error_rate = wrong / len(gap_attempts)
        if error_rate >= 0.50:
            missing = next(
                (
                    attempt.missing_prerequisite_skill_id
                    or (attempt.question_subtype or "").removeprefix("prerequisite:")
                    for attempt in gap_attempts
                    if attempt.missing_prerequisite_skill_id
                    or (attempt.question_subtype or "").startswith("prerequisite:")
                ),
                None,
            )
            return {
                "missing_prerequisite_skill_id": missing,
                "prerequisite_attempts": len(gap_attempts),
                "prerequisite_error_rate": round(error_rate, 4),
                "wrong_count": wrong,
            }
        return None

    def _low_confidence_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        confidence_values = [
            float(attempt.confidence)
            for attempt in attempts
            if attempt.confidence is not None
        ]
        if len(confidence_values) < 4:
            return None

        avg_confidence = sum(confidence_values) / len(confidence_values)
        answer_changes = sum(1 for attempt in attempts if attempt.answer_changed)
        answer_change_rate = answer_changes / len(attempts)
        accuracy = self._accuracy(attempts)

        if avg_confidence < 45.0 and accuracy >= 50.0:
            return {
                "avg_confidence": round(avg_confidence, 2),
                "accuracy": accuracy,
                "answer_change_rate": round(answer_change_rate, 4),
                "answer_changes": answer_changes,
            }
        return None

    def _skip_avoidance_pattern(
        self,
        attempts: list[ErrorAttempt],
    ) -> dict[str, float | int] | None:
        skipped = sum(1 for attempt in attempts if attempt.skip)
        skip_rate = skipped / len(attempts) if attempts else 0.0
        if skipped >= 2 and skip_rate >= 0.25:
            return {
                "skip_rate": round(skip_rate, 4),
                "skipped_attempts": skipped,
                "attempts": len(attempts),
            }
        return None

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

    def _severity(
        self,
        *,
        pattern_type: ErrorPatternType,
        accuracy: float,
        evidence: dict[str, float | str | int | bool | None],
    ) -> PatternSeverity:
        if pattern_type in {
            ErrorPatternType.PREREQUISITE_GAP,
            ErrorPatternType.SKIP_AVOIDANCE,
        }:
            return "high"
        if accuracy < 40.0:
            return "high"
        if accuracy < 70.0 or pattern_type != ErrorPatternType.NO_DOMINANT_PATTERN:
            return "medium"
        return "low"

    def _confidence(
        self,
        *,
        attempts_analyzed: int,
        evidence: dict[str, float | str | int | bool | None],
    ) -> float:
        evidence_strength = max(
            (
                float(value)
                for value in evidence.values()
                if isinstance(value, (int, float, bool))
            ),
            default=0.0,
        )
        reliability = min(1.0, attempts_analyzed / 10.0)
        normalized_strength = min(1.0, evidence_strength)
        return round(max(0.1, (reliability * 0.70) + (normalized_strength * 0.30)), 2)

    def _result(
        self,
        pattern_type: ErrorPatternType,
        *,
        accuracy: float,
        attempts_analyzed: int,
        evidence: dict[str, float | str | int | bool | None],
    ) -> ErrorPatternResult:
        severity = self._severity(
            pattern_type=pattern_type,
            accuracy=accuracy,
            evidence=evidence,
        )
        return ErrorPatternResult(
            pattern_type=pattern_type,
            recommended_intervention=TREATMENT_RECOMMENDATIONS[pattern_type],
            severity=severity,
            confidence=self._confidence(
                attempts_analyzed=attempts_analyzed,
                evidence=evidence,
            ),
            accuracy=accuracy,
            attempts_analyzed=attempts_analyzed,
            evidence=evidence,
        )
