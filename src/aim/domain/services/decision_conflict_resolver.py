"""Decision conflict resolution for AIM recommendations."""

from __future__ import annotations

from dataclasses import dataclass, field


# Represents conflicting adaptive signals.
@dataclass(frozen=True)
class DecisionConflictInput:
    """Signals that may conflict before choosing the final recommendation."""

    frustration_score: float
    emotional_signal: str
    prerequisite_gap_score: float
    weakness_score: float
    error_pattern_type: str | None
    retention: float
    confidence_mismatch: bool
    difficulty_action: str
    transfer_category: str | None
    current_skill_id: str | None
    reliability: float = 1.0
    prerequisite_skill_id: str | None = None
    transfer_skill_id: str | None = None


# Represents the selected priority and action.
@dataclass(frozen=True)
class DecisionConflictResult:
    """Resolved priority and action with explainable supporting evidence."""

    final_priority: str
    selected_action: str
    reason: str
    evidence: dict[str, float | str | bool | None] = field(default_factory=dict)


# Resolves conflicts using the AIM priority order.
class DecisionConflictResolver:
    """Applies AIM's priority order when adaptive signals disagree."""

    def resolve(self, item: DecisionConflictInput) -> DecisionConflictResult:
        evidence = {
            "frustration_score": item.frustration_score,
            "emotional_signal": item.emotional_signal,
            "prerequisite_gap_score": item.prerequisite_gap_score,
            "weakness_score": item.weakness_score,
            "error_pattern_type": item.error_pattern_type,
            "retention": item.retention,
            "confidence_mismatch": item.confidence_mismatch,
            "difficulty_action": item.difficulty_action,
            "transfer_category": item.transfer_category,
            "reliability": item.reliability,
            "current_skill_id": item.current_skill_id,
            "prerequisite_skill_id": item.prerequisite_skill_id,
            "transfer_skill_id": item.transfer_skill_id,
        }

        if item.reliability < 0.40:
            return self._result("low_reliability", "collect_more_evidence", evidence)
        if item.frustration_score >= 75.0 or item.emotional_signal == "possible_learning_overload":
            return self._result("high_frustration_or_overload", "easy_win", evidence)
        if item.prerequisite_gap_score > 0.0 and item.prerequisite_skill_id:
            return self._result("severe_prerequisite_gap", "review_prerequisite", evidence)
        if item.weakness_score >= 75.0:
            return self._result("severe_weakness", "reteach_concept", evidence)
        if item.error_pattern_type in {"guessing", "misunderstood_concept", "rushing"}:
            return self._result("strong_error_pattern", "targeted_practice", evidence)
        if item.retention < 70.0:
            return self._result("retention_review", "spaced_review", evidence)
        if item.confidence_mismatch:
            return self._result("confidence_mismatch", "confidence_builder", evidence)
        if item.difficulty_action.lower() == "increase":
            return self._result("difficulty_adaptation", "increase_difficulty", evidence)
        if item.transfer_category == "HIGH" and item.transfer_skill_id:
            return self._result("transfer_acceleration", "mixed_practice", evidence)
        return self._result("continue_current_skill", "continue_current_skill", evidence)

    @staticmethod
    def _result(
        priority: str,
        action: str,
        evidence: dict[str, float | str | bool | None],
    ) -> DecisionConflictResult:
        return DecisionConflictResult(
            final_priority=priority,
            selected_action=action,
            reason=f"Selected {action} because priority is {priority}.",
            evidence=evidence,
        )
