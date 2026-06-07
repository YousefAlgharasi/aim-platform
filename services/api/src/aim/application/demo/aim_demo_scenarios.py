"""Shared AIM scenario definitions for demos and algorithm tests."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DemoAttemptInput:
    question_id: str
    is_correct: bool
    response_time: float
    attempts: int
    difficulty: int
    hint_used: bool = False
    skip: bool = False
    answer_changed: bool = False
    time_of_day: str = "morning"


@dataclass(frozen=True)
class DemoInitialSkillState:
    mastery: float
    confidence: float
    retention: float
    current_difficulty: int
    avg_speed: float
    weakness: str
    consistency: float = 100.0


@dataclass(frozen=True)
class DemoRelatedSkillState:
    skill_id: str
    mastery: float
    confidence: float = 50.0
    retention: float = 100.0
    current_difficulty: int = 1
    avg_speed: float = 0.0
    consistency: float = 100.0


@dataclass(frozen=True)
class DemoScenario:
    key: str
    student_name: str
    course: str
    level: str
    lesson: str
    skill_id: str
    skill_label: str
    initial_state: DemoInitialSkillState
    attempts: tuple[DemoAttemptInput, ...]
    related_skill_states: tuple[DemoRelatedSkillState, ...] = ()

    @property
    def previous_mastery(self) -> float:
        return self.initial_state.mastery

    @property
    def previous_confidence(self) -> float:
        return self.initial_state.confidence

    @property
    def previous_retention(self) -> float:
        return self.initial_state.retention

    @property
    def previous_difficulty(self) -> int:
        return self.initial_state.current_difficulty

    @property
    def previous_avg_speed(self) -> float:
        return self.initial_state.avg_speed

    @property
    def previous_weakness(self) -> str:
        return self.initial_state.weakness


def _attempt(
    question_id: str,
    *,
    is_correct: bool,
    response_time: float,
    attempts: int,
    difficulty: int,
    hint_used: bool = False,
    skip: bool = False,
    answer_changed: bool = False,
) -> DemoAttemptInput:
    return DemoAttemptInput(
        question_id=question_id,
        is_correct=is_correct,
        response_time=response_time,
        attempts=attempts,
        difficulty=difficulty,
        hint_used=hint_used,
        skip=skip,
        answer_changed=answer_changed,
    )


SCENARIOS: dict[str, DemoScenario] = {
    "strong_student": DemoScenario(
        key="strong_student",
        student_name="Maha Strong",
        course="English Foundations",
        level="B1",
        lesson="Reading Inference",
        skill_id="READING_INFERENCE",
        skill_label="Reading Comprehension",
        initial_state=DemoInitialSkillState(
            mastery=82.0,
            confidence=96.0,
            retention=88.0,
            current_difficulty=3,
            avg_speed=8.0,
            weakness="None detected",
        ),
        attempts=(
            _attempt("inference:q1", is_correct=True, response_time=4.0, attempts=1, difficulty=4),
            _attempt("inference:q2", is_correct=True, response_time=4.5, attempts=1, difficulty=4),
            _attempt("inference:q3", is_correct=True, response_time=5.0, attempts=1, difficulty=5),
            _attempt("inference:q4", is_correct=True, response_time=4.2, attempts=1, difficulty=5),
            _attempt("inference:q5", is_correct=True, response_time=4.8, attempts=1, difficulty=5),
            _attempt("inference:q6", is_correct=True, response_time=5.1, attempts=1, difficulty=5),
        ),
    ),
    "weak_reading_student": DemoScenario(
        key="weak_reading_student",
        student_name="Yara Reading",
        course="English Foundations",
        level="A2",
        lesson="Short Passage Comprehension",
        skill_id="READING_COMPREHENSION",
        skill_label="Reading Comprehension",
        initial_state=DemoInitialSkillState(
            mastery=42.0,
            confidence=45.0,
            retention=58.0,
            current_difficulty=3,
            avg_speed=12.0,
            weakness="Reading Comprehension",
        ),
        attempts=(
            _attempt("main_idea:q1", is_correct=False, response_time=18.4, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("vocabulary:q2", is_correct=False, response_time=21.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("main_idea:q3", is_correct=True, response_time=20.2, attempts=2, difficulty=2, hint_used=True, answer_changed=True),
            _attempt("detail:q4", is_correct=False, response_time=24.5, attempts=3, difficulty=3, hint_used=True),
            _attempt("vocabulary:q5", is_correct=False, response_time=19.8, attempts=2, difficulty=2, hint_used=True),
        ),
    ),
    "rushing_student": DemoScenario(
        key="rushing_student",
        student_name="Samir Fast",
        course="English Foundations",
        level="A2",
        lesson="Grammar Accuracy",
        skill_id="GRAMMAR_VERB_FORMS",
        skill_label="Verb Tenses",
        initial_state=DemoInitialSkillState(
            mastery=61.0,
            confidence=92.0,
            retention=76.0,
            current_difficulty=3,
            avg_speed=8.0,
            weakness="Verb Tenses",
        ),
        attempts=(
            _attempt("tense:q1", is_correct=False, response_time=2.1, attempts=1, difficulty=3),
            _attempt("tense:q2", is_correct=False, response_time=2.4, attempts=1, difficulty=3),
            _attempt("tense:q3", is_correct=True, response_time=2.8, attempts=1, difficulty=3, answer_changed=True),
            _attempt("tense:q4", is_correct=False, response_time=2.0, attempts=1, difficulty=4),
            _attempt("tense:q5", is_correct=False, response_time=1.9, attempts=1, difficulty=4),
            _attempt("tense:q6", is_correct=True, response_time=2.6, attempts=1, difficulty=3),
        ),
    ),
    "frustrated_student": DemoScenario(
        key="frustrated_student",
        student_name="Nour Support",
        course="English Foundations",
        level="A1",
        lesson="Sentence Basics",
        skill_id="SENTENCE_STRUCTURE",
        skill_label="Sentence Structure",
        initial_state=DemoInitialSkillState(
            mastery=78.0,
            confidence=10.0,
            retention=72.0,
            current_difficulty=3,
            avg_speed=8.0,
            weakness="Sentence Structure",
        ),
        attempts=(
            _attempt("sentence_order:q1", is_correct=False, response_time=19.2, attempts=2, difficulty=3, hint_used=True),
            _attempt("sentence_order:q2", is_correct=False, response_time=24.4, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("sentence_order:q3", is_correct=False, response_time=30.8, attempts=3, difficulty=3, hint_used=True),
            _attempt("sentence_order:q4", is_correct=False, response_time=34.5, attempts=1, difficulty=3),
            _attempt("sentence_order:q5", is_correct=False, response_time=7.0, attempts=1, difficulty=2, skip=True),
        ),
    ),
    "low_confidence_student": DemoScenario(
        key="low_confidence_student",
        student_name="Lina Careful",
        course="English Foundations",
        level="A2",
        lesson="Vocabulary in Context",
        skill_id="VOCAB_CONTEXT",
        skill_label="Context Vocabulary",
        initial_state=DemoInitialSkillState(
            mastery=62.0,
            confidence=18.0,
            retention=84.0,
            current_difficulty=3,
            avg_speed=11.0,
            weakness="Low confidence",
            consistency=72.0,
        ),
        attempts=(
            _attempt("context:q1", is_correct=True, response_time=11.5, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("context:q2", is_correct=True, response_time=12.2, attempts=2, difficulty=3, hint_used=True),
            _attempt("context:q3", is_correct=True, response_time=10.8, attempts=1, difficulty=3, answer_changed=True),
            _attempt("context:q4", is_correct=False, response_time=13.1, attempts=2, difficulty=3, hint_used=True, answer_changed=True),
            _attempt("context:q5", is_correct=True, response_time=11.9, attempts=2, difficulty=2, hint_used=True),
            _attempt("context:q6", is_correct=True, response_time=12.4, attempts=1, difficulty=3, answer_changed=True),
            _attempt("context:q7", is_correct=True, response_time=10.6, attempts=2, difficulty=3, hint_used=True),
            _attempt("context:q8", is_correct=True, response_time=11.1, attempts=1, difficulty=3),
        ),
    ),
    "hint_dependent_student": DemoScenario(
        key="hint_dependent_student",
        student_name="Omar Hints",
        course="English Foundations",
        level="A2",
        lesson="Grammar Support",
        skill_id="GRAMMAR_VERB_FORMS",
        skill_label="Verb Forms",
        initial_state=DemoInitialSkillState(
            mastery=55.0,
            confidence=58.0,
            retention=82.0,
            current_difficulty=3,
            avg_speed=10.0,
            weakness="Hint dependency",
            consistency=62.0,
        ),
        attempts=(
            _attempt("verb_hint:q1", is_correct=True, response_time=12.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("verb_hint:q2", is_correct=True, response_time=13.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("verb_hint:q3", is_correct=False, response_time=11.4, attempts=2, difficulty=3, hint_used=True),
            _attempt("verb_hint:q4", is_correct=True, response_time=12.8, attempts=3, difficulty=2, hint_used=True),
            _attempt("verb_hint:q5", is_correct=True, response_time=10.9, attempts=2, difficulty=3, hint_used=True),
            _attempt("verb_hint:q6", is_correct=False, response_time=14.2, attempts=3, difficulty=3, hint_used=True),
            _attempt("verb_hint:q7", is_correct=True, response_time=12.1, attempts=2, difficulty=2, hint_used=True),
            _attempt("verb_hint:q8", is_correct=True, response_time=11.8, attempts=2, difficulty=3, hint_used=True),
        ),
    ),
    "prerequisite_gap_student": DemoScenario(
        key="prerequisite_gap_student",
        student_name="Hana Passive",
        course="English Foundations",
        level="B1",
        lesson="Passive Voice",
        skill_id="GRAMMAR_PASSIVE_VOICE",
        skill_label="Passive Voice",
        initial_state=DemoInitialSkillState(
            mastery=72.0,
            confidence=74.0,
            retention=86.0,
            current_difficulty=3,
            avg_speed=9.0,
            weakness="Missing prerequisites",
            consistency=80.0,
        ),
        related_skill_states=(
            DemoRelatedSkillState("GRAMMAR_TO_BE", mastery=35.0, confidence=40.0),
            DemoRelatedSkillState("GRAMMAR_PAST_PARTICIPLE", mastery=88.0, confidence=80.0),
            DemoRelatedSkillState("GRAMMAR_TENSES_PRESENT_SIMPLE", mastery=85.0, confidence=80.0),
            DemoRelatedSkillState("GRAMMAR_TENSES_PAST_SIMPLE", mastery=82.0, confidence=78.0),
        ),
        attempts=(
            _attempt("passive:q1", is_correct=True, response_time=9.8, attempts=1, difficulty=3),
            _attempt("passive:q2", is_correct=True, response_time=10.2, attempts=1, difficulty=3),
            _attempt("passive:q3", is_correct=False, response_time=11.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("passive:q4", is_correct=True, response_time=9.4, attempts=1, difficulty=3),
        ),
    ),
    "retention_review_student": DemoScenario(
        key="retention_review_student",
        student_name="Maya Review",
        course="English Foundations",
        level="A2",
        lesson="Present Perfect Refresh",
        skill_id="GRAMMAR_TENSES_PRESENT_PERFECT",
        skill_label="Present Perfect",
        initial_state=DemoInitialSkillState(
            mastery=76.0,
            confidence=70.0,
            retention=45.0,
            current_difficulty=3,
            avg_speed=10.0,
            weakness="Low retention",
            consistency=70.0,
        ),
        related_skill_states=(
            DemoRelatedSkillState("GRAMMAR_TENSES_PRESENT_SIMPLE", mastery=85.0, confidence=80.0),
            DemoRelatedSkillState("GRAMMAR_TENSES_PAST_SIMPLE", mastery=85.0, confidence=80.0),
        ),
        attempts=(
            _attempt("present_perfect:q1", is_correct=True, response_time=10.5, attempts=1, difficulty=3),
            _attempt("present_perfect:q2", is_correct=False, response_time=13.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("present_perfect:q3", is_correct=True, response_time=11.4, attempts=1, difficulty=2),
            _attempt("present_perfect:q4", is_correct=False, response_time=14.2, attempts=2, difficulty=3, hint_used=True),
            _attempt("present_perfect:q5", is_correct=True, response_time=10.9, attempts=1, difficulty=3),
        ),
    ),
    "slow_but_accurate_student": DemoScenario(
        key="slow_but_accurate_student",
        student_name="Salma Slow Accurate",
        course="English Foundations",
        level="A2",
        lesson="Reading Details",
        skill_id="VOCAB_BASIC",
        skill_label="Basic Vocabulary",
        initial_state=DemoInitialSkillState(
            mastery=64.0,
            confidence=68.0,
            retention=88.0,
            current_difficulty=3,
            avg_speed=9.0,
            weakness="Slow but accurate",
            consistency=80.0,
        ),
        attempts=(
            _attempt("reading_detail:q1", is_correct=True, response_time=24.0, attempts=1, difficulty=3),
            _attempt("reading_detail:q2", is_correct=True, response_time=25.5, attempts=1, difficulty=3),
            _attempt("reading_detail:q3", is_correct=True, response_time=23.8, attempts=1, difficulty=3),
            _attempt("reading_detail:q4", is_correct=True, response_time=26.1, attempts=1, difficulty=3),
            _attempt("reading_detail:q5", is_correct=True, response_time=24.7, attempts=1, difficulty=3),
            _attempt("reading_detail:q6", is_correct=True, response_time=25.2, attempts=1, difficulty=3),
            _attempt("reading_detail:q7", is_correct=True, response_time=24.5, attempts=1, difficulty=3),
            _attempt("reading_detail:q8", is_correct=True, response_time=26.0, attempts=1, difficulty=3),
            _attempt("reading_detail:q9", is_correct=True, response_time=23.6, attempts=1, difficulty=3),
            _attempt("reading_detail:q10", is_correct=True, response_time=24.9, attempts=1, difficulty=3),
        ),
    ),
    "low_reliability_student": DemoScenario(
        key="low_reliability_student",
        student_name="Nabil Sparse",
        course="English Foundations",
        level="A1",
        lesson="Short Diagnostic",
        skill_id="VOCAB_BASIC",
        skill_label="Basic Vocabulary",
        initial_state=DemoInitialSkillState(
            mastery=50.0,
            confidence=50.0,
            retention=90.0,
            current_difficulty=2,
            avg_speed=8.0,
            weakness="Insufficient evidence",
            consistency=75.0,
        ),
        attempts=(
            _attempt("vocab_basic:q1", is_correct=True, response_time=7.0, attempts=1, difficulty=2),
            _attempt("vocab_basic:q2", is_correct=True, response_time=8.0, attempts=1, difficulty=2),
        ),
    ),
    "questionable_question_quality_student": DemoScenario(
        key="questionable_question_quality_student",
        student_name="Rami Question Quality",
        course="English Foundations",
        level="A2",
        lesson="Ambiguous Question Check",
        skill_id="VOCAB_CONTEXT",
        skill_label="Context Vocabulary",
        initial_state=DemoInitialSkillState(
            mastery=58.0,
            confidence=60.0,
            retention=82.0,
            current_difficulty=3,
            avg_speed=10.0,
            weakness="Question quality risk",
            consistency=70.0,
        ),
        attempts=(
            _attempt("ambiguous_item:q1", is_correct=False, response_time=15.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("ambiguous_item:q1", is_correct=False, response_time=16.0, attempts=2, difficulty=3, hint_used=True),
            _attempt("ambiguous_item:q1", is_correct=False, response_time=12.0, attempts=1, difficulty=3, skip=True, hint_used=True),
            _attempt("ambiguous_item:q1", is_correct=False, response_time=17.0, attempts=3, difficulty=3, hint_used=True),
            _attempt("ambiguous_item:q1", is_correct=True, response_time=18.0, attempts=2, difficulty=3, hint_used=True),
        ),
    ),
}


def get_demo_scenario(key: str) -> DemoScenario | None:
    return SCENARIOS.get(key)


def scenario_keys() -> tuple[str, ...]:
    return tuple(SCENARIOS)
