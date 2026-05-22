"""Mastery calculation V2 for the AIM algorithm.

Response time is intentionally excluded from mastery. It may still appear in
attempt snapshots for behavioral analysis, but this module never reads it.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Protocol, Sequence

from aim.domain.services.evidence_quality_engine import (
    EvidenceQualityEngine,
    EvidenceQualityInput,
)
from aim.domain.services.reliability_engine import ReliabilityEngine


# Minimal view of one attempt needed for mastery calculation.
@dataclass(frozen=True)
class AttemptSnapshot:
    """Attempt facts used by mastery, excluding speed from all score math."""

    is_correct: bool
    response_time: float
    attempts: int
    difficulty: int
    skip: bool
    hint_used: bool = False


# Current persisted state for one student-skill pair.
@dataclass(frozen=True)
class SkillState:
    """Current mastery context used to stabilize the next mastery value."""

    retention: float
    confidence: float
    mastery: float = 0.0


# Supplies attempts to the mastery calculator.
class AttemptSnapshotRepository(Protocol):
    """Read-only attempt source for mastery calculation."""

    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> Sequence[AttemptSnapshot]: ...


# Supplies and updates the current skill state.
class SkillStateRepository(Protocol):
    """Persistence contract for reading state and storing final mastery."""

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> SkillState | None: ...

    def update_mastery(
        self,
        student_id: int,
        skill_id: str,
        mastery: float,
    ) -> None: ...


# Existing calibration dependency retained for constructor compatibility.
class CalibrationProtocol(Protocol):
    """Compatibility protocol; V2 uses fixed no-speed weights."""

    def get_weights(self, student_id: int, skill_id: str): ...


# Explainable mastery calculation result.
@dataclass(frozen=True)
class MasteryResult:
    """Full explainable V2 mastery result."""

    student_id: int
    skill_id: str
    previous_mastery: float
    mastery_raw: float
    mastery_adjusted: float
    final_mastery: float
    reliability: float
    decision_confidence: str
    accuracy_score: float
    consistency_score: float
    retention_score: float
    difficulty_performance_score: float
    evidence_quality_score: float
    penalties: dict[str, float] = field(default_factory=dict)
    explanation: str = ""
    attempt_count: int = 0
    valid_attempt_count: int = 0

    @property
    def mastery(self) -> float:
        """Backward-compatible alias for final mastery."""
        return self.final_mastery

    @property
    def difficulty_score(self) -> float:
        """Backward-compatible alias for difficulty performance."""
        return self.difficulty_performance_score


# Core mastery engine.
class MasteryCalculator:
    """Calculates mastery with evidence, reliability, and stabilization."""

    CONSISTENCY_WINDOW = 10
    MAX_INCREASE_PER_SESSION = 12.0
    MAX_DECREASE_PER_SESSION = 15.0

    def __init__(
        self,
        attempt_repo: AttemptSnapshotRepository,
        state_repo: SkillStateRepository,
        calibration: CalibrationProtocol | None = None,
    ) -> None:
        self._attempts = attempt_repo
        self._state = state_repo
        self._calibration = calibration
        self._evidence_quality = EvidenceQualityEngine()
        self._reliability = ReliabilityEngine()

    def calculate(
        self,
        student_id: int,
        skill_id: str,
        *,
        evidence_quality_score: float | None = None,
    ) -> MasteryResult:
        """Compute, stabilize, persist, and return mastery V2."""
        all_attempts = list(self._attempts.get_attempts(student_id, skill_id))
        valid_attempts = [attempt for attempt in all_attempts if not attempt.skip]
        state = self._state.get_skill_state(student_id, skill_id)
        previous_mastery = self._clamp(state.mastery if state else 0.0)
        retention = self._clamp(state.retention if state else 100.0)

        # Calculate mastery components without reading response_time.
        accuracy = self._accuracy_score(valid_attempts)
        consistency = self._consistency_score(valid_attempts)
        difficulty = self._difficulty_score(valid_attempts)
        evidence_quality = (
            self._clamp(evidence_quality_score)
            if evidence_quality_score is not None
            else self._evidence_quality_score(all_attempts)
        )

        # Apply support and skipped-answer penalties after the weighted raw score.
        penalties = self._penalties(all_attempts, valid_attempts)
        mastery_raw = round(
            (accuracy * 0.40)
            + (consistency * 0.20)
            + (retention * 0.15)
            + (difficulty * 0.20)
            + (evidence_quality * 0.05),
            2,
        )
        mastery_adjusted = round(
            max(0.0, mastery_raw - sum(penalties.values())),
            2,
        )

        reliability = self._reliability.calculate(len(valid_attempts))
        blended = (
            previous_mastery * (1.0 - reliability.reliability)
            + mastery_adjusted * reliability.reliability
        )

        # Stabilize large jumps so low evidence cannot whiplash mastery.
        stabilized = self._stabilize(previous_mastery, blended)
        final_mastery = round(self._clamp(stabilized), 2)
        self._state.update_mastery(student_id, skill_id, final_mastery)

        return MasteryResult(
            student_id=student_id,
            skill_id=skill_id,
            previous_mastery=previous_mastery,
            mastery_raw=mastery_raw,
            mastery_adjusted=mastery_adjusted,
            final_mastery=final_mastery,
            reliability=reliability.reliability,
            decision_confidence=reliability.decision_confidence,
            accuracy_score=accuracy,
            consistency_score=consistency,
            retention_score=retention,
            difficulty_performance_score=difficulty,
            evidence_quality_score=evidence_quality,
            penalties=penalties,
            explanation=self._explanation(
                previous_mastery=previous_mastery,
                mastery_raw=mastery_raw,
                mastery_adjusted=mastery_adjusted,
                final_mastery=final_mastery,
                reliability=reliability.reliability,
                decision_confidence=reliability.decision_confidence,
            ),
            attempt_count=len(all_attempts),
            valid_attempt_count=len(valid_attempts),
        )

    def _accuracy_score(self, attempts: Sequence[AttemptSnapshot]) -> float:
        """Accuracy = correct valid attempts / valid attempts."""
        if not attempts:
            return 0.0
        correct = sum(1 for attempt in attempts if attempt.is_correct)
        return round((correct / len(attempts)) * 100.0, 2)

    def _consistency_score(self, attempts: Sequence[AttemptSnapshot]) -> float:
        """Consistency = correctness stability over the latest valid attempts."""
        window = list(attempts)[-self.CONSISTENCY_WINDOW :]
        if len(window) < 2:
            return 100.0

        values = [1.0 if attempt.is_correct else 0.0 for attempt in window]
        mean = sum(values) / len(values)
        variance = sum((value - mean) ** 2 for value in values) / len(values)
        normalized_std = math.sqrt(variance) * 200.0
        return round(max(0.0, 100.0 - normalized_std), 2)

    def _difficulty_score(self, attempts: Sequence[AttemptSnapshot]) -> float:
        """Difficulty performance = difficulty-weighted correctness."""
        if not attempts:
            return 0.0

        weighted_correct = sum(
            attempt.difficulty for attempt in attempts if attempt.is_correct
        )
        max_possible = sum(attempt.difficulty for attempt in attempts)
        if max_possible <= 0:
            return 0.0
        return round((weighted_correct / max_possible) * 100.0, 2)

    def _evidence_quality_score(self, attempts: Sequence[AttemptSnapshot]) -> float:
        """Average attempt evidence quality after hints, retries, skips, and quality."""
        result = self._evidence_quality.score_session(
            EvidenceQualityInput(
                is_correct=attempt.is_correct,
                difficulty=attempt.difficulty,
                hint_used=getattr(attempt, "hint_used", False),
                retry_count=max(0, attempt.attempts - 1),
                skip=attempt.skip,
                question_quality_score=100.0,
            )
            for attempt in attempts
        )
        return result.evidence_quality_score

    def _penalties(
        self,
        all_attempts: Sequence[AttemptSnapshot],
        valid_attempts: Sequence[AttemptSnapshot],
    ) -> dict[str, float]:
        """Calculate bounded support and skipped-answer penalties."""
        if not all_attempts:
            return {"hint_penalty": 0.0, "retry_penalty": 0.0, "skip_penalty": 0.0}

        hint_rate = (
            sum(1 for attempt in valid_attempts if getattr(attempt, "hint_used", False))
            / len(valid_attempts)
            if valid_attempts
            else 0.0
        )
        retry_rate = (
            sum(max(0, attempt.attempts - 1) for attempt in valid_attempts)
            / len(valid_attempts)
            if valid_attempts
            else 0.0
        )
        skip_rate = sum(1 for attempt in all_attempts if attempt.skip) / len(all_attempts)
        return {
            "hint_penalty": round(hint_rate * 10.0, 2),
            "retry_penalty": round(min(15.0, retry_rate * 5.0), 2),
            "skip_penalty": round(skip_rate * 15.0, 2),
        }

    def _stabilize(self, previous_mastery: float, candidate: float) -> float:
        """Limit one-session mastery movement to configured caps."""
        upper = previous_mastery + self.MAX_INCREASE_PER_SESSION
        lower = previous_mastery - self.MAX_DECREASE_PER_SESSION
        return min(upper, max(lower, candidate))

    @staticmethod
    def _clamp(value: float) -> float:
        return max(0.0, min(100.0, float(value)))

    @staticmethod
    def _explanation(
        *,
        previous_mastery: float,
        mastery_raw: float,
        mastery_adjusted: float,
        final_mastery: float,
        reliability: float,
        decision_confidence: str,
    ) -> str:
        return (
            "Mastery used accuracy, consistency, retention, difficulty performance, "
            "and evidence quality. Response time was not used. "
            f"Raw {mastery_raw}, adjusted {mastery_adjusted}, reliability "
            f"{reliability} ({decision_confidence}), previous {previous_mastery}, "
            f"final {final_mastery} after stabilization."
        )
