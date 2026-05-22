from __future__ import annotations

from aim.domain.services.recommendation_engine import (
    RecommendationActionType,
    RecommendationAttempt,
    RecommendationContext,
    RecommendationEngine,
    RecommendationSkillState,
)


class FakeProvider:
    def __init__(self, context: RecommendationContext) -> None:
        self.context = context

    def get_context(self, student_id: int) -> RecommendationContext:
        return self.context


def state(
    *,
    skill_id: str = "GRAMMAR_VERB_FORMS",
    mastery: float = 70.0,
    confidence: float = 70.0,
    consistency: float = 80.0,
    retention: float = 100.0,
    weakness_score: float = 0.0,
    frustration_score: float = 0.0,
    reliability: float = 1.0,
    difficulty: int = 3,
) -> RecommendationSkillState:
    return RecommendationSkillState(
        skill_id=skill_id,
        mastery=mastery,
        confidence=confidence,
        consistency=consistency,
        retention=retention,
        weakness_score=weakness_score,
        frustration_score=frustration_score,
        reliability=reliability,
        current_difficulty=difficulty,
    )


def attempt(index: int, *, correct: bool = True) -> RecommendationAttempt:
    return RecommendationAttempt(
        student_id=1,
        skill_id="GRAMMAR_VERB_FORMS",
        question_id=f"q{index}",
        is_correct=correct,
        response_time=10.0,
        difficulty=3,
        session_position=index,
    )


def engine(context: RecommendationContext) -> RecommendationEngine:
    return RecommendationEngine(FakeProvider(context))


def test_high_frustration_triggers_easy_win() -> None:
    context = RecommendationContext(
        student_id=1,
        current_skill_id="GRAMMAR_VERB_FORMS",
        skill_states=[state(frustration_score=80.0)],
        recent_attempts=[],
    )

    result = engine(context).get_next_action(1)

    assert result.action_type == RecommendationActionType.EASY_WIN
    assert result.confidence == "high"
    assert result.evidence["frustration_score"] == 80.0


def test_prerequisite_gap_triggers_review_prerequisite() -> None:
    context = RecommendationContext(
        student_id=1,
        current_skill_id="GRAMMAR_PASSIVE_VOICE",
        skill_states=[state(skill_id="GRAMMAR_PASSIVE_VOICE")],
        recent_attempts=[attempt(i) for i in range(1, 11)],
        prerequisite_gaps=["GRAMMAR_TO_BE"],
    )

    result = engine(context).get_next_action(1)

    assert result.action_type == RecommendationActionType.REVIEW_PREREQUISITE
    assert result.skill_id == "GRAMMAR_TO_BE"
    assert result.decision_priority == "severe_prerequisite_gap"


def test_low_reliability_collects_more_evidence() -> None:
    context = RecommendationContext(
        student_id=1,
        current_skill_id="GRAMMAR_VERB_FORMS",
        skill_states=[state(reliability=0.30)],
        recent_attempts=[attempt(1)],
    )

    result = engine(context).get_next_action(1)

    assert result.action_type == RecommendationActionType.COLLECT_MORE_EVIDENCE
    assert result.confidence == "low"


def test_high_quality_state_increases_difficulty() -> None:
    context = RecommendationContext(
        student_id=1,
        current_skill_id="GRAMMAR_VERB_FORMS",
        skill_states=[
            state(
                mastery=90.0,
                consistency=90.0,
                retention=90.0,
                reliability=0.90,
                difficulty=3,
            )
        ],
        recent_attempts=[attempt(i) for i in range(1, 11)],
    )

    result = engine(context).get_next_action(1)

    assert result.action_type == RecommendationActionType.INCREASE_DIFFICULTY
    assert result.difficulty == 4


def test_recommendation_includes_reason_evidence_and_confidence() -> None:
    context = RecommendationContext(
        student_id=1,
        current_skill_id="GRAMMAR_VERB_FORMS",
        skill_states=[state()],
        recent_attempts=[attempt(i) for i in range(1, 11)],
    )

    result = engine(context).get_next_action(1)

    assert result.reason
    assert result.evidence
    assert result.confidence in {"low", "medium", "high"}
    assert result.inputs_snapshot["current_skill_id"] == "GRAMMAR_VERB_FORMS"
