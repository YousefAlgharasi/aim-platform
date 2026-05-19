"""
T-12: A/B test assignment foundation.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass
from enum import Enum


class RecommendationVariant(str, Enum):
    RULE_BASED = "RULE_BASED"
    ML_MODEL = "ML_MODEL"


@dataclass(frozen=True)
class AssignmentResult:
    student_id: int
    variant: RecommendationVariant


def assign_student_variant(student_id: int) -> AssignmentResult:
    digest = hashlib.sha256(str(student_id).encode("utf-8")).hexdigest()
    bucket = int(digest[:8], 16) % 100
    variant = (
        RecommendationVariant.ML_MODEL
        if bucket < 50
        else RecommendationVariant.RULE_BASED
    )
    return AssignmentResult(student_id=student_id, variant=variant)
