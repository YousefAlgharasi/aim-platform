from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
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

