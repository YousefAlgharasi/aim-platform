from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.content import AuditLogORM
from aim.infrastructure.database.models.outcome_record import OutcomeRecordORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.admin_pilot as admin_pilot_router
from aim.presentation.api.routers.admin_pilot import router


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
    app.dependency_overrides[admin_pilot_router.get_db] = override_get_db
    return TestClient(app)


def seed_pilot_data() -> None:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name="Pilot Student", email="pilot@test.com")
        db.add(student)
        db.flush()
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id="GRAMMAR_VERB_FORMS",
                mastery=72.0,
                confidence=68.0,
                reliability=0.8,
                current_difficulty=2,
                retention=84.0,
            )
        )
        db.add_all(
            [
                QuestionAttemptORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_id="q1",
                    session_id="session-1",
                    is_correct=True,
                    response_time=8.0,
                    attempts=1,
                    difficulty=1,
                    hint_used=False,
                    skip=False,
                    answer_changed=False,
                    time_of_day="morning",
                    session_position=1,
                ),
                QuestionAttemptORM(
                    student_id=student.id,
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_id="q2",
                    session_id="session-1",
                    is_correct=False,
                    response_time=10.0,
                    attempts=2,
                    difficulty=1,
                    hint_used=True,
                    skip=False,
                    answer_changed=True,
                    time_of_day="morning",
                    session_position=2,
                ),
            ]
        )
        recommendation = RecommendationLogORM(
            student_id=student.id,
            action_type="continue_current_skill",
            skill_id="GRAMMAR_VERB_FORMS",
            difficulty=1,
            reason="Keep practicing.",
            evidence={},
            confidence="medium",
        )
        db.add(recommendation)
        db.flush()
        db.add(
            OutcomeRecordORM(
                recommendation_id=recommendation.id,
                mastery_before=68.0,
                mastery_after=72.0,
                retention_before=80.0,
                retention_after=84.0,
                weakness_before=35.0,
                weakness_after=28.0,
                outcome="successful",
            )
        )
        db.add(
            AuditLogORM(
                actor_student_id=student.id,
                action="adaptive_result",
                entity_type="web_session",
                entity_id="session-1",
                before_state={},
                after_state={},
            )
        )
        db.commit()
    finally:
        db.close()


def test_admin_pilot_overview_returns_monitoring_summary(client: TestClient) -> None:
    seed_pilot_data()

    resp = client.get("/admin/pilot/overview")

    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["summary"]["students"] == 1
    assert data["summary"]["sessions"] == 1
    assert data["summary"]["recommendations"] == 1
    assert data["students"][0]["latest_mastery"] == 72.0
    assert data["sessions"][0]["accuracy"] == 50.0
    assert data["recommendations"][0]["action_type"] == "continue_current_skill"
    assert data["outcomes"][0]["mastery_delta"] == 4.0
    assert data["events"][0]["action"] == "adaptive_result"
