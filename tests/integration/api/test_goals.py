"""
T-06 tests for GET /students/{id}/goals.
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.models.goal import MicroGoalORM
from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.goals as goals_router
from aim.presentation.api.routers.goals import router


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
    app.dependency_overrides[goals_router.get_db] = override_get_db
    return TestClient(app)


def seed_student_with_states() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Alice", email="alice@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        db.add_all(
            [
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_TENSES_PRESENT_PERFECT",
                    mastery=62.0,
                    confidence=60.0,
                    weakness_score=20.0,
                ),
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_PASSIVE_VOICE",
                    mastery=30.0,
                    confidence=75.0,
                    weakness_score=90.0,
                ),
            ]
        )
        db.commit()
        return student.id
    finally:
        db.close()


class TestStudentGoalsEndpoint:
    def test_generates_and_returns_three_active_goals(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student_with_states()
        resp = client.get(f"/students/{student_id}/goals")

        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert [goal["goal_type"] for goal in data] == [
            "daily",
            "weekly",
            "monthly",
        ]
        assert data[0]["text"] == (
            "Answer 5 Passive Voice questions correctly in a row."
        )
        assert data[1]["text"] == "Reach 80% mastery on Passive Voice."
        assert data[2]["text"] == "Complete all Level 4 Grammar skills."

    def test_returns_existing_active_goals_without_regenerating(
        self,
        client: TestClient,
    ) -> None:
        student_id = seed_student_with_states()
        first = client.get(f"/students/{student_id}/goals")
        second = client.get(f"/students/{student_id}/goals")

        assert first.status_code == 200
        assert second.status_code == 200
        assert [g["id"] for g in second.json()] == [g["id"] for g in first.json()]

    def test_student_without_states_returns_empty_goals(
        self,
        client: TestClient,
    ) -> None:
        db = TestingSessionLocal()
        try:
            student = StudentORM(name="Bob", email="bob@test.com")
            db.add(student)
            db.commit()
            db.refresh(student)
            student_id = student.id
        finally:
            db.close()

        resp = client.get(f"/students/{student_id}/goals")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_unknown_student_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/goals")
        assert resp.status_code == 404

    def test_refresh_deactivates_old_goals(self, client: TestClient) -> None:
        student_id = seed_student_with_states()
        client.get(f"/students/{student_id}/goals")

        db = TestingSessionLocal()
        try:
            goals_router.refresh_student_goals(
                db,
                student_id,
                current_skill_id="GRAMMAR_TENSES_PRESENT_PERFECT",
            )
            active_count = (
                db.query(MicroGoalORM)
                .filter(
                    MicroGoalORM.student_id == student_id,
                    MicroGoalORM.is_active.is_(True),
                )
                .count()
            )
            inactive_count = (
                db.query(MicroGoalORM)
                .filter(
                    MicroGoalORM.student_id == student_id,
                    MicroGoalORM.is_active.is_(False),
                )
                .count()
            )
        finally:
            db.close()

        assert active_count == 3
        assert inactive_count == 3
