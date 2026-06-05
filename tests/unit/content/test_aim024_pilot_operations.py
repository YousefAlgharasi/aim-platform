import json
from pathlib import Path

from aim.content.validators import PilotOperationsModel, PilotPlanModel

REPO_ROOT = Path(__file__).resolve().parents[3]
PILOT_PLAN_PATH = REPO_ROOT / "content" / "pilot" / "aim_023_pilot_plan.json"
OPERATIONS_PATH = REPO_ROOT / "content" / "pilot" / "aim_024_pilot_operations.json"


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def test_aim024_operations_pass_schema():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    assert operations.operations_id == "AIM-024"


def test_aim024_operations_link_to_aim023_plan():
    plan = PilotPlanModel.model_validate(load_json(PILOT_PLAN_PATH))
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    assert operations.linked_pilot_id == plan.pilot_id


def test_aim024_operations_cover_pilot_days():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    days = [item.day for item in operations.daily_operations]
    assert min(days) == 0
    assert max(days) == 13
    assert set(range(1, 12)).issubset(days)


def test_aim024_operations_define_required_issue_protocols():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    issue_types = {item.issue_type for item in operations.issue_protocols}
    assert {
        "login_access",
        "lesson_submission",
        "high_frustration_signal",
        "data_quality_gap",
    }.issubset(issue_types)


def test_aim024_operations_define_required_exports():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    artifact_names = {item.artifact_name for item in operations.data_exports}
    assert {
        "pre_post_scores",
        "session_attempts",
        "adaptive_recommendations",
        "admin_daily_snapshot",
    }.issubset(artifact_names)


def test_aim024_operations_do_not_collect_forbidden_mastery_speed_fields():
    raw = json.dumps(load_json(OPERATIONS_PATH)).lower()
    forbidden = {"response_time", "avg_response_time", "speed_score"}
    assert forbidden.isdisjoint(raw)


def test_aim024_operations_use_educational_safety_boundaries():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    forbidden = " ".join(operations.forbidden_interpretations).lower()
    assert "diagnosis" in forbidden
    assert "clinical" in forbidden
    assert "mental health" in forbidden

    high_frustration = next(
        item for item in operations.issue_protocols if item.issue_type == "high_frustration_signal"
    )
    assert high_frustration.must_pause_student is True
    assert high_frustration.severity == "high"
