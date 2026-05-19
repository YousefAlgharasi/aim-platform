"""
T-12: Training data export and labeling foundation.

This module prepares recommendation logs for future ML training. It does not
pretend a model can be trained before enough production data exists.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


class NotEnoughTrainingDataError(RuntimeError):
    """Raised when Phase 3 training is requested before enough data exists."""


@dataclass(frozen=True)
class RecommendationTrainingRow:
    recommendation_id: int
    student_id: int
    action_type: str
    mastery: float
    confidence: float
    frustration_score: float
    error_pattern_type: str
    retention: float
    difficulty_score: float
    streak: int
    time_of_day: str
    session_length_history: float
    mastery_after_next_2_sessions: float | None


@dataclass(frozen=True)
class LabeledTrainingExample:
    features: dict[str, float | int | str]
    label: int
    recommendation_id: int


def assert_minimum_rows(row_count: int, minimum: int = 10_000) -> None:
    if row_count < minimum:
        raise NotEnoughTrainingDataError(
            f"T-12 needs at least {minimum} recommendation rows, got {row_count}. "
            "Keep using the rule-based RecommendationEngine until enough "
            "production data has been collected."
        )


def label_training_data(
    rows: Iterable[RecommendationTrainingRow],
) -> list[LabeledTrainingExample]:
    labeled = []
    for row in rows:
        if row.mastery_after_next_2_sessions is None:
            continue
        success = row.mastery_after_next_2_sessions > row.mastery + 5.0
        labeled.append(
            LabeledTrainingExample(
                recommendation_id=row.recommendation_id,
                label=1 if success else 0,
                features={
                    "mastery": row.mastery,
                    "confidence": row.confidence,
                    "frustration_score": row.frustration_score,
                    "error_pattern_type": row.error_pattern_type,
                    "retention": row.retention,
                    "difficulty_score": row.difficulty_score,
                    "streak": row.streak,
                    "time_of_day": row.time_of_day,
                    "session_length_history": row.session_length_history,
                    "action_type": row.action_type,
                },
            )
        )
    return labeled
