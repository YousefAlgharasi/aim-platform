"""Tests for AIM Engine learning contract models."""

from datetime import UTC, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.contracts import (
    AdaptiveSessionCompletionRequest,
    AdaptiveSessionCompletionResponse,
    DifficultyLevel,
    EngineProcessingStatus,
    ExistingSkillStateInput,
    RecommendationContract,
    RetentionReviewContract,
    SkillAttemptInput,
    SkillStateUpdateContract,
    WeaknessRecordContract,
)


def _attempt(skill_id: str = "grammar.present-simple") -> SkillAttemptInput:
    return SkillAttemptInput(
        attempt_id=uuid4(),
        skill_id=skill_id,
        exercise_id="exercise-001",
        difficulty=DifficultyLevel.EASY,
        is_correct=True,
        score=1.0,
        time_spent_seconds=12.5,
        retries=0,
        hints_used=0,
        submitted_at=datetime.now(UTC),
    )


def test_session_completion_request_accepts_valid_payload() -> None:
    request = AdaptiveSessionCompletionRequest(
        request_id=uuid4(),
        student_id=uuid4(),
        session_id=uuid4(),
        course_id=uuid4(),
        lesson_id=uuid4(),
        completed_at=datetime.now(UTC),
        attempts=[_attempt()],
        existing_skill_states=[
            ExistingSkillStateInput(
                skill_id="grammar.present-simple",
                mastery_score=0.4,
                confidence_score=0.6,
                current_difficulty=DifficultyLevel.EASY,
                attempts_count=3,
            )
        ],
    )

    assert request.attempts[0].skill_id == "grammar.present-simple"


def test_session_completion_request_rejects_empty_attempts() -> None:
    with pytest.raises(ValidationError):
        AdaptiveSessionCompletionRequest(
            request_id=uuid4(),
            student_id=uuid4(),
            session_id=uuid4(),
            course_id=uuid4(),
            completed_at=datetime.now(UTC),
            attempts=[],
        )


def test_session_completion_request_rejects_duplicate_skill_state_snapshots() -> None:
    skill_state = ExistingSkillStateInput(
        skill_id="grammar.present-simple",
        mastery_score=0.4,
        confidence_score=0.6,
        current_difficulty=DifficultyLevel.EASY,
        attempts_count=3,
    )

    with pytest.raises(ValidationError):
        AdaptiveSessionCompletionRequest(
            request_id=uuid4(),
            student_id=uuid4(),
            session_id=uuid4(),
            course_id=uuid4(),
            completed_at=datetime.now(UTC),
            attempts=[_attempt()],
            existing_skill_states=[skill_state, skill_state],
        )


def test_skill_attempt_rejects_invalid_score() -> None:
    with pytest.raises(ValidationError):
        SkillAttemptInput(
            attempt_id=uuid4(),
            skill_id="grammar.present-simple",
            exercise_id="exercise-001",
            difficulty=DifficultyLevel.EASY,
            is_correct=True,
            score=1.2,
            time_spent_seconds=12.5,
            retries=0,
            hints_used=0,
            submitted_at=datetime.now(UTC),
        )


def test_session_completion_response_accepts_valid_future_outputs() -> None:
    student_id = uuid4()
    session_id = uuid4()

    response = AdaptiveSessionCompletionResponse(
        request_id=uuid4(),
        student_id=student_id,
        session_id=session_id,
        status=EngineProcessingStatus.COMPLETED,
        engine_version="0.1.0",
        skill_updates=[
            SkillStateUpdateContract(
                skill_id="grammar.present-simple",
                mastery_score=0.55,
                confidence_score=0.7,
                next_difficulty=DifficultyLevel.MEDIUM,
                reason_codes=["accuracy_signal"],
            )
        ],
        weaknesses=[
            WeaknessRecordContract(
                skill_id="grammar.present-simple",
                weakness_score=0.35,
                reason_codes=["retry_signal"],
            )
        ],
        recommendations=[
            RecommendationContract(
                recommendation_id=uuid4(),
                target_type="review",
                target_id=uuid4(),
                priority=20,
                reason_codes=["retention_due"],
            )
        ],
        retention_reviews=[
            RetentionReviewContract(
                skill_id="grammar.present-simple",
                review_after=datetime.now(UTC),
                reason_codes=["spaced_review"],
            )
        ],
    )

    assert response.status == EngineProcessingStatus.COMPLETED
    assert response.student_id == student_id
    assert response.session_id == session_id


def test_contracts_reject_unknown_fields() -> None:
    with pytest.raises(ValidationError):
        SkillAttemptInput(
            attempt_id=uuid4(),
            skill_id="grammar.present-simple",
            exercise_id="exercise-001",
            difficulty=DifficultyLevel.EASY,
            is_correct=True,
            score=1.0,
            time_spent_seconds=12.5,
            retries=0,
            hints_used=0,
            submitted_at=datetime.now(UTC),
            unexpected_field="not allowed",
        )
