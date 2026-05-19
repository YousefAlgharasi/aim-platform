"""
T-06 tests for MicroGoalGenerator.
"""

from __future__ import annotations

import pytest

from aim.domain.services.micro_goal_generator import GoalType, MicroGoalGenerator
from aim.infrastructure.skill_graph.skill_graph import SkillGraph


class TestMicroGoalGenerator:
    def test_generates_daily_weekly_monthly_goals(self) -> None:
        generator = MicroGoalGenerator(SkillGraph())
        goals = generator.generate(
            [
                {
                    "skill_id": "GRAMMAR_TENSES_PRESENT_PERFECT",
                    "mastery": 62.0,
                    "weakness_score": 40.0,
                },
                {
                    "skill_id": "GRAMMAR_PASSIVE_VOICE",
                    "mastery": 30.0,
                    "weakness_score": 90.0,
                },
            ],
            current_skill_id="GRAMMAR_TENSES_PRESENT_PERFECT",
        )

        assert [goal.goal_type for goal in goals] == [
            GoalType.DAILY,
            GoalType.WEEKLY,
            GoalType.MONTHLY,
        ]
        assert goals[0].text == (
            "Answer 5 Passive Voice questions correctly in a row."
        )
        assert goals[1].text == (
            "Reach 80% mastery on Present Perfect."
        )
        assert goals[2].text == "Complete all Level 3 Grammar skills."

    def test_uses_current_skill_when_no_weakness_state_exists(self) -> None:
        generator = MicroGoalGenerator()
        goals = generator.generate([], current_skill_id="present_perfect")
        assert goals[0].text == (
            "Answer 5 Present Perfect questions correctly in a row."
        )
        assert goals[1].text == "Reach 80% mastery on Present Perfect."

    def test_without_skill_graph_formats_skill_id(self) -> None:
        generator = MicroGoalGenerator()
        goals = generator.generate(
            [{"skill_id": "grammar_present_simple", "mastery": 45.0}],
        )
        assert "Grammar Present Simple" in goals[0].text

    def test_requires_state_or_current_skill(self) -> None:
        generator = MicroGoalGenerator()
        with pytest.raises(ValueError, match="at least one skill state"):
            generator.generate([])
