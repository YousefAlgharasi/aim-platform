# Canonical source: packages/shared-contracts/api/
# This copy lives in services/aim-engine/app/schemas/ for
# aim-engine-local packaging. Keep in sync with the canonical schemas.
# Added by P5-020.

"""AIM Engine analysis request schema.

Phase 5 — P5-021
Contract sources:
  packages/shared-contracts/api/aim-session-input-contracts.md  (P5-009)
  packages/shared-contracts/api/aim-attempt-input-contracts.md  (P5-010)

This module defines the Pydantic models the AIM Engine uses to validate the
POST /aim/v1/analysis payload sent exclusively by the Backend.

Scope rules (enforced by caller, asserted here in docstrings):
- Only the Backend calls POST /aim/v1/analysis.
- Flutter, Admin Dashboard, and any other client must never call this endpoint.
- No mastery, level, weakness, difficulty, recommendation, review-schedule,
  retention, or frustration values are accepted as *inputs* here — those are
  AIM Engine *outputs* (P5-011 through P5-017).
- All identifier fields are backend-issued UUIDs or stable skill keys.
  No display labels are used as identifiers.

No secrets, service-role keys, database credentials, or AI provider keys are
referenced in this module.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel

# ---------------------------------------------------------------------------
# Wire-format compatibility base (P5-076 contract fix)
# ---------------------------------------------------------------------------
#
# The Backend's AimRequestMapperService (P5-047) emits camelCase JSON keys
# (sessionId, studentId, behavioralContext, ...) over the wire, per the
# JavaScript/TypeScript naming convention used throughout the backend.
# This schema's internal field names remain snake_case (Python convention).
#
# AimCamelCaseModel bridges the two: alias_generator=to_camel derives a
# camelCase alias for every field (e.g. session_id -> sessionId), and
# populate_by_name=True additionally accepts the literal snake_case field
# name. This means the model validates both the real backend wire format
# and snake_case payloads (e.g. test fixtures, internal tooling) without
# requiring either side to change its own naming convention.
#
# model_dump() defaults to snake_case (by_alias=False); pass by_alias=True
# to serialize back to camelCase if ever needed for round-tripping.


class AimCamelCaseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

# ---------------------------------------------------------------------------
# Enumerations — locked to contract versions defined in P5-009 and P5-010
# ---------------------------------------------------------------------------

CONTRACT_VERSION = "1.0"


class AimSessionType(str, Enum):
    """Backend-classified session type (P5-009).

    The Backend, not the client, assigns this value.
    """

    LESSON_PRACTICE = "lesson_practice"
    REVIEW_PRACTICE = "review_practice"
    PLACEMENT_FOLLOWUP = "placement_followup"
    ADAPTIVE_DRILL = "adaptive_drill"


class AimLevelSource(str, Enum):
    """Where the student's current level was set."""

    PLACEMENT = "placement"
    AIM_ENGINE = "aim_engine"


class AimItemType(str, Enum):
    """Backend-classified item type (P5-010).

    Must be consistent with the accompanying ``session_type``.
    """

    LESSON_QUESTION = "lesson_question"
    PRACTICE_QUESTION = "practice_question"
    REVIEW_QUESTION = "review_question"
    DRILL_QUESTION = "drill_question"


class AimDifficultyLevel(int, Enum):
    """Phase 0/1 locked 1–4 difficulty scale (P5-010).

    ``presented_difficulty`` is informational context only.
    Next-presentation difficulty is an AIM Engine *output* (P5-014).
    """

    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4


class AimAnswerFormat(str, Enum):
    """Backend-classified answer format (P5-010)."""

    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    LISTENING_CHOICE = "listening_choice"
    FREE_TEXT = "free_text"


# ---------------------------------------------------------------------------
# Sub-models — session segment (P5-009)
# ---------------------------------------------------------------------------


class AimLevelContext(AimCamelCaseModel):
    """Student's current backend-persisted level context (P5-009).

    ``current_level`` is read-only context for the AIM Engine.  The AIM Engine
    may return an updated level in its response (P5-011), but it never receives
    client-submitted level values through this field.
    """

    current_level: str = Field(
        ...,
        description="Backend-persisted level identifier (Phase 0/4 scale).",
    )
    level_source: AimLevelSource = Field(
        ...,
        description="Whether the level came from placement or a prior AIM Engine decision.",
    )
    level_set_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when this level was last set.",
    )


class AimInitialSkillSignal(AimCamelCaseModel):
    """Bootstrap placement-derived signal for a single skill (P5-009).

    ``signal_strength`` is *not* a mastery value.  It is a placement-derived
    bootstrap input used only for a student's earliest sessions, sourced
    exclusively from the Phase 4 placement pipeline.
    """

    skill_id: str = Field(
        ...,
        description="Stable skill key (backend-issued, not a display label).",
    )
    signal_strength: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Backend-computed placement signal (0–1 inclusive). Not mastery.",
    )


class AimPlacementContext(AimCamelCaseModel):
    """Reference to the Phase 4 placement result (P5-009).

    Present only for a student's first analyzed sessions following placement.
    ``None`` once the AIM Engine has stable skill-state history.
    """

    placement_result_id: str = Field(
        ...,
        description="UUID reference to the Phase 4 placement result record.",
    )
    placement_completed_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when placement completed.",
    )
    initial_skill_signals: list[AimInitialSkillSignal] = Field(
        default_factory=list,
        description="Backend-derived initial per-skill signals from placement.",
    )


class AimSessionBehavioralContext(AimCamelCaseModel):
    """Raw session-level behavioral signals (P5-009).

    All fields are backend-computed aggregates derived from raw client events.
    None of these fields carry mastery, level, weakness, difficulty,
    recommendation, review-schedule, retention, or frustration values.
    """

    items_attempted_in_session: int = Field(
        ...,
        ge=0,
        description="Count of attempt records the Backend has recorded in this session so far.",
    )
    consecutive_incorrect: int = Field(
        ...,
        ge=0,
        description="Backend-counted current streak of incorrect attempts in the session.",
    )
    consecutive_correct: int = Field(
        ...,
        ge=0,
        description="Backend-counted current streak of correct attempts in the session.",
    )
    average_response_time_ms: Optional[float] = Field(
        None,
        ge=0.0,
        description=(
            "Raw average response time across session attempts in milliseconds. "
            "Behavioral context only — must never be used to compute mastery, "
            "level, or difficulty."
        ),
    )
    hesitation_event_count: int = Field(
        ...,
        ge=0,
        description="Backend-counted raw hesitation signals (e.g. answer changes before submit).",
    )
    retry_event_count: int = Field(
        ...,
        ge=0,
        description="Backend-counted raw retry signals within the session.",
    )
    idle_gap_count: int = Field(
        ...,
        ge=0,
        description="Backend-counted idle gaps exceeding the backend-configured idle threshold.",
    )


class AimSessionInput(AimCamelCaseModel):
    """Session-level portion of the AIM analysis request (P5-009).

    Every field is backend-owned.  No field is copied verbatim from an
    unvalidated client payload.
    """

    session_id: str = Field(
        ...,
        description="Backend-issued UUID of the learning session.",
    )
    student_id: str = Field(
        ...,
        description=(
            "Backend-issued UUID of the student. "
            "Resolved from authenticated identity — never from a raw client field."
        ),
    )
    session_type: AimSessionType = Field(
        ...,
        description="Backend-classified session type.",
    )
    started_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the session began.",
    )
    last_activity_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of the most recent backend-recorded activity.",
    )
    skill_focus_ids: list[str] = Field(
        default_factory=list,
        description=(
            "Skill keys resolved by the Backend from curriculum data. "
            "May be empty. Never copied verbatim from a client field."
        ),
    )
    level_context: AimLevelContext = Field(
        ...,
        description="Student's current backend-persisted level context.",
    )
    placement_context: Optional[AimPlacementContext] = Field(
        None,
        description=(
            "Phase 4 placement reference. Present only for earliest post-placement sessions. "
            "None once the AIM Engine has stable skill-state history for the student."
        ),
    )
    behavioral_context: AimSessionBehavioralContext = Field(
        ...,
        description="Raw, session-level behavioral signals (backend-computed).",
    )
    contract_version: str = Field(
        ...,
        description="Contract version string used by the AIM Engine for compatibility handling.",
    )

    @model_validator(mode="after")
    def started_at_before_last_activity(self) -> "AimSessionInput":
        if self.started_at > self.last_activity_at:
            raise ValueError(
                "started_at must be less than or equal to last_activity_at"
            )
        return self


# ---------------------------------------------------------------------------
# Sub-models — attempt segment (P5-010)
# ---------------------------------------------------------------------------


class AimStudentAnswer(AimCamelCaseModel):
    """Backend-normalized student answer (P5-010).

    ``value`` is the student's literal answer content included for AIM Engine
    analysis (e.g. error-pattern detection).  It is not an AIM-owned decision
    field.
    """

    format: AimAnswerFormat = Field(
        ...,
        description="Backend-classified answer format.",
    )
    value: str = Field(
        ...,
        description="Student's normalized answer value.",
    )
    options_presented_count: Optional[int] = Field(
        None,
        ge=1,
        description=(
            "Number of answer options presented for option-based formats. "
            "None for fill_blank and free_text."
        ),
    )

    @model_validator(mode="after")
    def options_count_only_for_option_formats(self) -> "AimStudentAnswer":
        option_formats = {
            AimAnswerFormat.MULTIPLE_CHOICE,
            AimAnswerFormat.TRUE_FALSE,
            AimAnswerFormat.LISTENING_CHOICE,
        }
        if self.format in option_formats and self.options_presented_count is None:
            raise ValueError(
                f"options_presented_count is required for format '{self.format.value}'"
            )
        if self.format not in option_formats and self.options_presented_count is not None:
            raise ValueError(
                f"options_presented_count must be None for format '{self.format.value}'"
            )
        return self


class AimAttemptBehavioralContext(AimCamelCaseModel):
    """Raw attempt-level behavioral signals (P5-010).

    All fields are raw signals computed by the Backend from recorded client
    events.  None carry mastery, level, weakness, difficulty, recommendation,
    review-schedule, retention, or frustration values.
    """

    answer_change_count: int = Field(
        ...,
        ge=0,
        description="Backend-counted answer changes before submission.",
    )
    hesitation_before_submit_ms: Optional[float] = Field(
        None,
        ge=0.0,
        description=(
            "Raw time between first interaction and final submission in milliseconds. "
            "None when not separately tracked."
        ),
    )
    used_hint: bool = Field(
        ...,
        description="Whether a backend-provided hint was shown before submission.",
    )
    abandoned_first_then_retried: bool = Field(
        ...,
        description="Whether the student navigated away and returned before completing.",
    )


class AimAttemptInput(AimCamelCaseModel):
    """Attempt-level portion of the AIM analysis request (P5-010).

    One or more of these entries compose alongside ``AimSessionInput`` inside
    the single ``POST /aim/v1/analysis`` request.  Each attempt must reference
    the ``session_id`` carried in the accompanying session segment.

    ``is_correct`` is evaluated by the Backend only — never trusted from a
    client-submitted value.
    """

    attempt_id: str = Field(
        ...,
        description="Backend-issued UUID of the attempt record.",
    )
    session_id: str = Field(
        ...,
        description="UUID of the session this attempt belongs to (must match session segment).",
    )
    item_id: str = Field(
        ...,
        description="Backend-issued UUID of the question or practice item.",
    )
    item_type: AimItemType = Field(
        ...,
        description="Backend-classified item type (must be consistent with session_type).",
    )
    skill_ids: list[str] = Field(
        ...,
        min_length=1,
        description=(
            "Skill keys linked to the item, resolved by the Backend from curriculum data. "
            "At least one entry required."
        ),
    )
    presented_difficulty: AimDifficultyLevel = Field(
        ...,
        description=(
            "Backend-recorded difficulty of this presentation. "
            "Informational context only — next difficulty is an AIM Engine output (P5-014)."
        ),
    )
    student_answer: AimStudentAnswer = Field(
        ...,
        description="Student's normalized answer in backend-normalized form.",
    )
    is_correct: bool = Field(
        ...,
        description="Backend-evaluated correctness. Never trusted from a client-submitted value.",
    )
    attempt_number_for_item: int = Field(
        ...,
        ge=1,
        description="Backend-counted ordinal of this attempt for this item in the session.",
    )
    started_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the item was presented.",
    )
    submitted_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the Backend recorded the submission.",
    )
    response_time_ms: int = Field(
        ...,
        ge=0,
        description=(
            "submitted_at minus started_at in milliseconds, computed by the Backend. "
            "Behavioral context only."
        ),
    )
    behavioral_context: AimAttemptBehavioralContext = Field(
        ...,
        description="Raw, attempt-level behavioral signals (backend-computed).",
    )

    @model_validator(mode="after")
    def started_at_before_submitted_at(self) -> "AimAttemptInput":
        if self.started_at > self.submitted_at:
            raise ValueError("started_at must be less than or equal to submitted_at")
        return self


# ---------------------------------------------------------------------------
# Top-level request envelope
# ---------------------------------------------------------------------------


class AimAnalysisRequest(AimCamelCaseModel):
    """Top-level request payload for POST /aim/v1/analysis (P5-021).

    The Backend assembles this envelope through the pipeline stages defined in
    ``docs/phase-5/backend-aim-pipeline-map.md``.  The AIM Engine validates
    this schema on receipt (P5-024) before passing it to any analyzer.

    Caller rules (enforced at the transport layer, asserted here for clarity):
    - Only the Backend NestJS adapter (Phase 5 scope) sends this request.
    - Flutter must not call POST /aim/v1/analysis.
    - Admin Dashboard must not call POST /aim/v1/analysis.
    - No client may calculate mastery, level, weakness, difficulty,
      recommendations, review schedules, retention, or frustration scores.

    The ``backend_request_id`` is used for idempotency per
    ``docs/phase-5/aim-engine-api-map.md`` (P5-006).
    """

    backend_request_id: str = Field(
        ...,
        description=(
            "Backend-issued UUID for this analysis call. "
            "Used by the AIM Engine for idempotency and correlation to the response."
        ),
    )
    session: AimSessionInput = Field(
        ...,
        description="Session-level context (P5-009).",
    )
    attempts: list[AimAttemptInput] = Field(
        ...,
        min_length=1,
        description="One or more attempt entries for this analysis call (P5-010).",
    )

    @field_validator("attempts")
    @classmethod
    def attempts_reference_session(
        cls, attempts: list[AimAttemptInput], info: any
    ) -> list[AimAttemptInput]:
        """Every attempt session_id must match the session segment's session_id."""
        # Access session_id from already-validated data if available
        data = info.data if hasattr(info, "data") else {}
        session = data.get("session")
        if session is not None:
            session_id = session.session_id
            for attempt in attempts:
                if attempt.session_id != session_id:
                    raise ValueError(
                        f"attempt_id={attempt.attempt_id!r}: session_id "
                        f"{attempt.session_id!r} does not match session.session_id "
                        f"{session_id!r}"
                    )
        return attempts
