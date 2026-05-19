from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.sessions as sessions_router
from aim.presentation.api.routers.sessions import router


engine_test = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_test,
)


def override_get_db():
    db: Session = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[sessions_router.get_db] = override_get_db
    return TestClient(app)


def seed_student() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Session Student", email="session@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        return student.id
    finally:
        db.close()


def attempt_payload(student_id: int, *, session_id: str = "session-1") -> dict:
    return {
        "student_id": student_id,
        "skill_id": "GRAMMAR_VERB_FORMS",
        "question_id": "q1",
        "session_id": session_id,
        "is_correct": True,
        "response_time": 8.0,
        "attempts": 1,
        "difficulty": 2,
        "hint_used": False,
        "skip": False,
        "answer_changed": False,
        "time_of_day": "morning",
        "session_position": 1,
    }


class TestRecordSessionAttempts:
    def test_empty_payload_returns_400(self, client: TestClient) -> None:
        resp = client.post("/sessions/session-1/attempts", json={"attempts": []})

        assert resp.status_code == 400

    def test_mismatched_session_id_returns_422(self, client: TestClient) -> None:
        student_id = seed_student()
        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": [attempt_payload(student_id, session_id="other")]},
        )

        assert resp.status_code == 422

    def test_records_attempts_updates_metrics_and_refreshes_goals(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student()
        second = attempt_payload(student_id)
        second["question_id"] = "q2"
        second["is_correct"] = False
        second["session_position"] = 2

        resp = client.post(
            "/sessions/session-1/attempts",
            json={"attempts": [attempt_payload(student_id), second]},
        )

        assert resp.status_code == 201, resp.text
        data = resp.json()
        assert data["attempts_saved"] == 2
        assert data["metrics_updated"][0]["accuracy"] == 50.0

        db = TestingSessionLocal()
        try:
            assert db.query(QuestionAttemptORM).count() == 2
            state = db.query(StudentSkillStateORM).first()
            assert state is not None
            assert state.skill_id == "GRAMMAR_VERB_FORMS"
            assert state.mastery == 50.0
            assert db.query(MicroGoalORM).filter(MicroGoalORM.is_active.is_(True)).count() == 3
        finally:
            db.close()

