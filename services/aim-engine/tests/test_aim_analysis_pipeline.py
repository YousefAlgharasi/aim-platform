"""Tests for the AIM Engine analysis pipeline entrypoint — P5-023.

Verifies:
- Protocol conformance: AimAnalysisPipelineEntrypoint satisfies AimAnalysisPipeline.
- Response envelope: backend_request_id, student_id, session_id are echoed.
- Response structure: all required envelope fields are present.
- Categories: all optional; absence is valid (no decision this call).
- Scope guards: no mastery, no speed-as-mastery, no secrets in response.
- Integration: pipeline is injected into app.state and invoked by the route.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.pipeline.aim_analysis_pipeline import (
    AimAnalysisPipeline,
    AimAnalysisPipelineEntrypoint,
)
from app.schemas.aim_analysis_request import AimAnalysisRequest
from app.schemas.aim_analysis_response import AimAnalysisResponse, AimResponseCategories

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
# Protocol conformance
# ---------------------------------------------------------------------------


def test_entrypoint_satisfies_protocol() -> None:
    """AimAnalysisPipelineEntrypoint must satisfy the AimAnalysisPipeline protocol."""
    pipeline = AimAnalysisPipelineEntrypoint()
    assert isinstance(pipeline, AimAnalysisPipeline)


# ---------------------------------------------------------------------------
# Direct pipeline invocation
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pipeline_returns_aim_analysis_response() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    assert isinstance(response, AimAnalysisResponse)


@pytest.mark.asyncio
async def test_pipeline_echoes_correlation_ids() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    assert response.backend_request_id == request.backend_request_id
    assert response.student_id == request.session.student_id
    assert response.session_id == request.session.session_id


@pytest.mark.asyncio
async def test_pipeline_response_has_contract_version() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    assert response.contract_version == request.session.contract_version


@pytest.mark.asyncio
async def test_pipeline_response_has_generated_at() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    assert response.generated_at is not None


@pytest.mark.asyncio
async def test_pipeline_response_has_categories() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    assert isinstance(response.categories, AimResponseCategories)


@pytest.mark.asyncio
async def test_pipeline_categories_are_populated() -> None:
    """Domain services are wired — categories should be populated for valid input."""
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)

    cats = response.categories
    assert cats.skill_state is not None
    assert cats.difficulty_decision is not None
    assert cats.recommendations is not None
    assert cats.review_schedule is not None
    assert cats.session_summary is not None


# ---------------------------------------------------------------------------
# Scope guards
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_pipeline_response_contains_no_secrets() -> None:
    pipeline = AimAnalysisPipelineEntrypoint()
    request = AimAnalysisRequest(**VALID_BODY)

    response = await pipeline.run(request)
    body = response.model_dump_json()

    for forbidden in ("secret", "password", "database", "token"):
        assert forbidden not in body.lower(), f"Pipeline response must not contain '{forbidden}'"


# ---------------------------------------------------------------------------
# Integration: pipeline wired through app.state, invoked by the route
# ---------------------------------------------------------------------------


def test_app_state_has_aim_pipeline() -> None:
    """The app factory must inject the pipeline into app.state."""
    app = create_app()
    assert hasattr(app.state, "aim_pipeline")
    assert isinstance(app.state.aim_pipeline, AimAnalysisPipeline)


def test_route_delegates_to_pipeline(monkeypatch) -> None:
    """POST /aim/v1/analysis delegates to app.state.aim_pipeline when set."""
    client = TestClient(create_app())

    response = client.post(
        "/aim/v1/analysis",
        json=VALID_BODY,
        headers={"Authorization": f"Bearer {TOKEN}"},
    )

    assert response.status_code == 200
    payload = response.json()
    # Pipeline must echo correlation ids (not the stub's static values)
    # Wire format is camelCase per the P5-076 contract fix.
    assert payload["backendRequestId"] == VALID_BODY["backend_request_id"]
    assert payload["studentId"] == VALID_BODY["session"]["student_id"]
    assert payload["sessionId"] == VALID_BODY["session"]["session_id"]
    assert "categories" in payload
