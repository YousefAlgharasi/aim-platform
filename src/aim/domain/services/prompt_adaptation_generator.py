"""Prompt adaptation instructions for the next AI tutor lesson."""

from __future__ import annotations

from dataclasses import dataclass

from aim.domain.services.recommendation_engine import (
    RecommendationActionType,
    RecommendationResult,
)


@dataclass(frozen=True)
class PromptLearnerState:
    mastery: float | None = None
    retention: float | None = None
    weakness_score: float | None = None
    frustration_score: float | None = None
    error_pattern_type: str | None = None
    current_difficulty: int | None = None
    missing_prerequisites: list[str] | None = None


@dataclass(frozen=True)
class PromptAdaptationResult:
    student_id: int
    lesson_id: str
    skill_id: str
    tone: str
    difficulty: str
    teaching_strategy: str
    focus_weaknesses: list[str]
    avoid_patterns: list[str]
    micro_goal: str
    instruction_text: str


class PromptAdaptationGenerator:
    """Converts AIM recommendations into deterministic tutor prompt guidance."""

    def generate(
        self,
        *,
        student_id: int,
        lesson_id: str,
        skill_id: str,
        recommendation: RecommendationResult,
        learner_state: PromptLearnerState,
    ) -> PromptAdaptationResult:
        action = recommendation.action_type
        target_skill = recommendation.skill_id or skill_id
        focus_weaknesses = self._focus_weaknesses(
            target_skill,
            action,
            learner_state,
        )
        avoid_patterns = self._avoid_patterns(action, learner_state)

        if action == RecommendationActionType.EASY_WIN:
            tone = "warm and encouraging"
            difficulty = "easier"
            teaching_strategy = "short confidence-building practice"
            micro_goal = f"Help the student regain confidence on {target_skill}."
        elif action == RecommendationActionType.REVIEW:
            tone = "supportive"
            difficulty = "review"
            teaching_strategy = "spaced review with guided recall"
            micro_goal = f"Refresh retention for {target_skill}."
        elif action in {
            RecommendationActionType.CHALLENGE,
            RecommendationActionType.ACCELERATED,
        }:
            tone = "confident and motivating"
            difficulty = "higher"
            teaching_strategy = "extension tasks with productive struggle"
            micro_goal = f"Stretch mastery of {target_skill} with harder practice."
        elif action == RecommendationActionType.TIMED_PRACTICE:
            tone = "calm and coaching"
            difficulty = "same difficulty with pacing support"
            teaching_strategy = "paced timed practice"
            micro_goal = f"Improve pacing on {target_skill} without rushing."
        elif action in {
            RecommendationActionType.RETEACH_CONCEPT,
            RecommendationActionType.FILL_PREREQUISITE_GAP,
        }:
            tone = "patient and step-by-step"
            difficulty = "foundational"
            teaching_strategy = "explicit explanation followed by guided examples"
            micro_goal = f"Repair the blocking concept for {target_skill}."
        elif action == RecommendationActionType.WARM_UP:
            tone = "gentle and supportive"
            difficulty = "easy warm-up"
            teaching_strategy = "start with easy retrieval before assessment"
            micro_goal = f"Warm up the student before continuing {target_skill}."
        elif action == RecommendationActionType.CONFIDENCE_BUILDER:
            tone = "steady and reflective"
            difficulty = "slightly easier"
            teaching_strategy = "confidence calibration with feedback"
            micro_goal = f"Align confidence with actual mastery on {target_skill}."
        else:
            tone = "neutral and supportive"
            difficulty = "current"
            teaching_strategy = "continue current skill practice"
            micro_goal = f"Continue steady progress on {target_skill}."

        instruction_text = self._instruction_text(
            target_skill=target_skill,
            tone=tone,
            difficulty=difficulty,
            teaching_strategy=teaching_strategy,
            focus_weaknesses=focus_weaknesses,
            avoid_patterns=avoid_patterns,
            micro_goal=micro_goal,
        )

        return PromptAdaptationResult(
            student_id=student_id,
            lesson_id=lesson_id,
            skill_id=target_skill,
            tone=tone,
            difficulty=difficulty,
            teaching_strategy=teaching_strategy,
            focus_weaknesses=focus_weaknesses,
            avoid_patterns=avoid_patterns,
            micro_goal=micro_goal,
            instruction_text=instruction_text,
        )

    def _focus_weaknesses(
        self,
        target_skill: str,
        action: RecommendationActionType,
        learner_state: PromptLearnerState,
    ) -> list[str]:
        focus = [target_skill]
        if learner_state.retention is not None and learner_state.retention < 70.0:
            focus.append("low retention")
        if learner_state.weakness_score is not None and learner_state.weakness_score > 50.0:
            focus.append("high weakness score")
        if learner_state.error_pattern_type in {"guessing", "misunderstood_concept"}:
            focus.append(learner_state.error_pattern_type)
        if action == RecommendationActionType.FILL_PREREQUISITE_GAP:
            focus.extend(learner_state.missing_prerequisites or [])
        return self._unique(focus)

    def _avoid_patterns(
        self,
        action: RecommendationActionType,
        learner_state: PromptLearnerState,
    ) -> list[str]:
        avoid = []
        if action == RecommendationActionType.EASY_WIN:
            avoid.extend(["pressure", "long tasks"])
        if action == RecommendationActionType.TIMED_PRACTICE:
            avoid.extend(["speed-first wording", "punitive timing"])
        if learner_state.frustration_score is not None and learner_state.frustration_score > 70.0:
            avoid.append("discouraging feedback")
        if learner_state.error_pattern_type == "rushing":
            avoid.append("rushing")
        return self._unique(avoid)

    @staticmethod
    def _instruction_text(
        *,
        target_skill: str,
        tone: str,
        difficulty: str,
        teaching_strategy: str,
        focus_weaknesses: list[str],
        avoid_patterns: list[str],
        micro_goal: str,
    ) -> str:
        focus = ", ".join(focus_weaknesses)
        avoid = ", ".join(avoid_patterns) if avoid_patterns else "none"
        return (
            f"In the next lesson for {target_skill}, use a {tone} tone, set "
            f"the difficulty to {difficulty}, and use {teaching_strategy}. "
            f"Focus on {focus}. Avoid {avoid}. Micro-goal: {micro_goal}"
        )

    @staticmethod
    def _unique(values: list[str]) -> list[str]:
        seen = set()
        result = []
        for value in values:
            if value and value not in seen:
                result.append(value)
                seen.add(value)
        return result
