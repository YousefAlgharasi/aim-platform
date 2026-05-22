from __future__ import annotations

from aim.domain.services.emotional_state_detector import (
    EmotionalAttempt,
    EmotionalStateDetector,
)


def attempt(
    index: int,
    *,
    correct: bool = True,
    response_time: float = 10.0,
    previously_correct: bool = False,
    skip: bool = False,
) -> EmotionalAttempt:
    return EmotionalAttempt(
        question_id=f"q{index}",
        is_correct=correct,
        response_time=response_time,
        previously_correct=previously_correct,
        skip=skip,
    )


def test_high_overload_uses_safe_label_and_easy_win_mode() -> None:
    attempts = [
        attempt(i, correct=False, response_time=20.0, previously_correct=True)
        for i in range(1, 5)
    ]

    result = EmotionalStateDetector().detect(attempts, historical_avg_speed=10.0)

    assert result.frustration_score == 100.0
    assert result.emotional_signal == "possible_learning_overload"
    assert result.easy_win_mode is True
    assert "frustrated" not in result.emotional_signal


def test_rushing_signal_is_behavioral_only() -> None:
    attempts = [
        attempt(i, correct=False, response_time=2.0)
        for i in range(1, 11)
    ]

    result = EmotionalStateDetector().detect(attempts, historical_avg_speed=10.0)

    assert result.rushing is True
    assert result.emotional_signal == "rushing_signal"


def test_sudden_slowdown_sets_hesitation_evidence() -> None:
    attempts = [attempt(i, response_time=16.0) for i in range(1, 11)]

    result = EmotionalStateDetector().detect(attempts, historical_avg_speed=10.0)

    assert result.sudden_slowdown is True
    assert result.frustration_score == 30.0
    assert result.evidence["sudden_slowdown"] is True


def test_skipped_attempts_are_ignored() -> None:
    attempts = [
        attempt(1, correct=False, skip=True),
        attempt(2, correct=False, skip=True),
    ] + [attempt(i) for i in range(3, 13)]

    result = EmotionalStateDetector().detect(attempts, historical_avg_speed=10.0)

    assert result.attempts_analyzed == 10
    assert result.frustration_score == 0.0
