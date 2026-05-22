from __future__ import annotations

import pytest

from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector


def attempt(
    skill_id: str = "grammar",
    *,
    correct: bool = True,
    difficulty: int = 3,
    skip: bool = False,
    hint: bool = False,
    tries: int = 1,
) -> WeaknessAttempt:
    return WeaknessAttempt(
        student_id=1,
        skill_id=skill_id,
        is_correct=correct,
        difficulty=difficulty,
        skip=skip,
        hint_used=hint,
        attempts=tries,
    )


def test_v2_formula_uses_multiple_weakness_signals() -> None:
    attempts = [
        attempt(correct=False, hint=True, tries=2),
        attempt(correct=False, hint=True, tries=2),
        attempt(correct=True),
        attempt(correct=True, skip=True),
    ]

    result = WeaknessDetector().calculate_skill_weakness(
        attempts,
        "grammar",
        hesitation_index=0.5,
        retention_drop=30.0,
        prerequisite_gap_score=80.0,
    )

    assert result.weakness_score > 30.0
    assert "frequent_errors" in result.main_weaknesses
    assert "hint_dependency" in result.main_weaknesses
    assert result.severity in {"low", "medium", "high"}
    assert result.weakness_evidence["prerequisite_gap_score"] == 80.0


def test_skips_contribute_to_weakness_but_not_error_frequency() -> None:
    result = WeaknessDetector().calculate_skill_weakness(
        [attempt(correct=False, skip=True), attempt(correct=True)],
        "grammar",
    )

    assert result.error_frequency == 0.0
    assert result.skip_rate == 0.5
    assert result.weakness_score > 0.0


def test_top_weakest_skills_orders_by_score() -> None:
    attempts = [
        attempt("a", correct=False, hint=True, tries=2),
        attempt("a", correct=False, hint=True, tries=2),
        attempt("b", correct=False),
        attempt("c", correct=True),
    ]

    result = WeaknessDetector().top_weakest_skills(attempts, limit=2)

    assert [item.skill_id for item in result] == ["a", "b"]


def test_invalid_difficulty_raises() -> None:
    with pytest.raises(ValueError, match="difficulty"):
        WeaknessDetector().calculate_skill_weakness(
            [attempt(correct=False, difficulty=6)],
            "grammar",
        )
