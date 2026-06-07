"""Outcome tracking for prior AIM recommendations."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

OutcomeLabel = Literal["successful", "neutral", "failed"]


# Represents before/after metrics for one recommendation.
@dataclass(frozen=True)
class OutcomeTrackingInput:
    """Before/after metrics used to judge whether a recommendation helped."""

    recommendation_id: int
    mastery_before: float
    mastery_after: float
    retention_before: float
    retention_after: float
    weakness_before: float
    weakness_after: float


# Represents the measured recommendation outcome.
@dataclass(frozen=True)
class OutcomeTrackingResult:
    """Recommendation outcome label with the measured deltas."""

    recommendation_id: int
    mastery_before: float
    mastery_after: float
    retention_before: float
    retention_after: float
    weakness_before: float
    weakness_after: float
    outcome: OutcomeLabel


# Tracks whether a recommendation improved learning outcomes.
class OutcomeTracker:
    """Classifies whether prior adaptive recommendations improved learning."""

    def track(self, item: OutcomeTrackingInput) -> OutcomeTrackingResult:
        mastery_delta = item.mastery_after - item.mastery_before
        retention_delta = item.retention_after - item.retention_before
        weakness_delta = item.weakness_before - item.weakness_after

        if mastery_delta >= 5.0 or retention_delta >= 5.0 or weakness_delta >= 10.0:
            outcome: OutcomeLabel = "successful"
        elif mastery_delta <= -5.0 and weakness_delta <= -5.0:
            outcome = "failed"
        else:
            outcome = "neutral"

        return OutcomeTrackingResult(
            recommendation_id=item.recommendation_id,
            mastery_before=item.mastery_before,
            mastery_after=item.mastery_after,
            retention_before=item.retention_before,
            retention_after=item.retention_after,
            weakness_before=item.weakness_before,
            weakness_after=item.weakness_after,
            outcome=outcome,
        )
