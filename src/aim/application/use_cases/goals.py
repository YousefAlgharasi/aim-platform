"""Micro-goal use cases."""

from __future__ import annotations

from aim.application.errors import NotFoundError
from aim.domain.services.micro_goal_generator import MicroGoalGenerator
from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork
from aim.infrastructure.skill_graph import SkillGraph


class GoalUseCases:
    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow
        self._generator = MicroGoalGenerator(SkillGraph())

    def list_or_refresh_goals(self, student_id: int) -> list[MicroGoalORM]:
        self._get_student_or_raise(student_id)
        goals = self._uow.goals.list_active_goals(student_id)
        if goals:
            return goals
        return self.refresh_goals(student_id)

    def refresh_goals(
        self,
        student_id: int,
        *,
        current_skill_id: str | None = None,
        commit: bool = True,
    ) -> list[MicroGoalORM]:
        states = self._uow.goals.list_skill_states(student_id)
        state_dicts = [
            {
                "skill_id": state.skill_id,
                "mastery": state.mastery,
                "confidence": state.confidence,
                "weakness_score": state.weakness_score,
            }
            for state in states
        ]

        if current_skill_id is None and states:
            current_skill_id = min(states, key=lambda state: state.mastery).skill_id
        if current_skill_id is None:
            return []

        generated = self._generator.generate(
            state_dicts,
            current_skill_id=current_skill_id,
        )
        self._uow.goals.deactivate_active_goals(student_id)
        goals = [
            MicroGoalORM(
                student_id=student_id,
                skill_id=goal.skill_id,
                goal_type=goal.goal_type.value,
                text=goal.text,
                is_active=True,
                is_completed=False,
            )
            for goal in generated
        ]
        self._uow.goals.add_goals(goals)
        if commit:
            self._uow.commit()
        self._uow.goals.refresh_goals(goals)
        return self._uow.goals.list_active_goals(student_id)

    def _get_student_or_raise(self, student_id: int) -> None:
        if self._uow.students.get_student(student_id) is None:
            raise NotFoundError(f"Student {student_id} not found.")
