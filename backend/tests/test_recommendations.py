"""
T-10 integration tests for GET /students/{id}/next-action.
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.models.question_attempt import Base as QuestionAttemptBase
from backend.models.recommendation_log import RecommendationLogORM
from backend.models.student_state import Base, StudentORM, StudentSkillStateORM
import backend.routers.recommendations as recommendations_router
from backend.routers.recommendations import router


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
    QuestionAttemptBase.metadata.drop_all(bind=engine_test)
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    QuestionAttemptBase.metadata.create_all(bind=engine_test)
    yield


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[recommendations_router.get_db] = override_get_db
    return TestClient(app)


def seed_student_for_challenge() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Ali", email="ali-recommend@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id="GRAMMAR_VERB_FORMS",
                mastery=90.0,
                confidence=90.0,
                session_performance=[90.0, 91.0, 89.0],
                retention=100.0,
            )
        )
        db.commit()
        return student.id
    finally:
        db.close()


class TestNextActionEndpoint:
    def test_returns_next_action_and_logs_recommendation(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student_for_challenge()

        resp = client.get(f"/students/{student_id}/next-action")

        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["action_type"] == "CHALLENGE"
        assert data["skill_id"] == "GRAMMAR_VERB_FORMS"
        assert data["recommendation_id"] >= 1

        db = TestingSessionLocal()
        try:
            log = db.query(RecommendationLogORM).first()
            assert log is not None
            assert log.student_id == student_id
            assert log.action_type == "CHALLENGE"
            assert log.mastery_before == 90.0
        finally:
            db.close()

    def test_unknown_student_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/next-action")

        assert resp.status_code == 404
