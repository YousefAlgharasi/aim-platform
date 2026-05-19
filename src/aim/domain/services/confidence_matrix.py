"""
T-05: Confidence vs Competence Matrix
────────────────────────────────────────────────────────────────────────────────
Classifies a student into one of four states based on their mastery score
and self-reported/inferred confidence score.

States (from architecture doc):
  IDEAL          — High mastery  + High confidence  ✓
  DOUBTER        — High mastery  + Low confidence   (knows it but doubts)
  AWARE          — Low mastery   + Low confidence   (knows they're struggling)
  OVERCONFIDENT  — Low mastery   + High confidence  ⚠ MOST DANGEROUS

Threshold: mastery >= 70 and confidence >= 70 define "high".
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


# ──────────────────────────────────────────────
# Enum
# ──────────────────────────────────────────────

class ConfidenceState(str, Enum):
    IDEAL         = "IDEAL"
    DOUBTER       = "DOUBTER"
    AWARE         = "AWARE"
    OVERCONFIDENT = "OVERCONFIDENT"


# ──────────────────────────────────────────────
# Result
# ──────────────────────────────────────────────

@dataclass(frozen=True)
class ConfidenceMatrixResult:
    state:       ConfidenceState
    mastery:     float
    confidence:  float
    is_flagged:  bool    # True for OVERCONFIDENT — needs immediate intervention
    description: str


# ──────────────────────────────────────────────
# Threshold
# ──────────────────────────────────────────────

HIGH_THRESHOLD = 70.0   # mastery or confidence >= this → "high"


# ──────────────────────────────────────────────
# Classifier
# ──────────────────────────────────────────────

class ConfidenceMatrix:
    """
    Stateless classifier — call classify() with any mastery + confidence pair.
    """

    def classify(
        self,
        mastery: float,
        confidence: float,
    ) -> ConfidenceMatrixResult:
        """
        Returns the student's ConfidenceState.

        Args:
            mastery:    Calculated mastery score 0–100 (from MasteryCalculator)
            confidence: Student's confidence score  0–100 (from StudentSkillState)
        """
        if not (0.0 <= mastery <= 100.0):
            raise ValueError(f"mastery must be 0–100, got {mastery}")
        if not (0.0 <= confidence <= 100.0):
            raise ValueError(f"confidence must be 0–100, got {confidence}")

        high_mastery    = mastery    >= HIGH_THRESHOLD
        high_confidence = confidence >= HIGH_THRESHOLD

        if high_mastery and high_confidence:
            return ConfidenceMatrixResult(
                state=ConfidenceState.IDEAL,
                mastery=mastery,
                confidence=confidence,
                is_flagged=False,
                description=(
                    "Ideal state. Student understands the material and knows it. "
                    "Ready to advance to the next level."
                ),
            )

        if high_mastery and not high_confidence:
            return ConfidenceMatrixResult(
                state=ConfidenceState.DOUBTER,
                mastery=mastery,
                confidence=confidence,
                is_flagged=False,
                description=(
                    "Student knows the material but doubts themselves. "
                    "Use Confidence Builder exercises to close the gap."
                ),
            )

        if not high_mastery and not high_confidence:
            return ConfidenceMatrixResult(
                state=ConfidenceState.AWARE,
                mastery=mastery,
                confidence=confidence,
                is_flagged=False,
                description=(
                    "Student is struggling and aware of it. "
                    "Follow a supportive review path with gradual difficulty."
                ),
            )

        # Low mastery + High confidence — most dangerous state
        return ConfidenceMatrixResult(
            state=ConfidenceState.OVERCONFIDENT,
            mastery=mastery,
            confidence=confidence,
            is_flagged=True,   # ⚠ always flag
            description=(
                "DANGER: Student answers quickly but incorrectly. "
                "Force slow, reflection-based questions and targeted challenges. "
                "Do NOT advance until mastery improves."
            ),
        )
