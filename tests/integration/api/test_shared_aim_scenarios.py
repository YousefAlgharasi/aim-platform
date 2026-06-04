from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from aim.application.demo.aim_demo_scenarios import SCENARIOS, scenario_keys
from aim.presentation.api.routers.dev_aim_demo import router
from tests.fixtures.aim_scenarios import aim_scenario_payloads


EXPECTED_KEYS = {
    "strong_student",
    "weak_reading_student",
    "rushing_student",
    "frustrated_student",
    "low_confidence_student",
    "hint_dependent_student",
    "prerequisite_gap_student",
    "retention_review_student",
    "slow_but_accurate_student",
    "low_reliability_student",
    "questionable_question_quality_student",
}


def test_all_shared_scenario_keys_are_available() -> None:
    assert set(scenario_keys()) == EXPECTED_KEYS
    assert set(SCENARIOS) == EXPECTED_KEYS


def test_algorithm_harness_fixtures_adapt_shared_scenarios() -> None:
    fixtures = aim_scenario_payloads(student_id=123)

    assert set(fixtures) == EXPECTED_KEYS
    for key, fixture in fixtures.items():
        shared = SCENARIOS[key]
        assert fixture.key == shared.key
        assert fixture.skill_id == shared.skill_id
        assert fixture.initial_state["mastery"] == shared.initial_state.mastery
        assert len(fixture.attempts) == len(shared.attempts)
        assert len(fixture.related_skill_states) == len(shared.related_skill_states)
        assert fixture.attempts[0]["question_id"] == shared.attempts[0].question_id
        assert fixture.attempts[0]["student_id"] == 123


def test_dev_demo_endpoint_accepts_each_shared_scenario() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    for key in scenario_keys():
        response = client.post("/dev/aim/demo-session", json={"scenario": key})

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["data_source"] == "real_aim_pipeline"
        assert data["student_profile"]["skill_id"] == SCENARIOS[key].skill_id
        assert len(data["submitted_attempts"]) == len(SCENARIOS[key].attempts)
