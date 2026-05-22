from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from aim.presentation.api.routers.dev_aim_demo import router


VISUAL_RESPONSE_KEYS = {
    "student_profile",
    "submitted_attempts",
    "performance_metrics",
    "mastery_update",
    "weakness_detection",
    "error_pattern",
    "emotional_state",
    "difficulty_adaptation",
    "recommendation",
    "prompt_adaptation_instruction",
}


def client() -> TestClient:
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def run_scenario(scenario: str) -> dict:
    response = client().post("/dev/aim/demo-session", json={"scenario": scenario})
    assert response.status_code == 200, response.text
    return response.json()


def test_demo_endpoint_returns_real_pipeline_source_and_visual_shape() -> None:
    data = run_scenario("strong_student")

    assert data["data_source"] == "real_aim_pipeline"
    assert set(data) >= VISUAL_RESPONSE_KEYS
    assert data["submitted_attempts"]
    assert data["real_pipeline_output"]["adaptive_result_keys"]


def test_strong_student_uses_real_mastery_and_difficulty_outputs() -> None:
    data = run_scenario("strong_student")

    assert data["mastery_update"]["mastery_after"] >= 80.0
    assert data["difficulty_adaptation"]["decision"] in {"increase", "maintain"}
    assert data["recommendation"]["raw_action_type"] in {
        "increase_difficulty",
        "continue_current_skill",
        "mixed_practice",
    }


def test_weak_reading_student_returns_real_weakness_detection() -> None:
    data = run_scenario("weak_reading_student")

    assert data["mastery_update"]["mastery_after"] < 50.0
    assert data["weakness_detection"]["detected_weak_skill"] == "Reading Comprehension"
    assert data["weakness_detection"]["weakness_score"] > 0.0
    assert data["weakness_detection"]["repeated_mistake_count"] >= 1


def test_frustrated_student_returns_real_high_frustration_and_support() -> None:
    data = run_scenario("frustrated_student")

    assert data["emotional_state"]["frustration_score"] > 70.0
    assert data["difficulty_adaptation"]["decision"] == "decrease"
    assert data["recommendation"]["raw_action_type"] == "easy_win"
    assert data["prompt_adaptation_instruction"]["tone"] == "warm and encouraging"


def test_prompt_instruction_is_generated_by_real_prompt_generator() -> None:
    data = run_scenario("strong_student")
    prompt = data["prompt_adaptation_instruction"]

    assert prompt["student_id"] == data["student_profile"]["student_id"]
    assert prompt["lesson_id"] == data["session_id"]
    assert prompt["teaching_strategy"]
    assert prompt["micro_goal"]
    assert prompt["instruction_text"].startswith("In the next lesson")


def test_demo_endpoint_rejects_unknown_scenario() -> None:
    response = client().post("/dev/aim/demo-session", json={"scenario": "unknown"})

    assert response.status_code == 422
