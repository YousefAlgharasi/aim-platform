from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.learning_history import AssessmentResultORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
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


def test_question_quality_repository_loads_historical_stats_in_batch() -> None:
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
        first_student = StudentORM(name="Batch One", email="batch-one@test.com")
        second_student = StudentORM(name="Batch Two", email="batch-two@test.com")
        session.add_all([first_student, second_student])
        session.flush()
        session.add_all(
            [
                StudentSkillStateORM(
                    student_id=first_student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    mastery=90.0,
                ),
                StudentSkillStateORM(
                    student_id=second_student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    mastery=35.0,
                ),
                QuestionAttemptORM(
                    student_id=first_student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_id="batch:q1",
                    session_id="history-1",
                    is_correct=True,
                    response_time=7.0,
                    attempts=1,
                    difficulty=2,
                    hint_used=False,
                    skip=False,
                    answer_changed=False,
                    time_of_day="morning",
                    session_position=1,
                ),
                QuestionAttemptORM(
                    student_id=second_student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_id="batch:q2",
                    session_id="history-2",
                    is_correct=False,
                    response_time=14.0,
                    attempts=2,
                    difficulty=2,
                    hint_used=True,
                    skip=False,
                    answer_changed=False,
                    time_of_day="morning",
                    session_position=1,
                ),
            ]
        )
        session.flush()

        stats = uow.question_quality.get_question_quality_stats(
            ["batch:q1", "batch:q2", "batch:missing"]
        )

        assert set(stats) == {"batch:q1", "batch:q2", "batch:missing"}
        assert len(stats["batch:q1"]) == 1
        assert stats["batch:q1"][0].student_id == first_student.id
        assert stats["batch:q1"][0].is_correct is True
        assert stats["batch:q1"][0].learner_mastery == 90.0
        assert len(stats["batch:q2"]) == 1
        assert stats["batch:q2"][0].hint_used is True
        assert stats["batch:q2"][0].learner_mastery == 35.0
        assert stats["batch:missing"] == []
    finally:
        session.close()

