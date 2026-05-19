from __future__ import annotations

from aim.domain.services.prompt_adaptation_generator import (
    PromptAdaptationGenerator,
    PromptLearnerState,
)
from aim.domain.services.recommendation_engine import (
    RecommendationActionType,
    RecommendationResult,
)


def recommendation(
    action_type: RecommendationActionType,
    *,
    skill_id: str = "GRAMMAR_VERB_FORMS",
    difficulty: int = 2,
) -> RecommendationResult:
    return RecommendationResult(
        student_id=1,
        action_type=action_type,
        skill_id=skill_id,
        difficulty=difficulty,
        reason="test recommendation",
        inputs_snapshot={},
    )


def generate(
    action_type: RecommendationActionType,
    state: PromptLearnerState,
):
    return PromptAdaptationGenerator().generate(
        student_id=1,
        lesson_id="session-1",
        skill_id="GRAMMAR_VERB_FORMS",
        recommendation=recommendation(action_type),
        learner_state=state,
    )


class TestPromptAdaptationGenerator:
    def test_easy_win_creates_encouraging_easier_instruction(self) -> None:
        result = generate(
            RecommendationActionType.EASY_WIN,
            PromptLearnerState(frustration_score=90.0),
        )

        assert result.tone == "warm and encouraging"
        assert result.difficulty == "easier"
        assert "confidence-building" in result.teaching_strategy
        assert "pressure" in result.avoid_patterns
        assert "encouraging" in result.instruction_text

    def test_review_focuses_low_retention(self) -> None:
        result = generate(
            RecommendationActionType.REVIEW,
            PromptLearnerState(retention=45.0),
        )

        assert result.tone == "supportive"
        assert result.difficulty == "review"
        assert "low retention" in result.focus_weaknesses
        assert "Refresh retention" in result.micro_goal

    def test_timed_practice_uses_pacing_guidance(self) -> None:
        result = generate(
            RecommendationActionType.TIMED_PRACTICE,
            PromptLearnerState(error_pattern_type="rushing"),
        )

        assert result.tone == "calm and coaching"
        assert "paced" in result.teaching_strategy
        assert "speed-first wording" in result.avoid_patterns
        assert "rushing" in result.avoid_patterns

    def test_prerequisite_gap_focuses_missing_prerequisite(self) -> None:
        result = generate(
            RecommendationActionType.FILL_PREREQUISITE_GAP,
            PromptLearnerState(
                missing_prerequisites=["GRAMMAR_TO_BE"],
                weakness_score=75.0,
            ),
        )

        assert result.tone == "patient and step-by-step"
        assert result.difficulty == "foundational"
        assert "GRAMMAR_TO_BE" in result.focus_weaknesses
        assert "high weakness score" in result.focus_weaknesses

    def test_challenge_creates_harder_extension_instruction(self) -> None:
        result = generate(
            RecommendationActionType.CHALLENGE,
            PromptLearnerState(mastery=92.0),
        )

        assert result.tone == "confident and motivating"
        assert result.difficulty == "higher"
        assert "extension tasks" in result.teaching_strategy
        assert "harder practice" in result.micro_goal
