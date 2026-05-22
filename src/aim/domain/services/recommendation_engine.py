"""Recommendation Engine V2 for AIM adaptive next actions."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Protocol, Sequence

from aim.domain.services.confidence_matrix import ConfidenceMatrix, ConfidenceState
from aim.domain.services.contextual_memory import (
    ContextualMemory,
    SkillMasterySnapshot,
)
from aim.domain.services.difficulty_adapter import DifficultyAdapter
from aim.domain.services.emotional_state_detector import (
    EmotionalAttempt,
    EmotionalStateDetector,
)
from aim.domain.services.error_pattern_classifier import (
    ErrorAttempt,
    ErrorPatternClassifier,
    ErrorPatternType,
)
from aim.domain.services.micro_goal_generator import MicroGoalGenerator
from aim.domain.services.retention_tracker import REVIEW_THRESHOLD
from aim.domain.services.transfer_learning_detector import TransferCategory, TransferScoreResult
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector
from aim.infrastructure.skill_graph.skill_graph import SkillGraph


# Recommendation actions exposed by AIM V2.
class RecommendationActionType(str, Enum):
    """Supported AIM V2 next-action labels."""

    COLLECT_MORE_EVIDENCE = "collect_more_evidence"
    EASY_WIN = "easy_win"
    REVIEW_PREREQUISITE = "review_prerequisite"
    RETEACH_CONCEPT = "reteach_concept"
    TARGETED_PRACTICE = "targeted_practice"
    SPACED_REVIEW = "spaced_review"
    CONFIDENCE_BUILDER = "confidence_builder"
    REFLECTION_PRACTICE = "reflection_practice"
    MIXED_PRACTICE = "mixed_practice"
    INCREASE_DIFFICULTY = "increase_difficulty"
    CONTINUE_CURRENT_SKILL = "continue_current_skill"
    TRIGGER_TUTOR_INTERVENTION = "trigger_tutor_intervention"

    # Compatibility aliases for older callers that import enum names.
    REVIEW = "spaced_review"
    CHALLENGE = "increase_difficulty"
    TIMED_PRACTICE = "reflection_practice"
    FILL_PREREQUISITE_GAP = "review_prerequisite"
    WARM_UP = "easy_win"
    ACCELERATED = "mixed_practice"


# Recent attempt facts for recommendation context.
@dataclass(frozen=True)
class RecommendationAttempt:
    """Attempt snapshot used by the recommendation engine."""

    student_id: int
    skill_id: str
    question_id: str
    is_correct: bool
    response_time: float
    difficulty: int
    question_subtype: str | None = None
    is_timed: bool = False
    session_position: int = 1
    previously_correct: bool = False
    skip: bool = False
    hint_used: bool = False
    attempts: int = 1


# Current skill state for recommendation context.
@dataclass(frozen=True)
class RecommendationSkillState:
    """Student-skill state snapshot used for recommendation decisions."""

    skill_id: str
    mastery: float
    confidence: float
    consistency: float = 100.0
    current_difficulty: int = 3
    retention: float = 100.0
    review_due: bool = False
    weakness_score: float = 0.0
    frustration_score: float = 0.0
    reliability: float = 1.0
    learning_response_pattern: str | None = None


# Full recommendation context.
@dataclass(frozen=True)
class RecommendationContext:
    """All data needed to choose the next adaptive action."""

    student_id: int
    current_skill_id: str | None
    skill_states: Sequence[RecommendationSkillState]
    recent_attempts: Sequence[RecommendationAttempt]
    historical_avg_speed: float | None = None
    last_session_frustration_score: float | None = None
    error_pattern_type: str | None = None
    error_pattern_evidence: dict[str, Any] | None = None
    error_pattern_treatment_recommendation: str | None = None
    prerequisite_gaps: Sequence[str] = ()
    transfer_result: TransferScoreResult | None = None


# Recommendation result returned to application and API layers.
@dataclass(frozen=True)
class RecommendationResult:
    """Explainable V2 recommendation with evidence and confidence."""

    student_id: int
    action_type: RecommendationActionType
    skill_id: str | None
    difficulty: int
    reason: str
    evidence: dict[str, Any] = field(default_factory=dict)
    confidence: str = "medium"
    inputs_snapshot: dict[str, Any] = field(default_factory=dict)
    decision_priority: str = "continue_current_skill"

    @property
    def action(self) -> str:
        """V2 action label."""
        return self.action_type.value

    @property
    def target_skill_id(self) -> str | None:
        """V2 target skill alias."""
        return self.skill_id


# Provider contract for repository-backed contexts.
class RecommendationContextProvider(Protocol):
    """Application-side context provider dependency."""

    def get_context(self, student_id: int) -> RecommendationContext: ...


# Central AIM V2 recommendation engine.
class RecommendationEngine:
    """Combines AIM signals into one explainable next action."""

    def __init__(
        self,
        context_provider: RecommendationContextProvider,
        *,
        skill_graph: SkillGraph | None = None,
    ) -> None:
        self._provider = context_provider
        self._skill_graph = skill_graph or SkillGraph()
        self._difficulty_adapter = DifficultyAdapter()
        self._confidence_matrix = ConfidenceMatrix()
        self._error_classifier = ErrorPatternClassifier()
        self._emotional_detector = EmotionalStateDetector()
        self._weakness_detector = WeaknessDetector()
        self._micro_goal_generator = MicroGoalGenerator(self._skill_graph)
        self._contextual_memory = ContextualMemory()

    def get_next_action(self, student_id: int) -> RecommendationResult:
        """Choose the highest-priority adaptive recommendation."""
        context = self._provider.get_context(student_id)
        current_state = self._current_state(context)
        current_skill_id = current_state.skill_id if current_state else context.current_skill_id
        current_difficulty = current_state.current_difficulty if current_state else 1
        self._precompute_micro_goals(context)

        emotional = self._emotional_result(context)
        frustration_score = self._max_frustration(context, current_state, emotional.frustration_score)
        due = self._due_review_states(context)
        error_pattern_type, error_treatment = self._error_pattern_decision(context)
        prereq_gap = self._first_prerequisite_gap(context, current_skill_id)
        reliability = current_state.reliability if current_state else self._recent_reliability(context)
        difficulty_decision = None
        if current_state is not None:
            difficulty_decision = self._difficulty_adapter.decide(
                mastery=current_state.mastery,
                consistency=current_state.consistency,
                reliability=reliability,
                weakness_score=current_state.weakness_score,
                frustration_score=frustration_score,
                retention=current_state.retention,
                repeated_failure_count=self._recent_failure_streak(context),
                current_difficulty=current_state.current_difficulty,
                confidence=current_state.confidence,
            )

        base_evidence = self._inputs_snapshot(
            context,
            current_state=current_state,
            target_skill_id=current_skill_id,
            frustration_score=frustration_score,
            emotional_signal=emotional.emotional_signal,
            error_pattern_type=error_pattern_type,
            prerequisite_gap=prereq_gap,
            difficulty_action=(
                difficulty_decision.action.value if difficulty_decision is not None else None
            ),
            due_review_skill_ids=[state.skill_id for state in due],
            reliability=reliability,
        )

        if frustration_score >= 90.0 and current_state and current_state.weakness_score >= 75.0:
            return self._result(
                context,
                RecommendationActionType.TRIGGER_TUTOR_INTERVENTION,
                current_skill_id,
                1,
                "High overload and severe weakness require tutor intervention.",
                "high_frustration_or_overload",
                "high",
                base_evidence,
            )

        if frustration_score >= 75.0 or emotional.emotional_signal == "possible_learning_overload":
            easy_skill = self._easy_win_skill(context)
            target_skill_id = easy_skill.skill_id if easy_skill else current_skill_id
            return self._result(
                context,
                RecommendationActionType.EASY_WIN,
                target_skill_id,
                1,
                "High overload signal detected; start with an easy win.",
                "high_frustration_or_overload",
                "high",
                {**base_evidence, "target_skill_id": target_skill_id},
            )

        if prereq_gap is not None:
            return self._result(
                context,
                RecommendationActionType.REVIEW_PREREQUISITE,
                prereq_gap,
                1,
                f"Review prerequisite {prereq_gap} before continuing {current_skill_id}.",
                "severe_prerequisite_gap",
                "high",
                {**base_evidence, "target_skill_id": prereq_gap},
            )

        if current_state is not None and current_state.weakness_score >= 75.0:
            return self._result(
                context,
                RecommendationActionType.RETEACH_CONCEPT,
                current_skill_id,
                1,
                "Severe weakness score indicates the concept should be retaught.",
                "severe_weakness",
                "high",
                base_evidence,
            )

        if error_pattern_type in {"guessing", "misunderstood_concept"}:
            return self._result(
                context,
                RecommendationActionType.TARGETED_PRACTICE,
                current_skill_id,
                max(1, current_difficulty - 1),
                error_treatment,
                "strong_error_pattern",
                "medium",
                base_evidence,
            )

        if error_pattern_type == "rushing":
            return self._result(
                context,
                RecommendationActionType.REFLECTION_PRACTICE,
                current_skill_id,
                current_difficulty,
                error_treatment,
                "strong_error_pattern",
                "medium",
                base_evidence,
            )

        if due:
            target = due[0]
            return self._result(
                context,
                RecommendationActionType.SPACED_REVIEW,
                target.skill_id,
                max(1, min(5, target.current_difficulty)),
                "Retention is below threshold, so spaced review is due.",
                "retention_review",
                "medium",
                {**base_evidence, "target_skill_id": target.skill_id},
            )

        if current_state is not None:
            confidence = self._confidence_matrix.classify(
                mastery=current_state.mastery,
                confidence=current_state.confidence,
            )
            if confidence.state == ConfidenceState.OVERCONFIDENT:
                return self._result(
                    context,
                    RecommendationActionType.CONFIDENCE_BUILDER,
                    current_state.skill_id,
                    max(1, current_state.current_difficulty - 1),
                    "Confidence is high while mastery is not yet secure.",
                    "confidence_mismatch",
                    "medium",
                    base_evidence,
                )

        if reliability < 0.40:
            return self._result(
                context,
                RecommendationActionType.COLLECT_MORE_EVIDENCE,
                current_skill_id,
                current_difficulty,
                "Reliability is low; collect more evidence before changing path.",
                "low_reliability",
                "low",
                base_evidence,
            )

        if difficulty_decision is not None and difficulty_decision.action.value == "increase":
            return self._result(
                context,
                RecommendationActionType.INCREASE_DIFFICULTY,
                current_skill_id,
                difficulty_decision.target_difficulty,
                difficulty_decision.reason,
                "difficulty_adaptation",
                "high",
                {**base_evidence, "difficulty_evidence": difficulty_decision.evidence},
            )

        if (
            context.transfer_result is not None
            and context.transfer_result.category == TransferCategory.HIGH
        ):
            return self._result(
                context,
                RecommendationActionType.MIXED_PRACTICE,
                context.transfer_result.to_skill_id,
                current_difficulty,
                "High transfer learning detected; mix related skill practice.",
                "transfer_acceleration",
                "medium",
                {**base_evidence, "transfer_score": context.transfer_result.transfer_score},
            )

        fallback_skill = current_skill_id or self._weakest_skill_id(context)
        return self._result(
            context,
            RecommendationActionType.CONTINUE_CURRENT_SKILL,
            fallback_skill,
            current_difficulty,
            "No higher-priority intervention is needed.",
            "continue_current_skill",
            "medium",
            {**base_evidence, "target_skill_id": fallback_skill},
        )

    def _result(
        self,
        context: RecommendationContext,
        action: RecommendationActionType,
        skill_id: str | None,
        difficulty: int,
        reason: str,
        priority: str,
        confidence: str,
        evidence: dict[str, Any],
    ) -> RecommendationResult:
        return RecommendationResult(
            student_id=context.student_id,
            action_type=action,
            skill_id=skill_id,
            difficulty=difficulty,
            reason=reason,
            evidence=dict(evidence),
            confidence=confidence,
            decision_priority=priority,
            inputs_snapshot=dict(evidence),
        )

    def _current_state(
        self,
        context: RecommendationContext,
    ) -> RecommendationSkillState | None:
        if context.current_skill_id is not None:
            for state in context.skill_states:
                if state.skill_id == context.current_skill_id:
                    return state
        if not context.skill_states:
            return None
        return min(context.skill_states, key=lambda state: state.mastery)

    def _emotional_result(self, context: RecommendationContext):
        attempts = [
            EmotionalAttempt(
                question_id=attempt.question_id,
                is_correct=attempt.is_correct,
                response_time=attempt.response_time,
                previously_correct=attempt.previously_correct,
                skip=attempt.skip,
                hint_used=attempt.hint_used,
                attempts=attempt.attempts,
            )
            for attempt in context.recent_attempts
        ]
        return self._emotional_detector.detect(
            attempts,
            historical_avg_speed=context.historical_avg_speed,
        )

    @staticmethod
    def _max_frustration(
        context: RecommendationContext,
        current_state: RecommendationSkillState | None,
        current_score: float,
    ) -> float:
        scores = [current_score]
        if context.last_session_frustration_score is not None:
            scores.append(context.last_session_frustration_score)
        if current_state is not None:
            scores.append(current_state.frustration_score)
        return max(scores)

    def _error_pattern(self, context: RecommendationContext):
        attempts = [
            ErrorAttempt(
                student_id=attempt.student_id,
                skill_id=attempt.skill_id,
                question_id=attempt.question_id,
                is_correct=attempt.is_correct,
                question_subtype=attempt.question_subtype,
                is_timed=attempt.is_timed,
                session_position=attempt.session_position,
                skip=attempt.skip,
            )
            for attempt in context.recent_attempts
        ]
        return self._error_classifier.classify(attempts)

    def _error_pattern_decision(
        self,
        context: RecommendationContext,
    ) -> tuple[str, str]:
        if context.error_pattern_type is not None:
            return (
                context.error_pattern_type,
                context.error_pattern_treatment_recommendation
                or "Use the saved error pattern to adapt the next practice.",
            )

        error_pattern = self._error_pattern(context)
        architecture_type = {
            ErrorPatternType.TYPE_1_RANDOM: "guessing",
            ErrorPatternType.TYPE_2_CONSISTENT: "misunderstood_concept",
            ErrorPatternType.TYPE_3_PRESSURE: "rushing",
            ErrorPatternType.TYPE_4_WARMUP: "needs_warmup",
            ErrorPatternType.NO_DOMINANT_PATTERN: "unknown",
        }[error_pattern.pattern_type]
        return architecture_type, error_pattern.treatment_recommendation

    def _due_review_states(
        self,
        context: RecommendationContext,
    ) -> list[RecommendationSkillState]:
        due = [
            state
            for state in context.skill_states
            if state.review_due or state.retention < REVIEW_THRESHOLD
        ]
        return sorted(due, key=lambda state: state.retention)

    def _first_prerequisite_gap(
        self,
        context: RecommendationContext,
        current_skill_id: str | None,
    ) -> str | None:
        if context.prerequisite_gaps:
            return context.prerequisite_gaps[0]
        if current_skill_id is None or current_skill_id not in self._skill_graph:
            return None

        mastery_by_skill = {state.skill_id: state.mastery for state in context.skill_states}
        for prereq in self._skill_graph.get_prerequisites(current_skill_id):
            prereq_id = prereq["skill_id"]
            if mastery_by_skill.get(prereq_id, 0.0) < 70.0:
                return prereq_id
        return None

    def _easy_win_skill(
        self,
        context: RecommendationContext,
    ) -> RecommendationSkillState | None:
        snapshots = [
            SkillMasterySnapshot(state.skill_id, state.mastery)
            for state in context.skill_states
        ]
        self._contextual_memory.store_session_end(
            student_id=context.student_id,
            last_session_frustration_score=100.0,
            last_session_ending_mastery=0.0,
            last_skill_studied=context.current_skill_id or "",
        )
        rec = self._contextual_memory.get_session_start_recommendation(
            student_id=context.student_id,
            skill_states=snapshots,
        )
        if rec.skill_id is None:
            return None
        for state in context.skill_states:
            if state.skill_id == rec.skill_id:
                return state
        return None

    def _weakest_skill_id(self, context: RecommendationContext) -> str | None:
        attempts = [
            WeaknessAttempt(
                student_id=attempt.student_id,
                skill_id=attempt.skill_id,
                is_correct=attempt.is_correct,
                difficulty=attempt.difficulty,
                skip=attempt.skip,
                hint_used=attempt.hint_used,
                attempts=attempt.attempts,
            )
            for attempt in context.recent_attempts
        ]
        weakest = self._weakness_detector.top_weakest_skills(attempts, limit=1)
        if weakest:
            return weakest[0].skill_id
        if context.skill_states:
            return min(context.skill_states, key=lambda state: state.mastery).skill_id
        return None

    def _precompute_micro_goals(self, context: RecommendationContext) -> None:
        if not context.skill_states and context.current_skill_id is None:
            return
        self._micro_goal_generator.generate(
            [
                {
                    "skill_id": state.skill_id,
                    "mastery": state.mastery,
                    "weakness_score": state.weakness_score,
                }
                for state in context.skill_states
            ],
            current_skill_id=context.current_skill_id,
        )

    @staticmethod
    def _recent_reliability(context: RecommendationContext) -> float:
        valid_attempts = sum(1 for attempt in context.recent_attempts if not attempt.skip)
        return min(1.0, valid_attempts / 10.0)

    @staticmethod
    def _recent_failure_streak(context: RecommendationContext) -> int:
        streak = 0
        for attempt in reversed(context.recent_attempts):
            if attempt.skip:
                continue
            if not attempt.is_correct:
                streak += 1
            else:
                break
        return streak

    def _inputs_snapshot(
        self,
        context: RecommendationContext,
        *,
        current_state: RecommendationSkillState | None,
        target_skill_id: str | None,
        frustration_score: float,
        emotional_signal: str,
        error_pattern_type: str,
        prerequisite_gap: str | None,
        difficulty_action: str | None,
        due_review_skill_ids: Sequence[str],
        reliability: float,
    ) -> dict[str, Any]:
        return {
            "student_id": context.student_id,
            "current_skill_id": context.current_skill_id,
            "target_skill_id": target_skill_id,
            "mastery": current_state.mastery if current_state else None,
            "weakness_score": current_state.weakness_score if current_state else None,
            "retention": current_state.retention if current_state else None,
            "frustration_score": round(frustration_score, 2),
            "emotional_signal": emotional_signal,
            "error_pattern_type": error_pattern_type,
            "current_difficulty": (
                current_state.current_difficulty if current_state else None
            ),
            "consistency": current_state.consistency if current_state else None,
            "reliability": reliability,
            "difficulty_action": difficulty_action,
            "missing_prerequisites": [prerequisite_gap] if prerequisite_gap else [],
            "due_review_skill_ids": list(due_review_skill_ids),
            "recent_attempt_count": len(context.recent_attempts),
        }
