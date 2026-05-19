"""
T-09: Emotional State Detection Engine

Detects frustration from student behavior without asking the student directly.
All flags are binary and the final score is in the 0-100 range.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Sequence


class EmotionalState(str, Enum):
    CONFIDENT = "CONFIDENT"
    NEUTRAL = "NEUTRAL"
    FRUSTRATED = "FRUSTRATED"


@dataclass(frozen=True)
class EmotionalAttempt:
    question_id: str
    is_correct: bool
    response_time: float
    previously_correct: bool = False
    skip: bool = False


@dataclass(frozen=True)
class EmotionalStateResult:
    frustration_score: float
    state: EmotionalState
    repeated_errors: bool
    sudden_slowdown: bool
    early_exit: bool
    easy_win_mode: bool
    attempts_analyzed: int


class EmotionalStateDetector:
    """
    FrustrationScore = repeated_errors_flag * 40
                     + sudden_slowdown_flag * 30
                     + early_exit_flag * 30

    HIGH frustration is score > 70.
    """

    MIN_SESSION_QUESTIONS = 10
    SLOWDOWN_MULTIPLIER = 1.5
    HIGH_FRUSTRATION_THRESHOLD = 70.0
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

        score = round(
            (40.0 if repeated_errors else 0.0)
            + (30.0 if sudden_slowdown else 0.0)
            + (30.0 if early_exit else 0.0),
            2,
        )

        if score > self.HIGH_FRUSTRATION_THRESHOLD:
            state = EmotionalState.FRUSTRATED
        elif score == 0.0 and self._accuracy(non_skipped) >= 80.0:
            state = EmotionalState.CONFIDENT
        else:
            state = EmotionalState.NEUTRAL

        return EmotionalStateResult(
            frustration_score=score,
            state=state,
            repeated_errors=repeated_errors,
            sudden_slowdown=sudden_slowdown,
            early_exit=early_exit,
            easy_win_mode=state == EmotionalState.FRUSTRATED,
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

        current_avg = sum(a.response_time for a in attempts) / len(attempts)
        return current_avg > (historical_avg_speed * self.SLOWDOWN_MULTIPLIER)

    @staticmethod
    def _accuracy(attempts: Sequence[EmotionalAttempt]) -> float:
        if not attempts:
            return 0.0
        correct = sum(1 for attempt in attempts if attempt.is_correct)
        return (correct / len(attempts)) * 100.0
