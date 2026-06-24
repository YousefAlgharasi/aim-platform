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
from aim.domain.services.weakness_detector import WeaknessAttempt, WeaknessDetector  # noqa: E402

from app.schemas.aim_analysis_request import (  # noqa: E402
    AimAnalysisRequest,
    AimAttemptInput,
    AimSessionInput,
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
        return AimResponseCategories(
            skill_state=await self._analyze_skill_state(request.session, request.attempts),
            weakness_records=await self._analyze_weakness_records(
                request.session, request.attempts
            ),
            difficulty_decision=await self._decide_difficulty(request.session, request.attempts),
            recommendations=await self._generate_recommendations(request.session, request.attempts),
            review_schedule=await self._compute_review_schedule(request.session, request.attempts),
            session_summary=await self._summarize_session(request.session, request.attempts),
        )

    # -----------------------------------------------------------------------
    # Category stages — wired to domain services
    # Speed and response-time fields must never feed mastery or difficulty here.
    # -----------------------------------------------------------------------

    async def _analyze_skill_state(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
    ) -> list[AimSkillStateOutput] | None:
        """Compute skill-state updates (P5-012).

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
        for skill_id, skill_atts in skill_attempts.items():
            valid = [a for a in skill_atts if not a.behavioral_context.abandoned_first_then_retried]
            source = valid if valid else skill_atts
            total = len(source)
            correct = sum(1 for a in source if a.is_correct)
            accuracy = correct / total if total > 0 else 0.0

            confidence = min(1.0, total / 10.0)
            if total >= 3:
                trend = (
                    AimMasteryTrend.IMPROVING
                    if accuracy >= 0.7
                    else (AimMasteryTrend.DECLINING if accuracy < 0.4 else AimMasteryTrend.STABLE)
                )
            else:
                trend = AimMasteryTrend.INSUFFICIENT_DATA

            results.append(
                AimSkillStateOutput(
                    skill_id=skill_id,
                    mastery_score=round(accuracy, 2),
                    mastery_confidence=round(confidence, 2),
                    mastery_trend=trend,
                    attempts_considered_count=total,
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
    ) -> AimDifficultyDecisionOutput | None:
        """Decide next-item difficulty (P5-014).

        next_difficulty is exclusively an AIM Engine output.
        Speed and response-time must never enter difficulty logic at any stage.
        The one-step change constraint (|next - previous| <= 1) is enforced
        at the schema level (P5-022) and must be respected by any domain
        service wired here.
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
        consistency = 100.0
        current_diff = valid[-1].presented_difficulty.value
        reliability = min(1.0, total / 10.0)

        weakness_score = (1.0 - correct / total) * 100.0 if total > 0 else 0.0
        frustration_score = min(100.0, session.behavioral_context.consecutive_incorrect * 20.0)

        decision = self._difficulty_adapter.decide(
            mastery=accuracy,
            consistency=consistency,
            current_difficulty=min(5, max(1, current_diff)),
            reliability=reliability,
            weakness_score=weakness_score,
            frustration_score=frustration_score,
            retention=100.0,
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
    ) -> list[AimRecommendationOutput] | None:
        """Generate ranked recommendations (P5-015).

        Recommendations reference existing curriculum content only; they
        never generate new content and never embed AI Teacher framing.
        Rank values must be unique within the returned list.
        """
        if not attempts:
            return None

        now = datetime.now(UTC)
        skills_touched = list({sid for a in attempts for sid in a.skill_ids})
        if not skills_touched:
            return None

        results: list[AimRecommendationOutput] = []
        for rank, skill_id in enumerate(skills_touched, start=1):
            skill_atts = [a for a in attempts if skill_id in a.skill_ids]
            skill_correct = sum(1 for a in skill_atts if a.is_correct)
            skill_accuracy = skill_correct / len(skill_atts) if skill_atts else 0.0

            if skill_accuracy < 0.5:
                kind = AimRecommendationKind.TARGETED_PRACTICE
                reason = AimRecommendationReason.ADDRESSES_WEAKNESS
            elif skill_accuracy < 0.8:
                kind = AimRecommendationKind.REVIEW_SESSION
                reason = AimRecommendationReason.REINFORCES_RECENT_SKILL
            else:
                kind = AimRecommendationKind.TARGETED_PRACTICE
                reason = AimRecommendationReason.NEXT_IN_SEQUENCE

            results.append(
                AimRecommendationOutput(
                    recommendation_id=str(uuid.uuid4()),
                    kind=kind,
                    target_skill_id=skill_id,
                    target_lesson_id=None,
                    rank=rank,
                    reason=reason,
                    based_on_weakness_id=None,
                    generated_at=now,
                    expires_at=None,
                )
            )

        return results if results else None

    async def _compute_review_schedule(
        self,
        session: AimSessionInput,
        attempts: list[AimAttemptInput],
    ) -> list[AimReviewScheduleOutput] | None:
        """Compute spaced-repetition review schedule entries (P5-016).

        due_at, interval_days, and repetition_count are exclusively AIM
        Engine outputs. Speed and response-time must never directly set
        due_at.
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
            retention_lambda = 0.15
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
