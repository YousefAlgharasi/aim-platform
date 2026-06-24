"""Tests for the AIM Engine input validation rules — P5-024.

Covers every validation rule code defined in aim_request_validator.py:
  V-S-01  session_id UUID
  V-S-02  student_id UUID
  V-S-04  started_at <= last_activity_at
  V-S-05  placement signal_strength [0, 1]
  V-S-07  contract_version supported
  V-A-01  attempt_id UUID
  V-A-02  attempt session_id matches session segment
  V-A-03  item_id UUID
  V-A-06  attempt started_at <= submitted_at

Also verifies pipeline integration: invalid requests raise
AimRequestValidationError before any category dispatch.
"""

from __future__ import annotations

import copy

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.validation.aim_request_validator import (
    AimRequestValidationError,
    AimRequestValidator,
    _is_uuid,
)

TOKEN = "local-dev-token"

# ---------------------------------------------------------------------------
# Shared fixture payload
# ---------------------------------------------------------------------------

VALID_BODY = {
    "backend_request_id": "550e8400-e29b-41d4-a716-446655440000",
    "session": {
        "session_id": "660e8400-e29b-41d4-a716-446655440001",
        "student_id": "770e8400-e29b-41d4-a716-446655440002",
        "session_type": "lesson_practice",
        "started_at": "2026-06-17T10:00:00Z",
        "last_activity_at": "2026-06-17T10:30:00Z",
        "skill_focus_ids": ["skill:arabic:p1:vocab"],
        "level_context": {
            "current_level": "level_2",
            "level_source": "placement",
            "level_set_at": "2026-06-16T09:00:00Z",
        },
        "placement_context": None,
        "behavioral_context": {
            "items_attempted_in_session": 3,
            "consecutive_incorrect": 0,
            "consecutive_correct": 3,
            "average_response_time_ms": 4200.0,
            "hesitation_event_count": 0,
            "retry_event_count": 0,
            "idle_gap_count": 0,
        },
        "contract_version": "1.0",
    },
    "attempts": [
        {
            "attempt_id": "880e8400-e29b-41d4-a716-446655440003",
            "session_id": "660e8400-e29b-41d4-a716-446655440001",
            "item_id": "990e8400-e29b-41d4-a716-446655440004",
            "item_type": "lesson_question",
            "skill_ids": ["skill:arabic:p1:vocab"],
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
    ],
}


def _make_request(overrides: dict | None = None):
    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    if overrides:
        # Simple 1-level merge; nested overrides use dotted paths handled below
        for k, v in overrides.items():
            keys = k.split(".")
            d = body
            for key in keys[:-1]:
                d = d[key]
            d[keys[-1]] = v
    return AimAnalysisRequest(**body)


# ---------------------------------------------------------------------------
# UUID helper
# ---------------------------------------------------------------------------


def test_is_uuid_accepts_valid_v4() -> None:
    assert _is_uuid("550e8400-e29b-41d4-a716-446655440000")


def test_is_uuid_rejects_non_uuid() -> None:
    assert not _is_uuid("not-a-uuid")
    assert not _is_uuid("skill:arabic:p1:vocab")
    assert not _is_uuid("")


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------


def test_valid_request_passes_all_rules() -> None:
    validator = AimRequestValidator()
    result = validator.validate(_make_request())
    assert result.is_valid
    assert result.violations == []


# ---------------------------------------------------------------------------
# V-S-01: session_id must be a valid UUID
# ---------------------------------------------------------------------------


def test_V_S_01_invalid_session_id() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    # Set BOTH session.session_id AND attempt.session_id to the same non-UUID
    # so Pydantic's cross-field check passes, but our UUID validator fires.
    body = copy.deepcopy(VALID_BODY)
    body["session"]["session_id"] = "not-a-uuid"
    body["attempts"][0]["session_id"] = "not-a-uuid"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    codes = [v.code for v in result.violations]
    assert "V-S-01" in codes


# ---------------------------------------------------------------------------
# V-S-02: student_id must be a valid UUID
# ---------------------------------------------------------------------------


def test_V_S_02_invalid_student_id() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["student_id"] = "bad-student-id"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    assert any(v.code == "V-S-02" for v in result.violations)


# ---------------------------------------------------------------------------
# V-S-04: started_at <= last_activity_at
# ---------------------------------------------------------------------------


def test_V_S_04_started_at_after_last_activity() -> None:
    import copy

    from pydantic import ValidationError

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["started_at"] = "2026-06-17T11:00:00Z"
    body["session"]["last_activity_at"] = "2026-06-17T10:00:00Z"

    # Pydantic catches this first via model_validator
    with pytest.raises(ValidationError):
        AimAnalysisRequest(**body)


def test_V_S_04_equal_timestamps_are_valid() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["started_at"] = "2026-06-17T10:00:00Z"
    body["session"]["last_activity_at"] = "2026-06-17T10:00:00Z"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)
    assert not any(v.code == "V-S-04" for v in result.violations)


# ---------------------------------------------------------------------------
# V-S-05: placement_context signal_strength within [0, 1]
# ---------------------------------------------------------------------------


def test_V_S_05_signal_strength_out_of_range() -> None:
    import copy

    from pydantic import ValidationError

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["placement_context"] = {
        "placement_result_id": "aa0e8400-e29b-41d4-a716-446655440099",
        "placement_completed_at": "2026-06-16T08:00:00Z",
        "initial_skill_signals": [{"skill_id": "skill:arabic:p1:vocab", "signal_strength": 1.5}],
    }
    # Pydantic enforces ge=0.0, le=1.0 on signal_strength
    with pytest.raises(ValidationError):
        AimAnalysisRequest(**body)


def test_V_S_05_valid_signal_strength_passes() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["placement_context"] = {
        "placement_result_id": "aa0e8400-e29b-41d4-a716-446655440099",
        "placement_completed_at": "2026-06-16T08:00:00Z",
        "initial_skill_signals": [{"skill_id": "skill:arabic:p1:vocab", "signal_strength": 0.75}],
    }
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)
    assert not any(v.code == "V-S-05" for v in result.violations)


# ---------------------------------------------------------------------------
# V-S-07: contract_version must be supported
# ---------------------------------------------------------------------------


def test_V_S_07_unsupported_contract_version() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["contract_version"] = "99.0"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    assert any(v.code == "V-S-07" for v in result.violations)


def test_V_S_07_supported_version_passes() -> None:
    validator = AimRequestValidator()
    result = validator.validate(_make_request())
    assert not any(v.code == "V-S-07" for v in result.violations)


# ---------------------------------------------------------------------------
# V-A-01: attempt_id must be a valid UUID
# ---------------------------------------------------------------------------


def test_V_A_01_invalid_attempt_id() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["attempts"][0]["attempt_id"] = "not-a-uuid"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    assert any(v.code == "V-A-01" for v in result.violations)


# ---------------------------------------------------------------------------
# V-A-02: attempt session_id must match the session segment
# ---------------------------------------------------------------------------


def test_V_A_02_attempt_session_id_mismatch() -> None:
    import copy

    from pydantic import ValidationError

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["attempts"][0]["session_id"] = "aaaaaaaa-e29b-41d4-a716-446655440000"

    # Pydantic model_validator on AimAnalysisRequest already catches this
    with pytest.raises(ValidationError):
        AimAnalysisRequest(**body)


# ---------------------------------------------------------------------------
# V-A-03: item_id must be a valid UUID
# ---------------------------------------------------------------------------


def test_V_A_03_invalid_item_id() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["attempts"][0]["item_id"] = "bad-item-id"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    assert any(v.code == "V-A-03" for v in result.violations)


# ---------------------------------------------------------------------------
# V-A-06: attempt started_at <= submitted_at
# ---------------------------------------------------------------------------


def test_V_A_06_attempt_started_after_submitted() -> None:
    import copy

    from pydantic import ValidationError

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["attempts"][0]["started_at"] = "2026-06-17T10:10:00Z"
    body["attempts"][0]["submitted_at"] = "2026-06-17T10:05:00Z"

    # Pydantic model_validator catches this first
    with pytest.raises(ValidationError):
        AimAnalysisRequest(**body)


# ---------------------------------------------------------------------------
# Multiple violations aggregated
# ---------------------------------------------------------------------------


def test_multiple_violations_all_reported() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["session_id"] = "not-a-uuid"
    body["session"]["student_id"] = "also-not-a-uuid"
    body["session"]["contract_version"] = "99.0"
    body["attempts"][0]["item_id"] = "bad-item-id"
    body["attempts"][0]["attempt_id"] = "another-bad-id"
    # Keep attempt session_id in sync so Pydantic cross-check passes;
    # our UUID validator will flag both independently.
    body["attempts"][0]["session_id"] = "not-a-uuid"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    assert not result.is_valid
    codes = {v.code for v in result.violations}
    assert "V-S-01" in codes
    assert "V-S-02" in codes
    assert "V-S-07" in codes
    assert "V-A-01" in codes
    assert "V-A-03" in codes


# ---------------------------------------------------------------------------
# AimRequestValidationError carries the result
# ---------------------------------------------------------------------------


def test_validation_error_carries_result() -> None:
    import copy

    from app.schemas.aim_analysis_request import AimAnalysisRequest

    body = copy.deepcopy(VALID_BODY)
    body["session"]["contract_version"] = "99.0"
    request = AimAnalysisRequest(**body)

    validator = AimRequestValidator()
    result = validator.validate(request)

    error = AimRequestValidationError(result)
    assert error.result is result
    assert "V-S-07" in str(error)


# ---------------------------------------------------------------------------
# Pipeline integration: invalid request → 400 from the route
# ---------------------------------------------------------------------------


def test_pipeline_rejects_unsupported_contract_version_via_route() -> None:
    """The pipeline must propagate validation errors as HTTP 400."""
    import copy

    body = copy.deepcopy(VALID_BODY)
    body["session"]["contract_version"] = "99.0"

    client = TestClient(create_app(), raise_server_exceptions=False)
    response = client.post(
        "/aim/v1/analysis",
        json=body,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.status_code == 400
    payload = response.json()
    assert "detail" in payload
