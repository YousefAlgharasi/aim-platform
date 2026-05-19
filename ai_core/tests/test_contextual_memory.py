"""
T-09 tests for ContextualMemory.
"""

from __future__ import annotations

from ai_core.contextual_memory import (
    ContextualMemory,
    SessionStartMode,
    SkillMasterySnapshot,
)
from ai_core.emotional_state_detector import EmotionalState


class TestContextualMemory:
    def setup_method(self) -> None:
        self.memory = ContextualMemory()

    def test_store_session_end_frustrated(self) -> None:
        stored = self.memory.store_session_end(
            student_id=1,
            last_session_frustration_score=1.0,
            last_session_ending_mastery=40.0,
            last_skill_studied="GRAMMAR_PASSIVE_VOICE",
        )

        assert stored.ending_state == EmotionalState.FRUSTRATED
        assert self.memory.get_last_session(1) == stored

    def test_store_session_end_confident(self) -> None:
        stored = self.memory.store_session_end(
            student_id=1,
            last_session_frustration_score=0.0,
            last_session_ending_mastery=90.0,
            last_skill_studied="VOCAB_DAILY",
        )

        assert stored.ending_state == EmotionalState.CONFIDENT

    def test_new_student_gets_standard_start(self) -> None:
        rec = self.memory.get_session_start_recommendation(
            student_id=404,
            skill_states=[],
        )

        assert rec.mode == SessionStartMode.STANDARD
        assert rec.first_question_difficulty is None
        assert rec.skill_id is None

    def test_frustrated_student_gets_easy_win_on_highest_mastery_skill(self) -> None:
        self.memory.store_session_end(
            student_id=1,
            last_session_frustration_score=0.9,
            last_session_ending_mastery=30.0,
            last_skill_studied="GRAMMAR_PASSIVE_VOICE",
        )

        rec = self.memory.get_session_start_recommendation(
            student_id=1,
            skill_states=[
                SkillMasterySnapshot("VOCAB_DAILY", 82.0),
                SkillMasterySnapshot("GRAMMAR_TO_BE", 95.0),
                SkillMasterySnapshot("GRAMMAR_PASSIVE_VOICE", 30.0),
            ],
        )

        assert rec.mode == SessionStartMode.EASY_WIN
        assert rec.first_question_difficulty == 1
        assert rec.skill_id == "GRAMMAR_TO_BE"
        assert rec.last_skill_studied == "GRAMMAR_PASSIVE_VOICE"

    def test_frustration_boundary_at_0_70_does_not_trigger_easy_win(self) -> None:
        self.memory.store_session_end(
            student_id=1,
            last_session_frustration_score=0.70,
            last_session_ending_mastery=50.0,
            last_skill_studied="GRAMMAR_CONDITIONALS",
        )

        rec = self.memory.get_session_start_recommendation(
            student_id=1,
            skill_states=[SkillMasterySnapshot("VOCAB_DAILY", 90.0)],
        )

        assert rec.mode == SessionStartMode.STANDARD
        assert rec.first_question_difficulty is None

    def test_frustrated_student_without_high_mastery_skill_gets_standard_start(self) -> None:
        self.memory.store_session_end(
            student_id=1,
            last_session_frustration_score=0.95,
            last_session_ending_mastery=25.0,
            last_skill_studied="GRAMMAR_CONDITIONALS",
        )

        rec = self.memory.get_session_start_recommendation(
            student_id=1,
            skill_states=[
                SkillMasterySnapshot("GRAMMAR_CONDITIONALS", 25.0),
                SkillMasterySnapshot("VOCAB_ACADEMIC", 55.0),
            ],
        )

        assert rec.mode == SessionStartMode.STANDARD
        assert rec.skill_id == "GRAMMAR_CONDITIONALS"
