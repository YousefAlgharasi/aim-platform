"""Reliability scoring for AIM session evidence."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

DecisionConfidence = Literal["low", "medium", "high"]


# Represents reliability and decision confidence for a session.
@dataclass(frozen=True)
class ReliabilityResult:
    """Trust level for how strongly the current session should affect mastery."""

    reliability: float
    decision_confidence: DecisionConfidence
    evidence_warning: str | None
    valid_attempt_count: int


# Calculates how much the current session should affect mastery.
class ReliabilityEngine:
    """Calculates session reliability from the count of valid attempts."""

    TARGET_ATTEMPTS = 10

    def calculate(self, valid_attempt_count: int) -> ReliabilityResult:
        if valid_attempt_count < 0:
            raise ValueError("valid_attempt_count must be >= 0")

        reliability = round(min(1.0, valid_attempt_count / self.TARGET_ATTEMPTS), 4)
        if reliability < 0.40:
            confidence: DecisionConfidence = "low"
        elif reliability < 0.70:
            confidence = "medium"
        else:
            confidence = "high"

        warning = None
        if confidence == "low":
            warning = "too_few_attempts_for_strong_mastery_update"
        elif confidence == "medium":
            warning = "moderate_attempt_count_collect_more_evidence"

        return ReliabilityResult(
            reliability=reliability,
            decision_confidence=confidence,
            evidence_warning=warning,
            valid_attempt_count=valid_attempt_count,
        )
