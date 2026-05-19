"""
T-09: Contextual Memory

Stores the previous session ending state and recommends the first question for
the next session. If the student ended frustrated, AIM starts with an Easy Win.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Protocol, Sequence

from ai_core.emotional_state_detector import EmotionalState


class SessionStartMode(str, Enum):
    STANDARD = "STANDARD"
    EASY_WIN = "EASY_WIN"


@dataclass(frozen=True)
class LastSessionMemory:
    student_id: int
    last_session_frustration_score: float
    last_session_ending_mastery: float
    last_skill_studied: str
    ending_state: EmotionalState


@dataclass(frozen=True)
class SkillMasterySnapshot:
    skill_id: str
    mastery: float


@dataclass(frozen=True)
class SessionStartRecommendation:
    mode: SessionStartMode
    first_question_difficulty: int | None
    skill_id: str | None
    reason: str
    last_skill_studied: str | None


class ContextualMemoryStore(Protocol):
    def save_last_session(self, memory: LastSessionMemory) -> None: ...
    def get_last_session(self, student_id: int) -> LastSessionMemory | None: ...


class InMemoryContextualMemoryStore:
    def __init__(self) -> None:
        self._store: dict[int, LastSessionMemory] = {}

    def save_last_session(self, memory: LastSessionMemory) -> None:
        self._store[memory.student_id] = memory

    def get_last_session(self, student_id: int) -> LastSessionMemory | None:
        return self._store.get(student_id)


class ContextualMemory:
    HIGH_FRUSTRATION_THRESHOLD = 0.70
    HIGH_MASTERY_THRESHOLD = 70.0

    def __init__(self, store: ContextualMemoryStore | None = None) -> None:
        self._store = store or InMemoryContextualMemoryStore()

    def store_session_end(
        self,
        *,
        student_id: int,
        last_session_frustration_score: float,
        last_session_ending_mastery: float,
        last_skill_studied: str,
    ) -> LastSessionMemory:
        ending_state = self._ending_state(
            last_session_frustration_score,
            last_session_ending_mastery,
        )
        memory = LastSessionMemory(
            student_id=student_id,
            last_session_frustration_score=last_session_frustration_score,
            last_session_ending_mastery=last_session_ending_mastery,
            last_skill_studied=last_skill_studied,
            ending_state=ending_state,
        )
        self._store.save_last_session(memory)
        return memory

    def get_last_session(self, student_id: int) -> LastSessionMemory | None:
        return self._store.get_last_session(student_id)

    def get_session_start_recommendation(
        self,
        *,
        student_id: int,
        skill_states: Sequence[SkillMasterySnapshot],
    ) -> SessionStartRecommendation:
        memory = self.get_last_session(student_id)
        if memory is None:
            return SessionStartRecommendation(
                mode=SessionStartMode.STANDARD,
                first_question_difficulty=None,
                skill_id=None,
                reason="No previous session memory is available.",
                last_skill_studied=None,
            )

        if memory.last_session_frustration_score <= self.HIGH_FRUSTRATION_THRESHOLD:
            return SessionStartRecommendation(
                mode=SessionStartMode.STANDARD,
                first_question_difficulty=None,
                skill_id=memory.last_skill_studied,
                reason="Previous session did not end frustrated.",
                last_skill_studied=memory.last_skill_studied,
            )

        easy_skill = self._select_high_mastery_skill(skill_states)
        if easy_skill is None:
            return SessionStartRecommendation(
                mode=SessionStartMode.STANDARD,
                first_question_difficulty=None,
                skill_id=memory.last_skill_studied,
                reason="Previous session was frustrated, but no high-mastery skill exists yet.",
                last_skill_studied=memory.last_skill_studied,
            )

        return SessionStartRecommendation(
            mode=SessionStartMode.EASY_WIN,
            first_question_difficulty=1,
            skill_id=easy_skill.skill_id,
            reason="Previous session ended frustrated. Start with an Easy Win.",
            last_skill_studied=memory.last_skill_studied,
        )

    def _select_high_mastery_skill(
        self,
        skill_states: Sequence[SkillMasterySnapshot],
    ) -> SkillMasterySnapshot | None:
        high_mastery = [
            state for state in skill_states
            if state.mastery >= self.HIGH_MASTERY_THRESHOLD
        ]
        if not high_mastery:
            return None
        return max(high_mastery, key=lambda state: state.mastery)

    def _ending_state(
        self,
        frustration_score: float,
        ending_mastery: float,
    ) -> EmotionalState:
        if frustration_score > self.HIGH_FRUSTRATION_THRESHOLD:
            return EmotionalState.FRUSTRATED
        if frustration_score == 0.0 and ending_mastery >= self.HIGH_MASTERY_THRESHOLD:
            return EmotionalState.CONFIDENT
        return EmotionalState.NEUTRAL
