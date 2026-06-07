import json
from pathlib import Path

from aim.content.validators import (
    PilotAnalysisPlanModel,
    PilotOperationsModel,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
CONTENT_DIR = REPO_ROOT / "packages" / "content"
OPERATIONS_PATH = CONTENT_DIR / "pilot" / "aim_024_pilot_operations.json"
ANALYSIS_PATH = CONTENT_DIR / "pilot" / "aim_025_pilot_analysis.json"


def load_json(path: Path) -> dict:
    with open(path) as f:
        return json.load(f)


def test_aim025_analysis_plan_passes_schema():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    assert analysis.analysis_id == "AIM-025"


def test_aim025_analysis_links_to_aim024_operations():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    assert analysis.linked_operations_id == operations.operations_id


def test_aim025_analysis_defines_required_metrics():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    metric_ids = {metric.metric_id for metric in analysis.metrics}
    assert {
        "learning_gain",
        "completion_rate",
        "recommendation_effectiveness",
        "mastery_movement",
        "retention_movement",
        "weakness_reduction",
        "data_quality",
    }.issubset(metric_ids)


def test_aim025_analysis_uses_required_operation_exports():
    operations = PilotOperationsModel.model_validate(load_json(OPERATIONS_PATH))
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    operation_exports = {export.artifact_name for export in operations.data_exports}
    required_artifacts = set(analysis.required_artifacts)
    assert {
        "pre_post_scores",
        "session_attempts",
        "adaptive_recommendations",
        "admin_daily_snapshot",
    }.issubset(operation_exports)
    assert operation_exports.issubset(required_artifacts)


def test_aim025_analysis_defines_required_report_sections():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    section_ids = {section.section_id for section in analysis.report_sections}
    assert {
        "cohort_summary",
        "learning_gain",
        "aim_recommendations",
        "safety_review",
        "data_quality",
        "next_phase_decision",
    }.issubset(section_ids)


def test_aim025_analysis_defines_next_phase_decision_gates():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    gate_ids = {gate.gate_id for gate in analysis.decision_gates}
    assert {
        "learning_signal",
        "algorithm_safety",
        "data_completeness",
        "operator_readiness",
    }.issubset(gate_ids)


def test_aim025_analysis_keeps_speed_out_of_mastery_metrics():
    raw = json.dumps(load_json(ANALYSIS_PATH)).lower()
    forbidden = {"response_time", "avg_response_time", "speed_score"}
    assert forbidden.isdisjoint(raw)


def test_aim025_analysis_uses_educational_safety_language():
    analysis = PilotAnalysisPlanModel.model_validate(load_json(ANALYSIS_PATH))
    safety = " ".join(analysis.safety_notes).lower()
    assert "prerequisite gap" in safety
    assert "weak retention" in safety
    assert "low confidence signal" in safety
    assert "medical diagnosis" in safety
    assert "clinical psychological labels" in safety
