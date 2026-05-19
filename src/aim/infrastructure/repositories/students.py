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

