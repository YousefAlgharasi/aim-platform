"""
T-07 tests for WeaknessDetector.
"""

from __future__ import annotations

import pytest

from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector


def make_attempt(
    skill_id: str,
    *,
    is_correct: bool,
    difficulty: int = 3,
    skip: bool = False,
) -> WeaknessAttempt:
    return WeaknessAttempt(
        student_id=1,
        skill_id=skill_id,
        is_correct=is_correct,
        difficulty=difficulty,
        skip=skip,
    )


class TestWeaknessDetector:
    def setup_method(self) -> None:
        self.detector = WeaknessDetector()

    def test_calculates_weakness_score(self) -> None:
        attempts = [
            make_attempt("present_perfect", is_correct=False, difficulty=5),
            make_attempt("present_perfect", is_correct=False, difficulty=5),
            make_attempt("present_perfect", is_correct=True, difficulty=1),
            make_attempt("present_perfect", is_correct=True, difficulty=1),
        ]

        result = self.detector.calculate_skill_weakness(
            attempts,
            "present_perfect",
        )

        assert result.error_frequency == 0.5
        assert result.difficulty_weight == 100.0
        assert result.weakness_score == 50.0

    def test_returns_top_three_weakest_skills(self) -> None:
        attempts = [
            make_attempt("a", is_correct=False, difficulty=5),
            make_attempt("a", is_correct=False, difficulty=5),
            make_attempt("b", is_correct=False, difficulty=4),
            make_attempt("b", is_correct=True, difficulty=4),
            make_attempt("c", is_correct=False, difficulty=3),
            make_attempt("c", is_correct=True, difficulty=3),
            make_attempt("d", is_correct=True, difficulty=5),
        ]

        weakest = self.detector.top_weakest_skills(attempts)

        assert [w.skill_id for w in weakest] == ["a", "b", "c"]
        assert len(weakest) == 3

    def test_skipped_attempts_are_ignored(self) -> None:
        attempts = [
            make_attempt("grammar", is_correct=False, difficulty=5, skip=True),
            make_attempt("grammar", is_correct=True, difficulty=5),
        ]

        result = self.detector.calculate_skill_weakness(attempts, "grammar")

        assert result.total_attempts == 1
        assert result.repeated_mistakes == 0
        assert result.weakness_score == 0.0

    def test_missing_skill_returns_zero_weakness(self) -> None:
        result = self.detector.calculate_skill_weakness([], "missing")

        assert result.skill_id == "missing"
        assert result.total_attempts == 0
        assert result.weakness_score == 0.0

    def test_invalid_limit_raises(self) -> None:
        with pytest.raises(ValueError, match="limit"):
            self.detector.top_weakest_skills([], limit=0)

    def test_invalid_difficulty_raises(self) -> None:
        with pytest.raises(ValueError, match="difficulty"):
            self.detector.calculate_by_skill(
                [make_attempt("grammar", is_correct=False, difficulty=6)]
            )
