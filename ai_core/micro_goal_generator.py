"""
T-06: Micro-Goal Generator

Turns student state into concrete, display-ready goals. The UI should be able
to show these strings directly without calculating score wording itself.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any, Mapping, Sequence


class GoalType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


@dataclass(frozen=True)
class MicroGoal:
    goal_type: GoalType
    text: str
    skill_id: str | None = None


class MicroGoalGenerator:
    """
    Generates one daily, weekly, and monthly goal.

    Rules:
      - Daily: weakest skill, 5 correct answers in a row.
      - Weekly: current skill, reach the mastery threshold.
      - Monthly: complete the current skill level.
    """

    MASTERY_TARGET = 80.0

    def __init__(self, skill_graph: Any | None = None) -> None:
        self._skill_graph = skill_graph

    def generate(
        self,
        student_states: Sequence[Mapping[str, Any]],
        *,
        current_skill_id: str | None = None,
    ) -> list[MicroGoal]:
        if not student_states and current_skill_id is None:
            raise ValueError(
                "MicroGoalGenerator needs at least one skill state or "
                "a current_skill_id"
            )

        normalized = [dict(state) for state in student_states]
        current_state = self._select_current_state(normalized, current_skill_id)
        weakest_state = self._select_weakest_state(normalized) or current_state

        current_skill_id = current_state.get("skill_id")
        weakest_skill_id = weakest_state.get("skill_id")

        current_name = self._skill_name(current_skill_id)
        weakest_name = self._skill_name(weakest_skill_id)

        return [
            MicroGoal(
                goal_type=GoalType.DAILY,
                skill_id=weakest_skill_id,
                text=f"Answer 5 {weakest_name} questions correctly in a row.",
            ),
            MicroGoal(
                goal_type=GoalType.WEEKLY,
                skill_id=current_skill_id,
                text=f"Reach 80% mastery on {current_name}.",
            ),
            MicroGoal(
                goal_type=GoalType.MONTHLY,
                skill_id=current_skill_id,
                text=self._monthly_goal_text(current_skill_id),
            ),
        ]

    def _select_current_state(
        self,
        states: list[dict[str, Any]],
        current_skill_id: str | None,
    ) -> dict[str, Any]:
        if current_skill_id is not None:
            for state in states:
                if state.get("skill_id") == current_skill_id:
                    return state
            return {"skill_id": current_skill_id, "mastery": 0.0}

        if not states:
            raise ValueError("No student states available")

        return min(states, key=lambda s: float(s.get("mastery", 0.0)))

    def _select_weakest_state(
        self,
        states: list[dict[str, Any]],
    ) -> dict[str, Any] | None:
        if not states:
            return None

        return max(
            states,
            key=lambda s: (
                float(s.get("weakness_score", 0.0)),
                -float(s.get("mastery", 0.0)),
            ),
        )

    def _skill_name(self, skill_id: str | None) -> str:
        if not skill_id:
            return "current skill"

        if self._skill_graph is not None and skill_id in self._skill_graph:
            return self._skill_graph.get_skill(skill_id)["name"]

        return skill_id.replace("_", " ").title()

    def _monthly_goal_text(self, skill_id: str | None) -> str:
        if not skill_id:
            return "Complete the current skill level entirely."

        if self._skill_graph is not None and skill_id in self._skill_graph:
            skill = self._skill_graph.get_skill(skill_id)
            category = skill["category"]
            level = skill["level"]
            return f"Complete all Level {level} {category} skills."

        return f"Complete the level that includes {self._skill_name(skill_id)}."
