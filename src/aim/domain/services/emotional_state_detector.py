"""Safe educational behavior signal detection for AIM."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Literal, Sequence

ConfidenceLevel = Literal["low", "medium", "high"]


# Safe behavior signal labels.
class EmotionalState(str, Enum):
    """Backward-compatible enum name with safe educational labels."""

    POSSIBLE_LEARNING_OVERLOAD = "possible_learning_overload"
    HESITATION_SIGNAL = "hesitation_signal"
    RUSHING_SIGNAL = "rushing_signal"
    FATIGUE_OR_DISTRACTION_SIGNAL = "fatigue_or_distraction_signal"
    LOW_CONFIDENCE_SIGNAL = "low_confidence_signal"
    DISENGAGEMENT_SIGNAL = "disengagement_signal"


# Attempt facts used for safe signal detection.
@dataclass(frozen=True)
class EmotionalAttempt:
    """Attempt behavior snapshot used without medical or clinical diagnosis."""

    question_id: str
    is_correct: bool
    response_time: float
    previously_correct: bool = False
    skip: bool = False
    hint_used: bool = False
    attempts: int = 1


# Safe behavior detection result.
@dataclass(frozen=True)
class EmotionalStateResult:
    """Safe educational behavior signal result."""

    frustration_score: float
    state: EmotionalState
    emotional_signal: str
    confidence_level: ConfidenceLevel
    evidence: dict[str, float | int | bool | str] = field(default_factory=dict)
    repeated_errors: bool = False
    sudden_slowdown: bool = False
    early_exit: bool = False
    rushing: bool = False
    fatigue_or_distraction: bool = False
    easy_win_mode: bool = False
    attempts_analyzed: int = 0


# Safe educational detector.
class EmotionalStateDetector:
    """Detects behavior signals safely without clinical labels or diagnoses."""

    MIN_SESSION_QUESTIONS = 10
    SLOWDOWN_MULTIPLIER = 1.5
    HIGH_FRUSTRATION_THRESHOLD = 75.0
    REPEATED_ERROR_STREAK = 4

    def detect(
        self,
        attempts: Sequence[EmotionalAttempt],
        *,
        historical_avg_speed: float | None = None,
    ) -> EmotionalStateResult:
        non_skipped = [attempt for attempt in attempts if not attempt.skip]
        repeated_errors = self.has_repeated_errors(non_skipped)
        sudden_slowdown = self.has_sudden_slowdown(
            non_skipped,
            historical_avg_speed=historical_avg_speed,
        )
        early_exit = len(non_skipped) < self.MIN_SESSION_QUESTIONS
        rushing = self.has_rushing_signal(
            non_skipped,
            historical_avg_speed=historical_avg_speed,
        )
        fatigue_or_distraction = sudden_slowdown and self._accuracy(non_skipped) < 70.0

        # Response time contributes only to safe behavior signals, never mastery.
        score = round(min(100.0,
            (40.0 if repeated_errors else 0.0)
            + (30.0 if sudden_slowdown else 0.0)
            + (30.0 if early_exit else 0.0)
            + (15.0 if fatigue_or_distraction else 0.0),
        ), 2)
        signal = self._signal(
            score=score,
            repeated_errors=repeated_errors,
            rushing=rushing,
            fatigue_or_distraction=fatigue_or_distraction,
            early_exit=early_exit,
        )
        confidence_level = self._confidence_level(non_skipped, score)

        return EmotionalStateResult(
            frustration_score=score,
            state=EmotionalState(signal),
            emotional_signal=signal,
            confidence_level=confidence_level,
            evidence={
                "repeated_errors": repeated_errors,
                "sudden_slowdown": sudden_slowdown,
                "early_exit": early_exit,
                "rushing": rushing,
                "fatigue_or_distraction": fatigue_or_distraction,
                "accuracy": round(self._accuracy(non_skipped), 2),
                "attempts_analyzed": len(non_skipped),
            },
            repeated_errors=repeated_errors,
            sudden_slowdown=sudden_slowdown,
            early_exit=early_exit,
            rushing=rushing,
            fatigue_or_distraction=fatigue_or_distraction,
            easy_win_mode=score >= self.HIGH_FRUSTRATION_THRESHOLD,
            attempts_analyzed=len(non_skipped),
        )

    def detect_without_speed(
        self,
        attempts: Sequence[EmotionalAttempt],
    ) -> EmotionalStateResult:
        """Detect level/difficulty risk signals without reading response time."""
        non_skipped = [attempt for attempt in attempts if not attempt.skip]
        repeated_errors = self.has_repeated_errors(non_skipped)
        early_exit = len(non_skipped) < self.MIN_SESSION_QUESTIONS

        score = round(
            min(
                100.0,
                (40.0 if repeated_errors else 0.0)
                + (30.0 if early_exit else 0.0),
            ),
            2,
        )
        signal = self._signal(
            score=score,
            repeated_errors=repeated_errors,
            rushing=False,
            fatigue_or_distraction=False,
            early_exit=early_exit,
        )
        confidence_level = self._confidence_level(non_skipped, score)

        return EmotionalStateResult(
            frustration_score=score,
            state=EmotionalState(signal),
            emotional_signal=signal,
            confidence_level=confidence_level,
            evidence={
                "repeated_errors": repeated_errors,
                "sudden_slowdown": False,
                "early_exit": early_exit,
                "rushing": False,
                "fatigue_or_distraction": False,
                "accuracy": round(self._accuracy(non_skipped), 2),
                "attempts_analyzed": len(non_skipped),
                "speed_excluded_for_level": True,
            },
            repeated_errors=repeated_errors,
            sudden_slowdown=False,
            early_exit=early_exit,
            rushing=False,
            fatigue_or_distraction=False,
            easy_win_mode=score >= self.HIGH_FRUSTRATION_THRESHOLD,
            attempts_analyzed=len(non_skipped),
        )

    def has_repeated_errors(self, attempts: Sequence[EmotionalAttempt]) -> bool:
        streak = 0
        for attempt in attempts:
            if not attempt.is_correct and attempt.previously_correct:
                streak += 1
                if streak >= self.REPEATED_ERROR_STREAK:
                    return True
            else:
                streak = 0
        return False

    def has_sudden_slowdown(
        self,
        attempts: Sequence[EmotionalAttempt],
        *,
        historical_avg_speed: float | None,
    ) -> bool:
        if not attempts or historical_avg_speed is None or historical_avg_speed <= 0:
            return False

        current_avg = sum(attempt.response_time for attempt in attempts) / len(attempts)
        return current_avg > (historical_avg_speed * self.SLOWDOWN_MULTIPLIER)

    def has_rushing_signal(
        self,
        attempts: Sequence[EmotionalAttempt],
        *,
        historical_avg_speed: float | None,
    ) -> bool:
        if not attempts:
            return False

        accuracy = self._accuracy(attempts)
        current_avg = sum(attempt.response_time for attempt in attempts) / len(attempts)
        if historical_avg_speed is None or historical_avg_speed <= 0:
            return accuracy < 60.0 and current_avg <= 5.0
        return accuracy < 70.0 and current_avg < historical_avg_speed * 0.50

    @staticmethod
    def _accuracy(attempts: Sequence[EmotionalAttempt]) -> float:
        if not attempts:
            return 0.0
        correct = sum(1 for attempt in attempts if attempt.is_correct)
        return (correct / len(attempts)) * 100.0

    @staticmethod
    def _signal(
        *,
        score: float,
        repeated_errors: bool,
        rushing: bool,
        fatigue_or_distraction: bool,
        early_exit: bool,
    ) -> str:
        if score >= EmotionalStateDetector.HIGH_FRUSTRATION_THRESHOLD:
            return EmotionalState.POSSIBLE_LEARNING_OVERLOAD.value
        if rushing:
            return EmotionalState.RUSHING_SIGNAL.value
        if fatigue_or_distraction:
            return EmotionalState.FATIGUE_OR_DISTRACTION_SIGNAL.value
        if repeated_errors:
            return EmotionalState.LOW_CONFIDENCE_SIGNAL.value
        if early_exit:
            return EmotionalState.DISENGAGEMENT_SIGNAL.value
        return EmotionalState.HESITATION_SIGNAL.value

    @staticmethod
    def _confidence_level(
        attempts: Sequence[EmotionalAttempt],
        score: float,
    ) -> ConfidenceLevel:
        if len(attempts) < 4:
            return "low"
        if score >= EmotionalStateDetector.HIGH_FRUSTRATION_THRESHOLD:
            return "high"
        if len(attempts) >= 10:
            return "medium"
        return "low"
