"""Tests for the AIM Engine safe failure response — P5-025.

Covers:
- AimSafeFailureResponse schema: required/optional fields present and correct.
- AimSafeFailureBuilder: correct HTTP status, retryable flag, safe message.
- All 10 failure categories from the P5-008 taxonomy.
- Safety invariants: no secrets, no stack traces, no engine internals.
- Route integration: unhandled exceptions → 500 safe failure (not raw exception).
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.errors.aim_safe_failure import (
    AimFailureCategory,
    AimSafeFailureBuilder,
    AimSafeFailureResponse,
    _RETRYABLE,
    _HTTP_STATUS,
)
from app.main import create_app

TOKEN = "local-dev-token"

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


# ---------------------------------------------------------------------------
# AimSafeFailureResponse schema
# ---------------------------------------------------------------------------


def test_safe_failure_response_required_fields() -> None:
    resp = AimSafeFailureResponse(
        code="INTERNAL_ERROR",
        message="An unexpected error occurred.",
        timestamp="2026-06-17T10:00:00Z",
    )
    assert resp.code == "INTERNAL_ERROR"
    assert resp.message == "An unexpected error occurred."
    assert resp.timestamp == "2026-06-17T10:00:00Z"
    assert resp.request_id is None
    assert resp.category is None
    assert resp.retryable is None


def test_safe_failure_response_with_all_fields() -> None:
    resp = AimSafeFailureResponse(
        code="TRANSPORT_TIMEOUT",
        message="The analysis request timed out.",
        request_id="req-abc-123",
        timestamp="2026-06-17T10:00:00Z",
        category=AimFailureCategory.TRANSPORT_TIMEOUT,
        retryable=True,
    )
    assert resp.retryable is True
    assert resp.category == AimFailureCategory.TRANSPORT_TIMEOUT


def test_safe_failure_response_contains_no_forbidden_fields() -> None:
    """The schema must have no fields for secrets, stack traces, or internals."""
    field_names = set(AimSafeFailureResponse.model_fields.keys())
    for forbidden in ("token", "secret", "password", "traceback", "stack", "database"):
        assert forbidden not in field_names, (
            f"AimSafeFailureResponse must not have a '{forbidden}' field"
        )


# ---------------------------------------------------------------------------
# AimSafeFailureBuilder — all categories
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("category", list(AimFailureCategory))
def test_builder_produces_response_for_every_category(category: AimFailureCategory) -> None:
    builder = AimSafeFailureBuilder()
    response, http_status = builder.from_category(category=category, request_id="req-1")

    assert isinstance(response, AimSafeFailureResponse)
    assert response.code
    assert response.message
    assert response.timestamp
    assert response.category == category
    assert response.retryable == _RETRYABLE[category]
    assert http_status == _HTTP_STATUS[category]


@pytest.mark.parametrize("category", [
    AimFailureCategory.TRANSPORT_TIMEOUT,
    AimFailureCategory.TRANSPORT_CONNECTION_ERROR,
    AimFailureCategory.TRANSIENT_HTTP,
])
def test_retryable_categories_are_retryable(category: AimFailureCategory) -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(category=category)
    assert response.retryable is True


@pytest.mark.parametrize("category", [
    AimFailureCategory.AUTHENTICATION_FAILURE,
    AimFailureCategory.AUTHORIZATION_FAILURE,
    AimFailureCategory.VALIDATION_FAILURE,
    AimFailureCategory.IDEMPOTENCY_CONFLICT,
    AimFailureCategory.CONTRACT_VIOLATION,
    AimFailureCategory.PERSISTENCE_FAILURE,
    AimFailureCategory.INTERNAL_ERROR,
])
def test_non_retryable_categories_are_not_retryable(category: AimFailureCategory) -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(category=category)
    assert response.retryable is False


def test_builder_echoes_request_id() -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(
        category=AimFailureCategory.INTERNAL_ERROR, request_id="req-xyz"
    )
    assert response.request_id == "req-xyz"


def test_builder_allows_code_override() -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(
        category=AimFailureCategory.VALIDATION_FAILURE, code="CUSTOM_VALIDATION_CODE"
    )
    assert response.code == "CUSTOM_VALIDATION_CODE"


def test_builder_allows_message_override() -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(
        category=AimFailureCategory.INTERNAL_ERROR,
        message="Custom safe message.",
    )
    assert response.message == "Custom safe message."


def test_internal_error_convenience_method() -> None:
    builder = AimSafeFailureBuilder()
    response, http_status = builder.internal_error(request_id="req-500")
    assert http_status == 500
    assert response.retryable is False
    assert response.request_id == "req-500"
    assert response.code == "INTERNAL_ERROR"


# ---------------------------------------------------------------------------
# Safety invariants: response body must not leak internals
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("category", list(AimFailureCategory))
def test_builder_response_contains_no_secrets(category: AimFailureCategory) -> None:
    builder = AimSafeFailureBuilder()
    response, _ = builder.from_category(category=category, request_id="req-1")
    body = response.model_dump_json().lower()

    for forbidden in ("secret", "password", "token", "database", "traceback", "stack_trace"):
        assert forbidden not in body, (
            f"Safe failure response for {category} must not contain '{forbidden}'"
        )


# ---------------------------------------------------------------------------
# Route integration: unhandled exception → 500 safe failure
# ---------------------------------------------------------------------------


def test_route_returns_safe_500_on_pipeline_crash(monkeypatch) -> None:
    """An unexpected pipeline exception must produce a safe 500, not a raw error."""
    from app.pipeline.aim_analysis_pipeline import AimAnalysisPipelineEntrypoint

    async def _crash(self, request):
        raise RuntimeError("simulated internal error — must not leak")

    monkeypatch.setattr(AimAnalysisPipelineEntrypoint, "run", _crash)

    app = create_app()
    client = TestClient(app, raise_server_exceptions=False)

    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )

    assert response.status_code == 500
    payload = response.json()

    # Must be the safe failure envelope
    assert "code" in payload
    assert "message" in payload
    assert "timestamp" in payload

    # Must not leak the raw exception message
    assert "simulated internal error" not in response.text
    assert "RuntimeError" not in response.text


def test_route_500_response_has_cache_control_no_store(monkeypatch) -> None:
    from app.pipeline.aim_analysis_pipeline import AimAnalysisPipelineEntrypoint

    async def _crash(self, request):
        raise RuntimeError("crash")

    monkeypatch.setattr(AimAnalysisPipelineEntrypoint, "run", _crash)

    client = TestClient(create_app(), raise_server_exceptions=False)
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.headers.get("cache-control") == "no-store"
