"""
T-08 tests for RetentionTracker.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Sequence

import pytest

from ai_core.retention_tracker import (
    DEFAULT_GRAMMAR_LAMBDA,
    DEFAULT_OTHER_LAMBDA,
    DEFAULT_VOCABULARY_LAMBDA,
    RetentionSkillState,
    RetentionTracker,
)


class FakeRetentionRepo:
    def __init__(self, states: list[RetentionSkillState]) -> None:
        self.states = {(s.student_id, s.skill_id): s for s in states}
        self.saved_retention: dict[tuple[int, str], tuple[float, bool]] = {}
        self.saved_lambda: dict[tuple[int, str], tuple[float, Sequence[dict]]] = {}

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> RetentionSkillState | None:
        return self.states.get((student_id, skill_id))

    def get_student_skill_states(
        self,
        student_id: int,
    ) -> Sequence[RetentionSkillState]:
        return [s for s in self.states.values() if s.student_id == student_id]

    def update_retention(
        self,
        student_id: int,
        skill_id: str,
        retention: float,
        is_due: bool,
    ) -> None:
        self.saved_retention[(student_id, skill_id)] = (retention, is_due)

    def update_lambda(
        self,
        student_id: int,
        skill_id: str,
        retention_lambda: float,
        retention_history: Sequence[dict],
    ) -> None:
        self.saved_lambda[(student_id, skill_id)] = (
            retention_lambda,
            retention_history,
        )


def make_state(
    skill_id: str = "GRAMMAR_TENSES_PRESENT_PERFECT",
    *,
    mastery: float = 100.0,
    retention_lambda: float | None = None,
    last_reviewed_at: datetime | None = None,
    category: str | None = "Grammar",
    retention_history: Sequence[dict] | None = None,
) -> RetentionSkillState:
    return RetentionSkillState(
        student_id=1,
        skill_id=skill_id,
        mastery=mastery,
        retention=100.0,
        retention_lambda=retention_lambda,
        last_reviewed_at=last_reviewed_at,
        category=category,
        retention_history=retention_history or [],
    )


class TestRetentionTracker:
    def test_default_lambda_by_category(self) -> None:
        assert RetentionTracker.default_lambda_for_category("Grammar") == DEFAULT_GRAMMAR_LAMBDA
        assert RetentionTracker.default_lambda_for_category("Vocabulary") == DEFAULT_VOCABULARY_LAMBDA
        assert RetentionTracker.default_lambda_for_category("Reading") == DEFAULT_OTHER_LAMBDA

    def test_calculates_forgetting_curve(self) -> None:
        now = datetime(2026, 5, 19)
        state = make_state(
            mastery=100.0,
            retention_lambda=0.1,
            last_reviewed_at=now - timedelta(days=3),
        )
        repo = FakeRetentionRepo([state])
        tracker = RetentionTracker(repo, now=now)

        result = tracker.calculate_current_retention(1, state.skill_id)

        expected = round(100.0 * math.exp(-0.1 * 3), 2)
        assert result.retention == expected
        assert result.is_due is False
        assert repo.saved_retention[(1, state.skill_id)] == (expected, False)

    def test_flags_due_when_below_70_percent(self) -> None:
        now = datetime(2026, 5, 19)
        state = make_state(
            mastery=100.0,
            retention_lambda=0.2,
            last_reviewed_at=now - timedelta(days=3),
            category="Vocabulary",
        )
        repo = FakeRetentionRepo([state])
        tracker = RetentionTracker(repo, now=now)

        result = tracker.calculate_current_retention(1, state.skill_id)

        assert result.retention < 70.0
        assert result.is_due is True

    def test_get_skills_due_for_review_sorted_by_lowest_retention(self) -> None:
        now = datetime(2026, 5, 19)
        states = [
            make_state("a", retention_lambda=0.2, last_reviewed_at=now - timedelta(days=3)),
            make_state("b", retention_lambda=0.3, last_reviewed_at=now - timedelta(days=3)),
            make_state("c", retention_lambda=0.01, last_reviewed_at=now - timedelta(days=1)),
        ]
        repo = FakeRetentionRepo(states)
        tracker = RetentionTracker(repo, now=now)

        due = tracker.get_skills_due_for_review(1)

        assert [item.skill_id for item in due] == ["b", "a"]

    def test_update_lambda_uses_default_until_three_readings(self) -> None:
        now = datetime(2026, 5, 19)
        state = make_state(category="Grammar", retention_history=[])
        repo = FakeRetentionRepo([state])
        tracker = RetentionTracker(repo, now=now)

        new_lambda = tracker.update_lambda(1, state.skill_id, 90.0)

        assert new_lambda == DEFAULT_GRAMMAR_LAMBDA
        saved_lambda, history = repo.saved_lambda[(1, state.skill_id)]
        assert saved_lambda == DEFAULT_GRAMMAR_LAMBDA
        assert len(history) == 1

    def test_update_lambda_fits_decay_after_three_readings(self) -> None:
        start = datetime(2026, 5, 1)
        history = [
            {"timestamp": start.isoformat(), "mastery": 100.0},
            {
                "timestamp": (start + timedelta(days=2)).isoformat(),
                "mastery": round(100.0 * math.exp(-0.2 * 2), 2),
            },
        ]
        state = make_state(
            category="Vocabulary",
            retention_history=history,
        )
        repo = FakeRetentionRepo([state])
        tracker = RetentionTracker(repo, now=start + timedelta(days=4))

        fitted = tracker.update_lambda(
            1,
            state.skill_id,
            round(100.0 * math.exp(-0.2 * 4), 2),
            reading_time=start + timedelta(days=4),
        )

        assert fitted == pytest.approx(0.2, abs=0.01)
        assert len(repo.saved_lambda[(1, state.skill_id)][1]) == 3

    def test_missing_skill_raises_key_error(self) -> None:
        repo = FakeRetentionRepo([])
        tracker = RetentionTracker(repo)

        with pytest.raises(KeyError):
            tracker.calculate_current_retention(1, "missing")
