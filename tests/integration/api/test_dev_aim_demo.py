from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from aim.presentation.api.routers.dev_aim_demo import router


def test_demo_endpoint_returns_all_pipeline_steps_for_each_scenario() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)
    scenarios = {
        "strong_student": ("Challenge", "increase"),
        "weak_reading_student": ("Reteach Concept", "reduce"),
        "rushing_student": ("Timed Practice", "maintain"),
        "frustrated_student": ("Easy Win + Encourage", "reduce"),
    }

    for scenario, (action, decision) in scenarios.items():
        response = client.post("/dev/aim/demo-session", json={"scenario": scenario})

        assert response.status_code == 200, response.text
        data = response.json()
        assert set(data) >= {
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
        assert data["submitted_attempts"]
        assert data["recommendation"]["action"] == action
        assert data["difficulty_adaptation"]["decision"] == decision
        assert data["prompt_adaptation_instruction"]["instruction_text"]


def test_demo_endpoint_rejects_unknown_scenario() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    response = client.post("/dev/aim/demo-session", json={"scenario": "unknown"})

    assert response.status_code == 422
