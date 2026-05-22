"""Question quality analysis for fair mastery evidence."""

from __future__ import annotations

from dataclasses import dataclass, field


# Represents aggregated statistics for one question.
@dataclass(frozen=True)
class QuestionQualityInput:
    """Aggregated item statistics used to identify bad or unfair questions."""

    question_id: str
    question_error_rate: float
    avg_response_time: float
    hint_usage_rate: float
    skip_rate: float
    discrimination_index: float


# Represents the quality decision for one question.
@dataclass(frozen=True)
class QuestionQualityResult:
    """Question quality score and review guidance."""

    question_id: str
    quality_score: float
    flag_for_review: bool
    impact_weight: float
    warnings: list[str] = field(default_factory=list)
    evidence: dict[str, float | str | bool] = field(default_factory=dict)


# Detects low-quality questions and evidence impact.
class QuestionQualityAnalyzer:
    """Detects weak assessment items and lowers their impact on mastery evidence."""

    LOW_QUALITY_THRESHOLD = 60.0

    def analyze(self, item: QuestionQualityInput) -> QuestionQualityResult:
        self._validate_rate("question_error_rate", item.question_error_rate)
        self._validate_rate("hint_usage_rate", item.hint_usage_rate)
        self._validate_rate("skip_rate", item.skip_rate)
        if not -1.0 <= item.discrimination_index <= 1.0:
            raise ValueError("discrimination_index must be between -1 and 1")

        warnings: list[str] = []
        score = 100.0

        # High error, hint, and skip rates suggest the question may be unclear.
        score -= item.question_error_rate * 35.0
        score -= item.hint_usage_rate * 25.0
        score -= item.skip_rate * 20.0

        # Low or negative discrimination means the item does not separate mastery well.
        if item.discrimination_index < 0.20:
            score -= (0.20 - item.discrimination_index) * 50.0
            warnings.append("low_discrimination_index")

        if item.question_error_rate > 0.70:
            warnings.append("high_question_error_rate")
        if item.hint_usage_rate > 0.60:
            warnings.append("high_hint_usage_rate")
        if item.skip_rate > 0.30:
            warnings.append("high_skip_rate")

        score = round(max(0.0, min(100.0, score)), 2)
        flag = score < self.LOW_QUALITY_THRESHOLD
        if flag:
            warnings.append("flag_question_for_review")

        return QuestionQualityResult(
            question_id=item.question_id,
            quality_score=score,
            flag_for_review=flag,
            impact_weight=round(score / 100.0, 4),
            warnings=warnings,
            evidence={
                "question_error_rate": item.question_error_rate,
                "avg_response_time": item.avg_response_time,
                "hint_usage_rate": item.hint_usage_rate,
                "skip_rate": item.skip_rate,
                "discrimination_index": item.discrimination_index,
            },
        )

    @staticmethod
    def _validate_rate(name: str, value: float) -> None:
        if not 0.0 <= value <= 1.0:
            raise ValueError(f"{name} must be between 0 and 1")
