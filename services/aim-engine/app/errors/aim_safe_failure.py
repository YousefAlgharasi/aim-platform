"""AIM Engine safe failure response — P5-025.

Implements the safe error envelope the AIM Engine returns for every non-success
outcome on POST /aim/v1/analysis, as specified in:

  docs/phase-5/aim-error-handling-policy.md  (P5-008)
  packages/shared-contracts/api/errors.md    (P5-018)
  docs/phase-5/aim-engine-api-map.md         (P5-006 — Failure Status Map)

Design rules (from P5-008):
- Every failure produces a structured, safe response — never a raw exception,
  stack trace, or engine internal.
- The envelope carries only safe fields: code, message, request_id, timestamp,
  category, retryable.
- Forbidden: service tokens, AI provider keys, database errors, stack traces,
  raw engine response bodies, payload digests, internal model fields, secrets.
- The Backend never forwards this envelope verbatim to a client; it maps the
  engine code to a backend code and emits the backend envelope. This module
  defines the AIM Engine side only.

No secrets, service-role keys, database credentials, or AI provider keys are
referenced here.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Failure taxonomy (from P5-008 § Failure Taxonomy)
# ---------------------------------------------------------------------------


class AimFailureCategory(str, Enum):
    """Failure categories from the P5-008 taxonomy.

    These map to the Backend's retryable / non-retryable classification.
    """

    TRANSPORT_TIMEOUT = "transport_timeout"
    TRANSPORT_CONNECTION_ERROR = "transport_connection_error"
    TRANSIENT_HTTP = "transient_http"
    AUTHENTICATION_FAILURE = "authentication_failure"
    AUTHORIZATION_FAILURE = "authorization_failure"
    VALIDATION_FAILURE = "validation_failure"
    IDEMPOTENCY_CONFLICT = "idempotency_conflict"
    CONTRACT_VIOLATION = "contract_violation"
    PERSISTENCE_FAILURE = "persistence_failure"
    INTERNAL_ERROR = "internal_error"


# Map from category → retryable (Backend perspective, per P5-008 taxonomy)
_RETRYABLE: dict[AimFailureCategory, bool] = {
    AimFailureCategory.TRANSPORT_TIMEOUT: True,
    AimFailureCategory.TRANSPORT_CONNECTION_ERROR: True,
    AimFailureCategory.TRANSIENT_HTTP: True,
    AimFailureCategory.AUTHENTICATION_FAILURE: False,
    AimFailureCategory.AUTHORIZATION_FAILURE: False,
    AimFailureCategory.VALIDATION_FAILURE: False,
    AimFailureCategory.IDEMPOTENCY_CONFLICT: False,
    AimFailureCategory.CONTRACT_VIOLATION: False,
    AimFailureCategory.PERSISTENCE_FAILURE: False,
    AimFailureCategory.INTERNAL_ERROR: False,
}

# Map from category → HTTP status code (from P5-006 § Failure Status Map)
_HTTP_STATUS: dict[AimFailureCategory, int] = {
    AimFailureCategory.TRANSPORT_TIMEOUT: 504,
    AimFailureCategory.TRANSPORT_CONNECTION_ERROR: 503,
    AimFailureCategory.TRANSIENT_HTTP: 500,
    AimFailureCategory.AUTHENTICATION_FAILURE: 401,
    AimFailureCategory.AUTHORIZATION_FAILURE: 403,
    AimFailureCategory.VALIDATION_FAILURE: 400,
    AimFailureCategory.IDEMPOTENCY_CONFLICT: 409,
    AimFailureCategory.CONTRACT_VIOLATION: 500,
    AimFailureCategory.PERSISTENCE_FAILURE: 500,
    AimFailureCategory.INTERNAL_ERROR: 500,
}

# Safe user-facing messages — no internals, no stack traces
_SAFE_MESSAGES: dict[AimFailureCategory, str] = {
    AimFailureCategory.TRANSPORT_TIMEOUT: "The analysis request timed out.",
    AimFailureCategory.TRANSPORT_CONNECTION_ERROR: "The AIM Engine is unavailable.",
    AimFailureCategory.TRANSIENT_HTTP: "A transient error occurred. Retry is permitted.",
    AimFailureCategory.AUTHENTICATION_FAILURE: "Authentication is required.",
    AimFailureCategory.AUTHORIZATION_FAILURE: "You do not have permission to perform this action.",
    AimFailureCategory.VALIDATION_FAILURE: "One or more fields are invalid.",
    AimFailureCategory.IDEMPOTENCY_CONFLICT: "The request conflicts with the current resource state.",
    AimFailureCategory.CONTRACT_VIOLATION: "The analysis response was malformed.",
    AimFailureCategory.PERSISTENCE_FAILURE: "The analysis result could not be saved.",
    AimFailureCategory.INTERNAL_ERROR: "An unexpected error occurred.",
}


# ---------------------------------------------------------------------------
# Safe failure envelope (P5-025 output)
# ---------------------------------------------------------------------------


class AimSafeFailureResponse(BaseModel):
    """Structured safe failure envelope returned by the AIM Engine.

    Required fields (always present):
      code        — stable integration error code from P5-018.
      message     — short, user-safe message. No engine internals.
      request_id  — backend correlation id (X-Request-Id).
      timestamp   — ISO-8601 UTC.

    Optional fields (set only when safe):
      category    — failure category from P5-008 taxonomy.
      retryable   — whether the Backend may retry the upstream call.

    Forbidden (never included):
      service tokens, AI provider keys, database errors, stack traces,
      raw engine response bodies, payload digests, internal model fields.
    """

    code: str = Field(
        ...,
        description="Stable integration error code from P5-018.",
    )
    message: str = Field(
        ...,
        description="Short, user-safe message. No engine internals.",
    )
    request_id: Optional[str] = Field(
        None,
        description="Backend correlation id (X-Request-Id), echoed for tracing.",
    )
    timestamp: str = Field(
        ...,
        description="ISO-8601 UTC timestamp of when this failure response was produced.",
    )
    category: Optional[AimFailureCategory] = Field(
        None,
        description="Failure category from the P5-008 taxonomy.",
    )
    retryable: Optional[bool] = Field(
        None,
        description=(
            "Whether the Backend may retry the upstream caller action. "
            "Reflects the category's retryability from the P5-008 taxonomy."
        ),
    )


# ---------------------------------------------------------------------------
# Builder — produces safe failure responses without exposing internals
# ---------------------------------------------------------------------------


class AimSafeFailureBuilder:
    """Build AimSafeFailureResponse instances without leaking internals.

    Usage:
        builder = AimSafeFailureBuilder()
        response, http_status = builder.from_category(
            category=AimFailureCategory.VALIDATION_FAILURE,
            request_id=x_request_id,
            code="VALIDATION_ERROR",
        )

    The builder never includes exception messages, stack traces, or any field
    not explicitly allowed by P5-008.
    """

    def from_category(
        self,
        category: AimFailureCategory,
        request_id: Optional[str] = None,
        code: Optional[str] = None,
        message: Optional[str] = None,
    ) -> tuple[AimSafeFailureResponse, int]:
        """Build a safe failure response and its HTTP status code.

        Args:
            category:   Failure category from the P5-008 taxonomy.
            request_id: Backend X-Request-Id correlation header value.
            code:       Override the default error code. Falls back to the
                        category name as a stable code.
            message:    Override the default safe message. Falls back to the
                        category's pre-approved message from P5-008.

        Returns:
            (AimSafeFailureResponse, http_status_code)
        """
        resolved_code = code or category.value.upper()
        resolved_message = message or _SAFE_MESSAGES[category]
        http_status = _HTTP_STATUS[category]
        retryable = _RETRYABLE[category]

        response = AimSafeFailureResponse(
            code=resolved_code,
            message=resolved_message,
            request_id=request_id,
            timestamp=_utc_now_iso(),
            category=category,
            retryable=retryable,
        )
        return response, http_status

    def internal_error(
        self,
        request_id: Optional[str] = None,
    ) -> tuple[AimSafeFailureResponse, int]:
        """Convenience method for unexpected engine faults (500).

        Never includes exception messages or stack traces.
        """
        return self.from_category(
            category=AimFailureCategory.INTERNAL_ERROR,
            request_id=request_id,
            code="INTERNAL_ERROR",
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _utc_now_iso() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
