# Canonical source: packages/shared-contracts/api/
# This copy lives in services/aim-engine/app/schemas/ for
# aim-engine-local packaging. Keep in sync with the canonical schemas.
# Added by P5-020.

"""AIM Engine analysis response schema.

Phase 5 — P5-022
Contract sources:
  packages/shared-contracts/api/aim-engine-response-contracts.md   (P5-011)
  packages/shared-contracts/api/student-skill-state-contracts.md   (P5-012)
  packages/shared-contracts/api/weakness-record-contracts.md       (P5-013)
  packages/shared-contracts/api/difficulty-decision-contracts.md   (P5-014)
  packages/shared-contracts/api/aim-recommendation-contracts.md    (P5-015)
  packages/shared-contracts/api/review-schedule-contracts.md       (P5-016)
  packages/shared-contracts/api/aim-session-summary-contracts.md   (P5-017)

This module defines the Pydantic models the AIM Engine uses to produce the
structured response returned to the Backend from POST /aim/v1/analysis.

Scope rules:
- This response is returned to the Backend only.  It is never sent to clients.
- Clients receive only backend-persisted, permission-checked projections of
  these values through separate backend AIM result APIs (downstream tasks).
- No mastery, weakness, difficulty, recommendations, review schedule,
  retention, or frustration values may be computed or overridden by the
  Backend; those are exclusively AIM Engine outputs validated here.
- Speed and response time must never appear as inputs to mastery, level,
  difficulty, or frustration fields anywhere in this module.
- No secrets, service-role keys, database credentials, or AI provider keys
  are referenced in this module.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum, StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator
from pydantic.alias_generators import to_camel

# ---------------------------------------------------------------------------
# Wire-format compatibility base (P5-076 contract fix)
# ---------------------------------------------------------------------------
#
# The Backend's AimResponseMapperService (P5-048) reads camelCase keys
# (backendRequestId, studentId, sessionId, contractVersion, generatedAt, ...)
# from the AIM Engine's response, per JavaScript/TypeScript convention.
# This schema's internal field names remain snake_case (Python convention).
#
# AimCamelCaseModel derives a camelCase alias for every field via
# alias_generator=to_camel. The analysis endpoint (P5-020,
# services/aim-engine/app/api/analysis.py) must serialize with
# model_dump(mode="json", by_alias=True) so the wire response actually uses
# these aliases — by_alias defaults to False in Pydantic, so omitting it
# would silently emit snake_case again.
#
# populate_by_name=True additionally lets internal code / tests construct
# instances by the literal snake_case field name.


class AimCamelCaseModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


# --- Skill state (P5-012) ---


class AimMasteryTrend(StrEnum):
    """Directional mastery trend since the prior persisted skill state."""

    IMPROVING = "improving"
    STABLE = "stable"
    DECLINING = "declining"
    INSUFFICIENT_DATA = "insufficient_data"


# --- Weakness records (P5-013) ---


class AimWeaknessSeverity(StrEnum):
    """Weakness severity tier.

    ``critical`` is Phase 5-only and extends the Phase 4
    ``emerging``/``developing`` vocabulary for sustained or blocking weakness.
    """

    EMERGING = "emerging"
    DEVELOPING = "developing"
    CRITICAL = "critical"


class AimWeaknessStatus(StrEnum):
    """Lifecycle status of a weakness instance."""

    OPEN = "open"
    IMPROVING = "improving"
    RESOLVED = "resolved"


# --- Difficulty decision (P5-014) ---


class AimDifficultyLevel(int, Enum):
    """Phase 0/1 locked 1–4 difficulty scale (shared with P5-010/P5-021)."""

    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4


class AimDifficultyRationale(StrEnum):
    """Coarse enum describing why a difficulty decision was made.

    Never a free-text explanation; fixed to avoid leaking algorithm internals.
    Speed and response time must never appear as a rationale value.
    """

    MASTERY_INCREASE = "mastery_increase"
    MASTERY_DECREASE = "mastery_decrease"
    CONSISTENT_PERFORMANCE = "consistent_performance"
    INSUFFICIENT_DATA_HOLD = "insufficient_data_hold"


# --- Recommendations (P5-015) ---


class AimRecommendationKind(StrEnum):
    """Category of action being recommended."""

    LESSON = "lesson"
    TARGETED_PRACTICE = "targeted_practice"
    REVIEW_SESSION = "review_session"


class AimRecommendationReason(StrEnum):
    """Coarse enum describing why a recommendation was produced."""

    ADDRESSES_WEAKNESS = "addresses_weakness"
    REINFORCES_RECENT_SKILL = "reinforces_recent_skill"
    NEXT_IN_SEQUENCE = "next_in_sequence"
    REVIEW_DUE = "review_due"


# --- Session summary (P5-017) ---


class AimMasteryShiftDirection(StrEnum):
    """Coarse directional summary of mastery change across the session."""

    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"
    MIXED = "mixed"


class AimFrustrationLevel(StrEnum):
    """Educational-only frustration signal.

    Not a clinical or psychological assessment.  Must never be presented,
    logged, or treated as a mental-health diagnosis.
    """

    NONE = "none"
    LOW = "low"
    MODERATE = "moderate"
    ELEVATED = "elevated"


class AimEngagementLevel(StrEnum):
    """Educational-only engagement signal."""

    LOW = "low"
    TYPICAL = "typical"
    HIGH = "high"


class AimSignalBasis(StrEnum):
    """Coarse evidence category contributing to behavioral signal levels.

    Fixed enum to avoid leaking algorithm internals or implying a diagnostic
    methodology.
    """

    REPEATED_INCORRECT_STREAK = "repeated_incorrect_streak"
    INCREASED_HESITATION = "increased_hesitation"
    INCREASED_RETRY_RATE = "increased_retry_rate"
    SESSION_ABANDONMENT_PATTERN = "session_abandonment_pattern"
    SUSTAINED_CORRECT_STREAK = "sustained_correct_streak"


# ---------------------------------------------------------------------------
# Category output models
# ---------------------------------------------------------------------------


class AimSkillStateOutput(AimCamelCaseModel):
    """AIM Engine's mastery estimate for one student/skill pair (P5-012).

    ``mastery_score`` is the sole source of mastery truth for this skill.
    It must never be recomputed or adjusted by the Backend.
    Speed and response time must never feed into any field here.
    """

    skill_id: str = Field(
        ...,
        description="Skill key from the curriculum taxonomy.",
    )
    mastery_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "AIM Engine mastery estimate (0.00–1.00). Sole authority; never computed elsewhere."
        ),
    )
    mastery_confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description=(
            "AIM Engine confidence in mastery_score (0.00–1.00). "
            "Descriptive context; low confidence does not reduce mastery_score's authority."
        ),
    )
    mastery_trend: AimMasteryTrend = Field(
        ...,
        description="Directional trend since the prior persisted skill state.",
    )
    attempts_considered_count: int = Field(
        ...,
        ge=0,
        description=(
            "Attempts considered for this evaluation (evidence window, not lifetime total)."
        ),
    )
    last_attempt_id: str = Field(
        ...,
        description="Most recent attempt UUID that informed this evaluation.",
    )
    evaluated_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the AIM Engine produced this evaluation.",
    )


class AimWeaknessRecordOutput(AimCamelCaseModel):
    """AIM Engine's identification of a skill weakness instance (P5-013).

    ``severity`` and ``status`` are exclusively AIM Engine outputs.
    ``weakness_id`` is stable across updates to the same instance.
    A resolved weakness that recurs is issued a new ``weakness_id``.
    """

    weakness_id: str = Field(
        ...,
        description="Stable UUID for this weakness instance, issued by the AIM Engine.",
    )
    skill_id: str = Field(
        ...,
        description="Skill key this weakness applies to.",
    )
    severity: AimWeaknessSeverity = Field(
        ...,
        description="Current severity tier.",
    )
    status: AimWeaknessStatus = Field(
        ...,
        description="Lifecycle status of the weakness instance.",
    )
    trigger_attempt_ids: list[str] = Field(
        ...,
        min_length=1,
        description="Attempt UUIDs contributing evidence to this weakness on this call.",
    )
    detected_at: datetime = Field(
        ...,
        description=(
            "ISO-8601 UTC timestamp of when this weakness was first detected. "
            "Stable across updates."
        ),
    )
    resolved_at: datetime | None = Field(
        None,
        description="Set when status transitions to resolved. None while open or improving.",
    )

    @model_validator(mode="after")
    def resolved_at_only_when_resolved(self) -> AimWeaknessRecordOutput:
        if self.status == AimWeaknessStatus.RESOLVED and self.resolved_at is None:
            raise ValueError("resolved_at must be set when status is 'resolved'")
        if self.status != AimWeaknessStatus.RESOLVED and self.resolved_at is not None:
            raise ValueError("resolved_at must be None when status is not 'resolved'")
        return self


class AimDifficultyDecisionOutput(AimCamelCaseModel):
    """AIM Engine's decision on the next item difficulty for a skill (P5-014).

    ``next_difficulty`` governs the next presented item for the skill.
    The Backend validates the one-step constraint before persistence.
    Speed and response time must never enter difficulty logic at any layer.
    """

    decision_id: str = Field(
        ...,
        description="AIM-Engine-issued UUID for this decision instance.",
    )
    skill_id: str = Field(
        ...,
        description="Skill this difficulty decision applies to.",
    )
    next_difficulty: AimDifficultyLevel = Field(
        ...,
        description=(
            "Difficulty level for the student's next presented item for this skill. "
            "Exclusively an AIM Engine output."
        ),
    )
    previous_difficulty: AimDifficultyLevel = Field(
        ...,
        description=(
            "Difficulty level in effect immediately before this decision, for traceability."
        ),
    )
    rationale: AimDifficultyRationale = Field(
        ...,
        description=(
            "Coarse mastery-driven category for why this decision was made. "
            "Never references response time or speed."
        ),
    )
    based_on_attempt_ids: list[str] = Field(
        ...,
        min_length=1,
        description="Attempt UUIDs that informed this decision.",
    )
    decided_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the AIM Engine made this decision.",
    )

    @model_validator(mode="after")
    def step_constraint(self) -> AimDifficultyDecisionOutput:
        """Enforce the one-step change constraint at the schema level.

        |next_difficulty - previous_difficulty| <= 1
        The Backend also validates this independently before persistence.
        """
        if abs(self.next_difficulty.value - self.previous_difficulty.value) > 1:
            raise ValueError(
                f"Difficulty step constraint violated: "
                f"next={self.next_difficulty.value}, "
                f"previous={self.previous_difficulty.value}. "
                f"|next - previous| must be <= 1."
            )
        return self


class AimRecommendationOutput(AimCamelCaseModel):
    """AIM Engine's ranked recommendation for what to do next (P5-015).

    Always references existing curriculum content; never generates new content.
    ``rank`` must be unique within a single response's recommendations array.
    ``status`` (active/superseded/expired/dismissed) is backend-managed,
    not present on the wire.
    """

    recommendation_id: str = Field(
        ...,
        description="AIM-Engine-issued UUID for this recommendation instance.",
    )
    kind: AimRecommendationKind = Field(
        ...,
        description="Category of action being recommended.",
    )
    target_skill_id: str = Field(
        ...,
        description="Skill the recommendation targets.",
    )
    target_lesson_id: str | None = Field(
        None,
        description=(
            "Specific lesson UUID when kind=lesson. "
            "None for kinds that do not reference a single lesson."
        ),
    )
    rank: int = Field(
        ...,
        ge=1,
        description="Position in the ranked set (1 = top). Unique within one response.",
    )
    reason: AimRecommendationReason = Field(
        ...,
        description="Coarse category describing why this recommendation was produced.",
    )
    based_on_weakness_id: str | None = Field(
        None,
        description=(
            "References a weakness_records id when reason=addresses_weakness. None otherwise."
        ),
    )
    generated_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the AIM Engine generated this recommendation.",
    )
    expires_at: datetime | None = Field(
        None,
        description=(
            "When this recommendation is no longer current. None means no explicit expiry."
        ),
    )

    @model_validator(mode="after")
    def lesson_id_required_for_lesson_kind(self) -> AimRecommendationOutput:
        if self.kind == AimRecommendationKind.LESSON and self.target_lesson_id is None:
            raise ValueError("target_lesson_id is required when kind is 'lesson'")
        return self

    @model_validator(mode="after")
    def weakness_id_required_for_addresses_weakness(self) -> AimRecommendationOutput:
        if (
            self.reason == AimRecommendationReason.ADDRESSES_WEAKNESS
            and self.based_on_weakness_id is None
        ):
            raise ValueError("based_on_weakness_id is required when reason is 'addresses_weakness'")
        return self

    @model_validator(mode="after")
    def expires_at_after_generated_at(self) -> AimRecommendationOutput:
        if self.expires_at is not None and self.expires_at <= self.generated_at:
            raise ValueError("expires_at must be after generated_at")
        return self


class AimReviewScheduleOutput(AimCamelCaseModel):
    """AIM Engine's spaced-repetition scheduling decision for a skill (P5-016).

    ``due_at``, ``interval_days``, and ``repetition_count`` are exclusively
    AIM Engine outputs; the Backend never recomputes them.
    ``status`` (pending/due/completed/rescheduled) is backend-managed,
    not present on the wire.
    """

    schedule_id: str = Field(
        ...,
        description=(
            "Stable UUID for this review schedule instance. "
            "Persists across reschedules of the same spaced-repetition item."
        ),
    )
    skill_id: str = Field(
        ...,
        description="Skill this review schedule applies to.",
    )
    due_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the skill is next due for review.",
    )
    interval_days: float = Field(
        ...,
        gt=0,
        description=(
            "Interval in days between prior event and due_at. "
            "Informational; the Backend does not use it to recompute due_at."
        ),
    )
    repetition_count: int = Field(
        ...,
        ge=0,
        description=(
            "Number of successful spaced-repetition cycles completed so far. "
            "0 on the first-ever schedule for a skill."
        ),
    )
    based_on_attempt_id: str = Field(
        ...,
        description="Most recent attempt UUID that triggered this scheduling decision.",
    )
    scheduled_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the AIM Engine made this scheduling decision.",
    )


class AimSessionBehavioralSignal(AimCamelCaseModel):
    """Educational behavioral interpretation for a session (P5-017).

    ``frustration_level`` and ``engagement_level`` are coarse educational
    signals only — never clinical or psychological assessments.
    Speed and response time may contribute indirectly via ``signal_basis``
    categories (e.g. increased_hesitation) but are never stored as raw timing
    values here.
    """

    frustration_level: AimFrustrationLevel = Field(
        ...,
        description=(
            "Coarse educational-only frustration signal. "
            "Not a clinical or psychological assessment."
        ),
    )
    engagement_level: AimEngagementLevel = Field(
        ...,
        description="Coarse educational-only engagement signal.",
    )
    signal_basis: list[AimSignalBasis] = Field(
        default_factory=list,
        description=(
            "Coarse evidence categories that contributed to the levels above. "
            "Fixed enum list; never a free-text explanation."
        ),
    )


class AimSessionSummaryOutput(AimCamelCaseModel):
    """AIM Engine's closing snapshot for a learning session (P5-017).

    At most one summary per session. ``overall_mastery_shift`` is descriptive
    only; authoritative per-skill values remain in student_skill_states
    (P5-012). ``behavioral_signal`` carries frustration and engagement.
    """

    session_id: str = Field(
        ...,
        description="Must match the sessionId from the originating session input segment.",
    )
    items_attempted: int = Field(
        ...,
        ge=0,
        description="Total items attempted in the session as of this summary.",
    )
    items_correct: int = Field(
        ...,
        ge=0,
        description="Total items answered correctly in the session.",
    )
    skills_touched: list[str] = Field(
        default_factory=list,
        description="Distinct skill keys involved in the session (may be empty).",
    )
    overall_mastery_shift: AimMasteryShiftDirection = Field(
        ...,
        description=(
            "Coarse directional summary of mastery change across skills_touched. "
            "Descriptive only; per-skill authority stays in student_skill_states."
        ),
    )
    behavioral_signal: AimSessionBehavioralSignal = Field(
        ...,
        description="Educational behavioral interpretation for the session.",
    )
    closed_out_at: datetime = Field(
        ...,
        description=(
            "ISO-8601 UTC timestamp of when the AIM Engine determined the session "
            "reached a close-out point."
        ),
    )

    @model_validator(mode="after")
    def items_correct_le_attempted(self) -> AimSessionSummaryOutput:
        if self.items_correct > self.items_attempted:
            raise ValueError("items_correct must be <= items_attempted")
        return self


# ---------------------------------------------------------------------------
# Response categories container
# ---------------------------------------------------------------------------


class AimResponseCategories(AimCamelCaseModel):
    """Container for all decision categories in the AIM Engine response (P5-011).

    Every field is optional.  An empty categories object (no fields present)
    is a valid response meaning "no new decisions for this call."
    A missing category means "unchanged," not "reset."
    """

    skill_state: list[AimSkillStateOutput] | None = Field(
        None,
        description=(
            "Per-skill mastery updates (P5-012). Array; one entry per skill updated in this call."
        ),
    )
    weakness_records: list[AimWeaknessRecordOutput] | None = Field(
        None,
        description=(
            "Weakness instance updates (P5-013). "
            "Array; may surface, update, or resolve multiple weaknesses."
        ),
    )
    difficulty_decision: AimDifficultyDecisionOutput | None = Field(
        None,
        description=("Next-item difficulty decision (P5-014). Singular; at most one per call."),
    )
    recommendations: list[AimRecommendationOutput] | None = Field(
        None,
        description=(
            "Ranked recommendations (P5-015). "
            "Treated as the complete current set; replaces prior active set on persistence."
        ),
    )
    review_schedule: list[AimReviewScheduleOutput] | None = Field(
        None,
        description=(
            "Spaced-repetition schedule updates (P5-016). "
            "Array; may schedule reviews for multiple skills."
        ),
    )
    session_summary: AimSessionSummaryOutput | None = Field(
        None,
        description=(
            "Session close-out snapshot (P5-017). "
            "Singular; produced only when the session reaches a natural close-out point."
        ),
    )

    @model_validator(mode="after")
    def recommendation_ranks_unique(self) -> AimResponseCategories:
        """Ranks within a single response's recommendations array must be unique."""
        if self.recommendations:
            ranks = [r.rank for r in self.recommendations]
            if len(ranks) != len(set(ranks)):
                raise ValueError(
                    "recommendation rank values must be unique within a single response"
                )
        return self


# ---------------------------------------------------------------------------
# Top-level response envelope
# ---------------------------------------------------------------------------


class AimAnalysisResponse(AimCamelCaseModel):
    """Top-level response envelope for POST /aim/v1/analysis (P5-022).

    The AIM Engine sends this to the Backend.  The Backend validates every
    field before persisting any category (Stage 5 of the pipeline).

    Correlation rules (enforced by the Backend's response validation service):
    - ``backend_request_id`` must echo the originating request's id.
    - ``student_id`` must match the originating session segment's studentId.
    - ``session_id`` must match the originating session segment's sessionId.
    Any mismatch is a contract violation; the entire response is rejected.

    This envelope is never forwarded to clients.  Clients receive only
    backend-persisted, permission-checked projections through separate APIs.
    """

    backend_request_id: str = Field(
        ...,
        description=(
            "Echoes the backendRequestId from the originating request. "
            "Used by the Backend for correlation and idempotency validation."
        ),
    )
    contract_version: str = Field(
        ...,
        description="Contract version the AIM Engine used to produce this response.",
    )
    student_id: str = Field(
        ...,
        description=(
            "Must match the studentId from the originating session segment. "
            "Backend rejects any response where this does not match."
        ),
    )
    session_id: str = Field(
        ...,
        description=(
            "Must match the sessionId from the originating session segment. "
            "Backend rejects any response where this does not match."
        ),
    )
    generated_at: datetime = Field(
        ...,
        description="ISO-8601 UTC timestamp of when the AIM Engine produced this response.",
    )
    categories: AimResponseCategories = Field(
        ...,
        description=(
            "Container for all decision categories. "
            "May contain any subset, including none (empty categories is valid)."
        ),
    )
