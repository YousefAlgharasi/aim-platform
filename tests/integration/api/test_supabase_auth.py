from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.student import StudentORM
from aim.presentation.api.auth import SupabaseUser, get_current_supabase_user
import aim.presentation.api.routers.sessions as sessions_router
import aim.presentation.api.routers.student_state as student_state_router
from aim.presentation.api.routers.sessions import router as sessions_router_instance
from aim.presentation.api.routers.student_state import router as student_state_router_instance


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


def current_user(user_id: str, email: str = "student@test.com") -> SupabaseUser:
    return SupabaseUser(
        user_id=user_id,
        email=email,
        role="authenticated",
        claims={"sub": user_id, "email": email, "role": "authenticated"},
    )


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield


def build_client(user: SupabaseUser | None = None) -> TestClient:
    app = FastAPI()
    app.include_router(student_state_router_instance)
    app.include_router(sessions_router_instance)
    app.dependency_overrides[student_state_router.get_db] = override_get_db
    app.dependency_overrides[sessions_router.get_db] = override_get_db
    if user is not None:
        app.dependency_overrides[get_current_supabase_user] = lambda: user
    return TestClient(app)


def seed_student(auth_user_id: str = "auth-user-1") -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(
            name="Auth Student",
            email="student@test.com",
            auth_user_id=auth_user_id,
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student.id
    finally:
        db.close()


def attempt_payload(student_id: int) -> dict:
    return {
        "student_id": student_id,
        "skill_id": "GRAMMAR_VERB_FORMS",
        "question_id": "q1",
        "session_id": "session-auth",
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


def test_enabled_supabase_auth_requires_bearer_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("SUPABASE_AUTH_REQUIRED", "true")
    monkeypatch.setenv("SUPABASE_URL", "https://project.supabase.co")
    student_id = seed_student()

    resp = build_client().get(f"/students/{student_id}")

    assert resp.status_code == 401


def test_authenticated_user_can_access_linked_student() -> None:
    student_id = seed_student("auth-user-1")

    resp = build_client(current_user("auth-user-1")).get(f"/students/{student_id}")

    assert resp.status_code == 200
    assert resp.json()["id"] == student_id


def test_authenticated_user_can_fetch_linked_student_profile() -> None:
    student_id = seed_student("auth-user-1")

    resp = build_client(current_user("auth-user-1")).get("/students/me")

    assert resp.status_code == 200
    assert resp.json()["id"] == student_id


def test_current_student_requires_authenticated_user() -> None:
    resp = build_client().get("/students/me")

    assert resp.status_code == 401


def test_current_student_returns_404_when_user_has_no_student() -> None:
    resp = build_client(current_user("auth-user-1")).get("/students/me")

    assert resp.status_code == 404


def test_authenticated_user_cannot_access_another_student() -> None:
    student_id = seed_student("auth-user-1")

    resp = build_client(current_user("auth-user-2")).get(f"/students/{student_id}")

    assert resp.status_code == 403


def test_create_student_links_authenticated_user() -> None:
    resp = build_client(current_user("auth-user-1")).post(
        "/students",
        json={"name": "Auth Student", "email": "student@test.com"},
    )

    assert resp.status_code == 201, resp.text
    db = TestingSessionLocal()
    try:
        student = db.query(StudentORM).one()
        assert student.auth_user_id == "auth-user-1"
    finally:
        db.close()


def test_create_student_rejects_email_mismatch() -> None:
    resp = build_client(current_user("auth-user-1", email="owner@test.com")).post(
        "/students",
        json={"name": "Auth Student", "email": "other@test.com"},
    )

    assert resp.status_code == 403


def test_session_attempts_require_matching_student() -> None:
    student_id = seed_student("auth-user-1")

    resp = build_client(current_user("auth-user-2")).post(
        "/sessions/session-auth/attempts",
        json={"attempts": [attempt_payload(student_id)]},
    )

    assert resp.status_code == 403
