"""Evidence quality scoring for AIM mastery decisions."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable


# Represents one attempt's evidence-quality inputs.
@dataclass(frozen=True)
class EvidenceQualityInput:
    """Input facts used to judge how strong one answer is as mastery evidence."""

    is_correct: bool
    difficulty: int
    hint_used: bool
    retry_count: int
    skip: bool
    question_quality_score: float = 100.0


# Represents the explainable evidence-quality output.
@dataclass(frozen=True)
class EvidenceQualityResult:
    """Explainable evidence-quality result normalized to a 0-100 score."""

    evidence_quality_score: float
    evidence_summary: str
    evidence_warnings: list[str] = field(default_factory=list)
    evidence: dict[str, float | int | bool | str] = field(default_factory=dict)


# Calculates evidence quality without using speed.
class EvidenceQualityEngine:
    """Measures how strongly attempts prove understanding without using speed."""

    MIN_DIFFICULTY = 1
    MAX_DIFFICULTY = 5

    def score_attempt(self, item: EvidenceQualityInput) -> EvidenceQualityResult:
        self._validate(item)

        warnings: list[str] = []
        if item.skip:
            return EvidenceQualityResult(
                evidence_quality_score=0.0,
                evidence_summary="Skipped answers provide no mastery evidence.",
                evidence_warnings=["skip_reduces_evidence"],
                evidence={
                    "is_correct": item.is_correct,
                    "difficulty": item.difficulty,
                    "hint_used": item.hint_used,
                    "retry_count": item.retry_count,
                    "skip": item.skip,
                    "question_quality_score": item.question_quality_score,
                },
            )

        # Start from answer correctness; a wrong answer can still be useful evidence.
        score = 100.0 if item.is_correct else 35.0

        # Harder correct answers provide slightly stronger evidence; easy wrong
        # answers are slightly more concerning, but remain bounded.
        difficulty_delta = (item.difficulty - 3) * 3.0
        score += difficulty_delta if item.is_correct else -difficulty_delta

        # Hints and retries reduce confidence that the answer was independent.
        if item.hint_used:
            score -= 20.0
            warnings.append("hint_used_reduces_evidence")

        if item.retry_count > 0:
            retry_penalty = min(30.0, item.retry_count * 10.0)
            score -= retry_penalty
            warnings.append("retry_count_reduces_evidence")

        # Low-quality questions should not strongly punish or reward a student.
        quality_multiplier = item.question_quality_score / 100.0
        score *= quality_multiplier
        if item.question_quality_score < 60.0:
            warnings.append("low_question_quality_reduces_evidence_impact")

        score = round(self._clamp(score), 2)
        summary = self._summary(item, score)
        return EvidenceQualityResult(
            evidence_quality_score=score,
            evidence_summary=summary,
            evidence_warnings=warnings,
            evidence={
                "is_correct": item.is_correct,
                "difficulty": item.difficulty,
                "hint_used": item.hint_used,
                "retry_count": item.retry_count,
                "skip": item.skip,
                "question_quality_score": item.question_quality_score,
            },
        )

    def score_session(
        self,
        items: Iterable[EvidenceQualityInput],
    ) -> EvidenceQualityResult:
        results = [self.score_attempt(item) for item in items]
        if not results:
            return EvidenceQualityResult(
                evidence_quality_score=0.0,
                evidence_summary="No attempts were available for evidence scoring.",
                evidence_warnings=["no_attempts"],
                evidence={"attempt_count": 0},
            )

        score = round(
            sum(result.evidence_quality_score for result in results) / len(results),
            2,
        )
        warnings = sorted(
            {
                warning
                for result in results
                for warning in result.evidence_warnings
            }
        )
        return EvidenceQualityResult(
            evidence_quality_score=score,
            evidence_summary=(
                f"Evidence quality averaged {score} across {len(results)} attempt(s)."
            ),
            evidence_warnings=warnings,
            evidence={
                "attempt_count": len(results),
                "average_evidence_quality": score,
            },
        )

    def _validate(self, item: EvidenceQualityInput) -> None:
        if not self.MIN_DIFFICULTY <= item.difficulty <= self.MAX_DIFFICULTY:
            raise ValueError("difficulty must be between 1 and 5")
        if item.retry_count < 0:
            raise ValueError("retry_count must be >= 0")
        if not 0.0 <= item.question_quality_score <= 100.0:
            raise ValueError("question_quality_score must be between 0 and 100")

    @staticmethod
    def _clamp(value: float) -> float:
        return max(0.0, min(100.0, value))

    @staticmethod
    def _summary(item: EvidenceQualityInput, score: float) -> str:
        independence = "independent" if not item.hint_used and item.retry_count == 0 else "supported"
        correctness = "correct" if item.is_correct else "incorrect"
        return (
            f"{correctness.title()} {independence} answer at difficulty "
            f"{item.difficulty} produced evidence quality {score}."
        )
