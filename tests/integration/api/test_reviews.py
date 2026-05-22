"""
T-08 tests for due review endpoint and retention job.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.scheduler.retention import run_retention_review_job
from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.reviews as reviews_router
from aim.presentation.api.routers.reviews import router


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


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


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
    app.dependency_overrides[reviews_router.get_db] = override_get_db
    return TestClient(app)


def seed_student() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Ali", email="ali-retention@test.com")
        db.add(student)
        db.commit()
        db.refresh(student)
        db.add_all(
            [
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id="VOCAB_DAILY",
                    mastery=100.0,
                    retention=100.0,
                    retention_lambda=0.2,
                    last_reviewed_at=utc_now_naive() - timedelta(days=3),
                ),
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_TENSES_PRESENT_SIMPLE",
                    mastery=95.0,
                    retention=95.0,
                    retention_lambda=0.01,
                    last_reviewed_at=utc_now_naive() - timedelta(days=1),
                ),
            ]
        )
        db.commit()
        return student.id
    finally:
        db.close()


class TestDueReviewsEndpoint:
    def test_returns_due_reviews(self, client: TestClient) -> None:
        student_id = seed_student()

        resp = client.get(f"/students/{student_id}/due-reviews")

        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert len(data) == 1
        assert data[0]["skill_id"] == "VOCAB_DAILY"
        assert data[0]["is_due"] is True
        assert data[0]["retention"] < 70.0

    def test_unknown_student_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/due-reviews")

        assert resp.status_code == 404

    def test_daily_job_flags_due_skills(self) -> None:
        seed_student()

        due_count = run_retention_review_job(TestingSessionLocal)

        assert due_count == 1

        db = TestingSessionLocal()
        try:
            due_state = (
                db.query(StudentSkillStateORM)
                .filter(StudentSkillStateORM.skill_id == "VOCAB_DAILY")
                .first()
            )
            assert due_state.review_due is True
        finally:
            db.close()
