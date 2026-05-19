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

from aim.infrastructure.database.base import Base as QuestionAttemptBase
from aim.infrastructure.database.models.error_pattern import ErrorPatternRecordORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.recommendations as recommendations_router
from aim.presentation.api.routers.recommendations import router


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
                consistency=91.0,
                current_difficulty=3,
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
            assert log.inputs_snapshot["mastery"] == 90.0
            assert log.inputs_snapshot["current_difficulty"] == 3
            assert log.inputs_snapshot["target_skill_id"] == "GRAMMAR_VERB_FORMS"
        finally:
            db.close()

    def test_uses_saved_error_pattern_and_logs_snapshot(
        self,
        client: TestClient,
    ) -> None:
        db = TestingSessionLocal()
        try:
            student = StudentORM(name="Rush", email="rush-recommend@test.com")
            db.add(student)
            db.commit()
            db.refresh(student)
            db.add(
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    mastery=60.0,
                    confidence=60.0,
                    consistency=75.0,
                    current_difficulty=2,
                    retention=100.0,
                )
            )
            db.add(
                ErrorPatternRecordORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    pattern_type="rushing",
                    evidence_json={"timed_accuracy": 30.0},
                    treatment_recommendation="Use timed practice with pacing.",
                )
            )
            db.commit()
            student_id = student.id
        finally:
            db.close()

        resp = client.get(f"/students/{student_id}/next-action")

        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["action_type"] == "TIMED_PRACTICE"
        assert data["skill_id"] == "GRAMMAR_VERB_FORMS"

        db = TestingSessionLocal()
        try:
            log = db.query(RecommendationLogORM).one()
            assert log.inputs_snapshot["error_pattern_type"] == "rushing"
            assert log.inputs_snapshot["current_difficulty"] == 2
        finally:
            db.close()

    def test_unknown_student_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/next-action")

        assert resp.status_code == 404
