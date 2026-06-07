import json
from pathlib import Path

from aim.content.validators import PilotPlanModel

REPO_ROOT = Path(__file__).resolve().parents[3]
CONTENT_DIR = REPO_ROOT / "packages" / "content"
PILOT_PLAN_PATH = CONTENT_DIR / "pilot" / "aim_023_pilot_plan.json"


def load_plan() -> dict:
    with open(PILOT_PLAN_PATH) as f:
        return json.load(f)


def test_aim023_pilot_plan_passes_schema():
    plan = PilotPlanModel.model_validate(load_plan())
    assert plan.pilot_id == "AIM-023"


def test_aim023_pilot_plan_matches_required_cohort():
    plan = PilotPlanModel.model_validate(load_plan())
    assert plan.cohort.learner_count == 5
    assert plan.cohort.duration_days == 14
    assert plan.cohort.cefr_level == "A1"


def test_aim023_schedule_covers_all_lessons_and_measurements():
    plan = PilotPlanModel.model_validate(load_plan())
    lesson_ids = [item.lesson_id for item in plan.schedule if item.lesson_id]
    assert lesson_ids == [f"L{index:02d}" for index in range(1, 11)]
    assert plan.schedule[0].activity_type == "pre_test"
    assert plan.schedule[-1].activity_type == "post_test"


def test_aim023_plan_references_existing_content_files():
    plan = PilotPlanModel.model_validate(load_plan())
    for item in plan.schedule:
        if item.lesson_id:
            lesson_path = CONTENT_DIR / "lessons" / f"{item.lesson_id}_{lesson_slug(item.lesson_id)}.json"
            assert lesson_path.exists(), f"Missing lesson file for {item.lesson_id}"

    assessment_id = plan.measurement.pre_post_assessment_id
    assessment_path = CONTENT_DIR / "assessments" / "pre_post_test.json"
    assert assessment_path.exists()
    assert load_json(assessment_path)["assessment_id"] == assessment_id


def test_aim023_required_api_surfaces_are_declared():
    plan = PilotPlanModel.model_validate(load_plan())
    paths = {endpoint.path for endpoint in plan.required_backend_endpoints}
    assert "/students/{student_id}/sessions/{session_id}/attempts" in paths
    assert "/students/{student_id}/sessions/{session_id}/adaptive-result" in paths
    assert "/admin/pilot/overview" in paths

    frontend_routes = set(plan.required_frontend_routes)
    assert "/dashboard" in frontend_routes
    assert "/result/:session_id" in frontend_routes
    assert "/admin/pilot" in frontend_routes


def test_aim023_plan_keeps_speed_out_of_mastery_measurement():
    raw = json.dumps(load_plan()).lower()
    forbidden = {"response_time", "avg_response_time", "speed_score"}
    assert forbidden.isdisjoint(raw)
    assert "speed is not a mastery signal" not in raw


def test_aim023_plan_uses_educational_safety_language():
    plan = PilotPlanModel.model_validate(load_plan())
    allowed = set(plan.safety_terms_allowed)
    assert "low confidence signal" in allowed
    assert "prerequisite gap" in allowed
    assert "concept misunderstanding" in allowed

    forbidden = " ".join(plan.safety_terms_forbidden).lower()
    assert "diagnosis" in forbidden
    assert "clinical" in forbidden


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def lesson_slug(lesson_id: str) -> str:
    return {
        "L01": "greetings_introductions",
        "L02": "verb_to_be",
        "L03": "numbers_colors",
        "L04": "my_family",
        "L05": "daily_routines_part1",
        "L06": "daily_routines_part2",
        "L07": "present_simple_questions",
        "L08": "my_home_city",
        "L09": "basic_reading",
        "L10": "review_posttest",
    }[lesson_id]
