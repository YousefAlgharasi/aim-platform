from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool
from uuid import uuid4

from aim.infrastructure.database.base import Base
from aim.infrastructure.database.models.content import (
    LessonORM,
    QuestionChoiceORM,
    QuestionORM,
)
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
import aim.presentation.api.routers.web_pilot as web_pilot_router
from aim.presentation.api.routers.web_pilot import router


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
    app.dependency_overrides[web_pilot_router.get_db] = override_get_db
    return TestClient(app)


def seed_student() -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(
            name="Pilot Student",
            email=f"pilot-{uuid4().hex[:8]}@test.com",
        )
        db.add(student)
        db.commit()
        db.refresh(student)
        return student.id
    finally:
        db.close()


def seed_lesson() -> None:
    db = TestingSessionLocal()
    try:
        db.add(
            LessonORM(
                lesson_id="a1-routines-1",
                course_id="a1-pilot",
                title="Daily routines",
                lesson_order=1,
                level="A1",
                skill_focus=["GRAMMAR_VERB_FORMS"],
                main_skill_id="GRAMMAR_VERB_FORMS",
                prerequisites=[],
                estimated_minutes=12,
                difficulty=1,
                content={"objective": "Practice simple daily routine sentences."},
            )
        )
        db.add_all(
            [
                QuestionORM(
                    question_id="a1-routines-1:q1",
                    lesson_id="a1-routines-1",
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_type="multiple_choice",
                    prompt="Choose the correct sentence.",
                    correct_answer="I wake up at seven.",
                    explanation="Use the base verb after I.",
                    difficulty=1,
                    concept="present_simple_routines",
                    choices=[
                        "I wake up at seven.",
                        "I wakes up at seven.",
                    ],
                    common_error_tags=["third_person_s"],
                ),
                QuestionORM(
                    question_id="a1-routines-1:q2",
                    lesson_id="a1-routines-1",
                    skill_id="GRAMMAR_VERB_FORMS",
                    question_type="multiple_choice",
                    prompt="Choose the correct negative sentence.",
                    correct_answer="I do not work on Friday.",
                    explanation="Use do not before the base verb.",
                    difficulty=1,
                    concept="present_simple_negative",
                    choices=[
                        "I do not work on Friday.",
                        "I not work on Friday.",
                    ],
                    common_error_tags=["missing_auxiliary"],
                ),
            ]
        )
        db.add(
            QuestionChoiceORM(
                question_id="a1-routines-1:q1",
                choice_order=1,
                choice_text="I wake up at seven.",
                is_correct=True,
            )
        )
        db.commit()
    finally:
        db.close()


def attempt_payload(
    student_id: int,
    session_id: str,
    question_id: str,
    *,
    is_correct: bool,
    position: int,
) -> dict:
    return {
        "student_id": student_id,
        "skill_id": "GRAMMAR_VERB_FORMS",
        "question_id": question_id,
        "session_id": session_id,
        "is_correct": is_correct,
        "response_time": 8.0,
        "attempts": 1,
        "difficulty": 1,
        "hint_used": False,
        "skip": False,
        "answer_changed": False,
        "time_of_day": "morning",
        "session_position": position,
    }


def selected_answer_payload(
    student_id: int,
    session_id: str,
    question_id: str,
    *,
    selected_answer: str | None,
    position: int,
    skip: bool = False,
) -> dict:
    return {
        "student_id": student_id,
        "skill_id": "GRAMMAR_VERB_FORMS",
        "question_id": question_id,
        "session_id": session_id,
        "selected_answer": selected_answer,
        "confidence": 80.0,
        "response_time": 8.0,
        "attempts": 1,
        "difficulty": 1,
        "hint_used": position == 2,
        "skip": skip,
        "answer_changed": False,
        "time_of_day": "morning",
        "session_position": position,
    }


def test_react_pilot_can_list_and_start_lesson(client: TestClient) -> None:
    student_id = seed_student()
    seed_lesson()

    lessons = client.get(f"/students/{student_id}/lessons")
    assert lessons.status_code == 200, lessons.text
    assert lessons.json()["lessons"][0]["lesson_id"] == "a1-routines-1"

    started = client.post(f"/students/{student_id}/lessons/a1-routines-1/sessions")
    assert started.status_code == 201, started.text
    data = started.json()
    assert data["student_id"] == student_id
    assert data["lesson_id"] == "a1-routines-1"
    assert data["session_id"].startswith("a1-routines-1:")
    assert len(data["questions"]) == 2
    assert "correct_answer" not in data["questions"][0]
    assert data["questions"][0]["choices"][0]["choice_text"] == "I wake up at seven."


def test_react_pilot_can_submit_attempts_and_fetch_adaptive_result(
    client: TestClient,
) -> None:
    student_id = seed_student()
    seed_lesson()
    session_id = client.post(
        f"/students/{student_id}/lessons/a1-routines-1/sessions"
    ).json()["session_id"]

    attempts = [
        attempt_payload(
            student_id,
            session_id,
            "a1-routines-1:q1",
            is_correct=True,
            position=1,
        ),
        attempt_payload(
            student_id,
            session_id,
            "a1-routines-1:q2",
            is_correct=False,
            position=2,
        ),
    ]

    submitted = client.post(
        f"/students/{student_id}/sessions/{session_id}/attempts",
        json={"attempts": attempts},
    )

    assert submitted.status_code == 201, submitted.text
    result = submitted.json()
    assert result["session_id"] == session_id
    assert result["attempts_saved"] == 2
    assert "updated_skill_state" in result
    assert "recommendation" in result
    assert result["recommendation"]["action"] == result["decision_conflict"]["selected_action"]

    fetched = client.get(
        f"/students/{student_id}/sessions/{session_id}/adaptive-result"
    )
    assert fetched.status_code == 200, fetched.text
    assert fetched.json()["session_id"] == session_id
    assert fetched.json()["recommendation"]["id"] == result["recommendation"]["id"]


def test_react_pilot_scores_selected_answers_server_side(client: TestClient) -> None:
    student_id = seed_student()
    seed_lesson()
    session_id = client.post(
        f"/students/{student_id}/lessons/a1-routines-1/sessions"
    ).json()["session_id"]

    submitted = client.post(
        f"/students/{student_id}/sessions/{session_id}/attempts",
        json={
            "attempts": [
                selected_answer_payload(
                    student_id,
                    session_id,
                    "a1-routines-1:q1",
                    selected_answer="I wake up at seven.",
                    position=1,
                ),
                selected_answer_payload(
                    student_id,
                    session_id,
                    "a1-routines-1:q2",
                    selected_answer="I not work on Friday.",
                    position=2,
                ),
            ]
        },
    )

    assert submitted.status_code == 201, submitted.text
    db = TestingSessionLocal()
    try:
        attempts = (
            db.query(QuestionAttemptORM)
            .filter(QuestionAttemptORM.session_id == session_id)
            .order_by(QuestionAttemptORM.session_position.asc())
            .all()
        )
        assert [attempt.is_correct for attempt in attempts] == [True, False]
        assert attempts[1].hint_used is True
    finally:
        db.close()


def test_react_pilot_rejects_attempts_for_another_student(client: TestClient) -> None:
    student_id = seed_student()
    other_student_id = seed_student()
    seed_lesson()

    resp = client.post(
        f"/students/{student_id}/sessions/session-1/attempts",
        json={
            "attempts": [
                attempt_payload(
                    other_student_id,
                    "session-1",
                    "a1-routines-1:q1",
                    is_correct=True,
                    position=1,
                )
            ]
        },
    )

    assert resp.status_code == 422


def test_react_pilot_can_get_next_recommendation(client: TestClient) -> None:
    student_id = seed_student()
    db = TestingSessionLocal()
    try:
        db.add(
            StudentSkillStateORM(
                student_id=student_id,
                skill_id="GRAMMAR_VERB_FORMS",
                mastery=90.0,
                confidence=90.0,
                consistency=90.0,
                reliability=1.0,
                current_difficulty=2,
                retention=100.0,
            )
        )
        db.commit()
    finally:
        db.close()

    resp = client.get(f"/students/{student_id}/recommendation")

    assert resp.status_code == 200, resp.text
    assert resp.json()["student_id"] == student_id
    assert resp.json()["recommendation_id"] >= 1
    assert resp.json()["action_type"] in {
        "increase_difficulty",
        "mixed_practice",
        "continue_current_skill",
    }
