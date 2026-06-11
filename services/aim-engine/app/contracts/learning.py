"""AIM Engine learning contract models.

These models define the service boundary between the NestJS Backend API and the
Python AIM Engine. They intentionally do not implement adaptive-learning
behavior. They only validate request/response shapes for future pipeline tasks.
"""

from datetime import datetime
from enum import StrEnum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

BoundedScore = Annotated[float, Field(ge=0.0, le=1.0)]
PositiveSeconds = Annotated[float, Field(gt=0.0)]


class ContractModel(BaseModel):
    """Base model for public AIM Engine contracts."""

    model_config = ConfigDict(
        extra="forbid",
        frozen=True,
        str_strip_whitespace=True,
    )


class DifficultyLevel(StrEnum):
    """Supported difficulty levels at the engine contract boundary."""

    INTRO = "intro"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    ADVANCED = "advanced"


class EngineProcessingStatus(StrEnum):
    """Processing status values returned by future engine workflows."""

    ACCEPTED = "accepted"
    COMPLETED = "completed"
    FAILED = "failed"


class SkillAttemptInput(ContractModel):
    """Single learner attempt submitted by the backend to AIM Engine."""

    attempt_id: UUID
    skill_id: str = Field(min_length=1, max_length=120)
    exercise_id: str = Field(min_length=1, max_length=120)
    question_id: str | None = Field(default=None, min_length=1, max_length=120)
    difficulty: DifficultyLevel
    is_correct: bool
    score: BoundedScore
    time_spent_seconds: PositiveSeconds
    retries: int = Field(ge=0, le=20)
    hints_used: int = Field(ge=0, le=20)
    submitted_at: datetime

    @field_validator("skill_id", "exercise_id", "question_id")
    @classmethod
    def reject_blank_identifiers(cls, value: str | None) -> str | None:
        if value is not None and value.strip() == "":
            raise ValueError("identifier must not be blank")
        return value


class ExistingSkillStateInput(ContractModel):
    """Current backend-owned skill state snapshot sent to the engine."""

    skill_id: str = Field(min_length=1, max_length=120)
    mastery_score: BoundedScore
    confidence_score: BoundedScore
    current_difficulty: DifficultyLevel
    attempts_count: int = Field(ge=0)
    last_reviewed_at: datetime | None = None


class AdaptiveSessionCompletionRequest(ContractModel):
    """Request contract for future adaptive session-completion processing."""

    request_id: UUID
    student_id: UUID
    session_id: UUID
    course_id: UUID
    lesson_id: UUID | None = None
    completed_at: datetime
    attempts: list[SkillAttemptInput] = Field(min_length=1, max_length=500)
    existing_skill_states: list[ExistingSkillStateInput] = Field(
        default_factory=list, max_length=500
    )

    @model_validator(mode="after")
    def ensure_attempt_skills_have_unique_state_snapshots(
        self,
    ) -> "AdaptiveSessionCompletionRequest":
        state_skill_ids = [state.skill_id for state in self.existing_skill_states]
        if len(state_skill_ids) != len(set(state_skill_ids)):
            raise ValueError("existing_skill_states must not contain duplicate skill_id values")
        return self


class SkillStateUpdateContract(ContractModel):
    """Future engine output describing a backend-owned skill-state update."""

    skill_id: str = Field(min_length=1, max_length=120)
    mastery_score: BoundedScore
    confidence_score: BoundedScore
    next_difficulty: DifficultyLevel
    reason_codes: list[str] = Field(default_factory=list, max_length=20)


class WeaknessRecordContract(ContractModel):
    """Future engine output describing a detected weakness signal."""

    skill_id: str = Field(min_length=1, max_length=120)
    weakness_score: BoundedScore
    reason_codes: list[str] = Field(default_factory=list, min_length=1, max_length=20)


class RecommendationContract(ContractModel):
    """Future engine output describing a next learning recommendation."""

    recommendation_id: UUID
    target_type: str = Field(pattern="^(lesson|exercise|review)$")
    target_id: UUID
    priority: int = Field(ge=1, le=100)
    reason_codes: list[str] = Field(default_factory=list, min_length=1, max_length=20)


class RetentionReviewContract(ContractModel):
    """Future engine output describing a retention review schedule item."""

    skill_id: str = Field(min_length=1, max_length=120)
    review_after: datetime
    reason_codes: list[str] = Field(default_factory=list, min_length=1, max_length=20)


class AdaptiveSessionCompletionResponse(ContractModel):
    """Response contract for future adaptive session-completion processing."""

    request_id: UUID
    student_id: UUID
    session_id: UUID
    status: EngineProcessingStatus
    engine_version: str = Field(min_length=1, max_length=40)
    skill_updates: list[SkillStateUpdateContract] = Field(default_factory=list, max_length=500)
    weaknesses: list[WeaknessRecordContract] = Field(default_factory=list, max_length=500)
    recommendations: list[RecommendationContract] = Field(default_factory=list, max_length=100)
    retention_reviews: list[RetentionReviewContract] = Field(default_factory=list, max_length=500)
