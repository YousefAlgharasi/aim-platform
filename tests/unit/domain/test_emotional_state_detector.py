"""
T-09 tests for EmotionalStateDetector.
"""

from __future__ import annotations

from aim.domain.services.emotional_state_detector import (
    EmotionalAttempt,
    EmotionalState,
    EmotionalStateDetector,
)


def make_attempt(
    index: int,
    *,
    is_correct: bool = True,
    response_time: float = 10.0,
    previously_correct: bool = False,
    skip: bool = False,
) -> EmotionalAttempt:
    return EmotionalAttempt(
        question_id=f"q{index}",
        is_correct=is_correct,
        response_time=response_time,
        previously_correct=previously_correct,
        skip=skip,
    )


class TestEmotionalStateDetector:
    def setup_method(self) -> None:
        self.detector = EmotionalStateDetector()

    def test_high_frustration_triggers_easy_win_mode(self) -> None:
        attempts = [
            make_attempt(i, is_correct=False, response_time=20.0, previously_correct=True)
            for i in range(1, 5)
        ]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.frustration_score == 100.0
        assert result.state == EmotionalState.FRUSTRATED
        assert result.easy_win_mode is True
        assert result.repeated_errors is True
        assert result.sudden_slowdown is True
        assert result.early_exit is True

    def test_repeated_errors_requires_more_than_three_wrong_in_row(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, previously_correct=True),
            make_attempt(2, is_correct=False, previously_correct=True),
            make_attempt(3, is_correct=False, previously_correct=True),
            make_attempt(4, is_correct=True, previously_correct=True),
        ] + [make_attempt(i) for i in range(5, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.repeated_errors is False
        assert result.frustration_score == 0.0

    def test_repeated_errors_detects_four_wrong_in_row(self) -> None:
        attempts = [
            make_attempt(i, is_correct=False, previously_correct=True)
            for i in range(1, 5)
        ] + [make_attempt(i) for i in range(5, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.repeated_errors is True
        assert result.frustration_score == 40.0
        assert result.state == EmotionalState.NEUTRAL

    def test_sudden_slowdown_detects_current_average_above_1_5x_history(self) -> None:
        attempts = [make_attempt(i, response_time=16.0) for i in range(1, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.sudden_slowdown is True
        assert result.frustration_score == 30.0

    def test_sudden_slowdown_boundary_at_1_5x_is_not_flagged(self) -> None:
        attempts = [make_attempt(i, response_time=15.0) for i in range(1, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.sudden_slowdown is False

    def test_new_student_without_speed_history_has_no_slowdown_flag(self) -> None:
        attempts = [make_attempt(i, response_time=30.0) for i in range(1, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=None)

        assert result.sudden_slowdown is False
        assert result.frustration_score == 0.0

    def test_early_exit_before_10_questions(self) -> None:
        attempts = [make_attempt(i) for i in range(1, 10)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.early_exit is True
        assert result.frustration_score == 30.0

    def test_exactly_10_questions_is_not_early_exit(self) -> None:
        attempts = [make_attempt(i) for i in range(1, 11)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.early_exit is False
        assert result.state == EmotionalState.CONFIDENT

    def test_skipped_attempts_are_ignored(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, previously_correct=True, skip=True),
            make_attempt(2, is_correct=False, previously_correct=True, skip=True),
        ] + [make_attempt(i) for i in range(3, 13)]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.attempts_analyzed == 10
        assert result.frustration_score == 0.0
        assert result.state == EmotionalState.CONFIDENT

    def test_score_equal_70_is_not_high_frustration(self) -> None:
        attempts = [
            make_attempt(i, is_correct=False, previously_correct=True)
            for i in range(1, 5)
        ]

        result = self.detector.detect(attempts, historical_avg_speed=10.0)

        assert result.frustration_score == 70.0
        assert result.state == EmotionalState.NEUTRAL
        assert result.easy_win_mode is False
