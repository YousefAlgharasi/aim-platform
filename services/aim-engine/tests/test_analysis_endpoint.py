"""Tests for POST /aim/v1/analysis endpoint — P5-020.

Verifies:
- Service-token auth: 401 on missing/wrong token, 200 on valid token.
- Request schema acceptance: valid AimAnalysisRequest body parses and responds.
- Response envelope: backendRequestId, studentId, sessionId are echoed
  (wire format is camelCase per the P5-076 contract fix; internal field
  names remain snake_case backend_request_id/student_id/session_id).
- Scope guard: response body contains no secrets, no mastery internals.
- Stub behaviour: empty categories returned before P5-023 pipeline is wired.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

TOKEN = "local-dev-token"  # default from AimEngineSettings

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


@pytest.fixture()
def client() -> TestClient:
    return TestClient(create_app())


# ---------------------------------------------------------------------------
# Auth guard tests
# ---------------------------------------------------------------------------


def test_analysis_returns_401_when_no_token(client: TestClient) -> None:
    response = client.post("/aim/v1/analysis", json=VALID_BODY)
    assert response.status_code == 401
    detail = response.json()["detail"]
    assert detail["code"] == "UNAUTHORIZED"
    # Token value must never appear in the response
    assert TOKEN not in response.text


def test_analysis_returns_401_when_wrong_token(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": "Bearer wrong-token"},
    )
    assert response.status_code == 401
    detail = response.json()["detail"]
    assert detail["code"] == "AUTH_INVALID"
    assert TOKEN not in response.text
    assert "wrong-token" not in response.text


def test_analysis_returns_401_when_non_bearer_scheme(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Basic {TOKEN}"},
    )
    assert response.status_code == 401


# ---------------------------------------------------------------------------
# Happy path
# ---------------------------------------------------------------------------


def test_analysis_returns_200_with_valid_token(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.status_code == 200


def test_analysis_response_echoes_correlation_ids(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    payload = response.json()
    assert payload["backendRequestId"] == VALID_BODY["backend_request_id"]
    assert payload["studentId"] == VALID_BODY["session"]["student_id"]
    assert payload["sessionId"] == VALID_BODY["session"]["session_id"]


def test_analysis_response_has_categories_field(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    payload = response.json()
    assert "categories" in payload


def test_analysis_response_cache_control_no_store(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.headers.get("cache-control") == "no-store"


# ---------------------------------------------------------------------------
# Scope safety: response must not leak secrets or AIM internals
# ---------------------------------------------------------------------------


def test_analysis_response_contains_no_secrets(client: TestClient) -> None:
    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    body_lower = response.text.lower()
    for forbidden in ("secret", "password", "database", TOKEN.lower()):
        assert forbidden not in body_lower, f"Response must not contain '{forbidden}'"


# ---------------------------------------------------------------------------
# Schema rejection: malformed body → 422
# ---------------------------------------------------------------------------


def test_analysis_returns_422_when_body_missing_session(client: TestClient) -> None:
    bad_body = {**VALID_BODY}
    del bad_body["session"]
    response = client.post(
        "/aim/v1/analysis",
        json=bad_body,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.status_code == 422


def test_analysis_returns_422_when_attempts_empty(client: TestClient) -> None:
    bad_body = {**VALID_BODY, "attempts": []}
    response = client.post(
        "/aim/v1/analysis",
        json=bad_body,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )
    assert response.status_code == 422
