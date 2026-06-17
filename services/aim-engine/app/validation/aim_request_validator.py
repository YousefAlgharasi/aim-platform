"""AIM Engine input validation rules — P5-024.

This module implements the AIM Engine-side semantic validation the contracts
require beyond what Pydantic schema parsing already enforces.

Per the contracts (P5-009, P5-010):
  "The AIM Engine independently validates the segment per P5-024 on receipt."

Validation is a separate, explicit stage so the pipeline entrypoint (P5-023)
can call it before dispatching to any category analysis, and so the safe
failure path (P5-025) can surface structured validation errors rather than
unhandled exceptions.

Rules implemented (enumerated from P5-009 / P5-010 validation tables):

Session-level (P5-009):
  V-S-01  session_id is a valid UUID
  V-S-02  student_id is a valid UUID
  V-S-03  session_type is one of the defined enum values           [schema]
  V-S-04  started_at <= last_activity_at
  V-S-05  placement_context.signal_strength values within [0, 1]
  V-S-06  all behavioral_context numeric fields are non-negative   [schema]
  V-S-07  contract_version is non-empty                           [schema]

Attempt-level (P5-010):
  V-A-01  attempt_id is a valid UUID
  V-A-02  session_id on each attempt matches the session segment's session_id
  V-A-03  item_id is a valid UUID
  V-A-04  item_type is one of the defined enum values              [schema]
  V-A-05  skill_ids has at least one entry                        [schema]
  V-A-06  started_at <= submitted_at (per attempt)
  V-A-07  response_time_ms >= 0                                   [schema]
  V-A-08  attempt_number_for_item >= 1                            [schema]

Rules marked [schema] are already enforced at the Pydantic layer (P5-021).
They are listed here for completeness but not re-implemented to avoid
duplication.  The validator focuses on cross-field and cross-segment semantic
rules that Pydantic alone cannot express.

Speed / response-time rules:
  The validator never uses response_time_ms, hesitation_before_submit_ms,
  average_response_time_ms, or any other timing field to compute mastery,
  level, difficulty, weakness, or any adaptive-learning output.  Timing is
  validated only for structural correctness (non-negative range, temporal
  ordering). No secrets, service-role keys, or AI provider keys are used here.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from app.schemas.aim_analysis_request import AimAnalysisRequest

# UUID v4 pattern — used to validate identifier fields that must be UUIDs.
_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)

# Supported contract versions this AIM Engine build accepts.
SUPPORTED_CONTRACT_VERSIONS: frozenset[str] = frozenset({"1.0"})


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ValidationViolation:
    """A single validation rule violation."""

    code: str
    message: str
    field: str | None = None


@dataclass
class ValidationResult:
    """Aggregated result of running all validation rules against a request."""

    violations: list[ValidationViolation] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return len(self.violations) == 0

    def add(self, code: str, message: str, field: str | None = None) -> None:
        self.violations.append(ValidationViolation(code=code, message=message, field=field))


class AimRequestValidationError(ValueError):
    """Raised when AIM Engine input validation fails.

    Carries the full ``ValidationResult`` so the pipeline entrypoint (P5-023)
    and the safe failure path (P5-025) can surface structured error detail
    without exposing internal algorithm state.
    """

    def __init__(self, result: ValidationResult) -> None:
        self.result = result
        codes = ", ".join(v.code for v in result.violations)
        super().__init__(f"AIM request validation failed: [{codes}]")


# ---------------------------------------------------------------------------
# Validator
# ---------------------------------------------------------------------------


class AimRequestValidator:
    """Apply AIM Engine-side semantic validation rules to an AimAnalysisRequest.

    Usage:
        validator = AimRequestValidator()
        result = validator.validate(request)
        if not result.is_valid:
            raise AimRequestValidationError(result)

    All methods are pure functions of their arguments. No I/O, no DB access,
    no secrets.
    """

    def validate(self, request: AimAnalysisRequest) -> ValidationResult:
        """Run all validation rules and return an aggregated result.

        Does not raise on failure — returns the result so callers can decide
        how to handle it (raise, log, return safe failure shape, etc.).
        """
        result = ValidationResult()
        self._validate_session(request, result)
        self._validate_attempts(request, result)
        return result

    # -----------------------------------------------------------------------
    # Session-level rules
    # -----------------------------------------------------------------------

    def _validate_session(
        self, request: AimAnalysisRequest, result: ValidationResult
    ) -> None:
        session = request.session

        # V-S-01: session_id must be a valid UUID
        if not _is_uuid(session.session_id):
            result.add(
                "V-S-01",
                f"session.session_id is not a valid UUID: {session.session_id!r}",
                field="session.session_id",
            )

        # V-S-02: student_id must be a valid UUID
        if not _is_uuid(session.student_id):
            result.add(
                "V-S-02",
                f"session.student_id is not a valid UUID: {session.student_id!r}",
                field="session.student_id",
            )

        # V-S-04: started_at <= last_activity_at
        # (Pydantic model_validator also enforces this, but the contract
        #  specifies the AIM Engine validates it independently on receipt.)
        if session.started_at > session.last_activity_at:
            result.add(
                "V-S-04",
                "session.started_at must be <= session.last_activity_at",
                field="session.started_at",
            )

        # V-S-05: placement_context signal strengths within [0, 1]
        if session.placement_context is not None:
            for i, sig in enumerate(session.placement_context.initial_skill_signals):
                if not (0.0 <= sig.signal_strength <= 1.0):
                    result.add(
                        "V-S-05",
                        (
                            f"placement_context.initial_skill_signals[{i}].signal_strength "
                            f"must be within [0.0, 1.0], got {sig.signal_strength}"
                        ),
                        field=f"session.placement_context.initial_skill_signals[{i}].signal_strength",
                    )

        # V-S-07: contract_version must be a supported version
        if session.contract_version not in SUPPORTED_CONTRACT_VERSIONS:
            result.add(
                "V-S-07",
                (
                    f"contract_version {session.contract_version!r} is not supported. "
                    f"Supported versions: {sorted(SUPPORTED_CONTRACT_VERSIONS)}"
                ),
                field="session.contract_version",
            )

    # -----------------------------------------------------------------------
    # Attempt-level rules
    # -----------------------------------------------------------------------

    def _validate_attempts(
        self, request: AimAnalysisRequest, result: ValidationResult
    ) -> None:
        session_id = request.session.session_id

        for i, attempt in enumerate(request.attempts):
            prefix = f"attempts[{i}]"

            # V-A-01: attempt_id must be a valid UUID
            if not _is_uuid(attempt.attempt_id):
                result.add(
                    "V-A-01",
                    f"{prefix}.attempt_id is not a valid UUID: {attempt.attempt_id!r}",
                    field=f"{prefix}.attempt_id",
                )

            # V-A-02: attempt session_id must match the session segment
            if attempt.session_id != session_id:
                result.add(
                    "V-A-02",
                    (
                        f"{prefix}.session_id {attempt.session_id!r} does not match "
                        f"session.session_id {session_id!r}"
                    ),
                    field=f"{prefix}.session_id",
                )

            # V-A-03: item_id must be a valid UUID
            if not _is_uuid(attempt.item_id):
                result.add(
                    "V-A-03",
                    f"{prefix}.item_id is not a valid UUID: {attempt.item_id!r}",
                    field=f"{prefix}.item_id",
                )

            # V-A-06: started_at <= submitted_at
            # (Pydantic model_validator also enforces this; validated
            #  independently here per the AIM Engine's contract obligation.)
            if attempt.started_at > attempt.submitted_at:
                result.add(
                    "V-A-06",
                    f"{prefix}.started_at must be <= {prefix}.submitted_at",
                    field=f"{prefix}.started_at",
                )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _is_uuid(value: str) -> bool:
    """Return True if value is a valid UUID v4 string."""
    return bool(_UUID_RE.match(value))
