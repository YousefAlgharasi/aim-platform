from __future__ import annotations

from typing import Sequence

import pytest

from aim.domain.services.calibration import DEFAULT_WEIGHTS, CalibrationStub, MasteryWeights
from aim.domain.services.mastery_calculator import (
    AttemptSnapshot,
    MasteryCalculator,
    SkillState,
)


class FakeAttemptRepo:
    def __init__(self, attempts: list[AttemptSnapshot]) -> None:
        self._attempts = attempts

    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> Sequence[AttemptSnapshot]:
        return self._attempts[:limit] if limit is not None else self._attempts


class FakeStateRepo:
    def __init__(self, mastery: float = 50.0, retention: float = 100.0) -> None:
        self._state = SkillState(mastery=mastery, retention=retention, confidence=80.0)
        self.saved_mastery: float | None = None

    def get_skill_state(self, student_id: int, skill_id: str) -> SkillState:
        return self._state

    def update_mastery(self, student_id: int, skill_id: str, mastery: float) -> None:
        self.saved_mastery = mastery


def attempt(
    *,
    correct: bool = True,
    response_time: float = 10.0,
    tries: int = 1,
    difficulty: int = 3,
    hint: bool = False,
    skip: bool = False,
) -> AttemptSnapshot:
    return AttemptSnapshot(
        is_correct=correct,
        response_time=response_time,
        attempts=tries,
        difficulty=difficulty,
        skip=skip,
        hint_used=hint,
    )


def calculate(
    attempts: list[AttemptSnapshot],
    *,
    mastery: float = 50.0,
    retention: float = 100.0,
):
    state = FakeStateRepo(mastery=mastery, retention=retention)
    result = MasteryCalculator(
        attempt_repo=FakeAttemptRepo(attempts),
        state_repo=state,
        calibration=CalibrationStub(),
    ).calculate(1, "skill")
    return result, state


def test_default_weights_exclude_speed() -> None:
    weights = CalibrationStub().get_weights(1, "skill")

    assert weights == DEFAULT_WEIGHTS
    assert not hasattr(weights, "speed")
    assert weights.accuracy == 0.40
    assert weights.evidence_quality == 0.05


def test_invalid_weights_raise() -> None:
    with pytest.raises(ValueError):
        MasteryWeights(
            accuracy=0.40,
            consistency=0.20,
            retention=0.15,
            difficulty_performance=0.20,
            evidence_quality=0.50,
        )


def test_speed_is_not_used_in_mastery_calculation() -> None:
    fast = [attempt(correct=True, response_time=1.0, difficulty=5) for _ in range(10)]
    slow = [attempt(correct=True, response_time=120.0, difficulty=5) for _ in range(10)]

    fast_result, _ = calculate(fast)
    slow_result, _ = calculate(slow)

    assert fast_result.final_mastery == slow_result.final_mastery
    assert "Response time was not used" in slow_result.explanation


def test_slow_correct_student_is_not_punished() -> None:
    attempts = [attempt(correct=True, response_time=90.0, difficulty=4) for _ in range(10)]

    result, state = calculate(attempts, mastery=70.0)

    assert result.accuracy_score == 100.0
    assert result.final_mastery > 70.0
    assert state.saved_mastery == result.final_mastery


def test_fast_wrong_student_is_not_rewarded() -> None:
    attempts = [attempt(correct=False, response_time=1.0, difficulty=3) for _ in range(10)]

    result, _ = calculate(attempts, mastery=70.0)

    assert result.accuracy_score == 0.0
    assert result.final_mastery < 70.0


def test_hint_and_retry_reduce_adjusted_mastery() -> None:
    independent, _ = calculate([attempt(correct=True) for _ in range(10)])
    supported, _ = calculate(
        [attempt(correct=True, hint=True, tries=3) for _ in range(10)]
    )

    assert supported.evidence_quality_score < independent.evidence_quality_score
    assert supported.penalties["hint_penalty"] > 0
    assert supported.penalties["retry_penalty"] > 0
    assert supported.mastery_adjusted < independent.mastery_adjusted


def test_low_attempt_count_reduces_reliability_and_caps_jump() -> None:
    result, _ = calculate([attempt(correct=True, difficulty=5)], mastery=20.0)

    assert result.reliability == 0.1
    assert result.decision_confidence == "low"
    assert result.final_mastery <= 32.0


def test_mastery_drop_is_stabilized() -> None:
    result, _ = calculate(
        [attempt(correct=False, difficulty=5) for _ in range(10)],
        mastery=90.0,
    )

    assert result.final_mastery >= 75.0


def test_skips_reduce_valid_attempt_count_and_confidence() -> None:
    result, _ = calculate(
        [attempt(correct=True), attempt(correct=True), attempt(correct=False, skip=True)],
        mastery=50.0,
    )

    assert result.attempt_count == 3
    assert result.valid_attempt_count == 2
    assert result.penalties["skip_penalty"] > 0
    assert result.decision_confidence == "low"
