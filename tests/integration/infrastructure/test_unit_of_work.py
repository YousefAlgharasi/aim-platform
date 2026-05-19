from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.learning_history import AssessmentResultORM
from aim.infrastructure.database.models.student import StudentORM
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


def test_unit_of_work_rolls_back_uncommitted_changes() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_factory()

    try:
        uow = SqlAlchemyUnitOfWork(session)
        uow.students.add_student(StudentORM(name="Rollback", email="rollback@test.com"))
        uow.rollback()

        assert session.query(StudentORM).count() == 0
    finally:
        session.close()


def test_unit_of_work_saves_assessment_result_history() -> None:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = session_factory()

    try:
        uow = SqlAlchemyUnitOfWork(session)
        uow.learning_history.add_assessment_result(
            student_id=1,
            assessment_id="assessment-1",
            skill_id="GRAMMAR_VERB_FORMS",
            score=82.0,
            mastery_before=70.0,
            mastery_after=78.0,
            difficulty_level=3,
        )
        uow.commit()

        saved = session.query(AssessmentResultORM).one()
        assert saved.student_id == 1
        assert saved.assessment_id == "assessment-1"
        assert saved.skill_id == "GRAMMAR_VERB_FORMS"
        assert saved.score == 82.0
        assert saved.mastery_before == 70.0
        assert saved.mastery_after == 78.0
        assert saved.difficulty_level == 3
    finally:
        session.close()

