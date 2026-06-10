"""Guard tests for the Phase 1 no-speed mastery rule.

These tests intentionally do not test a real adaptive algorithm. They protect the
pipeline boundary from introducing direct speed-based mastery, level, difficulty,
retention, or recommendation changes.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4
import asyncio

from app.contracts import (
    AdaptiveSessionCompletionRequest,
    DifficultyLevel,
    EngineProcessingStatus,
    SkillAttemptInput,
)
from app.pipeline import PipelineExecutionContext, PlaceholderAdaptiveSessionCompletionPipeline


STUDENT_ID = UUID("11111111-1111-4111-8111-111111111111")
SESSION_ID = UUID("22222222-2222-4222-8222-222222222222")
COURSE_ID = UUID("33333333-3333-4333-8333-333333333333")


def _build_request(time_spent_seconds: float) -> AdaptiveSessionCompletionRequest:
    return AdaptiveSessionCompletionRequest(
        request_id=uuid4(),
        student_id=STUDENT_ID,
        session_id=SESSION_ID,
        course_id=COURSE_ID,
        completed_at=datetime.now(timezone.utc),
        attempts=[
            SkillAttemptInput(
                attempt_id=uuid4(),
                skill_id="grammar.present-simple",
                exercise_id="exercise-001",
                difficulty=DifficultyLevel.EASY,
                is_correct=True,
                score=1.0,
                time_spent_seconds=time_spent_seconds,
                retries=0,
                hints_used=0,
                submitted_at=datetime.now(timezone.utc),
            )
        ],
    )


def _run_placeholder_pipeline(
    request: AdaptiveSessionCompletionRequest,
):
    pipeline = PlaceholderAdaptiveSessionCompletionPipeline()
    context = PipelineExecutionContext(correlation_id=request.request_id)

    return asyncio.run(pipeline.complete_session(request, context))


def test_response_time_alone_does_not_create_mastery_or_difficulty_outputs() -> None:
    """Fast and slow otherwise-identical attempts must not produce direct AIM outputs.

    If a future implementation directly increases mastery, learner level, or
    difficulty only because the attempt was faster, this guard should fail when
    adapted to that implementation.
    """
    fast_request = _build_request(time_spent_seconds=2.0)
    slow_request = _build_request(time_spent_seconds=120.0)

    fast_response = _run_placeholder_pipeline(fast_request)
    slow_response = _run_placeholder_pipeline(slow_request)

    assert fast_response.status == EngineProcessingStatus.ACCEPTED
    assert slow_response.status == EngineProcessingStatus.ACCEPTED

    assert fast_response.skill_updates == []
    assert slow_response.skill_updates == []

    assert fast_response.recommendations == []
    assert slow_response.recommendations == []

    assert fast_response.retention_reviews == []
    assert slow_response.retention_reviews == []


def test_response_time_alone_does_not_create_weakness_outputs() -> None:
    """Slow response time alone must not be treated as weakness evidence."""
    slow_request = _build_request(time_spent_seconds=240.0)

    response = _run_placeholder_pipeline(slow_request)

    assert response.status == EngineProcessingStatus.ACCEPTED
    assert response.weaknesses == []


def test_attempt_contract_keeps_time_as_evidence_not_direct_mastery_signal() -> None:
    """Time remains accepted evidence but not a direct output field."""
    attempt = SkillAttemptInput(
        attempt_id=uuid4(),
        skill_id="grammar.present-simple",
        exercise_id="exercise-001",
        difficulty=DifficultyLevel.EASY,
        is_correct=True,
        score=1.0,
        time_spent_seconds=1.0,
        retries=0,
        hints_used=0,
        submitted_at=datetime.now(timezone.utc),
    )

    dumped = attempt.model_dump()

    assert dumped["time_spent_seconds"] == 1.0
    assert "speed_score" not in dumped
    assert "mastery_score" not in dumped
    assert "level" not in dumped
    assert "next_difficulty" not in dumped
