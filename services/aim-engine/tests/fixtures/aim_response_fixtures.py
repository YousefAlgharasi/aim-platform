"""AIM Engine analysis response fixtures (P5-026).

Contract sources:
  packages/shared-contracts/api/aim-engine-response-contracts.md  (P5-011)
  packages/shared-contracts/api/student-skill-state-contracts.md  (P5-012)
  packages/shared-contracts/api/weakness-record-contracts.md      (P5-013)
  packages/shared-contracts/api/difficulty-decision-contracts.md  (P5-014)
  packages/shared-contracts/api/aim-recommendation-contracts.md   (P5-015)
  packages/shared-contracts/api/review-schedule-contracts.md      (P5-016)
  packages/shared-contracts/api/aim-session-summary-contracts.md  (P5-017)
  services/aim-engine/app/schemas/aim_analysis_response.py        (P5-022)

Fixtures are deterministic dicts shaped exactly like AimAnalysisResponse.
Used by request-validator tests, response-shape tests, and downstream backend
persistence contract tests.

Scope rules:
- No mastery, weakness, difficulty, recommendation, review-schedule,
  retention, or frustration values are computed by callers — these fixtures
  represent the AIM Engine's authoritative output side of those contracts.
- Speed/response time never appears as a field in difficulty, mastery, or
  level decisions; only as behavioral-context categories in P5-017 outputs.
"""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.schemas.aim_analysis_response import AimAnalysisResponse

_STUDENT_ID = "770e8400-e29b-41d4-a716-446655440002"
_SESSION_ID = "660e8400-e29b-41d4-a716-446655440001"
_BACKEND_REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000"
_CONTRACT_VERSION = "1.0"
_GENERATED_AT = "2026-06-17T10:30:05Z"

_SKILL_VOCAB = "skill:english:a1:vocab.daily-routines"
_SKILL_GRAMMAR = "skill:english:a1:grammar.present-simple"
_SKILL_LISTENING = "skill:english:a1:listening.short-phrases"

_ATTEMPT_ID_1 = "880e8400-e29b-41d4-a716-446655440003"
_ATTEMPT_ID_2 = "880e8400-e29b-41d4-a716-446655440013"

_WEAKNESS_ID = "bb0e8400-e29b-41d4-a716-446655440006"
_DECISION_ID = "cc0e8400-e29b-41d4-a716-446655440007"
_RECOMMENDATION_ID_1 = "dd0e8400-e29b-41d4-a716-446655440008"
_RECOMMENDATION_ID_2 = "dd0e8400-e29b-41d4-a716-446655440018"
_SCHEDULE_ID = "ee0e8400-e29b-41d4-a716-446655440009"
_LESSON_ID = "ff0e8400-e29b-41d4-a716-446655440010"


def build_skill_state_output(
    *,
    skill_id: str = _SKILL_VOCAB,
    mastery_score: float = 0.62,
    mastery_confidence: float = 0.71,
    mastery_trend: str = "improving",
    attempts_considered_count: int = 8,
    last_attempt_id: str = _ATTEMPT_ID_1,
    evaluated_at: str = _GENERATED_AT,
) -> dict[str, Any]:
    """Return a deterministic skill-state output dict (P5-012)."""

    return {
        "skill_id": skill_id,
        "mastery_score": mastery_score,
        "mastery_confidence": mastery_confidence,
        "mastery_trend": mastery_trend,
        "attempts_considered_count": attempts_considered_count,
        "last_attempt_id": last_attempt_id,
        "evaluated_at": evaluated_at,
    }


def build_weakness_output(
    *,
    weakness_id: str = _WEAKNESS_ID,
    skill_id: str = _SKILL_GRAMMAR,
    severity: str = "developing",
    status: str = "open",
    trigger_attempt_ids: list[str] | None = None,
    detected_at: str = _GENERATED_AT,
    resolved_at: str | None = None,
) -> dict[str, Any]:
    """Return a deterministic weakness-record output dict (P5-013)."""

    return {
        "weakness_id": weakness_id,
        "skill_id": skill_id,
        "severity": severity,
        "status": status,
        "trigger_attempt_ids": list(trigger_attempt_ids)
        if trigger_attempt_ids
        else [_ATTEMPT_ID_1],
        "detected_at": detected_at,
        "resolved_at": resolved_at,
    }


def build_difficulty_decision_output(
    *,
    decision_id: str = _DECISION_ID,
    skill_id: str = _SKILL_VOCAB,
    next_difficulty: int = 3,
    previous_difficulty: int = 2,
    rationale: str = "mastery_increase",
    based_on_attempt_ids: list[str] | None = None,
    decided_at: str = _GENERATED_AT,
) -> dict[str, Any]:
    """Return a deterministic difficulty-decision output dict (P5-014)."""

    return {
        "decision_id": decision_id,
        "skill_id": skill_id,
        "next_difficulty": next_difficulty,
        "previous_difficulty": previous_difficulty,
        "rationale": rationale,
        "based_on_attempt_ids": list(based_on_attempt_ids)
        if based_on_attempt_ids
        else [_ATTEMPT_ID_1],
        "decided_at": decided_at,
    }


def build_recommendation_output(
    *,
    recommendation_id: str = _RECOMMENDATION_ID_1,
    kind: str = "lesson",
    target_skill_id: str = _SKILL_GRAMMAR,
    target_lesson_id: str | None = _LESSON_ID,
    rank: int = 1,
    reason: str = "addresses_weakness",
    based_on_weakness_id: str | None = _WEAKNESS_ID,
    generated_at: str = _GENERATED_AT,
    expires_at: str | None = "2026-06-24T10:30:05Z",
) -> dict[str, Any]:
    """Return a deterministic recommendation output dict (P5-015)."""

    return {
        "recommendation_id": recommendation_id,
        "kind": kind,
        "target_skill_id": target_skill_id,
        "target_lesson_id": target_lesson_id,
        "rank": rank,
        "reason": reason,
        "based_on_weakness_id": based_on_weakness_id,
        "generated_at": generated_at,
        "expires_at": expires_at,
    }


def build_review_schedule_output(
    *,
    schedule_id: str = _SCHEDULE_ID,
    skill_id: str = _SKILL_LISTENING,
    due_at: str = "2026-06-20T10:30:05Z",
    interval_days: float = 3.0,
    repetition_count: int = 2,
    based_on_attempt_id: str = _ATTEMPT_ID_2,
    scheduled_at: str = _GENERATED_AT,
) -> dict[str, Any]:
    """Return a deterministic review-schedule output dict (P5-016)."""

    return {
        "schedule_id": schedule_id,
        "skill_id": skill_id,
        "due_at": due_at,
        "interval_days": interval_days,
        "repetition_count": repetition_count,
        "based_on_attempt_id": based_on_attempt_id,
        "scheduled_at": scheduled_at,
    }


def build_session_summary_output(
    *,
    session_id: str = _SESSION_ID,
    items_attempted: int = 3,
    items_correct: int = 2,
    skills_touched: list[str] | None = None,
    overall_mastery_shift: str = "positive",
    frustration_level: str = "low",
    engagement_level: str = "typical",
    signal_basis: list[str] | None = None,
    closed_out_at: str = _GENERATED_AT,
) -> dict[str, Any]:
    """Return a deterministic session-summary output dict (P5-017)."""

    return {
        "session_id": session_id,
        "items_attempted": items_attempted,
        "items_correct": items_correct,
        "skills_touched": list(skills_touched)
        if skills_touched
        else [_SKILL_VOCAB, _SKILL_LISTENING],
        "overall_mastery_shift": overall_mastery_shift,
        "behavioral_signal": {
            "frustration_level": frustration_level,
            "engagement_level": engagement_level,
            "signal_basis": list(signal_basis) if signal_basis else ["sustained_correct_streak"],
        },
        "closed_out_at": closed_out_at,
    }


def build_response_envelope(
    *,
    backend_request_id: str = _BACKEND_REQUEST_ID,
    contract_version: str = _CONTRACT_VERSION,
    student_id: str = _STUDENT_ID,
    session_id: str = _SESSION_ID,
    generated_at: str = _GENERATED_AT,
    categories: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Return a deterministic AimAnalysisResponse envelope dict."""

    return {
        "backend_request_id": backend_request_id,
        "contract_version": contract_version,
        "student_id": student_id,
        "session_id": session_id,
        "generated_at": generated_at,
        "categories": categories if categories is not None else {},
    }


EMPTY_CATEGORIES_RESPONSE: dict[str, Any] = build_response_envelope()


SKILL_STATE_ONLY_RESPONSE: dict[str, Any] = build_response_envelope(
    categories={
        "skill_state": [
            build_skill_state_output(),
            build_skill_state_output(
                skill_id=_SKILL_LISTENING,
                mastery_score=0.41,
                mastery_confidence=0.55,
                mastery_trend="stable",
                attempts_considered_count=4,
                last_attempt_id=_ATTEMPT_ID_2,
            ),
        ],
    }
)


WEAKNESS_AND_DIFFICULTY_RESPONSE: dict[str, Any] = build_response_envelope(
    categories={
        "weakness_records": [
            build_weakness_output(),
        ],
        "difficulty_decision": build_difficulty_decision_output(),
    }
)


FULL_CATEGORIES_RESPONSE: dict[str, Any] = build_response_envelope(
    categories={
        "skill_state": [build_skill_state_output()],
        "weakness_records": [build_weakness_output()],
        "difficulty_decision": build_difficulty_decision_output(),
        "recommendations": [
            build_recommendation_output(rank=1),
            build_recommendation_output(
                recommendation_id=_RECOMMENDATION_ID_2,
                kind="targeted_practice",
                target_lesson_id=None,
                rank=2,
                reason="reinforces_recent_skill",
                based_on_weakness_id=None,
            ),
        ],
        "review_schedule": [build_review_schedule_output()],
        "session_summary": build_session_summary_output(),
    }
)


def _mutate(base: dict[str, Any], mutator) -> dict[str, Any]:
    copy = deepcopy(base)
    mutator(copy)
    return copy


def _violate_difficulty_step(envelope: dict[str, Any]) -> None:
    envelope["categories"]["difficulty_decision"]["previous_difficulty"] = 1
    envelope["categories"]["difficulty_decision"]["next_difficulty"] = 3


def _resolved_without_timestamp(envelope: dict[str, Any]) -> None:
    envelope["categories"]["weakness_records"][0]["status"] = "resolved"
    envelope["categories"]["weakness_records"][0]["resolved_at"] = None


def _duplicate_recommendation_rank(envelope: dict[str, Any]) -> None:
    envelope["categories"]["recommendations"][1]["rank"] = 1


INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION: dict[str, Any] = _mutate(
    WEAKNESS_AND_DIFFICULTY_RESPONSE, _violate_difficulty_step
)

INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP: dict[str, Any] = _mutate(
    WEAKNESS_AND_DIFFICULTY_RESPONSE, _resolved_without_timestamp
)

INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK: dict[str, Any] = _mutate(
    FULL_CATEGORIES_RESPONSE, _duplicate_recommendation_rank
)


def all_valid_responses() -> list[dict[str, Any]]:
    """Return all valid response fixtures for parameterized tests."""

    return [
        EMPTY_CATEGORIES_RESPONSE,
        SKILL_STATE_ONLY_RESPONSE,
        WEAKNESS_AND_DIFFICULTY_RESPONSE,
        FULL_CATEGORIES_RESPONSE,
    ]


def all_invalid_responses() -> list[dict[str, Any]]:
    """Return all invalid response fixtures for negative-path tests."""

    return [
        INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION,
        INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP,
        INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK,
    ]


def parse_valid_response(fixture: dict[str, Any]) -> AimAnalysisResponse:
    """Validate a fixture dict against AimAnalysisResponse for sanity checks."""

    return AimAnalysisResponse.model_validate(fixture)
