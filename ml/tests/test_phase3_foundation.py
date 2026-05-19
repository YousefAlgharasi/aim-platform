"""
T-12 foundation tests.
"""

from __future__ import annotations

import pytest

from ml.ab_test_framework import RecommendationVariant, assign_student_variant
from ml.data_pipeline import (
    NotEnoughTrainingDataError,
    RecommendationTrainingRow,
    assert_minimum_rows,
    label_training_data,
)
from ml.evaluation import MasteryOutcome, compare_mastery_improvement
from ml.train_recommendation_model import train_xgboost_recommendation_model


def row(
    recommendation_id: int,
    *,
    mastery: float = 60.0,
    mastery_after: float | None = 70.0,
) -> RecommendationTrainingRow:
    return RecommendationTrainingRow(
        recommendation_id=recommendation_id,
        student_id=1,
        action_type="REVIEW",
        mastery=mastery,
        confidence=50.0,
        frustration_score=0.0,
        error_pattern_type="NO_DOMINANT_PATTERN",
        retention=80.0,
        difficulty_score=60.0,
        streak=2,
        time_of_day="morning",
        session_length_history=12.0,
        mastery_after_next_2_sessions=mastery_after,
    )


def test_label_training_data_success_and_failure() -> None:
    labeled = label_training_data([
        row(1, mastery=60.0, mastery_after=66.0),
        row(2, mastery=60.0, mastery_after=64.0),
        row(3, mastery=60.0, mastery_after=None),
    ])

    assert [example.label for example in labeled] == [1, 0]
    assert labeled[0].features["action_type"] == "REVIEW"


def test_minimum_rows_guard() -> None:
    with pytest.raises(NotEnoughTrainingDataError):
        assert_minimum_rows(9999)


def test_trainer_refuses_to_train_without_enough_data() -> None:
    examples = label_training_data([row(1), row(2)])

    with pytest.raises(NotEnoughTrainingDataError):
        train_xgboost_recommendation_model(examples)


def test_ab_assignment_is_stable() -> None:
    first = assign_student_variant(42)
    second = assign_student_variant(42)

    assert first == second
    assert first.variant in {
        RecommendationVariant.RULE_BASED,
        RecommendationVariant.ML_MODEL,
    }


def test_evaluation_compares_average_improvement() -> None:
    result = compare_mastery_improvement([
        MasteryOutcome(1, RecommendationVariant.RULE_BASED, 50.0, 55.0),
        MasteryOutcome(2, RecommendationVariant.ML_MODEL, 50.0, 60.0),
    ])

    assert result.rule_based_avg_improvement == 5.0
    assert result.ml_avg_improvement == 10.0
    assert result.winner == RecommendationVariant.ML_MODEL
