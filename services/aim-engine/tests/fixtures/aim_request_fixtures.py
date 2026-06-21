"""AIM Engine analysis request fixtures (P5-026).

Contract sources:
  packages/shared-contracts/api/aim-session-input-contracts.md  (P5-009)
  packages/shared-contracts/api/aim-attempt-input-contracts.md  (P5-010)
  services/aim-engine/app/schemas/aim_analysis_request.py        (P5-021)

Each fixture is a fully-formed dict that matches the AimAnalysisRequest
Pydantic model. Hard-coded UUIDs and timestamps make these fixtures
deterministic across runs.

The valid fixtures are minimal scenarios chosen to exercise distinct shapes:
- VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT: simplest happy path.
- VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP: post-placement first session
  carrying a non-null placement_context block.
- VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT: multi-attempt review session
  with mixed correctness and free_text + multiple_choice answer formats.

The invalid fixtures intentionally violate exactly one contract rule each,
so that schema-level and validator-level tests can pinpoint the failure mode.
"""

from __future__ import annotations

from copy import deepcopy
from typing import Any

from app.schemas.aim_analysis_request import (
    CONTRACT_VERSION,
    AimAnalysisRequest,
)

_STUDENT_ID = "770e8400-e29b-41d4-a716-446655440002"
_SESSION_ID = "660e8400-e29b-41d4-a716-446655440001"
_BACKEND_REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000"

_ATTEMPT_ID_1 = "880e8400-e29b-41d4-a716-446655440003"
_ATTEMPT_ID_2 = "880e8400-e29b-41d4-a716-446655440013"
_ATTEMPT_ID_3 = "880e8400-e29b-41d4-a716-446655440023"

_ITEM_ID_1 = "990e8400-e29b-41d4-a716-446655440004"
_ITEM_ID_2 = "990e8400-e29b-41d4-a716-446655440014"
_ITEM_ID_3 = "990e8400-e29b-41d4-a716-446655440024"

_SKILL_VOCAB = "skill:english:a1:vocab.daily-routines"
_SKILL_GRAMMAR = "skill:english:a1:grammar.present-simple"
_SKILL_LISTENING = "skill:english:a1:listening.short-phrases"

_PLACEMENT_RESULT_ID = "aa0e8400-e29b-41d4-a716-446655440005"


def build_valid_session(
    *,
    session_id: str = _SESSION_ID,
    student_id: str = _STUDENT_ID,
    session_type: str = "lesson_practice",
    started_at: str = "2026-06-17T10:00:00Z",
    last_activity_at: str = "2026-06-17T10:30:00Z",
    skill_focus_ids: list[str] | None = None,
    current_level: str = "level_2",
    level_source: str = "placement",
    level_set_at: str = "2026-06-16T09:00:00Z",
    placement_context: dict[str, Any] | None = None,
    items_attempted_in_session: int = 3,
    consecutive_incorrect: int = 0,
    consecutive_correct: int = 3,
    average_response_time_ms: float | None = 4200.0,
    hesitation_event_count: int = 0,
    retry_event_count: int = 0,
    idle_gap_count: int = 0,
    contract_version: str = CONTRACT_VERSION,
) -> dict[str, Any]:
    """Return a deterministic session segment dict for AIM request fixtures."""

    return {
        "session_id": session_id,
        "student_id": student_id,
        "session_type": session_type,
        "started_at": started_at,
        "last_activity_at": last_activity_at,
        "skill_focus_ids": list(skill_focus_ids) if skill_focus_ids else [_SKILL_VOCAB],
        "level_context": {
            "current_level": current_level,
            "level_source": level_source,
            "level_set_at": level_set_at,
        },
        "placement_context": placement_context,
        "behavioral_context": {
            "items_attempted_in_session": items_attempted_in_session,
            "consecutive_incorrect": consecutive_incorrect,
            "consecutive_correct": consecutive_correct,
            "average_response_time_ms": average_response_time_ms,
            "hesitation_event_count": hesitation_event_count,
            "retry_event_count": retry_event_count,
            "idle_gap_count": idle_gap_count,
        },
        "contract_version": contract_version,
    }


def build_valid_attempt(
    *,
    attempt_id: str = _ATTEMPT_ID_1,
    session_id: str = _SESSION_ID,
    item_id: str = _ITEM_ID_1,
    item_type: str = "lesson_question",
    skill_ids: list[str] | None = None,
    presented_difficulty: int = 2,
    answer_format: str = "multiple_choice",
    answer_value: str = "B",
    options_presented_count: int | None = 4,
    is_correct: bool = True,
    attempt_number_for_item: int = 1,
    started_at: str = "2026-06-17T10:05:00Z",
    submitted_at: str = "2026-06-17T10:05:07Z",
    response_time_ms: int = 7000,
    answer_change_count: int = 0,
    hesitation_before_submit_ms: float | None = None,
    used_hint: bool = False,
    abandoned_first_then_retried: bool = False,
) -> dict[str, Any]:
    """Return a deterministic attempt segment dict for AIM request fixtures."""

    answer: dict[str, Any] = {
        "format": answer_format,
        "value": answer_value,
    }
    if options_presented_count is not None:
        answer["options_presented_count"] = options_presented_count

    return {
        "attempt_id": attempt_id,
        "session_id": session_id,
        "item_id": item_id,
        "item_type": item_type,
        "skill_ids": list(skill_ids) if skill_ids else [_SKILL_VOCAB],
        "presented_difficulty": presented_difficulty,
        "student_answer": answer,
        "is_correct": is_correct,
        "attempt_number_for_item": attempt_number_for_item,
        "started_at": started_at,
        "submitted_at": submitted_at,
        "response_time_ms": response_time_ms,
        "behavioral_context": {
            "answer_change_count": answer_change_count,
            "hesitation_before_submit_ms": hesitation_before_submit_ms,
            "used_hint": used_hint,
            "abandoned_first_then_retried": abandoned_first_then_retried,
        },
    }


def build_request_envelope(
    *,
    backend_request_id: str = _BACKEND_REQUEST_ID,
    session: dict[str, Any] | None = None,
    attempts: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Return a deterministic AimAnalysisRequest envelope dict."""

    return {
        "backend_request_id": backend_request_id,
        "session": session if session is not None else build_valid_session(),
        "attempts": attempts if attempts is not None else [build_valid_attempt()],
    }


VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT: dict[str, Any] = build_request_envelope()


VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP: dict[str, Any] = build_request_envelope(
    session=build_valid_session(
        session_type="placement_followup",
        skill_focus_ids=[_SKILL_VOCAB, _SKILL_GRAMMAR],
        current_level="level_1",
        level_source="placement",
        placement_context={
            "placement_result_id": _PLACEMENT_RESULT_ID,
            "placement_completed_at": "2026-06-16T08:30:00Z",
            "initial_skill_signals": [
                {"skill_id": _SKILL_VOCAB, "signal_strength": 0.45},
                {"skill_id": _SKILL_GRAMMAR, "signal_strength": 0.32},
            ],
        },
        items_attempted_in_session=1,
        consecutive_correct=1,
        consecutive_incorrect=0,
        average_response_time_ms=5100.0,
    ),
    attempts=[
        build_valid_attempt(
            item_type="practice_question",
            presented_difficulty=1,
            skill_ids=[_SKILL_GRAMMAR],
        )
    ],
)


VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT: dict[str, Any] = build_request_envelope(
    session=build_valid_session(
        session_type="review_practice",
        skill_focus_ids=[_SKILL_VOCAB, _SKILL_LISTENING],
        current_level="level_2",
        level_source="aim_engine",
        items_attempted_in_session=3,
        consecutive_correct=1,
        consecutive_incorrect=0,
        hesitation_event_count=2,
        retry_event_count=1,
        idle_gap_count=1,
        average_response_time_ms=6800.0,
    ),
    attempts=[
        build_valid_attempt(
            attempt_id=_ATTEMPT_ID_1,
            item_id=_ITEM_ID_1,
            item_type="review_question",
            skill_ids=[_SKILL_VOCAB],
            presented_difficulty=2,
            answer_format="multiple_choice",
            answer_value="A",
            options_presented_count=4,
            is_correct=False,
            attempt_number_for_item=1,
            started_at="2026-06-17T10:05:00Z",
            submitted_at="2026-06-17T10:05:09Z",
            response_time_ms=9000,
            answer_change_count=1,
            hesitation_before_submit_ms=3200.0,
        ),
        build_valid_attempt(
            attempt_id=_ATTEMPT_ID_2,
            item_id=_ITEM_ID_2,
            item_type="review_question",
            skill_ids=[_SKILL_VOCAB],
            presented_difficulty=2,
            answer_format="free_text",
            answer_value="i wake up at seven",
            options_presented_count=None,
            is_correct=True,
            attempt_number_for_item=1,
            started_at="2026-06-17T10:06:00Z",
            submitted_at="2026-06-17T10:06:11Z",
            response_time_ms=11000,
        ),
        build_valid_attempt(
            attempt_id=_ATTEMPT_ID_3,
            item_id=_ITEM_ID_3,
            item_type="review_question",
            skill_ids=[_SKILL_LISTENING],
            presented_difficulty=3,
            answer_format="listening_choice",
            answer_value="C",
            options_presented_count=3,
            is_correct=True,
            attempt_number_for_item=2,
            started_at="2026-06-17T10:07:00Z",
            submitted_at="2026-06-17T10:07:06Z",
            response_time_ms=6000,
            used_hint=True,
        ),
    ],
)


def _mutate(base: dict[str, Any], mutator) -> dict[str, Any]:
    """Deep-copy a base fixture and apply a mutator function to it."""

    copy = deepcopy(base)
    mutator(copy)
    return copy


def _set_attempt_session(envelope: dict[str, Any]) -> None:
    envelope["attempts"][0]["session_id"] = "999e8400-e29b-41d4-a716-446655440099"


def _reverse_session_timestamps(envelope: dict[str, Any]) -> None:
    envelope["session"]["started_at"] = "2026-06-17T11:00:00Z"
    envelope["session"]["last_activity_at"] = "2026-06-17T10:00:00Z"


def _negative_behavioral_count(envelope: dict[str, Any]) -> None:
    envelope["session"]["behavioral_context"]["hesitation_event_count"] = -1


def _options_count_for_free_text(envelope: dict[str, Any]) -> None:
    envelope["attempts"][0]["student_answer"] = {
        "format": "free_text",
        "value": "hello",
        "options_presented_count": 4,
    }


def _unsupported_contract_version(envelope: dict[str, Any]) -> None:
    envelope["session"]["contract_version"] = "9.9"


INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH: dict[str, Any] = _mutate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT, _set_attempt_session
)

INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED: dict[str, Any] = _mutate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT, _reverse_session_timestamps
)

INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT: dict[str, Any] = _mutate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT, _negative_behavioral_count
)

INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT: dict[str, Any] = _mutate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT, _options_count_for_free_text
)

INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION: dict[str, Any] = _mutate(
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT, _unsupported_contract_version
)


def all_valid_requests() -> list[dict[str, Any]]:
    """Return all valid request fixtures for parameterized tests."""

    return [
        VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
        VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
        VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
    ]


def all_invalid_requests() -> list[dict[str, Any]]:
    """Return all invalid request fixtures for negative-path tests."""

    return [
        INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH,
        INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED,
        INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT,
        INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT,
        INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION,
    ]


def parse_valid_request(fixture: dict[str, Any]) -> AimAnalysisRequest:
    """Validate a fixture dict against AimAnalysisRequest for sanity checks."""

    return AimAnalysisRequest.model_validate(fixture)
