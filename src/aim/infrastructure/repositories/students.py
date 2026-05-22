"""SQLAlchemy student repository."""

from __future__ import annotations

from sqlalchemy.orm import Session

from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM


class SQLStudentRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_student(self, student_id: int) -> StudentORM | None:
        return self._db.query(StudentORM).filter(StudentORM.id == student_id).first()

    def get_student_by_email(self, email: str) -> StudentORM | None:
        return self._db.query(StudentORM).filter(StudentORM.email == email).first()

    def add_student(self, student: StudentORM) -> None:
        self._db.add(student)

    def refresh_student(self, student: StudentORM) -> None:
        self._db.refresh(student)

    def list_skill_states(self, student_id: int) -> list[StudentSkillStateORM]:
        return (
            self._db.query(StudentSkillStateORM)
            .filter(StudentSkillStateORM.student_id == student_id)
            .all()
        )

    def get_skill_state(
        self,
        student_id: int,
        skill_id: str,
    ) -> StudentSkillStateORM | None:
        return (
            self._db.query(StudentSkillStateORM)
            .filter(
                StudentSkillStateORM.student_id == student_id,
                StudentSkillStateORM.skill_id == skill_id,
            )
            .first()
        )

    def add_skill_state(self, state: StudentSkillStateORM) -> None:
        self._db.add(state)

    def refresh_skill_state(self, state: StudentSkillStateORM) -> None:
        self._db.refresh(state)

    def update_frustration_score(
        self,
        student_id: int,
        skill_id: str,
        frustration_score: float,
    ) -> None:
        state = self.get_skill_state(student_id, skill_id)
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.frustration_score = frustration_score
        self._db.flush()

    def update_difficulty_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        consistency: float,
        current_difficulty: int,
    ) -> None:
        state = self.get_skill_state(student_id, skill_id)
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.consistency = consistency
        state.current_difficulty = current_difficulty
        self._db.flush()

    def update_learning_state(
        self,
        student_id: int,
        skill_id: str,
        *,
        reliability: float,
        hint_usage_rate: float,
        skip_rate: float,
        learning_response_pattern: str | None,
    ) -> None:
        state = self.get_skill_state(student_id, skill_id)
        if state is None:
            state = StudentSkillStateORM(student_id=student_id, skill_id=skill_id)
            self._db.add(state)

        state.reliability = reliability
        state.hint_usage_rate = hint_usage_rate
        state.skip_rate = skip_rate
        state.learning_response_pattern = learning_response_pattern
        self._db.flush()
