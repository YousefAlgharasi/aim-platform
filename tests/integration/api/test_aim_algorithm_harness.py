from __future__ import annotations

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
from tests.fixtures.aim_scenarios import AimScenario, aim_scenario_payloads


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


REQUIRED_ADAPTIVE_KEYS = {
    "updated_skill_state",
    "performance_metrics",
    "mastery_result",
    "weakness_result",
    "error_pattern",
    "safe_emotional_signal",
    "retention_result",
    "evidence_quality",
    "reliability",
    "question_quality",
    "learning_response_pattern",
    "prerequisite_gaps",
    "transfer_learning",
    "fairness_audit",
    "decision_conflict",
    "difficulty_decision",
    "recommendation",
    "prompt_adaptation_instruction",
    "outcome_tracking",
    "explanation_log_id",
}


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


def seed_student_for_scenario(scenario_key: str) -> AimScenario:
    db = TestingSessionLocal()
    try:
        preview = aim_scenario_payloads(student_id=0)[scenario_key]
        student = StudentORM(
            name=preview.student_name,
            email=preview.student_email,
        )
        db.add(student)
        db.flush()
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id=preview.skill_id,
                mastery=preview.initial_state["mastery"],
                confidence=preview.initial_state["confidence"],
                avg_speed=preview.initial_state["avg_speed"],
                current_difficulty=preview.initial_state["current_difficulty"],
                retention=preview.initial_state["retention"],
                consistency=preview.initial_state["consistency"],
            )
        )
        for state in preview.related_skill_states:
            db.add(
                StudentSkillStateORM(
                    student_id=student.id,
                    skill_id=state["skill_id"],
                    mastery=state["mastery"],
                    confidence=state["confidence"],
                    avg_speed=state["avg_speed"],
                    current_difficulty=state["current_difficulty"],
                    retention=state["retention"],
                    consistency=state["consistency"],
                )
            )
        db.commit()
        student_id = student.id
    finally:
        db.close()

    return aim_scenario_payloads(student_id=student_id)[scenario_key]


def run_real_session_pipeline(client: TestClient, scenario: AimScenario) -> dict:
    response = client.post(
        f"/sessions/{scenario.session_id}/attempts",
        json={"attempts": list(scenario.attempts)},
    )

    assert response.status_code == 201, response.text
    data = response.json()
    assert data["adaptive_results"], data
    assert set(data) >= REQUIRED_ADAPTIVE_KEYS
    assert set(data["adaptive_results"][0]) >= REQUIRED_ADAPTIVE_KEYS
    assert "frustration_score" in data or "safe_emotional_signal" in data
    assert data["recommendation"]["action_type"]
    assert data["recommendation"]["action"] == data["decision_conflict"]["selected_action"]
    assert data["prompt_adaptation_instruction"]["instruction_text"]
    assert isinstance(data["explanation_log_id"], int)
    return data


def assert_prompt_mentions_any(prompt: str, terms: set[str]) -> None:
    normalized = prompt.lower()
    assert any(term in normalized for term in terms), prompt


def test_strong_student_gets_challenge_recommendation(client: TestClient) -> None:
    scenario = seed_student_for_scenario("strong_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["mastery_result"]["mastery"] >= scenario.initial_state["mastery"]
    assert data["weakness_result"]["weakness_score"] <= scenario.expected["max_weakness_score"]
    assert data["frustration_score"] <= scenario.expected["max_frustration_score"]
    assert (
        data["difficulty_decision"]["target_difficulty"]
        >= scenario.initial_state["current_difficulty"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["challenge_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        {"harder", "higher", "stretch", "challenge", "current", "steady"},
    )


def test_weak_reading_student_gets_supportive_recommendation(client: TestClient) -> None:
    scenario = seed_student_for_scenario("weak_reading_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["weakness_result"]["skill_id"] == scenario.skill_id
    assert data["weakness_result"]["weakness_score"] > 0.0
    assert data["mastery_result"]["mastery"] <= scenario.expected["max_mastery_after"]
    assert data["recommendation"]["action_type"] in scenario.expected["support_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["support_prompt_terms"],
    )


def test_rushing_student_gets_reflective_or_timed_practice(client: TestClient) -> None:
    scenario = seed_student_for_scenario("rushing_student")

    data = run_real_session_pipeline(client, scenario)

    emotional_evidence = data["safe_emotional_signal"]["evidence"]
    assert (
        emotional_evidence["rushing"]
        or data["error_pattern"]["pattern_type"] in {"TYPE_3_PRESSURE", "rushing"}
        or data["recommendation"]["action_type"] in scenario.expected["reflective_actions"]
    )
    assert (
        data["difficulty_decision"]["target_difficulty"]
        <= scenario.expected["max_target_difficulty"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["reflective_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["rushing_prompt_terms"],
    )


def test_frustrated_student_gets_easy_win_or_reduced_difficulty(client: TestClient) -> None:
    scenario = seed_student_for_scenario("frustrated_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["frustration_score"] >= scenario.expected["min_frustration_score"]
    assert (
        data["difficulty_decision"]["target_difficulty"]
        <= scenario.initial_state["current_difficulty"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["support_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["support_prompt_terms"],
    )


def test_low_confidence_student_gets_supportive_path(client: TestClient) -> None:
    scenario = seed_student_for_scenario("low_confidence_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["recommendation"]["action_type"] in scenario.expected["support_actions"]
    assert (
        data["difficulty_decision"]["target_difficulty"]
        <= scenario.initial_state["current_difficulty"]
        + scenario.expected["max_difficulty_increase"]
    )
    assert data["mastery_result"]["mastery"] >= scenario.initial_state["mastery"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["support_prompt_terms"],
    )


def test_hint_dependent_student_reduces_evidence_quality(client: TestClient) -> None:
    scenario = seed_student_for_scenario("hint_dependent_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["mastery_result"]["evidence_quality_score"] <= scenario.expected["max_evidence_quality"]
    assert data["mastery_result"]["penalties"]["hint_penalty"] >= scenario.expected["min_hint_penalty"]
    assert data["weakness_result"]["weakness_score"] > 0.0
    assert data["recommendation"]["action_type"] in scenario.expected["support_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["support_prompt_terms"],
    )


def test_prerequisite_gap_student_gets_gap_or_safe_fallback(client: TestClient) -> None:
    scenario = seed_student_for_scenario("prerequisite_gap_student")

    data = run_real_session_pipeline(client, scenario)

    missing = scenario.expected["expected_missing_prerequisite"]
    assert data["prerequisite_gaps"]
    assert data["prerequisite_gaps"][0]["missing_prerequisite_skill_id"] == missing
    assert data["recommendation"]["action_type"] in scenario.expected["gap_actions"]
    assert missing in data["recommendation"]["inputs_snapshot"]["missing_prerequisites"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["prompt_terms"],
    )


def test_retention_review_student_gets_review_path(client: TestClient) -> None:
    scenario = seed_student_for_scenario("retention_review_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["retention_result"]["retention"] <= scenario.expected["max_retention"]
    assert data["recommendation"]["action_type"] in scenario.expected["review_actions"]
    assert_prompt_mentions_any(
        data["prompt_adaptation_instruction"]["instruction_text"],
        scenario.expected["prompt_terms"],
    )


def test_slow_but_accurate_student_not_punished_by_speed(client: TestClient) -> None:
    scenario = seed_student_for_scenario("slow_but_accurate_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["mastery_result"]["mastery"] >= scenario.initial_state["mastery"]
    assert data["performance_metrics"]["avg_speed"] >= 20.0
    assert "Response time was not used" in data["mastery_result"]["explanation"]
    assert data["weakness_result"]["weakness_score"] <= scenario.expected["max_weakness_score"]
    assert (
        data["difficulty_decision"]["target_difficulty"]
        >= scenario.initial_state["current_difficulty"]
        - scenario.expected["max_difficulty_drop"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["allowed_actions"]


def test_low_reliability_student_collects_more_evidence_or_low_confidence(
    client: TestClient,
) -> None:
    scenario = seed_student_for_scenario("low_reliability_student")

    data = run_real_session_pipeline(client, scenario)

    assert data["reliability"]["reliability"] <= scenario.expected["max_reliability"]
    assert data["mastery_result"]["decision_confidence"] == "low"
    assert (
        data["mastery_result"]["mastery"]
        <= scenario.initial_state["mastery"] + scenario.expected["max_mastery_gain"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["low_reliability_actions"]


def test_questionable_question_quality_student_reduces_evidence_impact(
    client: TestClient,
) -> None:
    scenario = seed_student_for_scenario("questionable_question_quality_student")

    data = run_real_session_pipeline(client, scenario)

    flagged_questions = [
        result for result in data["question_quality"]
        if result["flag_for_review"]
    ]
    assert flagged_questions
    assert flagged_questions[0]["quality_score"] <= scenario.expected["max_question_quality_score"]
    assert data["mastery_result"]["evidence_quality_score"] <= scenario.expected["max_evidence_quality"]
    assert (
        data["mastery_result"]["previous_mastery"] - data["mastery_result"]["mastery"]
        <= scenario.expected["max_mastery_drop"]
    )
    assert data["recommendation"]["action_type"] in scenario.expected["support_actions"]
