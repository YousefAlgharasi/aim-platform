from __future__ import annotations

from copy import deepcopy

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from aim.infrastructure.database.base import Base
import aim.infrastructure.database.models  # noqa: F401
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


def seed_student(
    *,
    email: str,
    skill_id: str = "RESPONSE_TIME_MASTERY_RULE",
    mastery: float = 60.0,
    confidence: float = 70.0,
    retention: float = 90.0,
    avg_speed: float = 10.0,
    current_difficulty: int = 3,
    consistency: float = 80.0,
) -> int:
    db = TestingSessionLocal()
    try:
        student = StudentORM(name=email.split("@")[0], email=email)
        db.add(student)
        db.flush()
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id=skill_id,
                mastery=mastery,
                confidence=confidence,
                retention=retention,
                avg_speed=avg_speed,
                current_difficulty=current_difficulty,
                consistency=consistency,
            )
        )
        db.commit()
        return student.id
    finally:
        db.close()


def build_attempts(
    *,
    student_id: int,
    session_id: str,
    skill_id: str = "RESPONSE_TIME_MASTERY_RULE",
    correctness: tuple[bool, ...],
    response_time: float,
    attempts: int = 1,
    difficulty: int = 3,
    hint_used: bool = False,
    skip: bool = False,
) -> list[dict]:
    return [
        {
            "student_id": student_id,
            "skill_id": skill_id,
            "question_id": f"speed_rule:q{index}",
            "session_id": session_id,
            "is_correct": is_correct,
            "response_time": response_time,
            "attempts": attempts,
            "difficulty": difficulty,
            "hint_used": hint_used,
            "skip": skip,
            "answer_changed": False,
            "time_of_day": "morning",
            "session_position": index,
        }
        for index, is_correct in enumerate(correctness, start=1)
    ]


def post_attempts(client: TestClient, session_id: str, attempts: list[dict]) -> dict:
    response = client.post(
        f"/sessions/{session_id}/attempts",
        json={"attempts": attempts},
    )

    assert response.status_code == 201, response.text
    return response.json()


def mastery_signature(data: dict) -> dict:
    mastery = data["mastery_result"]
    return {
        "mastery": mastery["mastery"],
        "mastery_raw": mastery["mastery_raw"],
        "mastery_adjusted": mastery["mastery_adjusted"],
        "accuracy": mastery["accuracy"],
        "consistency": mastery["consistency"],
        "retention": mastery["retention"],
        "difficulty_performance": mastery["difficulty_performance"],
        "evidence_quality_score": mastery["evidence_quality_score"],
        "penalties": deepcopy(mastery["penalties"]),
        "reliability": mastery["reliability"],
    }


def assert_mastery_result_has_no_speed_inputs(data: dict) -> None:
    mastery = data["mastery_result"]
    speed_keys = {
        "response_time",
        "avg_response_time",
        "avg_speed",
        "speed",
        "speed_score",
    }

    assert not speed_keys.intersection(mastery)
    assert "Response time was not used" in mastery["explanation"]


def test_slow_correct_student_is_not_punished_in_mastery(client: TestClient) -> None:
    normal_id = seed_student(email="normal-correct@test.example")
    slow_id = seed_student(email="slow-correct@test.example")
    correctness = (True,) * 10

    normal = post_attempts(
        client,
        "normal-correct-session",
        build_attempts(
            student_id=normal_id,
            session_id="normal-correct-session",
            correctness=correctness,
            response_time=8.0,
            difficulty=4,
        ),
    )
    slow = post_attempts(
        client,
        "slow-correct-session",
        build_attempts(
            student_id=slow_id,
            session_id="slow-correct-session",
            correctness=correctness,
            response_time=45.0,
            difficulty=4,
        ),
    )

    assert mastery_signature(slow) == mastery_signature(normal)
    assert slow["mastery_result"]["mastery"] > slow["mastery_result"]["previous_mastery"]
    assert slow["safe_emotional_signal"]["evidence"]["sudden_slowdown"] is True
    assert slow["performance_metrics"]["avg_speed"] == 45.0
    assert_mastery_result_has_no_speed_inputs(slow)


def test_fast_wrong_student_is_not_rewarded_in_mastery(client: TestClient) -> None:
    fast_id = seed_student(email="fast-wrong@test.example")
    slow_id = seed_student(email="slow-wrong@test.example")
    correctness = (False,) * 10

    fast = post_attempts(
        client,
        "fast-wrong-session",
        build_attempts(
            student_id=fast_id,
            session_id="fast-wrong-session",
            correctness=correctness,
            response_time=2.0,
            difficulty=3,
        ),
    )
    slow = post_attempts(
        client,
        "slow-wrong-session",
        build_attempts(
            student_id=slow_id,
            session_id="slow-wrong-session",
            correctness=correctness,
            response_time=35.0,
            difficulty=3,
        ),
    )

    assert mastery_signature(fast) == mastery_signature(slow)
    assert fast["mastery_result"]["mastery"] < fast["mastery_result"]["previous_mastery"]
    assert fast["safe_emotional_signal"]["evidence"]["rushing"] is True
    assert fast["performance_metrics"]["avg_speed"] == 2.0
    assert_mastery_result_has_no_speed_inputs(fast)


def test_same_learning_evidence_gets_same_mastery_with_different_response_time(
    client: TestClient,
) -> None:
    fast_id = seed_student(email="same-evidence-fast@test.example")
    slow_id = seed_student(email="same-evidence-slow@test.example")
    correctness = (True, False, True, True, False, True, False, True, True, False)

    fast = post_attempts(
        client,
        "same-evidence-fast-session",
        build_attempts(
            student_id=fast_id,
            session_id="same-evidence-fast-session",
            correctness=correctness,
            response_time=3.0,
            attempts=2,
            difficulty=3,
            hint_used=True,
        ),
    )
    slow = post_attempts(
        client,
        "same-evidence-slow-session",
        build_attempts(
            student_id=slow_id,
            session_id="same-evidence-slow-session",
            correctness=correctness,
            response_time=30.0,
            attempts=2,
            difficulty=3,
            hint_used=True,
        ),
    )

    assert mastery_signature(fast) == mastery_signature(slow)
    assert fast["performance_metrics"]["avg_speed"] != slow["performance_metrics"]["avg_speed"]
    assert fast["mastery_result"]["evidence_quality_score"] == slow["mastery_result"]["evidence_quality_score"]
    assert_mastery_result_has_no_speed_inputs(fast)
    assert_mastery_result_has_no_speed_inputs(slow)


def test_response_time_changes_behavioral_signals_but_not_mastery(
    client: TestClient,
) -> None:
    rushing_id = seed_student(email="behavior-rushing@test.example")
    slowdown_id = seed_student(email="behavior-slowdown@test.example")
    correctness = (False,) * 10

    rushing = post_attempts(
        client,
        "behavior-rushing-session",
        build_attempts(
            student_id=rushing_id,
            session_id="behavior-rushing-session",
            correctness=correctness,
            response_time=2.0,
        ),
    )
    slowdown = post_attempts(
        client,
        "behavior-slowdown-session",
        build_attempts(
            student_id=slowdown_id,
            session_id="behavior-slowdown-session",
            correctness=correctness,
            response_time=30.0,
        ),
    )

    assert mastery_signature(rushing) == mastery_signature(slowdown)
    assert rushing["safe_emotional_signal"]["emotional_signal"] == "rushing_signal"
    assert rushing["safe_emotional_signal"]["evidence"]["rushing"] is True
    assert slowdown["safe_emotional_signal"]["evidence"]["sudden_slowdown"] is True
    assert slowdown["safe_emotional_signal"]["evidence"]["fatigue_or_distraction"] is True
    assert rushing["performance_metrics"]["avg_speed"] == 2.0
    assert slowdown["performance_metrics"]["avg_speed"] == 30.0


def test_response_time_does_not_change_current_difficulty(client: TestClient) -> None:
    normal_id = seed_student(
        email="difficulty-normal-speed@test.example",
        mastery=85.0,
        confidence=80.0,
        retention=90.0,
        avg_speed=8.0,
        current_difficulty=3,
        consistency=85.0,
    )
    slow_id = seed_student(
        email="difficulty-slow-speed@test.example",
        mastery=85.0,
        confidence=80.0,
        retention=90.0,
        avg_speed=8.0,
        current_difficulty=3,
        consistency=85.0,
    )
    correctness = (False, False, False, False, True)

    normal = post_attempts(
        client,
        "difficulty-normal-speed-session",
        build_attempts(
            student_id=normal_id,
            session_id="difficulty-normal-speed-session",
            correctness=correctness,
            response_time=8.0,
        ),
    )
    slow = post_attempts(
        client,
        "difficulty-slow-speed-session",
        build_attempts(
            student_id=slow_id,
            session_id="difficulty-slow-speed-session",
            correctness=correctness,
            response_time=24.0,
        ),
    )

    assert slow["safe_emotional_signal"]["evidence"]["sudden_slowdown"] is True
    assert slow["safe_emotional_signal"]["frustration_score"] > normal["safe_emotional_signal"]["frustration_score"]
    assert normal["difficulty_decision"]["target_difficulty"] == slow["difficulty_decision"]["target_difficulty"]
    assert normal["updated_skill_state"]["current_difficulty"] == slow["updated_skill_state"]["current_difficulty"]
    assert slow["difficulty_decision"]["evidence"]["frustration_score"] == normal["difficulty_decision"]["evidence"]["frustration_score"]
