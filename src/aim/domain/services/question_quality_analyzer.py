"""Question quality analysis for fair mastery evidence."""

from __future__ import annotations

from dataclasses import dataclass, field


# Represents one historical answer used for item statistics.
@dataclass(frozen=True)
class HistoricalQuestionAttempt:
    """Historical attempt facts used to estimate question quality."""

    student_id: int
    is_correct: bool
    response_time: float
    hint_used: bool
    skip: bool
    learner_mastery: float | None = None


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
    sample_size: int = 0
    correct_rate: float | None = None
    difficulty_index: float | None = None


# Represents the quality decision for one question.
@dataclass(frozen=True)
class QuestionQualityResult:
    """Question quality score and review guidance."""

    question_id: str
    quality_score: float
    flag_for_review: bool
    impact_weight: float
    quality_label: str
    confidence: float
    warnings: list[str] = field(default_factory=list)
    evidence: dict[str, float | str | bool] = field(default_factory=dict)


# Detects low-quality questions and evidence impact.
class QuestionQualityAnalyzer:
    """Detects weak assessment items and lowers their impact on mastery evidence."""

    LOW_QUALITY_THRESHOLD = 60.0
    MIN_HISTORICAL_SAMPLE_SIZE = 5
    STRONG_CONFIDENCE_SAMPLE_SIZE = 20

    def analyze_historical(
        self,
        question_id: str,
        attempts: list[HistoricalQuestionAttempt],
    ) -> QuestionQualityResult:
        """Build question-quality stats from historical attempts."""
        sample_size = len(attempts)
        if sample_size < self.MIN_HISTORICAL_SAMPLE_SIZE:
            confidence = round(sample_size / self.STRONG_CONFIDENCE_SAMPLE_SIZE, 2)
            return QuestionQualityResult(
                question_id=question_id,
                quality_score=85.0,
                flag_for_review=False,
                impact_weight=0.85,
                quality_label="insufficient_data",
                confidence=confidence,
                warnings=["insufficient_data"],
                evidence={
                    "sample_size": sample_size,
                    "correct_rate": 0.0,
                    "difficulty_index": 0.0,
                    "question_error_rate": 0.0,
                    "avg_response_time": 0.0,
                    "hint_usage_rate": 0.0,
                    "skip_rate": (
                        sum(1 for attempt in attempts if attempt.skip) / sample_size
                        if sample_size
                        else 0.0
                    ),
                    "discrimination_index": 0.0,
                    "quality_label": "insufficient_data",
                    "confidence": confidence,
                },
            )

        non_skipped = [attempt for attempt in attempts if not attempt.skip]
        valid_count = len(non_skipped)
        correct_rate = (
            sum(1 for attempt in non_skipped if attempt.is_correct) / valid_count
            if valid_count
            else 0.0
        )
        hint_usage_rate = (
            sum(1 for attempt in non_skipped if attempt.hint_used) / valid_count
            if valid_count
            else 0.0
        )
        avg_response_time = (
            sum(attempt.response_time for attempt in non_skipped) / valid_count
            if valid_count
            else 0.0
        )
        skip_rate = sum(1 for attempt in attempts if attempt.skip) / sample_size
        discrimination_index = self._historical_discrimination_index(non_skipped)

        return self.analyze(
            QuestionQualityInput(
                question_id=question_id,
                question_error_rate=1.0 - correct_rate,
                avg_response_time=round(avg_response_time, 2),
                hint_usage_rate=hint_usage_rate,
                skip_rate=skip_rate,
                discrimination_index=discrimination_index,
                sample_size=sample_size,
                correct_rate=correct_rate,
                difficulty_index=correct_rate,
            )
        )

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
        label = self._quality_label(
            score=score,
            sample_size=item.sample_size,
            correct_rate=(
                item.correct_rate
                if item.correct_rate is not None
                else 1.0 - item.question_error_rate
            ),
        )
        confidence = self._confidence(item.sample_size)

        return QuestionQualityResult(
            question_id=item.question_id,
            quality_score=score,
            flag_for_review=flag,
            impact_weight=round(score / 100.0, 4),
            quality_label=label,
            confidence=confidence,
            warnings=warnings,
            evidence={
                "sample_size": item.sample_size,
                "correct_rate": (
                    item.correct_rate
                    if item.correct_rate is not None
                    else 1.0 - item.question_error_rate
                ),
                "difficulty_index": (
                    item.difficulty_index
                    if item.difficulty_index is not None
                    else 1.0 - item.question_error_rate
                ),
                "question_error_rate": item.question_error_rate,
                "avg_response_time": item.avg_response_time,
                "hint_usage_rate": item.hint_usage_rate,
                "skip_rate": item.skip_rate,
                "discrimination_index": item.discrimination_index,
                "quality_label": label,
                "confidence": confidence,
            },
        )

    def _historical_discrimination_index(
        self,
        attempts: list[HistoricalQuestionAttempt],
    ) -> float:
        mastery_attempts = [
            attempt for attempt in attempts
            if attempt.learner_mastery is not None
        ]
        if len(mastery_attempts) < self.MIN_HISTORICAL_SAMPLE_SIZE:
            return 0.0

        sorted_attempts = sorted(
            mastery_attempts,
            key=lambda attempt: float(attempt.learner_mastery or 0.0),
            reverse=True,
        )
        group_size = max(2, len(sorted_attempts) // 3)
        high = sorted_attempts[:group_size]
        low = sorted_attempts[-group_size:]
        return round(self._correct_rate(high) - self._correct_rate(low), 4)

    @staticmethod
    def _correct_rate(attempts: list[HistoricalQuestionAttempt]) -> float:
        if not attempts:
            return 0.0
        return sum(1 for attempt in attempts if attempt.is_correct) / len(attempts)

    def _confidence(self, sample_size: int) -> float:
        return round(min(1.0, sample_size / self.STRONG_CONFIDENCE_SAMPLE_SIZE), 2)

    def _quality_label(
        self,
        *,
        score: float,
        sample_size: int,
        correct_rate: float,
    ) -> str:
        if sample_size < self.MIN_HISTORICAL_SAMPLE_SIZE:
            return "insufficient_data"
        if score < self.LOW_QUALITY_THRESHOLD:
            return "review"
        if correct_rate < 0.30:
            return "too_hard"
        if correct_rate > 0.95:
            return "too_easy"
        if score >= 85.0:
            return "strong"
        return "acceptable"

    @staticmethod
    def _validate_rate(name: str, value: float) -> None:
        if not 0.0 <= value <= 1.0:
            raise ValueError(f"{name} must be between 0 and 1")
