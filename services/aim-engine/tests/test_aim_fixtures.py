"""Self-tests for AIM Engine test fixtures (P5-026).

Verifies that:
- Every "valid" fixture round-trips through Pydantic validation cleanly.
- Every "invalid" fixture fails Pydantic validation for the expected reason.
- Builder helpers produce contract-conformant dicts when called with defaults.
- Fixtures embed no obvious secrets or production credential markers.
- Speed / response_time appears only as behavioral context, never inside any
  mastery, level, difficulty, or frustration field.
"""

from __future__ import annotations

import json

import pytest
from pydantic import ValidationError

from app.schemas.aim_analysis_request import AimAnalysisRequest
from app.schemas.aim_analysis_response import AimAnalysisResponse
from tests.fixtures import (
    EMPTY_CATEGORIES_RESPONSE,
    FULL_CATEGORIES_RESPONSE,
    INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH,
    INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT,
    INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT,
    INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED,
    INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION,
    INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION,
    INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK,
    INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP,
    SKILL_STATE_ONLY_RESPONSE,
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
    VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
    VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
    WEAKNESS_AND_DIFFICULTY_RESPONSE,
    build_request_envelope,
    build_response_envelope,
    build_skill_state_output,
    build_valid_attempt,
    build_valid_session,
)
from tests.fixtures.aim_request_fixtures import (
    all_invalid_requests,
    all_valid_requests,
    parse_valid_request,
)
from tests.fixtures.aim_response_fixtures import (
    all_invalid_responses,
    all_valid_responses,
    parse_valid_response,
)


@pytest.mark.parametrize(
    "fixture",
    [
        VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
        VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
        VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
    ],
    ids=["lesson_practice", "placement_followup", "review_practice_multi"],
)
def test_valid_request_fixtures_round_trip(fixture: dict) -> None:
    parsed = AimAnalysisRequest.model_validate(fixture)
    assert parsed.backend_request_id == fixture["backend_request_id"]
    assert parsed.session.session_id == fixture["session"]["session_id"]
    assert len(parsed.attempts) == len(fixture["attempts"])


def test_valid_request_fixtures_helper_returns_three() -> None:
    assert len(all_valid_requests()) == 3


def test_invalid_request_attempt_session_mismatch_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisRequest.model_validate(INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH)
    assert "session_id" in str(exc.value)


def test_invalid_request_session_timestamps_reversed_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisRequest.model_validate(INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED)
    assert "last_activity_at" in str(exc.value)


def test_invalid_request_negative_behavioral_count_rejected() -> None:
    with pytest.raises(ValidationError):
        AimAnalysisRequest.model_validate(INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT)


def test_invalid_request_options_count_wrong_for_format_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisRequest.model_validate(INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT)
    assert "options_presented_count" in str(exc.value)


def test_invalid_request_unsupported_contract_version_passes_schema() -> None:
    parsed = AimAnalysisRequest.model_validate(INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION)
    assert parsed.session.contract_version == "9.9"


def test_all_invalid_requests_helper_returns_five() -> None:
    assert len(all_invalid_requests()) == 5


@pytest.mark.parametrize(
    "fixture",
    [
        EMPTY_CATEGORIES_RESPONSE,
        SKILL_STATE_ONLY_RESPONSE,
        WEAKNESS_AND_DIFFICULTY_RESPONSE,
        FULL_CATEGORIES_RESPONSE,
    ],
    ids=["empty", "skill_state_only", "weakness_and_difficulty", "full"],
)
def test_valid_response_fixtures_round_trip(fixture: dict) -> None:
    parsed = AimAnalysisResponse.model_validate(fixture)
    assert parsed.backend_request_id == fixture["backend_request_id"]
    assert parsed.student_id == fixture["student_id"]
    assert parsed.session_id == fixture["session_id"]


def test_valid_response_fixtures_helper_returns_four() -> None:
    assert len(all_valid_responses()) == 4


def test_invalid_response_difficulty_step_violation_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisResponse.model_validate(INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION)
    assert "step" in str(exc.value).lower() or "difficulty" in str(exc.value).lower()


def test_invalid_response_resolved_without_timestamp_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisResponse.model_validate(INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP)
    assert "resolved" in str(exc.value).lower()


def test_invalid_response_duplicate_recommendation_rank_rejected() -> None:
    with pytest.raises(ValidationError) as exc:
        AimAnalysisResponse.model_validate(INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK)
    assert "rank" in str(exc.value).lower()


def test_all_invalid_responses_helper_returns_three() -> None:
    assert len(all_invalid_responses()) == 3


def test_builders_produce_round_trippable_envelope() -> None:
    envelope = build_request_envelope(
        session=build_valid_session(),
        attempts=[build_valid_attempt()],
    )
    parsed = parse_valid_request(envelope)
    assert parsed.attempts[0].session_id == parsed.session.session_id


def test_response_builders_produce_round_trippable_envelope() -> None:
    envelope = build_response_envelope(
        categories={
            "skill_state": [build_skill_state_output()],
        }
    )
    parsed = parse_valid_response(envelope)
    assert parsed.categories.skill_state is not None
    assert len(parsed.categories.skill_state) == 1


def test_fixtures_contain_no_secret_markers() -> None:
    forbidden_markers = (
        "service_role",
        "service-role",
        "api_key=",
        "api-key=",
        "sk-",
        "Bearer ",
        "password=",
        "OPENAI",
        "SUPABASE_SERVICE",
        "DATABASE_URL",
    )
    payloads = [json.dumps(f, default=str) for f in (*all_valid_requests(), *all_valid_responses())]
    for blob in payloads:
        for marker in forbidden_markers:
            assert marker not in blob, (
                f"Forbidden secret marker {marker!r} appeared in a fixture payload"
            )


def test_response_time_only_appears_as_behavioral_context() -> None:
    forbidden_contexts = (
        "mastery_score",
        "mastery_confidence",
        "mastery_trend",
        "next_difficulty",
        "previous_difficulty",
        "frustration_level",
        "current_level",
    )
    for fixture in all_valid_requests():
        for attempt in fixture["attempts"]:
            assert "response_time_ms" in attempt
        for forbidden in forbidden_contexts:
            for attempt in fixture["attempts"]:
                ctx = attempt.get("behavioral_context", {})
                assert forbidden not in ctx
            session_ctx = fixture["session"].get("behavioral_context", {})
            assert forbidden not in session_ctx


def test_fixture_uuids_are_stable_across_imports() -> None:
    from tests.fixtures import (
        VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT as a,
    )
    from tests.fixtures import (
        VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT as b,
    )

    assert a["backend_request_id"] == b["backend_request_id"]
    assert a["session"]["session_id"] == b["session"]["session_id"]
    assert a["attempts"][0]["attempt_id"] == b["attempts"][0]["attempt_id"]
