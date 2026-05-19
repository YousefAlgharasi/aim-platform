"""Development-only AIM visual demo endpoint."""

from __future__ import annotations

from copy import deepcopy
from typing import Any, Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel


router = APIRouter(prefix="/dev/aim", tags=["development"])

ScenarioName = Literal[
    "strong_student",
    "weak_reading_student",
    "rushing_student",
    "frustrated_student",
]


class AimDemoSessionRequest(BaseModel):
    scenario: ScenarioName


def _attempt(
    question_id: str,
    skill: str,
    *,
    is_correct: bool,
    response_time: float,
    attempts: int,
    difficulty: int,
    hint_used: bool = False,
    skipped: bool = False,
    answer_changed: bool = False,
) -> dict[str, Any]:
    return {
        "question_id": question_id,
        "skill": skill,
        "is_correct": is_correct,
        "response_time": response_time,
        "attempts": attempts,
        "difficulty": difficulty,
        "hint_used": hint_used,
        "skipped": skipped,
        "answer_changed": answer_changed,
    }


SCENARIOS: dict[str, dict[str, Any]] = {
    "strong_student": {
        "student_profile": {
            "student_id": "AIM-DEMO-001",
            "student_name": "Maha Strong",
            "course": "English Foundations",
            "level": "B1",
            "lesson": "Reading Inference",
            "target_skill": "Reading Comprehension",
            "previous_mastery": 82,
            "previous_difficulty": 3,
            "previous_retention": 86,
            "previous_weakness": "None detected",
        },
        "submitted_attempts": [
            _attempt("read-inf-1", "Reading Comprehension", is_correct=True, response_time=7.2, attempts=1, difficulty=3),
            _attempt("read-inf-2", "Reading Comprehension", is_correct=True, response_time=8.1, attempts=1, difficulty=4),
            _attempt("read-inf-3", "Reading Comprehension", is_correct=True, response_time=6.4, attempts=1, difficulty=4),
            _attempt("read-inf-4", "Reading Comprehension", is_correct=True, response_time=7.8, attempts=1, difficulty=4),
            _attempt("read-inf-5", "Reading Comprehension", is_correct=True, response_time=8.6, attempts=1, difficulty=5),
        ],
        "performance_metrics": {
            "accuracy": 100,
            "average_response_time": 7.62,
            "retry_rate": 0,
            "hesitation_index": 0,
            "consistency": 100,
            "difficulty_performance": 100,
        },
        "mastery_update": {
            "mastery_before": 82,
            "mastery_after": 94,
            "formula_inputs": "Accuracy 100 x 0.35 + Speed 49.2 x 0.15 + Consistency 100 x 0.20 + Retention 86 x 0.15 + Difficulty 100 x 0.15",
            "accuracy_contribution": 35,
            "speed_contribution": 7.38,
            "consistency_contribution": 20,
            "retention_contribution": 12.9,
            "difficulty_performance_contribution": 15,
        },
        "weakness_detection": {
            "detected_weak_skill": "None",
            "weakness_score": 0,
            "error_frequency": 0,
            "repeated_mistake_count": 0,
            "explanation": "The student answered consistently at and above the current level.",
        },
        "error_pattern": {
            "pattern_type": "unknown",
            "evidence": "No repeated misses, skips, or pacing problems were detected.",
            "treatment_recommendation": "Continue current skill practice and increase challenge.",
        },
        "emotional_state": {
            "frustration_score": 0,
            "emotional_label": "calm",
            "reason": "Correct answers were steady with no hints, retries, or skipped questions.",
            "suggested_tone": "confident and motivating",
        },
        "difficulty_adaptation": {
            "difficulty_before": 3,
            "difficulty_score": 92,
            "decision": "increase",
            "difficulty_after": 4,
            "explanation": "High mastery and consistency support harder exercises.",
        },
        "recommendation": {
            "action": "Challenge",
            "reason": "The learner is ready for more demanding reading practice.",
            "priority": "Medium",
            "next_skill_or_lesson_suggestion": "Longer inference passages with evidence-based answers",
        },
        "prompt_adaptation_instruction": {
            "instruction_text": (
                "In the next lesson, give this student harder reading inference "
                "exercises, use richer passages, and ask the student to justify "
                "answers with evidence from the text."
            ),
        },
        "before_after": {
            "before": {"mastery": 82, "difficulty": 3, "retention": 86, "weakness": "None detected"},
            "after": {
                "mastery": 94,
                "difficulty": 4,
                "retention": 94,
                "weakness": "None detected",
                "recommendation": "Challenge",
                "next_prompt_instruction": "Give harder reading exercises and require evidence from the text.",
            },
        },
    },
    "weak_reading_student": {
        "student_profile": {
            "student_id": "AIM-DEMO-002",
            "student_name": "Yara Reading",
            "course": "English Foundations",
            "level": "A2",
            "lesson": "Short Passage Comprehension",
            "target_skill": "Reading Comprehension",
            "previous_mastery": 42,
            "previous_difficulty": 3,
            "previous_retention": 58,
            "previous_weakness": "Reading Comprehension",
        },
        "submitted_attempts": [
            _attempt("read-main-1", "Reading Comprehension", is_correct=False, response_time=18.4, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("read-vocab-2", "Reading Comprehension", is_correct=False, response_time=21.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("read-main-3", "Reading Comprehension", is_correct=True, response_time=20.2, attempts=2, difficulty=2, hint_used=True, answer_changed=True),
            _attempt("read-detail-4", "Reading Comprehension", is_correct=False, response_time=24.5, attempts=3, difficulty=3, hint_used=True),
            _attempt("read-vocab-5", "Reading Comprehension", is_correct=False, response_time=19.8, attempts=2, difficulty=2, hint_used=True),
        ],
        "performance_metrics": {
            "accuracy": 20,
            "average_response_time": 20.78,
            "retry_rate": 1.2,
            "hesitation_index": 0.4,
            "consistency": 40,
            "difficulty_performance": 18,
        },
        "mastery_update": {
            "mastery_before": 42,
            "mastery_after": 31,
            "formula_inputs": "Accuracy 20 x 0.35 + Speed 0 x 0.15 + Consistency 40 x 0.20 + Retention 58 x 0.15 + Difficulty 18 x 0.15",
            "accuracy_contribution": 7,
            "speed_contribution": 0,
            "consistency_contribution": 8,
            "retention_contribution": 8.7,
            "difficulty_performance_contribution": 2.7,
        },
        "weakness_detection": {
            "detected_weak_skill": "Reading Comprehension",
            "weakness_score": 68,
            "error_frequency": 0.8,
            "repeated_mistake_count": 4,
            "explanation": "Wrong answers repeat on main idea, vocabulary, and detail questions.",
        },
        "error_pattern": {
            "pattern_type": "misunderstood_concept",
            "evidence": "Four of five reading questions were wrong and most needed hints or retries.",
            "treatment_recommendation": "Reteach how to locate evidence before answering comprehension questions.",
        },
        "emotional_state": {
            "frustration_score": 55,
            "emotional_label": "uncertain",
            "reason": "Long response times and repeated hint use show uncertainty.",
            "suggested_tone": "patient and step-by-step",
        },
        "difficulty_adaptation": {
            "difficulty_before": 3,
            "difficulty_score": 39,
            "decision": "reduce",
            "difficulty_after": 2,
            "explanation": "Low mastery and weak consistency indicate the next reading task should be easier.",
        },
        "recommendation": {
            "action": "Reteach Concept",
            "reason": "Reading weakness is high and the same comprehension mistakes are repeating.",
            "priority": "High",
            "next_skill_or_lesson_suggestion": "Shorter passages focused on main idea and vocabulary support",
        },
        "prompt_adaptation_instruction": {
            "instruction_text": (
                "In the next lesson, give this student easier reading passages, "
                "use shorter texts, explain difficult vocabulary before the "
                "questions, and check comprehension step by step."
            ),
        },
        "before_after": {
            "before": {"mastery": 42, "difficulty": 3, "retention": 58, "weakness": "Reading Comprehension"},
            "after": {
                "mastery": 31,
                "difficulty": 2,
                "retention": 31,
                "weakness": "Reading Comprehension",
                "recommendation": "Reteach Concept",
                "next_prompt_instruction": "Use easier reading passages with vocabulary and step-by-step support.",
            },
        },
    },
    "rushing_student": {
        "student_profile": {
            "student_id": "AIM-DEMO-003",
            "student_name": "Samir Fast",
            "course": "English Foundations",
            "level": "A2",
            "lesson": "Grammar Accuracy",
            "target_skill": "Verb Tenses",
            "previous_mastery": 61,
            "previous_difficulty": 3,
            "previous_retention": 74,
            "previous_weakness": "Verb Tenses",
        },
        "submitted_attempts": [
            _attempt("tense-1", "Verb Tenses", is_correct=False, response_time=2.1, attempts=1, difficulty=3),
            _attempt("tense-2", "Verb Tenses", is_correct=False, response_time=2.4, attempts=1, difficulty=3),
            _attempt("tense-3", "Verb Tenses", is_correct=True, response_time=2.8, attempts=1, difficulty=3, answer_changed=True),
            _attempt("tense-4", "Verb Tenses", is_correct=False, response_time=2.0, attempts=1, difficulty=4),
            _attempt("tense-5", "Verb Tenses", is_correct=False, response_time=1.9, attempts=1, difficulty=4),
            _attempt("tense-6", "Verb Tenses", is_correct=True, response_time=2.6, attempts=1, difficulty=3),
        ],
        "performance_metrics": {
            "accuracy": 33,
            "average_response_time": 2.3,
            "retry_rate": 0,
            "hesitation_index": 0,
            "consistency": 47,
            "difficulty_performance": 29,
        },
        "mastery_update": {
            "mastery_before": 61,
            "mastery_after": 49,
            "formula_inputs": "Accuracy 33 x 0.35 + Speed 84.7 x 0.15 + Consistency 47 x 0.20 + Retention 74 x 0.15 + Difficulty 29 x 0.15",
            "accuracy_contribution": 11.55,
            "speed_contribution": 12.7,
            "consistency_contribution": 9.4,
            "retention_contribution": 11.1,
            "difficulty_performance_contribution": 4.35,
        },
        "weakness_detection": {
            "detected_weak_skill": "Verb Tenses",
            "weakness_score": 48,
            "error_frequency": 0.67,
            "repeated_mistake_count": 4,
            "explanation": "Fast incorrect answers suggest the learner is choosing before checking tense clues.",
        },
        "error_pattern": {
            "pattern_type": "rushing",
            "evidence": "Average response time is very fast while most answers are wrong and no hints are used.",
            "treatment_recommendation": "Use reflective practice: require the student to name the tense clue before answering.",
        },
        "emotional_state": {
            "frustration_score": 25,
            "emotional_label": "uncertain",
            "reason": "The issue is speed with mistakes, not slowdown or early exit behavior.",
            "suggested_tone": "calm and coaching",
        },
        "difficulty_adaptation": {
            "difficulty_before": 3,
            "difficulty_score": 52,
            "decision": "maintain",
            "difficulty_after": 3,
            "explanation": "Keep the level stable while adding pacing and reflection.",
        },
        "recommendation": {
            "action": "Timed Practice",
            "reason": "The student is answering too quickly and making avoidable tense errors.",
            "priority": "High",
            "next_skill_or_lesson_suggestion": "Reflective verb tense practice with a short pause before answer submission",
        },
        "prompt_adaptation_instruction": {
            "instruction_text": (
                "In the next lesson, slow the student down, ask step-by-step "
                "questions before each answer, and require a brief reason for "
                "the chosen verb tense."
            ),
        },
        "before_after": {
            "before": {"mastery": 61, "difficulty": 3, "retention": 74, "weakness": "Verb Tenses"},
            "after": {
                "mastery": 49,
                "difficulty": 3,
                "retention": 49,
                "weakness": "Verb Tenses",
                "recommendation": "Timed Practice",
                "next_prompt_instruction": "Slow down and use step-by-step tense clue questions.",
            },
        },
    },
    "frustrated_student": {
        "student_profile": {
            "student_id": "AIM-DEMO-004",
            "student_name": "Nour Support",
            "course": "English Foundations",
            "level": "A1",
            "lesson": "Sentence Basics",
            "target_skill": "Sentence Structure",
            "previous_mastery": 54,
            "previous_difficulty": 3,
            "previous_retention": 63,
            "previous_weakness": "Sentence Structure",
        },
        "submitted_attempts": [
            _attempt("sent-1", "Sentence Structure", is_correct=False, response_time=17.2, attempts=2, difficulty=3, hint_used=True),
            _attempt("sent-2", "Sentence Structure", is_correct=False, response_time=26.4, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("sent-3", "Sentence Structure", is_correct=False, response_time=31.8, attempts=3, difficulty=3, hint_used=True),
            _attempt("sent-4", "Sentence Structure", is_correct=False, response_time=33.5, attempts=1, difficulty=3, skipped=True),
            _attempt("sent-5", "Sentence Structure", is_correct=False, response_time=7.0, attempts=1, difficulty=2, skipped=True),
        ],
        "performance_metrics": {
            "accuracy": 0,
            "average_response_time": 27.23,
            "retry_rate": 0.75,
            "hesitation_index": 0.6,
            "consistency": 100,
            "difficulty_performance": 0,
        },
        "mastery_update": {
            "mastery_before": 54,
            "mastery_after": 29,
            "formula_inputs": "Accuracy 0 x 0.35 + Speed 0 x 0.15 + Consistency 100 x 0.20 + Retention 63 x 0.15 + Difficulty 0 x 0.15",
            "accuracy_contribution": 0,
            "speed_contribution": 0,
            "consistency_contribution": 20,
            "retention_contribution": 9.45,
            "difficulty_performance_contribution": 0,
        },
        "weakness_detection": {
            "detected_weak_skill": "Sentence Structure",
            "weakness_score": 60,
            "error_frequency": 1,
            "repeated_mistake_count": 5,
            "explanation": "The learner repeatedly missed sentence order questions and began skipping.",
        },
        "error_pattern": {
            "pattern_type": "misunderstood_concept",
            "evidence": "Repeated wrong answers, hints, slowdown, skips, and early exit behavior all appeared.",
            "treatment_recommendation": "Pause assessment and rebuild the concept with very easy guided examples.",
        },
        "emotional_state": {
            "frustration_score": 100,
            "emotional_label": "highly frustrated",
            "reason": "Repeated wrong answers, sudden slowdown, skipped questions, and early exit behavior.",
            "suggested_tone": "warm and encouraging",
        },
        "difficulty_adaptation": {
            "difficulty_before": 3,
            "difficulty_score": 43,
            "decision": "reduce",
            "difficulty_after": 2,
            "explanation": "High frustration and low accuracy require an easier next task.",
        },
        "recommendation": {
            "action": "Easy Win + Encourage",
            "reason": "The learner needs a low-pressure correct answer before returning to assessment.",
            "priority": "Critical",
            "next_skill_or_lesson_suggestion": "One-step sentence ordering with immediate positive feedback",
        },
        "prompt_adaptation_instruction": {
            "instruction_text": (
                "In the next lesson, use an encouraging tone, start with easier "
                "sentence questions, give an Easy Win first, and avoid long or "
                "high-pressure tasks until confidence improves."
            ),
        },
        "before_after": {
            "before": {"mastery": 54, "difficulty": 3, "retention": 63, "weakness": "Sentence Structure"},
            "after": {
                "mastery": 29,
                "difficulty": 2,
                "retention": 29,
                "weakness": "Sentence Structure",
                "recommendation": "Easy Win + Encourage",
                "next_prompt_instruction": "Use encouraging tone, easier questions, and an Easy Win first.",
            },
        },
    },
}


@router.post(
    "/demo-session",
    summary="Development-only AIM demo session",
    description=(
        "Development/demo-only endpoint for the frontend AIM visual dashboard. "
        "It returns deterministic scenario data and is not intended for production "
        "student sessions."
    ),
)
def run_demo_session(body: AimDemoSessionRequest) -> dict[str, Any]:
    """Return a deterministic full AIM pipeline response for visual testing only."""
    scenario = SCENARIOS.get(body.scenario)
    if scenario is None:
        raise HTTPException(status_code=400, detail="Unknown AIM demo scenario.")
    return deepcopy(scenario)
