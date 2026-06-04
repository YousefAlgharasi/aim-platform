"""Thin adapters from shared AIM demo scenarios to API test payloads."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from aim.application.demo.aim_demo_scenarios import (
    SCENARIOS,
    DemoScenario,
)


@dataclass(frozen=True)
class AimScenario:
    key: str
    student_name: str
    student_email: str
    skill_id: str
    session_id: str
    initial_state: dict[str, Any]
    related_skill_states: tuple[dict[str, Any], ...]
    attempts: tuple[dict[str, Any], ...]
    expected: dict[str, Any]


EXPECTED_RULES: dict[str, dict[str, Any]] = {
    "strong_student": {
        "challenge_actions": {
            "increase_difficulty",
            "mixed_practice",
            "continue_current_skill",
        },
        "max_weakness_score": 25.0,
        "max_frustration_score": 35.0,
    },
    "weak_reading_student": {
        "support_actions": {
            "reteach_concept",
            "targeted_practice",
            "spaced_review",
            "collect_more_evidence",
            "confidence_builder",
            "easy_win",
        },
        "max_mastery_after": 70.0,
        "support_prompt_terms": {
            "foundational",
            "guided",
            "step-by-step",
            "review",
            "support",
            "easier",
            "evidence",
        },
    },
    "rushing_student": {
        "reflective_actions": {
            "reflection_practice",
            "confidence_builder",
            "targeted_practice",
            "spaced_review",
            "collect_more_evidence",
            "reteach_concept",
        },
        "max_target_difficulty": 3,
        "rushing_prompt_terms": {
            "reflect",
            "reasoning",
            "calibration",
            "feedback",
            "evidence",
            "guided",
            "practice",
        },
    },
    "frustrated_student": {
        "min_frustration_score": 75.0,
        "support_actions": {
            "easy_win",
            "trigger_tutor_intervention",
            "spaced_review",
            "reteach_concept",
            "targeted_practice",
        },
        "support_prompt_terms": {
            "warm",
            "encouraging",
            "easier",
            "supportive",
            "confidence",
            "guided",
        },
    },
    "low_confidence_student": {
        "support_actions": {
            "confidence_builder",
            "collect_more_evidence",
            "targeted_practice",
            "continue_current_skill",
            "spaced_review",
        },
        "max_difficulty_increase": 1,
        "support_prompt_terms": {
            "supportive",
            "confidence",
            "current",
            "diagnostic",
            "guided",
            "feedback",
        },
    },
    "hint_dependent_student": {
        "support_actions": {
            "reteach_concept",
            "targeted_practice",
            "confidence_builder",
            "collect_more_evidence",
            "spaced_review",
            "continue_current_skill",
        },
        "max_evidence_quality": 85.0,
        "min_hint_penalty": 1.0,
        "support_prompt_terms": {
            "guided",
            "foundational",
            "supportive",
            "practice",
            "evidence",
            "current",
        },
    },
    "prerequisite_gap_student": {
        "gap_actions": {
            "review_prerequisite",
            "targeted_practice",
            "collect_more_evidence",
        },
        "expected_missing_prerequisite": "GRAMMAR_TO_BE",
        "prompt_terms": {
            "GRAMMAR_TO_BE",
            "prerequisite",
            "foundational",
            "guided",
        },
    },
    "retention_review_student": {
        "review_actions": {
            "spaced_review",
            "review_prerequisite",
            "collect_more_evidence",
            "targeted_practice",
        },
        "max_retention": 70.0,
        "prompt_terms": {
            "review",
            "refresh",
            "retention",
            "guided",
        },
    },
    "slow_but_accurate_student": {
        "allowed_actions": {
            "increase_difficulty",
            "mixed_practice",
            "continue_current_skill",
            "collect_more_evidence",
        },
        "max_weakness_score": 25.0,
        "max_difficulty_drop": 0,
    },
    "low_reliability_student": {
        "low_reliability_actions": {
            "collect_more_evidence",
            "continue_current_skill",
            "spaced_review",
        },
        "max_reliability": 0.3,
        "max_mastery_gain": 12.0,
    },
    "questionable_question_quality_student": {
        "support_actions": {
            "targeted_practice",
            "reteach_concept",
            "collect_more_evidence",
            "spaced_review",
            "easy_win",
        },
        "max_question_quality_score": 60.0,
        "max_evidence_quality": 55.0,
        "max_mastery_drop": 15.0,
    },
}


def aim_scenario_payloads(student_id: int) -> dict[str, AimScenario]:
    """Return shared scenario definitions adapted to real session API payloads."""

    return {
        key: _to_api_fixture(scenario, student_id=student_id)
        for key, scenario in SCENARIOS.items()
    }


def _to_api_fixture(scenario: DemoScenario, *, student_id: int) -> AimScenario:
    session_id = f"aim-harness-{scenario.key.replace('_', '-')}"
    return AimScenario(
        key=scenario.key,
        student_name=f"AIM {scenario.student_name}",
        student_email=f"aim-{scenario.key.replace('_', '-')}@test.example",
        skill_id=scenario.skill_id,
        session_id=session_id,
        initial_state={
            "mastery": scenario.initial_state.mastery,
            "confidence": scenario.initial_state.confidence,
            "avg_speed": scenario.initial_state.avg_speed,
            "current_difficulty": scenario.initial_state.current_difficulty,
            "retention": scenario.initial_state.retention,
            "consistency": scenario.initial_state.consistency,
        },
        related_skill_states=tuple(
            {
                "skill_id": state.skill_id,
                "mastery": state.mastery,
                "confidence": state.confidence,
                "avg_speed": state.avg_speed,
                "current_difficulty": state.current_difficulty,
                "retention": state.retention,
                "consistency": state.consistency,
            }
            for state in scenario.related_skill_states
        ),
        attempts=tuple(
            {
                "student_id": student_id,
                "skill_id": scenario.skill_id,
                "question_id": attempt.question_id,
                "session_id": session_id,
                "is_correct": attempt.is_correct,
                "response_time": attempt.response_time,
                "attempts": attempt.attempts,
                "difficulty": attempt.difficulty,
                "hint_used": attempt.hint_used,
                "skip": attempt.skip,
                "answer_changed": attempt.answer_changed,
                "time_of_day": attempt.time_of_day,
                "session_position": index,
            }
            for index, attempt in enumerate(scenario.attempts, start=1)
        ),
        expected=EXPECTED_RULES[scenario.key],
    )
