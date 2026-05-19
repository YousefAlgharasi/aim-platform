"""
T-11 tests for TransferLearningDetector.
"""

from __future__ import annotations

import pytest

from aim.domain.services.transfer_learning_detector import (
    TransferCategory,
    TransferLearningDetector,
    TransferLearningRecord,
)


class TestTransferLearningDetector:
    def setup_method(self) -> None:
        self.detector = TransferLearningDetector()

    def test_relationship_map_reads_skill_graph_coefficients(self) -> None:
        relationships = self.detector.get_relationship_map()

        assert relationships[
            ("GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE")
        ] == pytest.approx(0.9)

    def test_high_transfer_score(self) -> None:
        result = self.detector.calculate_transfer_score(
            from_skill_id="GRAMMAR_VERB_FORMS",
            to_skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
            previous_skill_mastery=90.0,
            avg_time_to_learn_new_skill=1.0,
        )

        assert result.transfer_score == pytest.approx(0.81)
        assert result.category == TransferCategory.HIGH
        assert result.recommendation_flag == "ACCELERATED"

    def test_low_transfer_score(self) -> None:
        result = self.detector.calculate_transfer_score(
            from_skill_id="GRAMMAR_VERB_FORMS",
            to_skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
            previous_skill_mastery=30.0,
            avg_time_to_learn_new_skill=5.0,
        )

        assert result.category == TransferCategory.LOW
        assert result.recommendation_flag == "TEACH_FROM_SCRATCH"

    def test_detect_for_student_returns_best_transfer(self) -> None:
        records = [
            TransferLearningRecord(1, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 90.0, 1.0, True),
            TransferLearningRecord(1, "GRAMMAR_TO_BE", "GRAMMAR_TENSES_PRESENT_SIMPLE", 70.0, 1.0, True),
            TransferLearningRecord(2, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 20.0, 1.0, False),
        ]

        result = self.detector.detect_for_student(1, records)

        assert result is not None
        assert result.from_skill_id == "GRAMMAR_VERB_FORMS"
        assert result.category == TransferCategory.HIGH

    def test_compare_prerequisite_groups(self) -> None:
        records = [
            TransferLearningRecord(1, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 90.0, 2.0, True),
            TransferLearningRecord(2, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 80.0, 4.0, True),
            TransferLearningRecord(3, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 30.0, 8.0, False),
            TransferLearningRecord(4, "GRAMMAR_VERB_FORMS", "GRAMMAR_TENSES_PRESENT_SIMPLE", 20.0, 10.0, False),
        ]

        comparison = self.detector.compare_prerequisite_groups(
            records,
            from_skill_id="GRAMMAR_VERB_FORMS",
            to_skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
        )

        assert comparison.mastered_avg_time == 3.0
        assert comparison.unmastered_avg_time == 9.0
        assert comparison.acceleration_ratio == 3.0

    def test_unrelated_skills_raise(self) -> None:
        with pytest.raises(ValueError, match="No prerequisite relationship"):
            self.detector.calculate_transfer_score(
                from_skill_id="VOCAB_BASIC",
                to_skill_id="GRAMMAR_VERB_FORMS",
                previous_skill_mastery=90.0,
                avg_time_to_learn_new_skill=1.0,
            )
