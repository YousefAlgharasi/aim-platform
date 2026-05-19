"""
T-12: Recommendation model trainer foundation.

The real XGBoost training path is guarded until enough production data exists.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from aim.ml.data_pipeline import LabeledTrainingExample, assert_minimum_rows


@dataclass(frozen=True)
class TrainedRecommendationModel:
    model_type: str
    training_rows: int
    feature_names: list[str]

    def get_next_action(self, student_id: int):  # pragma: no cover - interface stub
        raise RuntimeError(
            "The trained ML model is not available yet. Use the rule-based "
            "RecommendationEngine fallback until Phase 3 data requirements are met."
        )


def train_xgboost_recommendation_model(
    examples: Sequence[LabeledTrainingExample],
    *,
    minimum_rows: int = 10_000,
) -> TrainedRecommendationModel:
    assert_minimum_rows(len(examples), minimum=minimum_rows)

    try:
        import xgboost  # noqa: F401
    except ImportError as exc:  # pragma: no cover - depends on optional package
        raise RuntimeError("Install xgboost before training the Phase 3 model") from exc

    feature_names = list(examples[0].features.keys()) if examples else []
    return TrainedRecommendationModel(
        model_type="xgboost-gradient-boosting-classifier",
        training_rows=len(examples),
        feature_names=feature_names,
    )
