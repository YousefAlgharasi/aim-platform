"""
T-05: Mastery Calculation Engine
────────────────────────────────────────────────────────────────────────────────
Computes a real mastery score — not just raw accuracy.

Formula (from architecture doc):
  Mastery = (Accuracy × 0.35) + (Speed × 0.15) + (Consistency × 0.20)
           + (Retention × 0.15) + (DifficultyPerformance × 0.15)

All sub-scores are normalised to 0–100 before weights are applied.
Weights come from CalibrationProtocol so T-12 can hot-swap an ML model in.

Public interface:
    calculator = MasteryCalculator(repo, calibration)
    result     = calculator.calculate(student_id, skill_id)

    result.mastery                  -> float  0–100
    result.accuracy_score           -> float  0–100  (normalised sub-score)
    result.speed_score              -> float  0–100
    result.consistency_score        -> float  0–100
    result.retention_score          -> float  0–100
    result.difficulty_score         -> float  0–100
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Protocol, Sequence


# ──────────────────────────────────────────────
# Domain types (mirrors T-04 AttemptRecord)
# ──────────────────────────────────────────────

@dataclass(frozen=True)
class AttemptSnapshot:
    """Minimal view of one attempt needed for mastery calculation."""
    is_correct:    bool
    response_time: float   # seconds
    attempts:      int     # total tries (1 = first-try correct)
    difficulty:    int     # 1–5
    skip:          bool


@dataclass(frozen=True)
class SkillState:
    """Current persisted state for one (student, skill) pair — from T-03."""
    retention:  float   # 0–100, managed by RetentionTracker (T-08)
    confidence: float   # 0–100


# ──────────────────────────────────────────────
# Repository protocols
# ──────────────────────────────────────────────

class AttemptSnapshotRepository(Protocol):
    def get_attempts(
        self,
        student_id: int,
        skill_id: str,
        limit: int | None = None,
    ) -> Sequence[AttemptSnapshot]: ...


class SkillStateRepository(Protocol):
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


class CalibrationProtocol(Protocol):
    def get_weights(self, student_id: int, skill_id: str): ...


# ──────────────────────────────────────────────
# Result dataclass
# ──────────────────────────────────────────────

@dataclass
class MasteryResult:
    student_id:        int
    skill_id:          str
    mastery:           float   # final weighted score 0–100
    accuracy_score:    float   # normalised sub-score
    speed_score:       float
    consistency_score: float
    retention_score:   float
    difficulty_score:  float
    attempt_count:     int


# ──────────────────────────────────────────────
# Helper constants
# ──────────────────────────────────────────────

_EXPECTED_SPEED_SECONDS = 15.0   # baseline: answer in 15 s = full speed score
_CONSISTENCY_WINDOW     = 10     # use last N attempts for std-dev


# ──────────────────────────────────────────────
# Core engine
# ──────────────────────────────────────────────

class MasteryCalculator:
    """
    Computes mastery for a (student, skill) pair using the weighted formula
    from the architecture document.

    Depends on:
        attempt_repo  — supplies raw attempt data (T-04)
        state_repo    — supplies retention & confidence (T-03)
        calibration   — supplies weights (T-05 stub / T-12 ML model)
    """

    def __init__(
        self,
        attempt_repo:  AttemptSnapshotRepository,
        state_repo:    SkillStateRepository,
        calibration:   CalibrationProtocol,
    ) -> None:
        self._attempts   = attempt_repo
        self._state      = state_repo
        self._calibration = calibration

    # ── Public ─────────────────────────────────

    def calculate(self, student_id: int, skill_id: str) -> MasteryResult:
        """
        Compute mastery, persist it to student_skill_states, and return
        the full breakdown.
        """
        attempts = [
            a for a in self._attempts.get_attempts(student_id, skill_id)
            if not a.skip
        ]

        weights   = self._calibration.get_weights(student_id, skill_id)
        state     = self._state.get_skill_state(student_id, skill_id)
        retention = state.retention if state else 100.0

        acc   = self._accuracy_score(attempts)
        spd   = self._speed_score(attempts)
        con   = self._consistency_score(attempts)
        ret   = retention                          # already 0–100 from T-08
        diff  = self._difficulty_score(attempts)

        mastery = round(
            (acc  * weights.accuracy)
            + (spd  * weights.speed)
            + (con  * weights.consistency)
            + (ret  * weights.retention)
            + (diff * weights.difficulty_performance),
            2,
        )
        mastery = max(0.0, min(100.0, mastery))

        self._state.update_mastery(student_id, skill_id, mastery)

        return MasteryResult(
            student_id=student_id,
            skill_id=skill_id,
            mastery=mastery,
            accuracy_score=acc,
            speed_score=spd,
            consistency_score=con,
            retention_score=ret,
            difficulty_score=diff,
            attempt_count=len(attempts),
        )

    # ── Sub-score calculations ──────────────────

    def _accuracy_score(self, attempts: list[AttemptSnapshot]) -> float:
        """
        Accuracy = (Correct / Total) × 100
        Returns 0.0 for zero attempts.
        """
        if not attempts:
            return 0.0
        correct = sum(1 for a in attempts if a.is_correct)
        return round((correct / len(attempts)) * 100, 2)

    def _speed_score(self, attempts: list[AttemptSnapshot]) -> float:
        """
        Speed score = max(0, 100 − (avg_speed / expected_speed × 100))

        A student answering in exactly the expected time scores ~0.
        Faster → higher score. Slower → lower, floored at 0.
        Returns 0.0 for zero attempts.
        """
        if not attempts:
            return 0.0
        avg_speed = sum(a.response_time for a in attempts) / len(attempts)
        score = max(0.0, 100.0 - (avg_speed / _EXPECTED_SPEED_SECONDS * 100.0))
        return round(score, 2)

    def _consistency_score(self, attempts: list[AttemptSnapshot]) -> float:
        """
        Consistency = 100 − normalised_std_dev of correctness over last N attempts.

        Low standard deviation (stable performance) → high score.
        High standard deviation (erratic) → low score.
        Returns 100.0 for 0 or 1 attempts (no variance possible).
        """
        window = attempts[-_CONSISTENCY_WINDOW:]
        if len(window) < 2:
            return 100.0

        values = [1.0 if a.is_correct else 0.0 for a in window]
        mean   = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        std_dev  = math.sqrt(variance)

        # std_dev is in [0, 0.5] for binary data; normalise to 0–100
        normalised_std = std_dev * 200.0      # 0.5 → 100
        score = max(0.0, 100.0 - normalised_std)
        return round(score, 2)

    def _difficulty_score(self, attempts: list[AttemptSnapshot]) -> float:
        """
        DifficultyPerformance: weight correct answers by their difficulty level.

        Correct on difficulty 5 contributes more than correct on difficulty 1.
        Score = (weighted_correct / max_possible_weighted) × 100
        Returns 0.0 for zero attempts.
        """
        if not attempts:
            return 0.0

        weighted_correct = sum(a.difficulty for a in attempts if a.is_correct)
        max_possible     = sum(a.difficulty for a in attempts)

        if max_possible == 0:
            return 0.0

        return round((weighted_correct / max_possible) * 100, 2)
