"""AIM Engine analysis pipeline entrypoint — P5-023.

This module implements the Python-side pipeline entrypoint that the
``POST /aim/v1/analysis`` route (P5-020) delegates to via
``app.state.aim_pipeline``.

Responsibility:
  Accept a validated ``AimAnalysisRequest``, coordinate the AIM Engine's
  internal analysis stages, and return a structured ``AimAnalysisResponse``.

Phase 5 scope:
  The pipeline coordinates stages and enforces the authority rules defined in
  the contract documents.  Concrete adaptive-learning algorithms live in the
  domain services under ``app/domain/`` and ``packages/ai_core/``; they are
  called through the stage interfaces defined here.

  This entrypoint intentionally does NOT:
  - Write to any database (the AIM Engine is side-effect-free per P5-006).
  - Accept mastery, level, weakness, difficulty, recommendations,
    review-schedule, retention, or frustration values from the caller.
  - Expose any AI Teacher behaviour.
  - Log raw request bodies, raw response bodies, or secrets.

Pipeline stages (AIM Engine side, mirrors the backend pipeline map):
  1. Request correlation   — extract correlation ids, stamp generated_at.
  2. Category dispatch     — run each analysis category against the request.
  3. Response assembly     — assemble the AimAnalysisResponse envelope.

Each stage is a separate private method to keep concerns isolated and to allow
downstream tasks (P5-024 input validation, P5-025 safe failure) to augment
individual stages without restructuring the entrypoint.

No secrets, service-role keys, database credentials, or AI provider keys are
referenced in this module.
"""

from __future__ import annotations

import logging
import math
import os
import sys
import uuid
from datetime import UTC, datetime, timedelta
from typing import Protocol, runtime_checkable

# Add the API domain services to the import path so aim.domain.services is importable.
_API_SRC = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "api", "src"))
if _API_SRC not in sys.path:
    sys.path.insert(0, _API_SRC)

from aim.domain.services.difficulty_adapter import DifficultyAction, DifficultyAdapter  # noqa: E402
from aim.domain.services.emotional_state_detector import (  # noqa: E402
    EmotionalAttempt,
    EmotionalStateDetector,
)
from aim.domain.services.mastery_calculator import (  # noqa: E402
    AttemptSnapshot,
    MasteryCalculator,
    MasteryResult,
    SkillState,
)
from aim.domain.services.recommendation_engine import (  # noqa: E402
    RecommendationActionType,
    RecommendationAttempt,
    RecommendationContext,
    RecommendationEngine,
    RecommendationSkillState,
)
from aim.domain.services.retention_tracker import (  # noqa: E402
    RetentionSkillState,
    RetentionTracker,
)
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector  # noqa: E402

from app.schemas.aim_analysis_request import (  # noqa: E402
    AimAnalysisRequest,
    AimAttemptInput,
    AimSessionInput,
    AimSkillMasteryContext,
)
from app.schemas.aim_analysis_response import (  # noqa: E402
    AimAnalysisResponse,
    AimDifficultyDecisionOutput,
    AimDifficultyLevel,
    AimDifficultyRationale,
    AimEngagementLevel,
    AimFrustrationLevel,
    AimMasteryShiftDirection,
    AimMasteryTrend,
    AimRecommendationKind,
    AimRecommendationOutput,
    AimRecommendationReason,
    AimResponseCategories,
    AimReviewScheduleOutput,
    AimSessionBehavioralSignal,
    AimSessionSummaryOutput,
    AimSignalBasis,
    AimSkillStateOutput,
    AimWeaknessRecordOutput,
    AimWeaknessSeverity,
    AimWeaknessStatus,
)
from app.validation.aim_request_validator import (  # noqa: E402
    AimRequestValidationError,
    AimRequestValidator,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# RecommendationActionType -> (AimRecommendationKind, AimRecommendationReason)
# (P20-009)
#
# recommendations.kind and recommendations.reason are locked by live Postgres
# CHECK constraints (recommendations_kind_check: lesson/targeted_practice/
# review_session; recommendations_reason_check: addresses_weakness/
# reinforces_recent_skill/next_in_sequence/review_due — confirmed via
# Supabase, not assumed) predating this task. The ported engine's 12 action
# types are mapped onto that fixed vocabulary rather than expanding the
# schema, which is out of this task's scope. `kind=lesson` is never produced
# here because it requires a real target_lesson_id the AIM Engine has no
# source for. TRIGGER_TUTOR_INTERVENTION has no entry — handled separately
# in `_generate_recommendations` since no recommendation category fits it.
# ---------------------------------------------------------------------------

_ACTION_TYPE_TO_KIND_REASON: dict[
    RecommendationActionType, tuple[AimRecommendationKind, AimRecommendationReason]
] = {
    RecommendationActionType.COLLECT_MORE_EVIDENCE: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
    RecommendationActionType.EASY_WIN: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
    RecommendationActionType.REVIEW_PREREQUISITE: (
        AimRecommendationKind.REVIEW_SESSION,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
    RecommendationActionType.RETEACH_CONCEPT: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.ADDRESSES_WEAKNESS,
    ),
    RecommendationActionType.TARGETED_PRACTICE: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.ADDRESSES_WEAKNESS,
    ),
    RecommendationActionType.SPACED_REVIEW: (
        AimRecommendationKind.REVIEW_SESSION,
        AimRecommendationReason.REVIEW_DUE,
    ),
    RecommendationActionType.CONFIDENCE_BUILDER: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
    RecommendationActionType.REFLECTION_PRACTICE: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
    RecommendationActionType.MIXED_PRACTICE: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.REINFORCES_RECENT_SKILL,
    ),
    RecommendationActionType.INCREASE_DIFFICULTY: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.REINFORCES_RECENT_SKILL,
    ),
    RecommendationActionType.CONTINUE_CURRENT_SKILL: (
        AimRecommendationKind.TARGETED_PRACTICE,
        AimRecommendationReason.NEXT_IN_SEQUENCE,
    ),
}


# ---------------------------------------------------------------------------
# MasteryCalculator adapters (P20-007)
#
# MasteryCalculator was written against a repository-injection pattern
# (query history, persist the result). The AIM Engine is side-effect-free —
# it never queries or writes to any database (see module docstring) — so
# these adapters satisfy MasteryCalculator's Protocol contracts using only
# data already present in the validated request. ``update_mastery`` is a
# deliberate no-op: the Backend, not the AIM Engine, persists mastery_score
# via AimPersistenceService after this response is validated.
# ---------------------------------------------------------------------------


class _RequestAttemptSnapshotRepository:
    """Read-only AttemptSnapshotRepository backed by request-supplied history."""

    def __init__(self, attempts_by_skill: dict[str, list[AttemptSnapshot]]) -> None:
        self._attempts_by_skill = attempts_by_skill

    def get_attempts(
        self, student_id: object, skill_id: str, limit: int | None = None
    ) -> list[AttemptSnapshot]:
        attempts = self._attempts_by_skill.get(skill_id, [])
        return attempts[-limit:] if limit else attempts


class _RequestSkillStateRepository:
    """SkillStateRepository backed by request-supplied prior mastery/retention.

    ``update_mastery`` intentionally does nothing — the AIM Engine must never
    write to any database (P5-006). The returned mastery_score is persisted
    by the Backend's AimPersistenceService after response validation.
    """

    def __init__(
        self,
        previous_mastery_by_skill: dict[str, float],
        retention_by_skill: dict[str, float],
    ) -> None:
        self._previous_mastery_by_skill = previous_mastery_by_skill
        self._retention_by_skill = retention_by_skill

    def get_skill_state(self, student_id: object, skill_id: str) -> SkillState | None:
        if skill_id not in self._previous_mastery_by_skill:
            return None
        return SkillState(
            # Real forgetting-curve retention (P20-008, RetentionTracker), not
            # a hardcode — see _compute_retention.
            retention=self._retention_by_skill.get(skill_id, 100.0),
            # confidence unused by MasteryCalculator.calculate(); kept for the dataclass contract.
            confidence=0.0,
            mastery=self._previous_mastery_by_skill[skill_id],
        )

    def update_mastery(self, student_id: object, skill_id: str, mastery: float) -> None:
        return None


# ---------------------------------------------------------------------------
# RetentionTracker adapters (P20-008)
#
# Same rationale as the MasteryCalculator adapters above: RetentionTracker
# was written against a repository-injection pattern that reads and writes
# persisted state. The AIM Engine stays side-effect-free, so this adapter
# satisfies RetentionRepository using only request-supplied data, and every
# write method is a deliberate no-op.
# ---------------------------------------------------------------------------


class _RequestRetentionRepository:
    """RetentionRepository backed by a single request-supplied prior state."""

    def __init__(self, state: RetentionSkillState | None) -> None:
        self._state = state

    def get_skill_state(self, student_id: object, skill_id: str) -> RetentionSkillState | None:
        return self._state

    def get_student_skill_states(self, student_id: object) -> list[RetentionSkillState]:
        return [self._state] if self._state is not None else []

    def update_retention(
        self, student_id: object, skill_id: str, retention: float, is_due: bool
    ) -> None:
        return None

    def update_lambda(
        self,
        student_id: object,
        skill_id: str,
        retention_lambda: float,
        retention_history: object,
    ) -> None:
        return None

    def update_review_progress(self, student_id: object, skill_id: str, **kwargs: object) -> None:
        return None

    def upsert_schedule(self, student_id: object, skill_id: str, **kwargs: object) -> None:
        return None


# ---------------------------------------------------------------------------
# RecommendationEngine adapter (P20-009)
#
# RecommendationEngine's own dependencies (SkillGraph, ConfidenceMatrix,
# ErrorPatternClassifier, MicroGoalGenerator, ContextualMemory) are all
# stateless or backed only by a bundled static file / a fresh in-process
# dict per instance — none of them write to a database, so RecommendationEngine
# itself can be constructed fresh per request with no adapter needed for it.
# Only its RecommendationContextProvider needs one, since that's the one
# repository-injection seam RecommendationEngine's constructor requires.
# ---------------------------------------------------------------------------


class _RequestRecommendationContextProvider:
    """RecommendationContextProvider backed by a single request-built context."""

    def __init__(self, context: RecommendationContext) -> None:
        self._context = context

    def get_context(self, student_id: object) -> RecommendationContext:
        return self._context


def _ensure_domain_services_importable() -> None:
    """Add the API domain services source tree to sys.path once."""
    api_src = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "api", "src")
    )
    if api_src not in sys.path:
        sys.path.insert(0, api_src)


# ---------------------------------------------------------------------------
# Protocol — allows the route (P5-020) to depend on an interface, not the
# concrete class. Test doubles and future implementations satisfy this protocol.
# ---------------------------------------------------------------------------


@runtime_checkable
class AimAnalysisPipeline(Protocol):
    """Interface for the AIM Engine analysis pipeline entrypoint (P5-023).

    The POST /aim/v1/analysis route injects an implementation of this
    protocol through ``app.state.aim_pipeline``.

    Implementors must:
    - Accept only ``AimAnalysisRequest`` as input.
    - Return only ``AimAnalysisResponse`` as output.
    - Never write to any database.
    - Never expose secrets, provider keys, or raw payloads in logs.
    - Never compute mastery, level, weakness, difficulty, recommendations,
      review schedule, retention, or frustration outside the domain services
      designated by this pipeline.
    """

    async def run(self, request: AimAnalysisRequest) -> AimAnalysisResponse:
        """Run the AIM analysis pipeline for one request."""
        ...


# ---------------------------------------------------------------------------
# Concrete entrypoint
# ---------------------------------------------------------------------------


class AimAnalysisPipelineEntrypoint:
    """Concrete AIM Engine analysis pipeline entrypoint (P5-023).

    Coordinates the AIM Engine's internal analysis stages and returns a
    structured ``AimAnalysisResponse``.  Each stage is isolated in its own
    private method; stages that require real domain services will be wired in
    by downstream tasks.

    This implementation returns a structurally correct response with whatever
    categories the stage methods produce.  For Phase 5 initial wiring, stages
    that have not yet been connected to real domain services return ``None``
    (absent category), consistent with the ``AimResponseCategories`` optionality
    rule: a missing category means "no new decision this call," not an error.
    """

    def __init__(self) -> None:
        self._validator = AimRequestValidator()
        self._weakness_detector = WeaknessDetector()
        self._difficulty_adapter = DifficultyAdapter()
        self._emotional_detector = EmotionalStateDetector()

    async def run(self, request: AimAnalysisRequest) -> AimAnalysisResponse:
        """Execute all pipeline stages and return the assembled response.

        Raises ``AimRequestValidationError`` (P5-024) before any category
        dispatch when the request fails AIM Engine-side semantic validation.

        Audit metadata (never raw bodies or secrets) is logged at start and
        end, consistent with the audit-surface rules in aim-engine-api-map.md.
        """
        generated_at = datetime.now(UTC)

        validation_result = self._validator.validate(request)
        if not validation_result.is_valid:
            raise AimRequestValidationError(validation_result)

        logger.info(
            "aim_pipeline_started",
            extra={
                "backend_request_id": request.backend_request_id,
                "student_id": request.session.student_id,
                "session_id": request.session.session_id,
                "attempt_count": len(request.attempts),
            },
        )

        categories = await self._dispatch_categories(request)

        response = AimAnalysisResponse(
            backend_request_id=request.backend_request_id,
            contract_version=request.session.contract_version,
            student_id=request.session.student_id,
            session_id=request.session.session_id,
            generated_at=generated_at,
            categories=categories,
        )

        logger.info(
            "aim_pipeline_completed",
            extra={
                "backend_request_id": request.backend_request_id,
                "student_id": request.session.student_id,
                "session_id": request.session.session_id,
                "categories_present": [
                    k for k, v in categories.model_dump().items() if v is not None
                ],
            },
        )

        return response

    # -----------------------------------------------------------------------
    # Stage: category dispatch
    # -----------------------------------------------------------------------

    async def _dispatch_categories(self, request: AimAnalysisRequest) -> AimResponseCategories:
        """Dispatch each response category to its analysis stage.

        Each category method is independent.  A None return means "no decision
        produced for this category on this call" — valid and expected during
        early pipeline wiring.  Categories are never reset to zero by absence;
        the Backend treats absence as "unchanged" per the response contract.

        Real domain-service calls will be wired here by downstream tasks
        (P5-056 through P5-063 for the actual adaptive logic).
        """
        # Computed once and shared: the difficulty decision (P20-008) reuses
        # MasteryCalculator's consistency_score instead of a second,
        # possibly-inconsistent definition of "consistency".
        mastery_results = self._compute_mastery_results(
            request.session, request.attempts, request.skill_mastery_context
        )

        weakness_records = await self._analyze_weakness_records(request.session, request.attempts)

        return AimResponseCategories(
            skill_state=await self._analyze_skill_state(request.attempts, mastery_results),
            weakness_records=weakness_records,
            difficulty_decision=await self._decide_difficulty(
                request.session, request.attempts, mastery_results, request.skill_mastery_context
            ),
            recommendations=await self._generate_recommendations(
                request.session,
                request.attempts,
                mastery_results,
                request.skill_mastery_context,
                weakness_records,
            ),
            review_schedule=await self._compute_review_schedule(
                request.session, request.attempts, request.skill_mastery_context
            ),
            session_summary=await self._summarize_session(request.session, request.attempts),
        )

    # -----------------------------------------------------------------------
    # Shared mastery computation (P20-007/P20-008)
    # -----------------------------------------------------------------------

    def _compute_mastery_results(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
        skill_mastery_context: dict[str, AimSkillMasteryContext],
    ) -> dict[str, MasteryResult]:
        """Run the real weighted mastery formula (P20-007) once per skill
        touched in this call, feeding it the real forgetting-curve retention
        estimate (P20-008) instead of a hardcode. Shared by the skill-state
        and difficulty-decision stages so they never disagree.
        """
        skill_attempts: dict[str, list[AimAttemptInput]] = {}
        for attempt in attempts:
            for sid in attempt.skill_ids:
                skill_attempts.setdefault(sid, []).append(attempt)

        results: dict[str, MasteryResult] = {}
        for skill_id, skill_atts in skill_attempts.items():
            context = skill_mastery_context.get(skill_id)
            retention = self._compute_retention(skill_id, context)

            # Prior history (oldest first) + this call's new attempt(s), so
            # MasteryCalculator sees the full evidence set, not just history.
            history_snapshots = [
                AttemptSnapshot(
                    is_correct=prior.is_correct,
                    attempts=prior.attempt_number_for_item,
                    difficulty=int(prior.presented_difficulty),
                    skip=prior.skip,
                    hint_used=prior.used_hint,
                )
                for prior in (context.recent_attempts if context else [])
            ]
            current_snapshots = [
                AttemptSnapshot(
                    is_correct=a.is_correct,
                    attempts=a.attempt_number_for_item,
                    difficulty=int(a.presented_difficulty),
                    skip=False,
                    hint_used=a.behavioral_context.used_hint,
                )
                for a in skill_atts
            ]

            attempt_repo = _RequestAttemptSnapshotRepository(
                {skill_id: history_snapshots + current_snapshots}
            )
            previous_mastery_by_skill = (
                {skill_id: context.previous_mastery_score}
                if context is not None and context.previous_mastery_score is not None
                else {}
            )
            state_repo = _RequestSkillStateRepository(
                previous_mastery_by_skill, {skill_id: retention}
            )

            calculator = MasteryCalculator(attempt_repo, state_repo)
            results[skill_id] = calculator.calculate(session.student_id, skill_id)

        return results

    # -----------------------------------------------------------------------
    # RetentionTracker helpers (P20-008)
    # -----------------------------------------------------------------------

    def _build_retention_state(
        self, skill_id: str, context: AimSkillMasteryContext | None
    ) -> RetentionSkillState | None:
        if context is None or context.previous_mastery_score is None:
            return None
        # RetentionTracker._current_time() returns a naive UTC datetime (its
        # own internal convention) and diffs it directly against
        # last_reviewed_at — a tz-aware value (as Pydantic parses our
        # ISO-8601 "Z" timestamps) would raise "can't subtract offset-naive
        # and offset-aware datetimes". Normalize to naive UTC to match.
        last_reviewed_at = (
            context.last_evaluated_at.astimezone(UTC).replace(tzinfo=None)
            if context.last_evaluated_at is not None
            else None
        )

        return RetentionSkillState(
            # student_id is unused by the ported retention math beyond
            # passthrough to the (no-op) repository — same pre-existing
            # int-typed Protocol mismatch as MasteryCalculator's (P20-007).
            student_id=0,
            skill_id=skill_id,
            mastery=context.previous_mastery_score,
            retention=context.previous_mastery_score,
            retention_lambda=None,
            last_reviewed_at=last_reviewed_at,
            category=context.category,
            retention_history=[
                {"timestamp": point.recorded_at.isoformat(), "mastery": point.mastery_score}
                for point in context.retention_history
            ],
        )

    def _compute_retention(self, skill_id: str, context: AimSkillMasteryContext | None) -> float:
        """Current forgetting-curve retention estimate for a skill (P20-008),
        replacing the hardcoded ``retention = 100.0``. Returns 100.0 (full
        retention — nothing to decay from yet) when there's no prior mastery
        for this skill, matching this pipeline's pre-P20-008 fallback.
        """
        state = self._build_retention_state(skill_id, context)
        if state is None:
            return 100.0

        tracker = RetentionTracker(_RequestRetentionRepository(state))
        try:
            result = tracker.calculate_current_retention(0, skill_id)
        except KeyError:
            return 100.0
        return result.retention

    def _compute_retention_lambda(
        self, skill_id: str, context: AimSkillMasteryContext | None
    ) -> float:
        """Category-appropriate default retention decay rate, or the
        personalized least-squares fit once at least 3 real history points
        exist (P20-008), replacing the hardcoded ``retention_lambda = 0.15``.
        """
        category = context.category if context else None
        history_points = context.retention_history if context else []

        if len(history_points) >= 3:
            history_dicts = [
                {"timestamp": point.recorded_at.isoformat(), "mastery": point.mastery_score}
                for point in history_points
            ]
            # _fit_lambda is a private method; reused directly here because it
            # is pure (no repository I/O) and is the only entry point for a
            # lambda fit without going through a state-mutating public method.
            return RetentionTracker(_RequestRetentionRepository(None))._fit_lambda(  # noqa: SLF001
                history_dicts
            )

        return RetentionTracker.default_lambda_for_category(category)

    # -----------------------------------------------------------------------
    # Category stages — wired to domain services
    # Speed and response-time fields must never feed mastery or difficulty here.
    # -----------------------------------------------------------------------

    async def _analyze_skill_state(
        self,
        attempts: list[AimAttemptInput],
        mastery_results: dict[str, MasteryResult],
    ) -> list[AimSkillStateOutput] | None:
        """Compute skill-state updates (P5-012) from the real weighted
        mastery formula (P20-007), ported from
        ``services/api/src/aim/domain/services/mastery_calculator.py``:
        ``accuracy*0.40 + consistency*0.20 + retention*0.15 +
        difficulty*0.20 + evidence_quality*0.05``, blended against previous
        mastery by a reliability factor and capped for one-session movement.
        Retention (P20-008) is a real forgetting-curve estimate, not a
        hardcode — see ``_compute_mastery_results``/``_compute_retention``.

        Mastery, confidence, and trend are exclusively AIM Engine outputs.
        Speed and response-time are behavioral context only and must never
        feed into mastery_score, mastery_confidence, or mastery_trend.
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        skill_attempts: dict[str, list[AimAttemptInput]] = {}
        for attempt in attempts:
            for sid in attempt.skill_ids:
                skill_attempts.setdefault(sid, []).append(attempt)

        results: list[AimSkillStateOutput] = []
        for skill_id, result in mastery_results.items():
            skill_atts = skill_attempts.get(skill_id, [])
            if not skill_atts:
                continue

            if result.valid_attempt_count < 3:
                trend = AimMasteryTrend.INSUFFICIENT_DATA
            elif result.final_mastery > result.previous_mastery:
                trend = AimMasteryTrend.IMPROVING
            elif result.final_mastery < result.previous_mastery:
                trend = AimMasteryTrend.DECLINING
            else:
                trend = AimMasteryTrend.STABLE

            results.append(
                AimSkillStateOutput(
                    skill_id=skill_id,
                    # MasteryCalculator's scale is 0-100; the response contract is 0.00-1.00.
                    mastery_score=round(result.final_mastery / 100.0, 4),
                    mastery_confidence=round(result.reliability, 4),
                    mastery_trend=trend,
                    attempts_considered_count=result.attempt_count,
                    last_attempt_id=skill_atts[-1].attempt_id,
                    evaluated_at=now,
                )
            )

        return results if results else None

    async def _analyze_weakness_records(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
    ) -> list[AimWeaknessRecordOutput] | None:
        """Detect or update weakness records (P5-013).

        Severity and status are exclusively AIM Engine outputs.
        The critical tier is Phase 5-only and never produced by the backend.
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        weakness_attempts = [
            WeaknessAttempt(
                student_id=int(session.student_id) if session.student_id.isdigit() else 0,
                skill_id=attempt.skill_ids[0],
                is_correct=attempt.is_correct,
                difficulty=attempt.presented_difficulty.value,
                skip=attempt.behavioral_context.abandoned_first_then_retried,
                hint_used=attempt.behavioral_context.used_hint,
                attempts=attempt.attempt_number_for_item,
            )
            for attempt in attempts
            if attempt.skill_ids
        ]

        if not weakness_attempts:
            return None

        skill_weaknesses = self._weakness_detector.calculate_by_skill(weakness_attempts)
        attempt_ids_by_skill: dict[str, list[str]] = {}
        for attempt in attempts:
            for sid in attempt.skill_ids:
                attempt_ids_by_skill.setdefault(sid, []).append(attempt.attempt_id)

        severity_map = {
            "low": AimWeaknessSeverity.EMERGING,
            "medium": AimWeaknessSeverity.DEVELOPING,
            "high": AimWeaknessSeverity.CRITICAL,
        }

        results: list[AimWeaknessRecordOutput] = []
        for sw in skill_weaknesses:
            if sw.weakness_score < 10.0:
                continue
            trigger_ids = attempt_ids_by_skill.get(sw.skill_id, [])
            if not trigger_ids:
                continue
            results.append(
                AimWeaknessRecordOutput(
                    weakness_id=str(uuid.uuid4()),
                    skill_id=sw.skill_id,
                    severity=severity_map.get(sw.severity, AimWeaknessSeverity.EMERGING),
                    status=AimWeaknessStatus.OPEN,
                    trigger_attempt_ids=trigger_ids,
                    detected_at=now,
                    resolved_at=None,
                )
            )

        return results if results else None

    async def _decide_difficulty(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
        mastery_results: dict[str, MasteryResult],
        skill_mastery_context: dict[str, AimSkillMasteryContext],
    ) -> AimDifficultyDecisionOutput | None:
        """Decide next-item difficulty (P5-014).

        next_difficulty is exclusively an AIM Engine output.
        Speed and response-time must never enter difficulty logic at any stage.
        The one-step change constraint (|next - previous| <= 1) is enforced
        at the schema level (P5-022) and must be respected by any domain
        service wired here.

        ``consistency`` (P20-008) reuses MasteryCalculator's consistency_score
        for the same skill rather than a second, independently-computed
        definition. ``retention`` (P20-008) reuses the same real
        forgetting-curve estimate fed into that same mastery computation.
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        valid = [a for a in attempts if not a.behavioral_context.abandoned_first_then_retried]
        if not valid:
            return None

        total = len(valid)
        correct = sum(1 for a in valid if a.is_correct)
        accuracy = (correct / total) * 100.0 if total > 0 else 0.0
        current_diff = valid[-1].presented_difficulty.value
        reliability = min(1.0, total / 10.0)

        primary_skill_id = attempts[0].skill_ids[0] if attempts[0].skill_ids else None
        mastery_result = mastery_results.get(primary_skill_id) if primary_skill_id else None
        consistency = mastery_result.consistency_score if mastery_result else 100.0
        retention = (
            self._compute_retention(primary_skill_id, skill_mastery_context.get(primary_skill_id))
            if primary_skill_id
            else 100.0
        )

        weakness_score = (1.0 - correct / total) * 100.0 if total > 0 else 0.0
        frustration_score = min(100.0, session.behavioral_context.consecutive_incorrect * 20.0)

        decision = self._difficulty_adapter.decide(
            mastery=accuracy,
            consistency=consistency,
            current_difficulty=min(5, max(1, current_diff)),
            reliability=reliability,
            weakness_score=weakness_score,
            frustration_score=frustration_score,
            retention=retention,
            repeated_failure_count=session.behavioral_context.consecutive_incorrect,
        )

        action_rationale = {
            DifficultyAction.INCREASE: AimDifficultyRationale.MASTERY_INCREASE,
            DifficultyAction.DECREASE: AimDifficultyRationale.MASTERY_DECREASE,
            DifficultyAction.MAINTAIN: AimDifficultyRationale.CONSISTENT_PERFORMANCE,
        }

        next_diff = max(1, min(4, decision.target_difficulty))
        prev_diff = max(1, min(4, current_diff))
        if abs(next_diff - prev_diff) > 1:
            next_diff = prev_diff

        return AimDifficultyDecisionOutput(
            decision_id=str(uuid.uuid4()),
            skill_id=attempts[0].skill_ids[0] if attempts[0].skill_ids else "unknown",
            next_difficulty=AimDifficultyLevel(next_diff),
            previous_difficulty=AimDifficultyLevel(prev_diff),
            rationale=action_rationale.get(
                decision.action, AimDifficultyRationale.INSUFFICIENT_DATA_HOLD
            ),
            based_on_attempt_ids=[a.attempt_id for a in valid],
            decided_at=now,
        )

    async def _generate_recommendations(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
        mastery_results: dict[str, MasteryResult],
        skill_mastery_context: dict[str, AimSkillMasteryContext],
        weakness_records: list[AimWeaknessRecordOutput] | None,
    ) -> list[AimRecommendationOutput] | None:
        """Generate the highest-priority recommendation (P5-015) using the
        real 12-action recommendation cascade (P20-009), ported from
        ``services/api/src/aim/domain/services/recommendation_engine.py``.

        Recommendations reference existing curriculum content only; they
        never generate new content and never embed AI Teacher framing.

        This replaces the old per-skill if/elif with a single top-priority
        decision from ``RecommendationEngine.get_next_action()`` — that
        engine picks *the* next best action across all signals, not an
        independent guess per skill, so this method now returns at most one
        recommendation (rank=1) instead of one per skill touched.

        The engine's 12-value ``RecommendationActionType`` is mapped onto
        the existing 3-value ``AimRecommendationKind`` / 4-value
        ``AimRecommendationReason`` enums, both of which are enforced by a
        live Postgres CHECK constraint on the `recommendations` table
        (confirmed via Supabase, not assumed) — introducing new wire values
        would fail every insert, so this is a deliberate, lossy-but-safe
        mapping, not an oversight. See the module-level
        ``_ACTION_TYPE_TO_KIND_REASON`` table and ``_map_recommendation``.
        """
        if not attempts or not mastery_results:
            return None

        now = datetime.now(UTC)
        context = self._build_recommendation_context(
            session, attempts, mastery_results, skill_mastery_context
        )
        provider = _RequestRecommendationContextProvider(context)
        engine = RecommendationEngine(provider)
        decision = engine.get_next_action(0)

        if decision.action_type == RecommendationActionType.TRIGGER_TUTOR_INTERVENTION:
            # No response category exists today for "escalate to a human
            # tutor" — recommendations must reference existing curriculum
            # content only (this method's own docstring / P5-015), and this
            # decision isn't that. Skip rather than mis-tag it as ordinary
            # practice content. Flagged as a real contract gap in the PR.
            return None

        kind, reason = _ACTION_TYPE_TO_KIND_REASON[decision.action_type]
        target_skill_id = decision.skill_id or (
            attempts[0].skill_ids[0] if attempts[0].skill_ids else "unknown"
        )

        based_on_weakness_id = None
        if reason == AimRecommendationReason.ADDRESSES_WEAKNESS:
            based_on_weakness_id = self._find_weakness_id(weakness_records, target_skill_id)
            if based_on_weakness_id is None:
                # The DB requires based_on_weakness_id whenever reason is
                # addresses_weakness — never violate that by guessing an id;
                # fall back to a reason that doesn't need one.
                reason = AimRecommendationReason.NEXT_IN_SEQUENCE

        return [
            AimRecommendationOutput(
                recommendation_id=str(uuid.uuid4()),
                kind=kind,
                target_skill_id=target_skill_id,
                target_lesson_id=None,
                rank=1,
                reason=reason,
                based_on_weakness_id=based_on_weakness_id,
                generated_at=now,
                expires_at=None,
            )
        ]

    def _build_recommendation_context(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
        mastery_results: dict[str, MasteryResult],
        skill_mastery_context: dict[str, AimSkillMasteryContext],
    ) -> RecommendationContext:
        """Build the RecommendationEngine's input context from request data
        only (P20-009). Fields the request contract has no real source for
        (historical_avg_speed, last_session_frustration_score,
        prerequisite_gaps, transfer_result) are left at their safe defaults
        (None / empty) rather than fabricated — see this task's PR for the
        specific gaps that leaves inert, most notably that the bundled
        ``SkillGraph`` static file uses a placeholder skill-id namespace
        (e.g. "VOCAB_BASIC") that does not match this curriculum's real
        `skills.key` values, so prerequisite-gap detection can never
        actually match a real skill today.
        """
        skill_attempts: dict[str, list[AimAttemptInput]] = {}
        for attempt in attempts:
            for sid in attempt.skill_ids:
                skill_attempts.setdefault(sid, []).append(attempt)

        skill_states: list[RecommendationSkillState] = []
        recommendation_attempts: list[RecommendationAttempt] = []
        for skill_id, result in mastery_results.items():
            skill_atts = skill_attempts.get(skill_id, [])
            if not skill_atts:
                continue

            current_diff = skill_atts[-1].presented_difficulty.value
            correct = sum(1 for a in skill_atts if a.is_correct)
            weakness_score = (1.0 - correct / len(skill_atts)) * 100.0
            retention = self._compute_retention(skill_id, skill_mastery_context.get(skill_id))
            frustration_score = min(100.0, session.behavioral_context.consecutive_incorrect * 20.0)

            skill_states.append(
                RecommendationSkillState(
                    skill_id=skill_id,
                    mastery=result.final_mastery,
                    # No real metacognitive-confidence signal exists yet —
                    # reliability (evidence volume) is the best available
                    # proxy, not an equivalent measurement. Flagged in the PR.
                    confidence=round(result.reliability * 100.0, 2),
                    attempts=result.attempt_count,
                    consistency=result.consistency_score,
                    current_difficulty=min(5, max(1, current_diff)),
                    retention=retention,
                    review_due=False,
                    weakness_score=weakness_score,
                    frustration_score=frustration_score,
                    reliability=result.reliability,
                )
            )

            for a in skill_atts:
                recommendation_attempts.append(
                    RecommendationAttempt(
                        student_id=0,
                        skill_id=skill_id,
                        question_id=a.item_id,
                        is_correct=a.is_correct,
                        response_time=a.response_time_ms / 1000.0,
                        difficulty=int(a.presented_difficulty),
                        skip=False,
                        hint_used=a.behavioral_context.used_hint,
                        attempts=a.attempt_number_for_item,
                    )
                )

        current_skill_id = attempts[0].skill_ids[0] if attempts[0].skill_ids else None

        return RecommendationContext(
            student_id=0,
            current_skill_id=current_skill_id,
            skill_states=skill_states,
            recent_attempts=recommendation_attempts,
            historical_avg_speed=None,
            last_session_frustration_score=None,
            error_pattern_type=None,
            error_pattern_evidence=None,
            error_pattern_treatment_recommendation=None,
            prerequisite_gaps=(),
            transfer_result=None,
        )

    @staticmethod
    def _find_weakness_id(
        weakness_records: list[AimWeaknessRecordOutput] | None,
        skill_id: str | None,
    ) -> str | None:
        if not weakness_records or skill_id is None:
            return None
        for record in weakness_records:
            if record.skill_id == skill_id:
                return record.weakness_id
        return None

    async def _compute_review_schedule(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
        skill_mastery_context: dict[str, AimSkillMasteryContext],
    ) -> list[AimReviewScheduleOutput] | None:
        """Compute spaced-repetition review schedule entries (P5-016).

        due_at, interval_days, and repetition_count are exclusively AIM
        Engine outputs. Speed and response-time must never directly set
        due_at. ``retention_lambda`` (P20-008) is the category-appropriate
        default (or personalized fit once enough history exists), replacing
        the previous fixed 0.15 used for every student and skill.
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        skills_touched = list({sid for a in attempts for sid in a.skill_ids})

        results: list[AimReviewScheduleOutput] = []
        for skill_id in skills_touched:
            skill_atts = [a for a in attempts if skill_id in a.skill_ids]
            correct = sum(1 for a in skill_atts if a.is_correct)
            accuracy = correct / len(skill_atts) if skill_atts else 0.0

            mastery_pct = accuracy * 100.0
            retention_lambda = self._compute_retention_lambda(
                skill_id, skill_mastery_context.get(skill_id)
            )
            if mastery_pct > 70.0 and retention_lambda > 0:
                days_until_due = math.log(mastery_pct / 70.0) / retention_lambda
            else:
                days_until_due = 1.0
            interval_days = max(0.5, round(days_until_due, 2))
            due_at = now + timedelta(days=interval_days)

            results.append(
                AimReviewScheduleOutput(
                    schedule_id=str(uuid.uuid4()),
                    skill_id=skill_id,
                    due_at=due_at,
                    interval_days=interval_days,
                    repetition_count=0,
                    based_on_attempt_id=skill_atts[-1].attempt_id,
                    scheduled_at=now,
                )
            )

        return results if results else None

    async def _summarize_session(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
    ) -> AimSessionSummaryOutput | None:
        """Produce a session close-out summary including behavioral signals (P5-017).

        frustration_level and engagement_level are coarse educational signals
        only — never clinical or psychological assessments.
        overall_mastery_shift is descriptive; per-skill authority stays in
        student_skill_states (P5-012).
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        emotional_attempts = [
            EmotionalAttempt(
                question_id=a.item_id,
                is_correct=a.is_correct,
                response_time=a.response_time_ms / 1000.0,
                previously_correct=False,
                skip=a.behavioral_context.abandoned_first_then_retried,
                hint_used=a.behavioral_context.used_hint,
                attempts=a.attempt_number_for_item,
            )
            for a in attempts
        ]

        avg_response_ms = session.behavioral_context.average_response_time_ms
        historical_avg = (avg_response_ms / 1000.0) if avg_response_ms else None
        emotional_result = self._emotional_detector.detect(
            emotional_attempts,
            historical_avg_speed=historical_avg,
        )

        total = len(attempts)
        correct = sum(1 for a in attempts if a.is_correct)
        accuracy = correct / total if total > 0 else 0.0
        skills_touched = list({sid for a in attempts for sid in a.skill_ids})

        if accuracy >= 0.7:
            mastery_shift = AimMasteryShiftDirection.POSITIVE
        elif accuracy >= 0.4:
            mastery_shift = AimMasteryShiftDirection.NEUTRAL
        else:
            mastery_shift = AimMasteryShiftDirection.NEGATIVE

        frustration_score = emotional_result.frustration_score
        if frustration_score >= 75.0:
            frustration_level = AimFrustrationLevel.ELEVATED
        elif frustration_score >= 50.0:
            frustration_level = AimFrustrationLevel.MODERATE
        elif frustration_score >= 25.0:
            frustration_level = AimFrustrationLevel.LOW
        else:
            frustration_level = AimFrustrationLevel.NONE

        if total >= 15 and accuracy >= 0.7:
            engagement_level = AimEngagementLevel.HIGH
        elif total < 5:
            engagement_level = AimEngagementLevel.LOW
        else:
            engagement_level = AimEngagementLevel.TYPICAL

        signal_basis: list[AimSignalBasis] = []
        if emotional_result.repeated_errors:
            signal_basis.append(AimSignalBasis.REPEATED_INCORRECT_STREAK)
        if emotional_result.sudden_slowdown:
            signal_basis.append(AimSignalBasis.INCREASED_HESITATION)
        if session.behavioral_context.retry_event_count > 3:
            signal_basis.append(AimSignalBasis.INCREASED_RETRY_RATE)
        if emotional_result.early_exit:
            signal_basis.append(AimSignalBasis.SESSION_ABANDONMENT_PATTERN)
        if session.behavioral_context.consecutive_correct >= 5:
            signal_basis.append(AimSignalBasis.SUSTAINED_CORRECT_STREAK)

        return AimSessionSummaryOutput(
            session_id=session.session_id,
            items_attempted=total,
            items_correct=correct,
            skills_touched=skills_touched,
            overall_mastery_shift=mastery_shift,
            behavioral_signal=AimSessionBehavioralSignal(
                frustration_level=frustration_level,
                engagement_level=engagement_level,
                signal_basis=signal_basis,
            ),
            closed_out_at=now,
        )
