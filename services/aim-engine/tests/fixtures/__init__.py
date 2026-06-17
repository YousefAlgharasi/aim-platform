"""Deterministic AIM Engine test fixtures (P5-026).

This package provides reusable, contract-conformant inputs and outputs for
testing the AIM Engine analysis pipeline, request validation, response shape,
and downstream backend integration paths.

Fixtures intentionally use stable hard-coded UUIDs and timestamps so tests
remain deterministic across runs and environments.

Scope rules:
- These fixtures are test artifacts only. They are never imported by
  production code paths.
- Fixtures contain no secrets, no service-role keys, no database credentials,
  and no AI provider keys.
- Fixtures do not embed mastery, level, weakness, difficulty, recommendation,
  review-schedule, retention, or frustration *inputs* to the engine; those
  fields exist only on the response side per P5-011 through P5-017.
- Fixtures preserve the Phase 5 rule that speed and response time appear as
  behavioral context only and never feed mastery, level, or difficulty logic.
"""

from app.schemas.aim_analysis_request import AimAnalysisRequest
from app.schemas.aim_analysis_response import AimAnalysisResponse

from .aim_request_fixtures import (
    INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH,
    INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT,
    INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT,
    INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED,
    INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION,
    VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT,
    VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP,
    VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT,
    build_request_envelope,
    build_valid_attempt,
    build_valid_session,
)
from .aim_response_fixtures import (
    EMPTY_CATEGORIES_RESPONSE,
    FULL_CATEGORIES_RESPONSE,
    INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION,
    INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK,
    INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP,
    SKILL_STATE_ONLY_RESPONSE,
    WEAKNESS_AND_DIFFICULTY_RESPONSE,
    build_response_envelope,
    build_skill_state_output,
)

__all__ = [
    "AimAnalysisRequest",
    "AimAnalysisResponse",
    "INVALID_REQUEST_ATTEMPT_SESSION_MISMATCH",
    "INVALID_REQUEST_NEGATIVE_BEHAVIORAL_COUNT",
    "INVALID_REQUEST_OPTIONS_COUNT_WRONG_FOR_FORMAT",
    "INVALID_REQUEST_SESSION_TIMESTAMPS_REVERSED",
    "INVALID_REQUEST_UNSUPPORTED_CONTRACT_VERSION",
    "VALID_REQUEST_LESSON_PRACTICE_SINGLE_ATTEMPT",
    "VALID_REQUEST_PLACEMENT_FOLLOWUP_WITH_BOOTSTRAP",
    "VALID_REQUEST_REVIEW_PRACTICE_MULTI_ATTEMPT",
    "build_request_envelope",
    "build_valid_attempt",
    "build_valid_session",
    "EMPTY_CATEGORIES_RESPONSE",
    "FULL_CATEGORIES_RESPONSE",
    "INVALID_RESPONSE_DIFFICULTY_STEP_VIOLATION",
    "INVALID_RESPONSE_DUPLICATE_RECOMMENDATION_RANK",
    "INVALID_RESPONSE_RESOLVED_WEAKNESS_WITHOUT_TIMESTAMP",
    "SKILL_STATE_ONLY_RESPONSE",
    "WEAKNESS_AND_DIFFICULTY_RESPONSE",
    "build_response_envelope",
    "build_skill_state_output",
]
