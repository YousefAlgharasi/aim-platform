"""Calibration weights for AIM mastery V2."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


# Container for no-speed mastery weights.
@dataclass(frozen=True)
class MasteryWeights:
    """Weights that sum to 1.0 and intentionally exclude speed."""

    accuracy: float
    consistency: float
    retention: float
    difficulty_performance: float
    evidence_quality: float

    def __post_init__(self) -> None:
        total = round(
            self.accuracy
            + self.consistency
            + self.retention
            + self.difficulty_performance
            + self.evidence_quality,
            6,
        )
        if abs(total - 1.0) > 1e-4:
            raise ValueError(f"MasteryWeights must sum to 1.0, got {total}")


DEFAULT_WEIGHTS = MasteryWeights(
    accuracy=0.40,
    consistency=0.20,
    retention=0.15,
    difficulty_performance=0.20,
    evidence_quality=0.05,
)


# Calibration backend protocol.
class CalibrationProtocol(Protocol):
    """Interface for future calibrated V2 mastery weights."""

    def get_weights(
        self,
        student_id: int,
        skill_id: str,
    ) -> MasteryWeights: ...


# Default fixed no-speed calibration.
class CalibrationStub(CalibrationProtocol):
    """Returns the same V2 no-speed weights for every student and skill."""

    def get_weights(
        self,
        student_id: int,
        skill_id: str,
    ) -> MasteryWeights:
        return DEFAULT_WEIGHTS
