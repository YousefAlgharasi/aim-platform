"""
T-06 tests for DifficultyAdapter.
"""

from __future__ import annotations

import pytest

from aim.domain.services.difficulty_adapter import DifficultyAction, DifficultyAdapter


class TestDifficultyAdapter:
    def setup_method(self) -> None:
        self.adapter = DifficultyAdapter()

    def test_increase_when_score_above_80(self) -> None:
        decision = self.adapter.decide(
            mastery=90.0,
            confidence=85.0,
            consistency=90.0,
            current_difficulty=3,
        )
        assert decision.score == 89.0
        assert decision.action == DifficultyAction.INCREASE
        assert decision.target_difficulty == 4

    def test_maintain_when_score_is_80(self) -> None:
        decision = self.adapter.decide(
            mastery=80.0,
            confidence=80.0,
            consistency=80.0,
            current_difficulty=3,
        )
        assert decision.score == 80.0
        assert decision.action == DifficultyAction.MAINTAIN
        assert decision.target_difficulty == 3

    def test_maintain_when_score_is_50(self) -> None:
        decision = self.adapter.decide(
            mastery=50.0,
            confidence=50.0,
            consistency=50.0,
            current_difficulty=3,
        )
        assert decision.score == 50.0
        assert decision.action == DifficultyAction.MAINTAIN

    def test_decrease_when_score_below_50(self) -> None:
        decision = self.adapter.decide(
            mastery=40.0,
            confidence=45.0,
            consistency=30.0,
            current_difficulty=3,
        )
        assert decision.score == 38.0
        assert decision.action == DifficultyAction.DECREASE
        assert decision.target_difficulty == 2

    def test_difficulty_caps_at_five(self) -> None:
        decision = self.adapter.decide(
            mastery=100.0,
            confidence=100.0,
            consistency=100.0,
            current_difficulty=5,
        )
        assert decision.action == DifficultyAction.INCREASE
        assert decision.target_difficulty == 5

    def test_difficulty_floors_at_one(self) -> None:
        decision = self.adapter.decide(
            mastery=0.0,
            confidence=0.0,
            consistency=0.0,
            current_difficulty=1,
        )
        assert decision.action == DifficultyAction.DECREASE
        assert decision.target_difficulty == 1

    def test_invalid_score_raises(self) -> None:
        with pytest.raises(ValueError, match="mastery"):
            self.adapter.decide(
                mastery=101.0,
                confidence=50.0,
                consistency=50.0,
                current_difficulty=3,
            )

    def test_invalid_difficulty_raises(self) -> None:
        with pytest.raises(ValueError, match="current_difficulty"):
            self.adapter.decide(
                mastery=50.0,
                confidence=50.0,
                consistency=50.0,
                current_difficulty=6,
            )
