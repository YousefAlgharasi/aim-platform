"""Compatibility exports for question attempt ORM models and schemas."""

from __future__ import annotations

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.presentation.api.schemas.attempts import (
    BatchAttemptRequest,
    QuestionAttemptCreate,
    QuestionAttemptRead,
    TimeOfDay,
)

__all__ = [
    "Base",
    "BatchAttemptRequest",
    "QuestionAttemptCreate",
    "QuestionAttemptORM",
    "QuestionAttemptRead",
    "TimeOfDay",
]

