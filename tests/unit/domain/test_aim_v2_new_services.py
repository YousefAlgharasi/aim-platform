from __future__ import annotations

from aim.domain.services.decision_conflict_resolver import (
    DecisionConflictInput,
    DecisionConflictResolver,
)
from aim.domain.services.evidence_quality_engine import (
    EvidenceQualityEngine,
    EvidenceQualityInput,
)
from aim.domain.services.fairness_audit_engine import (
    FairnessAuditEngine,
    FairnessAuditInput,
)
from aim.domain.services.learning_response_pattern_detector import (
    LearningPatternAttempt,
    LearningResponsePatternDetector,
)
from aim.domain.services.outcome_tracker import OutcomeTracker, OutcomeTrackingInput
from aim.domain.services.question_quality_analyzer import (
    HistoricalQuestionAttempt,
    QuestionQualityAnalyzer,
    QuestionQualityInput,
)
from aim.domain.services.reliability_engine import ReliabilityEngine


def test_hint_usage_reduces_evidence_quality() -> None:
    engine = EvidenceQualityEngine()

    independent = engine.score_attempt(
        EvidenceQualityInput(True, 3, False, 0, False, 100.0)
    )
    hinted = engine.score_attempt(
        EvidenceQualityInput(True, 3, True, 0, False, 100.0)
    )

    assert hinted.evidence_quality_score < independent.evidence_quality_score
    assert "hint_used_reduces_evidence" in hinted.evidence_warnings


def test_retry_count_reduces_evidence_quality() -> None:
    engine = EvidenceQualityEngine()

    first_try = engine.score_attempt(
        EvidenceQualityInput(True, 3, False, 0, False, 100.0)
    )
    retried = engine.score_attempt(
        EvidenceQualityInput(True, 3, False, 2, False, 100.0)
    )

    assert retried.evidence_quality_score < first_try.evidence_quality_score


def test_low_attempt_count_reduces_reliability() -> None:
    result = ReliabilityEngine().calculate(3)

    assert result.reliability == 0.3
    assert result.decision_confidence == "low"
    assert result.evidence_warning is not None


def test_low_question_quality_reduces_impact() -> None:
    result = QuestionQualityAnalyzer().analyze(
        QuestionQualityInput(
            question_id="q1",
            question_error_rate=0.90,
            avg_response_time=30.0,
            hint_usage_rate=0.80,
            skip_rate=0.40,
            discrimination_index=0.0,
        )
    )

    assert result.quality_score < 60.0
    assert result.flag_for_review is True
    assert result.impact_weight < 0.60


def test_historical_question_quality_returns_insufficient_data() -> None:
    result = QuestionQualityAnalyzer().analyze_historical(
        "q-low-sample",
        [
            HistoricalQuestionAttempt(
                student_id=1,
                is_correct=False,
                response_time=10.0,
                hint_used=False,
                skip=False,
                learner_mastery=70.0,
            )
        ],
    )

    assert result.quality_label == "insufficient_data"
    assert result.quality_score == 85.0
    assert result.impact_weight == 0.85
    assert result.flag_for_review is False


def test_historical_question_quality_computes_discrimination() -> None:
    attempts = [
        HistoricalQuestionAttempt(i, True, 8.0, False, False, learner_mastery=90.0)
        for i in range(1, 5)
    ] + [
        HistoricalQuestionAttempt(i, False, 12.0, True, False, learner_mastery=35.0)
        for i in range(5, 9)
    ]

    result = QuestionQualityAnalyzer().analyze_historical("q-history", attempts)

    assert result.evidence["sample_size"] == 8
    assert result.evidence["correct_rate"] == 0.5
    assert result.evidence["difficulty_index"] == 0.5
    assert result.evidence["discrimination_index"] > 0.0
    assert result.quality_label in {"acceptable", "strong"}


def test_fairness_audit_returns_warnings_when_needed() -> None:
    result = FairnessAuditEngine().audit(
        FairnessAuditInput(
            accuracy_score=30.0,
            avg_response_time=1.0,
            response_time_used_in_mastery=False,
            mastery_delta=10.0,
            reliability=0.20,
            evidence_quality_score=30.0,
            difficulty_action="increase",
            question_quality_score=100.0,
        )
    )

    assert result.fairness_risk_level == "high"
    assert result.fairness_warnings


def test_learning_response_pattern_detects_hint_dependency() -> None:
    result = LearningResponsePatternDetector().detect(
        [
            LearningPatternAttempt(True, 10.0, True, 2, 3),
            LearningPatternAttempt(True, 10.0, True, 2, 3),
        ],
        mastery=60.0,
        confidence_score=60.0,
    )

    assert result.learning_response_pattern == "hint_dependent"


def test_conflict_resolver_prioritizes_overload() -> None:
    result = DecisionConflictResolver().resolve(
        DecisionConflictInput(
            frustration_score=90.0,
            emotional_signal="possible_learning_overload",
            prerequisite_gap_score=90.0,
            weakness_score=90.0,
            error_pattern_type="misunderstood_concept",
            retention=50.0,
            confidence_mismatch=True,
            difficulty_action="increase",
            transfer_category="HIGH",
            current_skill_id="skill",
        )
    )

    assert result.selected_action == "easy_win"
    assert result.final_priority == "high_frustration_or_overload"


def test_conflict_resolver_prioritizes_low_reliability_first() -> None:
    result = DecisionConflictResolver().resolve(
        DecisionConflictInput(
            frustration_score=90.0,
            emotional_signal="possible_learning_overload",
            prerequisite_gap_score=90.0,
            weakness_score=90.0,
            error_pattern_type="misunderstood_concept",
            retention=50.0,
            confidence_mismatch=True,
            difficulty_action="increase",
            transfer_category="HIGH",
            current_skill_id="skill",
            reliability=0.30,
        )
    )

    assert result.selected_action == "collect_more_evidence"
    assert result.final_priority == "low_reliability"


def test_outcome_tracker_classifies_success() -> None:
    result = OutcomeTracker().track(
        OutcomeTrackingInput(
            recommendation_id=1,
            mastery_before=50.0,
            mastery_after=58.0,
            retention_before=50.0,
            retention_after=50.0,
            weakness_before=40.0,
            weakness_after=35.0,
        )
    )

    assert result.outcome == "successful"
