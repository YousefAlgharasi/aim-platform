"""
T-07 tests for ErrorPatternClassifier.
"""

from __future__ import annotations

from ai_core.error_pattern_classifier import (
    ErrorAttempt,
    ErrorPatternClassifier,
    ErrorPatternType,
)


def make_attempt(
    index: int,
    *,
    is_correct: bool,
    question_subtype: str | None = "mixed",
    is_timed: bool = False,
    session_position: int | None = None,
) -> ErrorAttempt:
    return ErrorAttempt(
        student_id=1,
        skill_id="present_perfect",
        question_id=f"q{index}",
        is_correct=is_correct,
        question_subtype=question_subtype,
        is_timed=is_timed,
        session_position=session_position or index,
    )


class TestErrorPatternClassifier:
    def setup_method(self) -> None:
        self.classifier = ErrorPatternClassifier()

    def test_type_1_random_low_accuracy_no_repeating_subtype(self) -> None:
        attempts = [
            make_attempt(i, is_correct=(i in {3, 7, 10}), question_subtype=f"type_{i}")
            for i in range(1, 11)
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.TYPE_1_RANDOM
        assert result.accuracy == 30.0
        assert "Reteach" in result.treatment_recommendation

    def test_type_1_boundary_at_40_is_not_random(self) -> None:
        attempts = [
            make_attempt(i, is_correct=(i in {1, 2, 3, 4}), question_subtype=f"type_{i}")
            for i in range(1, 11)
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN

    def test_type_2_consistent_subtype_errors(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, question_subtype="past_participle"),
            make_attempt(2, is_correct=False, question_subtype="past_participle"),
            make_attempt(3, is_correct=False, question_subtype="past_participle"),
            make_attempt(4, is_correct=True, question_subtype="past_participle"),
            make_attempt(5, is_correct=True, question_subtype="vocab"),
            make_attempt(6, is_correct=True, question_subtype="vocab"),
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.TYPE_2_CONSISTENT
        assert result.evidence["question_subtype"] == "past_participle"
        assert "targeted explanation" in result.treatment_recommendation

    def test_type_2_requires_more_than_60_percent_error_rate(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, question_subtype="modals"),
            make_attempt(2, is_correct=False, question_subtype="modals"),
            make_attempt(3, is_correct=True, question_subtype="modals"),
            make_attempt(4, is_correct=True, question_subtype="modals"),
            make_attempt(5, is_correct=True, question_subtype="modals"),
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN

    def test_type_3_pressure_errors(self) -> None:
        attempts = [
            make_attempt(i, is_correct=True, is_timed=False)
            for i in range(1, 7)
        ] + [
            make_attempt(i, is_correct=(i == 7), is_timed=True)
            for i in range(7, 13)
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.TYPE_3_PRESSURE
        assert result.evidence["accuracy_drop"] > 25.0
        assert "slower reflection" in result.treatment_recommendation

    def test_type_3_boundary_drop_of_25_is_not_pressure(self) -> None:
        attempts = [
            make_attempt(i, is_correct=(i != 1), is_timed=False)
            for i in range(1, 5)
        ] + [
            make_attempt(i, is_correct=(i in {5, 6}), is_timed=True)
            for i in range(5, 9)
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN

    def test_type_4_warmup_errors(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, session_position=1),
            make_attempt(2, is_correct=False, session_position=2),
            make_attempt(3, is_correct=False, session_position=3),
            make_attempt(4, is_correct=True, session_position=4),
            make_attempt(5, is_correct=True, session_position=5),
        ] + [
            make_attempt(i, is_correct=True, session_position=i)
            for i in range(6, 13)
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.TYPE_4_WARMUP
        assert result.evidence["first_5_error_rate"] == 0.6
        assert "warm-up" in result.treatment_recommendation

    def test_type_4_requires_first_five_more_than_twice_rest(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, session_position=1),
            make_attempt(2, is_correct=True, session_position=2),
            make_attempt(3, is_correct=True, session_position=3),
            make_attempt(4, is_correct=True, session_position=4),
            make_attempt(5, is_correct=True, session_position=5),
            make_attempt(6, is_correct=False, session_position=6),
            make_attempt(7, is_correct=True, session_position=7),
            make_attempt(8, is_correct=True, session_position=8),
            make_attempt(9, is_correct=True, session_position=9),
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN

    def test_uses_only_last_20_attempts(self) -> None:
        old_wrong = [
            make_attempt(i, is_correct=False, question_subtype=f"old_{i}")
            for i in range(1, 11)
        ]
        recent_correct = [
            make_attempt(i, is_correct=True, question_subtype=f"new_{i}")
            for i in range(11, 31)
        ]

        result = self.classifier.classify(old_wrong + recent_correct)

        assert result.attempts_analyzed == 20
        assert result.accuracy == 100.0
        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN

    def test_skipped_attempts_are_ignored(self) -> None:
        attempts = [
            ErrorAttempt(
                student_id=1,
                skill_id="present_perfect",
                question_id="skip",
                is_correct=False,
                question_subtype="ghost",
                skip=True,
            ),
            make_attempt(1, is_correct=True),
        ]

        result = self.classifier.classify(attempts)

        assert result.attempts_analyzed == 1
        assert result.accuracy == 100.0

    def test_no_attempts_returns_no_dominant_pattern(self) -> None:
        result = self.classifier.classify([])

        assert result.pattern_type == ErrorPatternType.NO_DOMINANT_PATTERN
        assert result.attempts_analyzed == 0

    def test_priority_warmup_before_other_patterns(self) -> None:
        attempts = [
            make_attempt(1, is_correct=False, is_timed=True, session_position=1),
            make_attempt(2, is_correct=False, is_timed=True, session_position=2),
            make_attempt(3, is_correct=False, is_timed=True, session_position=3),
            make_attempt(4, is_correct=True, is_timed=False, session_position=4),
            make_attempt(5, is_correct=True, is_timed=False, session_position=5),
            make_attempt(6, is_correct=True, is_timed=False, session_position=6),
            make_attempt(7, is_correct=True, is_timed=False, session_position=7),
            make_attempt(8, is_correct=True, is_timed=False, session_position=8),
        ]

        result = self.classifier.classify(attempts)

        assert result.pattern_type == ErrorPatternType.TYPE_4_WARMUP
