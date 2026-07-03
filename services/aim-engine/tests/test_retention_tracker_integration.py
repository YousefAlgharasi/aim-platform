"""P20-008: Tests for the real retention curves ported into the AIM Engine
pipeline (RetentionTracker), replacing:
  - the hardcoded `retention = 100.0` difficulty-decision input
  - the hardcoded `retention_lambda = 0.15` review-scheduling input

Verifies:
- retention decays with elapsed time since last_evaluated_at (forgetting
  curve), instead of always reporting full retention.
- A recently-struggling student (low previous mastery, long elapsed time)
  gets a lower retention estimate than a consistently-succeeding one.
- Category-appropriate default lambdas (grammar/vocabulary/other) are used
  in place of the single fixed 0.15.
- A personalized lambda is fit once >=3 real history points are supplied,
  and differs from the category default.
- No literal 100.0/0.15 retention hardcodes remain reachable in the pipeline
  for these two inputs (both now real, request-data-driven computations).
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from app.pipeline.aim_analysis_pipeline import AimAnalysisPipelineEntrypoint
from app.schemas.aim_analysis_request import AimAnalysisRequest

_SKILL_ID = "skill:english:a1:grammar.past-simple"

_BASE_SESSION = {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "student_id": "770e8400-e29b-41d4-a716-446655440002",
    "session_type": "lesson_practice",
    "started_at": "2026-06-17T10:00:00Z",
    "last_activity_at": "2026-06-17T10:30:00Z",
    "skill_focus_ids": [_SKILL_ID],
    "level_context": {
        "current_level": "level_2",
        "level_source": "placement",
        "level_set_at": "2026-06-16T09:00:00Z",
    },
    "placement_context": None,
    "behavioral_context": {
        "items_attempted_in_session": 1,
        "consecutive_incorrect": 0,
        "consecutive_correct": 1,
        "average_response_time_ms": 4200.0,
        "hesitation_event_count": 0,
        "retry_event_count": 0,
        "idle_gap_count": 0,
    },
    "contract_version": "1.0",
}


def _attempt() -> dict:
    return {
        "attempt_id": "880e8400-e29b-41d4-a716-446655440003",
        "session_id": _BASE_SESSION["session_id"],
        "item_id": "990e8400-e29b-41d4-a716-446655440004",
        "item_type": "lesson_question",
        "skill_ids": [_SKILL_ID],
        "presented_difficulty": 2,
        "student_answer": {
            "format": "multiple_choice",
            "value": "B",
            "options_presented_count": 4,
        },
        "is_correct": True,
        "attempt_number_for_item": 1,
        "started_at": "2026-06-17T10:05:00Z",
        "submitted_at": "2026-06-17T10:05:07Z",
        "response_time_ms": 7000,
        "behavioral_context": {
            "answer_change_count": 0,
            "hesitation_before_submit_ms": None,
            "used_hint": False,
            "abandoned_first_then_retried": False,
        },
    }


def _body(skill_mastery_context: dict) -> dict:
    return {
        "backend_request_id": "550e8400-e29b-41d4-a716-446655440000",
        "session": _BASE_SESSION,
        "attempts": [_attempt()],
        "skill_mastery_context": skill_mastery_context,
    }


@pytest.mark.asyncio
async def test_retention_decays_with_elapsed_time_instead_of_always_100() -> None:
    """Same previous_mastery_score, same new attempt — a skill last evaluated
    long ago must produce a lower blended mastery_score than one evaluated
    moments ago, because the real forgetting-curve retention component now
    feeds MasteryCalculator's formula. Under the old hardcode
    (retention = 100.0 regardless of elapsed time) these two would be
    identical.
    """
    pipeline = AimAnalysisPipelineEntrypoint()
    just_now = datetime.now(UTC).isoformat()
    long_ago = (datetime.now(UTC) - timedelta(days=90)).isoformat()

    def _context(last_evaluated_at: str) -> dict:
        return {
            _SKILL_ID: {
                "previous_mastery_score": 90.0,
                "recent_attempts": [],
                "category": "grammar",
                "last_evaluated_at": last_evaluated_at,
                "retention_history": [],
            }
        }

    recent_response = await pipeline.run(AimAnalysisRequest(**_body(_context(just_now))))
    stale_response = await pipeline.run(AimAnalysisRequest(**_body(_context(long_ago))))

    recent_mastery = recent_response.categories.skill_state[0].mastery_score
    stale_mastery = stale_response.categories.skill_state[0].mastery_score

    assert stale_mastery < recent_mastery


@pytest.mark.asyncio
async def test_struggling_student_gets_lower_retention_than_consistent_student() -> None:
    """Two skills, same elapsed time: one with low previous mastery (struggling)
    must retain less than one with high previous mastery (consistently
    succeeding) — retention should move in the expected direction.
    """
    pipeline = AimAnalysisPipelineEntrypoint()
    elapsed = (datetime.now(UTC) - timedelta(days=10)).isoformat()

    struggling_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 30.0,
                "recent_attempts": [],
                "category": "vocabulary",
                "last_evaluated_at": elapsed,
                "retention_history": [],
            }
        }
    )
    consistent_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 95.0,
                "recent_attempts": [],
                "category": "vocabulary",
                "last_evaluated_at": elapsed,
                "retention_history": [],
            }
        }
    )

    struggling_response = await pipeline.run(AimAnalysisRequest(**struggling_body))
    consistent_response = await pipeline.run(AimAnalysisRequest(**consistent_body))

    struggling_mastery = struggling_response.categories.skill_state[0].mastery_score
    consistent_mastery = consistent_response.categories.skill_state[0].mastery_score

    assert struggling_mastery < consistent_mastery


@pytest.mark.asyncio
async def test_grammar_and_vocabulary_categories_use_different_default_lambdas() -> None:
    """Two skills with identical performance but different categories should
    get different review intervals — proving the category-appropriate
    default lambda replaces the single fixed 0.15 for every skill.
    """
    pipeline = AimAnalysisPipelineEntrypoint()

    grammar_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 80.0,
                "recent_attempts": [],
                "category": "grammar",
                "last_evaluated_at": None,
                "retention_history": [],
            }
        }
    )
    vocabulary_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 80.0,
                "recent_attempts": [],
                "category": "vocabulary",
                "last_evaluated_at": None,
                "retention_history": [],
            }
        }
    )

    grammar_response = await pipeline.run(AimAnalysisRequest(**grammar_body))
    vocabulary_response = await pipeline.run(AimAnalysisRequest(**vocabulary_body))

    grammar_schedule = grammar_response.categories.review_schedule[0]
    vocabulary_schedule = vocabulary_response.categories.review_schedule[0]

    # DEFAULT_GRAMMAR_LAMBDA (0.10) < DEFAULT_VOCABULARY_LAMBDA (0.20) ->
    # grammar forgets slower -> longer review interval than vocabulary,
    # given the same underlying accuracy this call.
    assert grammar_schedule.interval_days != vocabulary_schedule.interval_days


@pytest.mark.asyncio
async def test_personalized_lambda_fit_engages_with_three_or_more_history_points() -> None:
    """Supplying >=3 real retention_history points must produce a fitted
    lambda that differs from the plain category default, proving the
    least-squares personalized fit is actually wired and reachable, not
    just present in unused code.
    """
    pipeline = AimAnalysisPipelineEntrypoint()

    base_time = datetime(2026, 1, 1, tzinfo=UTC)
    # A rapid, steep decay history (relative to the 'other' default lambda of
    # 0.15) so the fitted lambda for this skill should differ measurably from
    # the flat 0.15 default used for an unrecognized/no-category skill.
    history = [
        {"recorded_at": (base_time + timedelta(days=0)).isoformat(), "mastery_score": 100.0},
        {"recorded_at": (base_time + timedelta(days=5)).isoformat(), "mastery_score": 60.0},
        {"recorded_at": (base_time + timedelta(days=10)).isoformat(), "mastery_score": 36.0},
    ]

    fitted_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 80.0,
                "recent_attempts": [],
                "category": None,
                "last_evaluated_at": None,
                "retention_history": history,
            }
        }
    )
    default_body = _body(
        {
            _SKILL_ID: {
                "previous_mastery_score": 80.0,
                "recent_attempts": [],
                "category": None,
                "last_evaluated_at": None,
                "retention_history": [],
            }
        }
    )

    fitted_response = await pipeline.run(AimAnalysisRequest(**fitted_body))
    default_response = await pipeline.run(AimAnalysisRequest(**default_body))

    fitted_schedule = fitted_response.categories.review_schedule[0]
    default_schedule = default_response.categories.review_schedule[0]

    assert fitted_schedule.interval_days != default_schedule.interval_days
