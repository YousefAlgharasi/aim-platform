"""
T-05: Calibration System
────────────────────────────────────────────────────────────────────────────────
CalibrationStub holds the default mastery weights and exposes an interface
designed so a trained ML model (T-12) can hot-swap in without touching
the MasteryCalculator at all.

The contract:
    weights = calibration.get_weights(student_id, skill_id)
    weights.accuracy            -> float  (sum of all weights = 1.0)
    weights.speed               -> float
    weights.consistency         -> float
    weights.retention           -> float
    weights.difficulty_performance -> float
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


# ──────────────────────────────────────────────
# Weight container
# ──────────────────────────────────────────────

@dataclass(frozen=True)
class MasteryWeights:
    """
    Weights that sum to 1.0.
    Frozen so no caller can mutate them after retrieval.
    """
    accuracy:               float  # 0.35 default
    speed:                  float  # 0.15 default
    consistency:            float  # 0.20 default
    retention:              float  # 0.15 default
    difficulty_performance: float  # 0.15 default

    def __post_init__(self) -> None:
        total = round(
            self.accuracy + self.speed + self.consistency
            + self.retention + self.difficulty_performance,
            6,
        )
        if abs(total - 1.0) > 1e-4:
            raise ValueError(
                f"MasteryWeights must sum to 1.0, got {total}"
            )


# ──────────────────────────────────────────────
# Default weights (from architecture doc)
# ──────────────────────────────────────────────

DEFAULT_WEIGHTS = MasteryWeights(
    accuracy=0.35,
    speed=0.15,
    consistency=0.20,
    retention=0.15,
    difficulty_performance=0.15,
)


# ──────────────────────────────────────────────
# Calibration protocol
# (T-12 will provide a concrete ML implementation)
# ──────────────────────────────────────────────

class CalibrationProtocol(Protocol):
    """
    Interface every calibration backend must satisfy.
    Both CalibrationStub and the future MLCalibration implement this.
    MasteryCalculator only ever calls get_weights() — nothing else.
    """

    def get_weights(
        self,
        student_id: int,
        skill_id: str,
    ) -> MasteryWeights: ...


# ──────────────────────────────────────────────
# Stub implementation (Phase 1 & 2)
# ──────────────────────────────────────────────

class CalibrationStub(CalibrationProtocol):
    """
    Returns the same default weights for every student and skill.
    Designed so T-12 can replace this with an ML-trained model by
    simply passing a different CalibrationProtocol to MasteryCalculator
    — no other code changes required.
    """

    def get_weights(
        self,
        student_id: int,   # noqa: ARG002  (unused until ML phase)
        skill_id: str,     # noqa: ARG002
    ) -> MasteryWeights:
        return DEFAULT_WEIGHTS
