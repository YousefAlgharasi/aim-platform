import json
from pathlib import Path

from aim.content.validators import (
    CloudDeploymentPlanModel,
    ProductionHardeningPlanModel,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
HARDENING_PATH = REPO_ROOT / "content" / "pilot" / "aim_026_production_hardening.json"
DEPLOYMENT_PATH = REPO_ROOT / "content" / "pilot" / "aim_027_cloud_deployment.json"


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def read_text(path: str) -> str:
    return (REPO_ROOT / path).read_text()


def test_aim027_cloud_deployment_plan_passes_schema():
    plan = CloudDeploymentPlanModel.model_validate(load_json(DEPLOYMENT_PATH))
    assert plan.deployment_id == "AIM-027"


def test_aim027_links_to_aim026_hardening():
    hardening = ProductionHardeningPlanModel.model_validate(load_json(HARDENING_PATH))
    deployment = CloudDeploymentPlanModel.model_validate(load_json(DEPLOYMENT_PATH))
    assert deployment.linked_hardening_id == hardening.hardening_id


def test_aim027_deployment_files_exist():
    deployment = CloudDeploymentPlanModel.model_validate(load_json(DEPLOYMENT_PATH))
    for relative_path in deployment.deployment_files:
        assert (REPO_ROOT / relative_path).exists(), relative_path


def test_aim027_backend_dockerfile_runs_migrations_and_uvicorn():
    dockerfile = read_text("deployment/cloud/backend.Dockerfile")
    assert "python:3.11-slim" in dockerfile
    assert "pip install --no-cache-dir ." in dockerfile
    assert "alembic upgrade head" in dockerfile
    assert "uvicorn aim.presentation.api.app:app" in dockerfile


def test_aim027_frontend_dockerfile_builds_react_and_serves_nginx():
    dockerfile = read_text("deployment/cloud/frontend.Dockerfile")
    assert "node:20-alpine" in dockerfile
    assert "npm ci" in dockerfile
    assert "npm run build" in dockerfile
    assert "nginx:1.27-alpine" in dockerfile
    assert "REACT_APP_SUPABASE_PUBLISHABLE_KEY" in dockerfile


def test_aim027_render_blueprint_contains_backend_and_frontend_env():
    blueprint = read_text("deployment/cloud/render.yaml")
    for expected in (
        "aim-fastapi-backend",
        "aim-react-frontend",
        "SUPABASE_DATABASE_URL",
        "SUPABASE_AUTH_REQUIRED",
        "REACT_APP_API_BASE_URL",
        "REACT_APP_SUPABASE_URL",
        "REACT_APP_SUPABASE_PUBLISHABLE_KEY",
    ):
        assert expected in blueprint


def test_aim027_frontend_env_example_has_public_supabase_values_only():
    env_example = read_text("frontend/.env.example")
    assert "REACT_APP_API_BASE_URL=" in env_example
    assert "REACT_APP_SUPABASE_URL=" in env_example
    assert "REACT_APP_SUPABASE_PUBLISHABLE_KEY=" in env_example
    assert "SERVICE_ROLE" not in env_example
    assert "SUPABASE_DATABASE_URL" not in env_example


def test_aim027_keeps_speed_out_of_deployment_plan():
    raw = json.dumps(load_json(DEPLOYMENT_PATH)).lower()
    forbidden = {"response_time", "avg_response_time", "speed_score"}
    assert forbidden.isdisjoint(raw)
