"""Student and skill-state use cases."""

from __future__ import annotations

from typing import Any

from aim.application.errors import ConflictError, NotFoundError
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


class StudentUseCases:
    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow

    def create_student(
        self,
        *,
        name: str,
        email: str,
        auth_user_id: str | None = None,
    ) -> StudentORM:
        if self._uow.students.get_student_by_email(email):
            raise ConflictError(f"A student with email '{email}' already exists.")
        if auth_user_id and self._uow.students.get_student_by_auth_user_id(auth_user_id):
            raise ConflictError("A student is already linked to this auth user.")

        student = StudentORM(name=name, email=email, auth_user_id=auth_user_id)
        self._uow.students.add_student(student)
        self._uow.commit()
        self._uow.students.refresh_student(student)
        return student

    def get_student(self, student_id: int) -> StudentORM:
        return self._get_student_or_raise(student_id)

    def list_skill_states(self, student_id: int) -> list[StudentSkillStateORM]:
        self._get_student_or_raise(student_id)
        return self._uow.students.list_skill_states(student_id)

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> StudentSkillStateORM:
        self._get_student_or_raise(student_id)
        return self._get_skill_state_or_raise(student_id, skill_id)

    def create_skill_state(
        self,
        student_id: int,
        skill_id: str,
        values: dict[str, Any],
    ) -> StudentSkillStateORM:
        self._get_student_or_raise(student_id)
        if self._uow.students.get_skill_state(student_id, skill_id):
            raise ConflictError(
                f"State for student {student_id}, skill '{skill_id}' already exists. "
                "Use PUT to update it."
            )

        state = StudentSkillStateORM(
            student_id=student_id,
            skill_id=skill_id,
            mastery=values.get("mastery", 0.0),
            confidence=values.get("confidence", 0.0),
            attempts=values.get("attempts", 0),
            avg_speed=values.get("avg_speed", 0.0),
            retry_rate=values.get("retry_rate", 0.0),
            consistency=values.get("consistency", 100.0),
            current_difficulty=values.get("current_difficulty", 1),
            retention=values.get("retention", 100.0),
            hesitation_index=values.get("hesitation_index", 0.0),
            retention_lambda=values.get("retention_lambda", 0.15),
            review_due=values.get("review_due", False),
            retention_history=values.get("retention_history", []),
            weakness_score=values.get("weakness_score", 0.0),
            frustration_score=values.get("frustration_score", 0.0),
            learning_style=values.get("learning_style"),
            session_performance=values.get("session_performance", []),
            context_memory=values.get("context_memory", {}),
            last_reviewed_at=values.get("last_reviewed_at"),
        )
        self._uow.students.add_skill_state(state)
        self._uow.commit()
        self._uow.students.refresh_skill_state(state)
        return state

    def update_skill_state(
        self,
        student_id: int,
        skill_id: str,
        values: dict[str, Any],
    ) -> StudentSkillStateORM:
        self._get_student_or_raise(student_id)
        state = self._get_skill_state_or_raise(student_id, skill_id)
        for field, value in values.items():
            setattr(state, field, value)
        self._uow.commit()
        self._uow.students.refresh_skill_state(state)
        return state

    def _get_student_or_raise(self, student_id: int) -> StudentORM:
        student = self._uow.students.get_student(student_id)
        if student is None:
            raise NotFoundError(f"Student {student_id} not found.")
        return student

    def _get_skill_state_or_raise(
        self,
        student_id: int,
        skill_id: str,
    ) -> StudentSkillStateORM:
        state = self._uow.students.get_skill_state(student_id, skill_id)
        if state is None:
            raise NotFoundError(
                f"No state found for student {student_id}, skill '{skill_id}'."
            )
        return state

