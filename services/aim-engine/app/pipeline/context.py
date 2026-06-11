"""Pipeline execution context models."""

from datetime import UTC, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PipelineExecutionContext(BaseModel):
    """Safe execution context for future AIM Engine pipeline calls.

    This context is intentionally operational only. It must not contain secrets,
    raw learner answers, provider keys, database URLs, or client-owned adaptive
    state.
    """

    model_config = ConfigDict(extra="forbid", frozen=True, str_strip_whitespace=True)

    correlation_id: UUID
    requested_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    source_service: str = Field(default="backend-api", min_length=1, max_length=80)
