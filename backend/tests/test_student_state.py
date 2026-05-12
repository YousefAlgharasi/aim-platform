"""
T-03: Tests — Student State Model + API Routes
────────────────────────────────────────────────────────────────────────────────
Uses SQLite in-memory with StaticPool so all connections share the same DB.
No real PostgreSQL needed — fully self-contained.

Run with:  pytest backend/tests/test_student_state.py -v
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool          # ← KEY FIX

from backend.models.student_state import Base, StudentORM, StudentSkillStateORM
import backend.routers.student_state as student_state_router
from backend.routers.student_state import router

# ──────────────────────────────────────────────
# In-memory SQLite — StaticPool forces every
# connection to reuse the SAME in-memory DB.
# Without this, sqlite:// creates a fresh empty
# DB for every new connection, so tables vanish.
# ──────────────────────────────────────────────

engine_test = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,          # ← all connections share one DB
)

TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine_test
)


def override_get_db():
    db: Session = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ──────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_db():
    """Drop and recreate tables before every test — clean slate."""
    Base.metadata.drop_all(bind=engine_test)
    Base.metadata.create_all(bind=engine_test)
    yield


@pytest.fixture
def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[student_state_router.get_db] = override_get_db
    return TestClient(app)


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def create_student(
    client: TestClient, name: str = "Alice", email: str = "alice@test.com"
) -> dict:
    resp = client.post("/students", json={"name": name, "email": email})
    assert resp.status_code == 201, resp.text
    return resp.json()


def create_skill_state(
    client: TestClient, student_id: int, skill_id: str = "present_simple"
) -> dict:
    resp = client.post(
        f"/students/{student_id}/skills/{skill_id}/state",
        json={
            "student_id": student_id,
            "skill_id": skill_id,
            "mastery": 0.0,
            "confidence": 0.0,
            "attempts": 0,
            "avg_speed": 0.0,
            "retention": 100.0,
            "weakness_score": 0.0,
            "frustration_score": 0.0,
            "learning_style": None,
            "session_performance": [],
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ══════════════════════════════════════════════
# Student CRUD
# ══════════════════════════════════════════════

class TestStudentCreate:

    def test_create_student_success(self, client: TestClient) -> None:
        data = create_student(client)
        assert data["name"] == "Alice"
        assert data["email"] == "alice@test.com"
        assert "id" in data
        assert "created_at" in data

    def test_create_student_duplicate_email_returns_409(self, client: TestClient) -> None:
        create_student(client)
        resp = client.post("/students", json={"name": "Bob", "email": "alice@test.com"})
        assert resp.status_code == 409

    def test_create_multiple_students(self, client: TestClient) -> None:
        s1 = create_student(client, "Alice", "alice@test.com")
        s2 = create_student(client, "Bob", "bob@test.com")
        assert s1["id"] != s2["id"]


class TestStudentGet:

    def test_get_student_success(self, client: TestClient) -> None:
        created = create_student(client)
        resp = client.get(f"/students/{created['id']}")
        assert resp.status_code == 200
        assert resp.json()["email"] == "alice@test.com"

    def test_get_student_not_found(self, client: TestClient) -> None:
        resp = client.get("/students/9999")
        assert resp.status_code == 404


# ══════════════════════════════════════════════
# Skill State — GET all states
# ══════════════════════════════════════════════

class TestGetStudentState:

    def test_returns_empty_list_for_new_student(self, client: TestClient) -> None:
        student = create_student(client)
        resp = client.get(f"/students/{student['id']}/state")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_returns_all_skill_states(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid, "present_simple")
        create_skill_state(client, sid, "past_perfect")
        resp = client.get(f"/students/{sid}/state")
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_student_not_found_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/state")
        assert resp.status_code == 404


# ══════════════════════════════════════════════
# Skill State — GET single skill
# ══════════════════════════════════════════════

class TestGetSkillState:

    def test_get_existing_skill_state(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid, "present_simple")
        resp = client.get(f"/students/{sid}/skills/present_simple/state")
        assert resp.status_code == 200
        assert resp.json()["skill_id"] == "present_simple"

    def test_nonexistent_skill_returns_404(self, client: TestClient) -> None:
        student = create_student(client)
        resp = client.get(f"/students/{student['id']}/skills/nonexistent/state")
        assert resp.status_code == 404

    def test_student_not_found_returns_404(self, client: TestClient) -> None:
        resp = client.get("/students/9999/skills/present_simple/state")
        assert resp.status_code == 404


# ══════════════════════════════════════════════
# Skill State — POST (create)
# ══════════════════════════════════════════════

class TestCreateSkillState:

    def test_create_skill_state_default_values(self, client: TestClient) -> None:
        student = create_student(client)
        data = create_skill_state(client, student["id"])
        assert data["mastery"] == 0.0
        assert data["confidence"] == 0.0
        assert data["retention"] == 100.0
        assert data["frustration_score"] == 0.0
        assert data["session_performance"] == []
        assert data["learning_style"] is None

    def test_create_with_all_fields(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        resp = client.post(
            f"/students/{sid}/skills/grammar_a/state",
            json={
                "student_id": sid,
                "skill_id": "grammar_a",
                "mastery": 75.5,
                "confidence": 60.0,
                "attempts": 12,
                "avg_speed": 8.3,
                "retention": 88.0,
                "weakness_score": 20.0,
                "frustration_score": 15.0,
                "learning_style": "example-first",
                "session_performance": [70.0, 72.5, 75.5],
                "last_reviewed_at": None,
            },
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["mastery"] == 75.5
        assert data["learning_style"] == "example-first"
        assert data["frustration_score"] == 15.0
        assert data["session_performance"] == [70.0, 72.5, 75.5]

    def test_duplicate_skill_state_returns_409(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid, "present_simple")
        resp = client.post(
            f"/students/{sid}/skills/present_simple/state",
            json={
                "student_id": sid,
                "skill_id": "present_simple",
                "mastery": 0.0,
                "confidence": 0.0,
                "attempts": 0,
                "avg_speed": 0.0,
                "retention": 100.0,
                "weakness_score": 0.0,
                "frustration_score": 0.0,
                "session_performance": [],
            },
        )
        assert resp.status_code == 409

    def test_create_for_nonexistent_student_returns_404(self, client: TestClient) -> None:
        resp = client.post(
            "/students/9999/skills/present_simple/state",
            json={
                "student_id": 9999,
                "skill_id": "present_simple",
                "mastery": 0.0,
                "confidence": 0.0,
                "attempts": 0,
                "avg_speed": 0.0,
                "retention": 100.0,
                "weakness_score": 0.0,
                "frustration_score": 0.0,
                "session_performance": [],
            },
        )
        assert resp.status_code == 404


# ══════════════════════════════════════════════
# Skill State — PUT (update)
# ══════════════════════════════════════════════

class TestUpdateSkillState:

    def test_partial_update_mastery(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid, "present_simple")
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"mastery": 82.0},
        )
        assert resp.status_code == 200
        assert resp.json()["mastery"] == 82.0
        assert resp.json()["confidence"] == 0.0  # untouched

    def test_update_frustration_score(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"frustration_score": 75.0},
        )
        assert resp.status_code == 200
        assert resp.json()["frustration_score"] == 75.0

    def test_update_learning_style(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"learning_style": "inductive"},
        )
        assert resp.status_code == 200
        assert resp.json()["learning_style"] == "inductive"

    def test_update_session_performance(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"session_performance": [65.0, 70.0, 78.0]},
        )
        assert resp.status_code == 200
        assert resp.json()["session_performance"] == [65.0, 70.0, 78.0]

    def test_update_multiple_fields_at_once(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"mastery": 90.0, "confidence": 85.0, "attempts": 30, "frustration_score": 5.0},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["mastery"] == 90.0
        assert data["confidence"] == 85.0
        assert data["attempts"] == 30
        assert data["frustration_score"] == 5.0

    def test_update_nonexistent_skill_returns_404(self, client: TestClient) -> None:
        student = create_student(client)
        resp = client.put(
            f"/students/{student['id']}/skills/nonexistent/state",
            json={"mastery": 50.0},
        )
        assert resp.status_code == 404

    def test_update_nonexistent_student_returns_404(self, client: TestClient) -> None:
        resp = client.put(
            "/students/9999/skills/present_simple/state",
            json={"mastery": 50.0},
        )
        assert resp.status_code == 404

    def test_mastery_out_of_range_rejected(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"mastery": 150.0},
        )
        assert resp.status_code == 422

    def test_negative_attempts_rejected(self, client: TestClient) -> None:
        student = create_student(client)
        sid = student["id"]
        create_skill_state(client, sid)
        resp = client.put(
            f"/students/{sid}/skills/present_simple/state",
            json={"attempts": -1},
        )
        assert resp.status_code == 422
