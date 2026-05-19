"""
T-10 tests for RecommendationEngine decision priority.
"""

from __future__ import annotations

from aim.domain.services.recommendation_engine import (
    RecommendationActionType,
    RecommendationAttempt,
    RecommendationContext,
    RecommendationEngine,
    RecommendationSkillState,
)
from aim.domain.services.transfer_learning_detector import (
    TransferCategory,
    TransferScoreResult,
)


class FakeContextProvider:
    def __init__(self, context: RecommendationContext) -> None:
        self.context = context

    def get_context(self, student_id: int) -> RecommendationContext:
        return self.context


def state(
    skill_id: str,
    *,
    mastery: float = 60.0,
    confidence: float = 60.0,
    consistency: float = 80.0,
    difficulty: int = 3,
    retention: float = 100.0,
    review_due: bool = False,
) -> RecommendationSkillState:
    return RecommendationSkillState(
        skill_id=skill_id,
        mastery=mastery,
        confidence=confidence,
        consistency=consistency,
        current_difficulty=difficulty,
        retention=retention,
        review_due=review_due,
    )


def attempt(
    index: int,
    *,
    is_correct: bool = True,
    skill_id: str = "GRAMMAR_VERB_FORMS",
    question_subtype: str | None = None,
    is_timed: bool = False,
    session_position: int | None = None,
    previously_correct: bool = False,
    response_time: float = 10.0,
) -> RecommendationAttempt:
    return RecommendationAttempt(
        student_id=1,
        skill_id=skill_id,
        question_id=f"q{index}",
        is_correct=is_correct,
        response_time=response_time,
        difficulty=3,
        question_subtype=question_subtype,
        is_timed=is_timed,
        session_position=session_position or index,
        previously_correct=previously_correct,
    )


def engine_for(context: RecommendationContext) -> RecommendationEngine:
    return RecommendationEngine(FakeContextProvider(context))


class TestRecommendationEngine:
    def test_priority_1_frustration_easy_win(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_PASSIVE_VOICE",
            skill_states=[
                state("GRAMMAR_PASSIVE_VOICE", mastery=35.0),
                state("GRAMMAR_TO_BE", mastery=92.0, confidence=80.0),
            ],
            recent_attempts=[],
            last_session_frustration_score=0.9,
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.EASY_WIN
        assert result.skill_id == "GRAMMAR_TO_BE"
        assert result.difficulty == 1

    def test_priority_2_due_review(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[
                state("GRAMMAR_VERB_FORMS", retention=65.0),
                state("VOCAB_BASIC", retention=50.0),
            ],
            recent_attempts=[],
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.REVIEW
        assert result.skill_id == "VOCAB_BASIC"

    def test_priority_3_random_errors_reteach(self) -> None:
        attempts = [
            attempt(i, is_correct=(i in {3, 7, 10}), question_subtype=f"type_{i}")
            for i in range(1, 11)
        ]
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[state("GRAMMAR_VERB_FORMS", mastery=45.0, confidence=40.0)],
            recent_attempts=attempts,
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.RETEACH_CONCEPT

    def test_priority_4_warmup(self) -> None:
        attempts = [
            attempt(i, is_correct=False, session_position=i)
            for i in range(1, 4)
        ] + [
            attempt(i, is_correct=True, session_position=i)
            for i in range(4, 13)
        ]
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[state("GRAMMAR_VERB_FORMS", mastery=60.0, confidence=60.0)],
            recent_attempts=attempts,
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.WARM_UP
        assert result.difficulty == 1

    def test_priority_5_pressure(self) -> None:
        attempts = [
            attempt(i, is_correct=True, is_timed=False)
            for i in range(1, 7)
        ] + [
            attempt(i, is_correct=(i == 7), is_timed=True)
            for i in range(7, 13)
        ]
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[state("GRAMMAR_VERB_FORMS", mastery=60.0, confidence=60.0)],
            recent_attempts=attempts,
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.TIMED_PRACTICE

    def test_priority_6_overconfident_confidence_builder(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[state("GRAMMAR_VERB_FORMS", mastery=40.0, confidence=90.0)],
            recent_attempts=[attempt(i) for i in range(1, 11)],
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.CONFIDENCE_BUILDER

    def test_priority_7_prerequisite_gap(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_PASSIVE_VOICE",
            skill_states=[
                state("GRAMMAR_PASSIVE_VOICE", mastery=60.0),
                state("GRAMMAR_TO_BE", mastery=40.0),
                state("GRAMMAR_PAST_PARTICIPLE", mastery=90.0),
                state("GRAMMAR_TENSES_PRESENT_SIMPLE", mastery=90.0),
                state("GRAMMAR_TENSES_PAST_SIMPLE", mastery=90.0),
            ],
            recent_attempts=[attempt(i, skill_id="GRAMMAR_PASSIVE_VOICE") for i in range(1, 11)],
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.FILL_PREREQUISITE_GAP
        assert result.skill_id == "GRAMMAR_TO_BE"

    def test_priority_8_challenge(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[
                state(
                    "GRAMMAR_VERB_FORMS",
                    mastery=90.0,
                    confidence=90.0,
                    consistency=90.0,
                    difficulty=3,
                )
            ],
            recent_attempts=[attempt(i) for i in range(1, 11)],
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.CHALLENGE
        assert result.difficulty == 4

    def test_high_transfer_turns_challenge_into_accelerated(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[
                state(
                    "GRAMMAR_VERB_FORMS",
                    mastery=90.0,
                    confidence=90.0,
                    consistency=90.0,
                    difficulty=3,
                )
            ],
            recent_attempts=[attempt(i) for i in range(1, 11)],
            transfer_result=TransferScoreResult(
                student_id=1,
                from_skill_id="GRAMMAR_VERB_FORMS",
                to_skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
                relationship_coefficient=0.9,
                previous_skill_mastery=90.0,
                avg_time_to_learn_new_skill=1.0,
                transfer_score=0.81,
                category=TransferCategory.HIGH,
                recommendation_flag="ACCELERATED",
            ),
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.ACCELERATED
        assert result.skill_id == "GRAMMAR_TENSES_PRESENT_SIMPLE"

    def test_priority_9_default_continue_current_skill(self) -> None:
        context = RecommendationContext(
            student_id=1,
            current_skill_id="GRAMMAR_VERB_FORMS",
            skill_states=[state("GRAMMAR_VERB_FORMS", mastery=60.0, confidence=60.0)],
            recent_attempts=[attempt(i) for i in range(1, 11)],
        )

        result = engine_for(context).get_next_action(1)

        assert result.action_type == RecommendationActionType.CONTINUE_CURRENT_SKILL
        assert result.skill_id == "GRAMMAR_VERB_FORMS"
