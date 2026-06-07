import json
from pathlib import Path

from aim.content.validators import (
    PilotAnalysisPlanModel,
    ProductionHardeningPlanModel,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
CONTENT_DIR = REPO_ROOT / "packages" / "content"
ANALYSIS_PATH = CONTENT_DIR / "pilot" / "aim_025_pilot_analysis.json"
HARDENING_PATH = CONTENT_DIR / "pilot" / "aim_026_production_hardening.json"


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def test_aim026_production_hardening_passes_schema():
    plan = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    assert plan.hardening_id == "AIM-026"


def test_aim026_links_to_aim025_analysis():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    assert hardening.linked_analysis_id == analysis.analysis_id


def test_aim026_includes_required_hardening_categories():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    categories = {check.category for check in hardening.checks}
    assert {
        "auth",
        "database",
        "api",
        "frontend",
        "observability",
        "privacy",
        "rollback",
        "testing",
    }.issubset(categories)


def test_aim026_requires_cloud_environment_variables():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    assert {
        "APP_ENV",
        "SUPABASE_URL",
        "SUPABASE_DATABASE_URL",
        "SUPABASE_AUTH_REQUIRED",
        "SUPABASE_JWT_AUDIENCE",
        "CORS_ORIGINS",
        "REACT_APP_API_BASE_URL",
        "REACT_APP_SUPABASE_URL",
        "REACT_APP_SUPABASE_PUBLISHABLE_KEY",
    }.issubset(set(hardening.required_env_vars))


def test_aim026_defines_observability_events():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    assert {
        "student_login",
        "lesson_session_started",
        "session_attempts_submitted",
        "adaptive_result_saved",
        "recommendation_generated",
        "outcome_recorded",
    }.issubset(set(hardening.observability_events))


def test_aim026_defines_rollback_steps():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    assert len(hardening.rollback_steps) >= 3
    assert [step.step for step in hardening.rollback_steps] == [1, 2, 3]


def test_aim026_keeps_speed_out_of_mastery_hardening():
    raw = json.dumps(load_json(HARDENING_PATH)).lower()
    forbidden = {"response_time", "avg_response_time", "speed_score"}
    assert forbidden.isdisjoint(raw)


def test_aim026_uses_privacy_safe_reporting_rules():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    privacy = " ".join(hardening.privacy_rules).lower()
    assert "student ids" in privacy
    assert "auth user ids" in privacy
    assert "names or emails" in privacy
