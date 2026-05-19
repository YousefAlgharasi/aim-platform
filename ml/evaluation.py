"""
T-12: A/B evaluation helpers.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from ml.ab_test_framework import RecommendationVariant


@dataclass(frozen=True)
class MasteryOutcome:
    student_id: int
    variant: RecommendationVariant
    mastery_before: float
    mastery_after_30_days: float


@dataclass(frozen=True)
class EvaluationResult:
    rule_based_avg_improvement: float
    ml_avg_improvement: float
    winner: RecommendationVariant | str


def compare_mastery_improvement(
    outcomes: Sequence[MasteryOutcome],
) -> EvaluationResult:
    rule_improvements = [
        item.mastery_after_30_days - item.mastery_before
        for item in outcomes
        if item.variant == RecommendationVariant.RULE_BASED
    ]
    ml_improvements = [
        item.mastery_after_30_days - item.mastery_before
        for item in outcomes
        if item.variant == RecommendationVariant.ML_MODEL
    ]

    rule_avg = _avg(rule_improvements)
    ml_avg = _avg(ml_improvements)
    if ml_avg > rule_avg:
        winner: RecommendationVariant | str = RecommendationVariant.ML_MODEL
    elif rule_avg > ml_avg:
        winner = RecommendationVariant.RULE_BASED
    else:
        winner = "TIE"

    return EvaluationResult(
        rule_based_avg_improvement=rule_avg,
        ml_avg_improvement=ml_avg,
        winner=winner,
    )


def _avg(values: Sequence[float]) -> float:
    if not values:
        return 0.0
    return round(sum(values) / len(values), 4)
