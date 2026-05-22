from __future__ import annotations

import pytest

from aim.domain.services.difficulty_adapter import DifficultyAction, DifficultyAdapter


def test_increase_requires_reliable_strong_evidence() -> None:
    decision = DifficultyAdapter().decide(
        mastery=90.0,
        consistency=90.0,
        reliability=0.80,
        weakness_score=20.0,
        frustration_score=10.0,
        retention=90.0,
        current_difficulty=3,
    )

    assert decision.action == DifficultyAction.INCREASE
    assert decision.target_difficulty == 4
    assert "Increase" in decision.reason


def test_does_not_increase_without_reliability() -> None:
    decision = DifficultyAdapter().decide(
        mastery=95.0,
        consistency=95.0,
        reliability=0.30,
        weakness_score=0.0,
        frustration_score=0.0,
        retention=100.0,
        current_difficulty=3,
    )

    assert decision.action == DifficultyAction.MAINTAIN
    assert decision.target_difficulty == 3


def test_decreases_for_high_frustration() -> None:
    decision = DifficultyAdapter().decide(
        mastery=90.0,
        consistency=90.0,
        reliability=1.0,
        weakness_score=10.0,
        frustration_score=80.0,
        retention=90.0,
        current_difficulty=3,
    )

    assert decision.action == DifficultyAction.DECREASE
    assert decision.target_difficulty == 2


def test_decreases_for_repeated_failures() -> None:
    decision = DifficultyAdapter().decide(
        mastery=70.0,
        consistency=70.0,
        reliability=0.70,
        weakness_score=10.0,
        frustration_score=0.0,
        retention=90.0,
        repeated_failure_count=3,
        current_difficulty=3,
    )

    assert decision.action == DifficultyAction.DECREASE


def test_maintains_when_no_gate_is_met() -> None:
    decision = DifficultyAdapter().decide(
        mastery=75.0,
        consistency=80.0,
        reliability=0.70,
        weakness_score=40.0,
        frustration_score=30.0,
        retention=80.0,
        current_difficulty=3,
    )

    assert decision.action == DifficultyAction.MAINTAIN


def test_invalid_values_raise() -> None:
    with pytest.raises(ValueError, match="mastery"):
        DifficultyAdapter().decide(
            mastery=101.0,
            consistency=80.0,
            current_difficulty=3,
        )

    with pytest.raises(ValueError, match="current_difficulty"):
        DifficultyAdapter().decide(
            mastery=50.0,
            consistency=50.0,
            current_difficulty=6,
        )
