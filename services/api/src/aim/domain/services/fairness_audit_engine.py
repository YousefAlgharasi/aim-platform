"""Fairness audit signals for AIM adaptive decisions."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

FairnessRiskLevel = Literal["low", "medium", "high"]


# Represents inputs for fairness risk detection.
@dataclass(frozen=True)
class FairnessAuditInput:
    """Evidence used to audit whether an adaptive result may be unfair."""

    accuracy_score: float
    avg_response_time: float
    response_time_used_in_mastery: bool
    mastery_delta: float
    reliability: float
    evidence_quality_score: float
    difficulty_action: str
    question_quality_score: float


# Represents fairness warnings for one adaptive decision.
@dataclass(frozen=True)
class FairnessAuditResult:
    """Fairness risk level with warnings and suggested corrections."""

    fairness_risk_level: FairnessRiskLevel
    fairness_warnings: list[str] = field(default_factory=list)
    suggested_correction: str = "No correction needed."
    evidence: dict[str, float | str | bool] = field(default_factory=dict)


# Audits adaptive decisions for possible unfair outcomes.
class FairnessAuditEngine:
    """Detects possible unfair adaptive outcomes without using clinical labels."""

    def audit(self, item: FairnessAuditInput) -> FairnessAuditResult:
        warnings: list[str] = []

        # Speed is no longer in mastery, so slow-correct penalty risk is normally low.
        if item.response_time_used_in_mastery:
            warnings.append("slow_correct_penalty_risk")
        if item.accuracy_score < 50.0 and item.mastery_delta > 0:
            warnings.append("fast_wrong_reward_risk")
        if item.reliability < 0.40 and abs(item.mastery_delta) > 8.0:
            warnings.append("false_mastery_shift_risk")
        if item.evidence_quality_score < 45.0 and item.mastery_delta > 5.0:
            warnings.append("false_high_mastery_risk")
        if item.question_quality_score < 60.0 and item.mastery_delta < -5.0:
            warnings.append("false_low_mastery_risk")
        if item.difficulty_action.lower() == "increase" and item.reliability < 0.70:
            warnings.append("difficulty_escalation_risk")
        if item.evidence_quality_score < 55.0:
            warnings.append("evidence_quality_gap")

        if len(warnings) >= 3:
            level: FairnessRiskLevel = "high"
            correction = "Collect more evidence and avoid aggressive mastery or difficulty changes."
        elif warnings:
            level = "medium"
            correction = "Use conservative recommendations and record the fairness warnings."
        else:
            level = "low"
            correction = "No correction needed."

        return FairnessAuditResult(
            fairness_risk_level=level,
            fairness_warnings=warnings,
            suggested_correction=correction,
            evidence={
                "accuracy_score": item.accuracy_score,
                "avg_response_time": item.avg_response_time,
                "response_time_used_in_mastery": item.response_time_used_in_mastery,
                "mastery_delta": item.mastery_delta,
                "reliability": item.reliability,
                "evidence_quality_score": item.evidence_quality_score,
                "difficulty_action": item.difficulty_action,
                "question_quality_score": item.question_quality_score,
            },
        )
