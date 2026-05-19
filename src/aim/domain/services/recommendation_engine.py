"""
T-10: Recommendation Engine

Central decision layer that combines the prior AIM systems into one next action.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Protocol, Sequence

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
from aim.infrastructure.skill_graph.skill_graph import SkillGraph
from aim.domain.services.transfer_learning_detector import TransferCategory, TransferScoreResult
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector


class RecommendationActionType(str, Enum):
    REVIEW = "REVIEW"
    CHALLENGE = "CHALLENGE"
    EASY_WIN = "EASY_WIN"
    RETEACH_CONCEPT = "RETEACH_CONCEPT"
    TIMED_PRACTICE = "TIMED_PRACTICE"
    CONFIDENCE_BUILDER = "CONFIDENCE_BUILDER"
    FILL_PREREQUISITE_GAP = "FILL_PREREQUISITE_GAP"
    WARM_UP = "WARM_UP"
    ACCELERATED = "ACCELERATED"
    CONTINUE_CURRENT_SKILL = "CONTINUE_CURRENT_SKILL"


@dataclass(frozen=True)
class RecommendationAttempt:
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


@dataclass(frozen=True)
class RecommendationSkillState:
    skill_id: str
    mastery: float
    confidence: float
    consistency: float = 100.0
    current_difficulty: int = 3
    retention: float = 100.0
    review_due: bool = False
    weakness_score: float = 0.0


@dataclass(frozen=True)
class RecommendationContext:
    student_id: int
    current_skill_id: str | None
    skill_states: Sequence[RecommendationSkillState]
    recent_attempts: Sequence[RecommendationAttempt]
    historical_avg_speed: float | None = None
    last_session_frustration_score: float | None = None
    transfer_result: TransferScoreResult | None = None


@dataclass(frozen=True)
class RecommendationResult:
    student_id: int
    action_type: RecommendationActionType
    skill_id: str | None
    difficulty: int
    reason: str


class RecommendationContextProvider(Protocol):
    def get_context(self, student_id: int) -> RecommendationContext: ...


class RecommendationEngine:
    """
    Applies the exact T-10 decision priority order.
    """

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
        context = self._provider.get_context(student_id)
        current_state = self._current_state(context)
        current_skill_id = current_state.skill_id if current_state else context.current_skill_id
        current_difficulty = current_state.current_difficulty if current_state else 1

        self._precompute_micro_goals(context)

        emotional = self._emotional_result(context)
        frustration_score = emotional.frustration_score
        if context.last_session_frustration_score is not None:
            frustration_score = max(frustration_score, context.last_session_frustration_score)

        # 1. frustration_score > 0.70 -> EASY_WIN
        if frustration_score > 0.70:
            easy_skill = self._easy_win_skill(context)
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.EASY_WIN,
                skill_id=easy_skill.skill_id if easy_skill else current_skill_id,
                difficulty=1,
                reason="Frustration score is above 0.70. Start with an Easy Win.",
            )

        # 2. skills_due_for_review exists -> REVIEW
        due = self._due_review_states(context)
        if due:
            target = due[0]
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.REVIEW,
                skill_id=target.skill_id,
                difficulty=max(1, min(5, target.current_difficulty)),
                reason="Retention is below 70%, so this skill is due for review.",
            )

        error_pattern = self._error_pattern(context)

        # 3. error_type == TYPE_1_RANDOM -> RETEACH_CONCEPT
        if error_pattern.pattern_type == ErrorPatternType.TYPE_1_RANDOM:
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.RETEACH_CONCEPT,
                skill_id=current_skill_id,
                difficulty=1,
                reason=error_pattern.treatment_recommendation,
            )

        # 4. error_type == TYPE_4_WARMUP -> WARM_UP
        if error_pattern.pattern_type == ErrorPatternType.TYPE_4_WARMUP:
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.WARM_UP,
                skill_id=current_skill_id,
                difficulty=1,
                reason=error_pattern.treatment_recommendation,
            )

        # 5. error_type == TYPE_3_PRESSURE -> TIMED_PRACTICE
        if error_pattern.pattern_type == ErrorPatternType.TYPE_3_PRESSURE:
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.TIMED_PRACTICE,
                skill_id=current_skill_id,
                difficulty=current_difficulty,
                reason=error_pattern.treatment_recommendation,
            )

        # 6. confidence_state == OVERCONFIDENT -> CONFIDENCE_BUILDER
        if current_state is not None:
            confidence = self._confidence_matrix.classify(
                mastery=current_state.mastery,
                confidence=current_state.confidence,
            )
            if confidence.state == ConfidenceState.OVERCONFIDENT:
                return RecommendationResult(
                    student_id=student_id,
                    action_type=RecommendationActionType.CONFIDENCE_BUILDER,
                    skill_id=current_state.skill_id,
                    difficulty=max(1, current_state.current_difficulty - 1),
                    reason="Student is overconfident: high confidence with low mastery.",
                )

        # 7. prerequisite_gaps exist -> FILL_PREREQUISITE_GAP
        prereq_gap = self._first_prerequisite_gap(context, current_skill_id)
        if prereq_gap is not None:
            return RecommendationResult(
                student_id=student_id,
                action_type=RecommendationActionType.FILL_PREREQUISITE_GAP,
                skill_id=prereq_gap,
                difficulty=1,
                reason=f"Prerequisite gap detected before continuing {current_skill_id}.",
            )

        # 8. difficulty_score > 80 -> CHALLENGE
        if current_state is not None:
            decision = self._difficulty_adapter.decide(
                mastery=current_state.mastery,
                confidence=current_state.confidence,
                consistency=current_state.consistency,
                current_difficulty=current_state.current_difficulty,
            )
            if decision.score > 80.0:
                if (
                    context.transfer_result is not None
                    and context.transfer_result.category == TransferCategory.HIGH
                ):
                    return RecommendationResult(
                        student_id=student_id,
                        action_type=RecommendationActionType.ACCELERATED,
                        skill_id=context.transfer_result.to_skill_id,
                        difficulty=decision.target_difficulty,
                        reason=(
                            "High transfer learning detected. Accelerate the next "
                            "related skill and skip redundant exercises."
                        ),
                    )
                return RecommendationResult(
                    student_id=student_id,
                    action_type=RecommendationActionType.CHALLENGE,
                    skill_id=current_state.skill_id,
                    difficulty=decision.target_difficulty,
                    reason="Difficulty score is above 80. Student is ready for a challenge.",
                )

        # 9. default -> continue current skill
        fallback_skill = current_skill_id or self._weakest_skill_id(context)
        return RecommendationResult(
            student_id=student_id,
            action_type=RecommendationActionType.CONTINUE_CURRENT_SKILL,
            skill_id=fallback_skill,
            difficulty=current_difficulty,
            reason="No higher-priority intervention is needed. Continue current skill.",
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
                question_id=a.question_id,
                is_correct=a.is_correct,
                response_time=a.response_time,
                previously_correct=a.previously_correct,
                skip=a.skip,
            )
            for a in context.recent_attempts
        ]
        return self._emotional_detector.detect(
            attempts,
            historical_avg_speed=context.historical_avg_speed,
        )

    def _error_pattern(self, context: RecommendationContext):
        attempts = [
            ErrorAttempt(
                student_id=a.student_id,
                skill_id=a.skill_id,
                question_id=a.question_id,
                is_correct=a.is_correct,
                question_subtype=a.question_subtype,
                is_timed=a.is_timed,
                session_position=a.session_position,
                skip=a.skip,
            )
            for a in context.recent_attempts
        ]
        return self._error_classifier.classify(attempts)

    def _due_review_states(
        self,
        context: RecommendationContext,
    ) -> list[RecommendationSkillState]:
        due = [
            state for state in context.skill_states
            if state.review_due or state.retention < REVIEW_THRESHOLD
        ]
        return sorted(due, key=lambda state: state.retention)

    def _first_prerequisite_gap(
        self,
        context: RecommendationContext,
        current_skill_id: str | None,
    ) -> str | None:
        if current_skill_id is None or current_skill_id not in self._skill_graph:
            return None

        mastery_by_skill = {
            state.skill_id: state.mastery
            for state in context.skill_states
        }
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
            last_session_frustration_score=1.0,
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
                student_id=a.student_id,
                skill_id=a.skill_id,
                is_correct=a.is_correct,
                difficulty=a.difficulty,
                skip=a.skip,
            )
            for a in context.recent_attempts
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
