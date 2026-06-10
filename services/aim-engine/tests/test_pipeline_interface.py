"""Tests for the AIM Engine pipeline interface skeleton."""

from datetime import datetime, timezone
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.contracts import (
    AdaptiveSessionCompletionRequest,
    DifficultyLevel,
    EngineProcessingStatus,
    SkillAttemptInput,
)
from app.pipeline import (
    AdaptiveSessionCompletionPipeline,
    PipelineExecutionContext,
    PlaceholderAdaptiveSessionCompletionPipeline,
)


def _request() -> AdaptiveSessionCompletionRequest:
    return AdaptiveSessionCompletionRequest(
        request_id=uuid4(),
        student_id=uuid4(),
        session_id=uuid4(),
        course_id=uuid4(),
        completed_at=datetime.now(timezone.utc),
        attempts=[
            SkillAttemptInput(
                attempt_id=uuid4(),
                skill_id="grammar.present-simple",
                exercise_id="exercise-001",
                difficulty=DifficultyLevel.EASY,
                is_correct=True,
                score=1.0,
                time_spent_seconds=8.0,
                retries=0,
                hints_used=0,
                submitted_at=datetime.now(timezone.utc),
            )
        ],
    )


@pytest.mark.asyncio
async def test_placeholder_pipeline_matches_interface_shape() -> None:
    pipeline: AdaptiveSessionCompletionPipeline = PlaceholderAdaptiveSessionCompletionPipeline()
    request = _request()
    context = PipelineExecutionContext(correlation_id=request.request_id)

    response = await pipeline.complete_session(request, context)

    assert response.request_id == request.request_id
    assert response.student_id == request.student_id
    assert response.session_id == request.session_id
    assert response.status == EngineProcessingStatus.ACCEPTED
    assert response.skill_updates == []
    assert response.weaknesses == []
    assert response.recommendations == []
    assert response.retention_reviews == []


def test_pipeline_context_rejects_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        PipelineExecutionContext(
            correlation_id=uuid4(),
            unexpected_secret="not allowed",
        )
