from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


class QuestionType(str, Enum):
    mcq = "mcq"
    fill = "fill"
    true_false = "true_false"
    matching = "matching"
    ordering = "ordering"


class QuestionModel(BaseModel):
    question_id: str = Field(pattern=r"^[A-Z0-9]{1,6}-Q[0-9]{2,3}$")
    skill_id: str = Field(pattern=r"^SK-[A-Z][0-9]{2}$")
    concept: str = Field(min_length=3)
    difficulty: int = Field(ge=1, le=5)
    type: QuestionType
    prompt_en: str = Field(min_length=5)
    prompt_ar: str = Field(min_length=5)
    choices: Optional[List[str]] = None
    correct_answer: str = Field(min_length=1)
    explanation_en: str = Field(min_length=10)
    explanation_ar: str = Field(min_length=10)
    common_error_tags: List[str]
    prerequisites: List[str]
    hints: List[str] = Field(min_length=1)

    @model_validator(mode="after")
    def choices_required_for_mcq(self) -> "QuestionModel":
        if self.type in (QuestionType.mcq, QuestionType.matching):
            if not self.choices or len(self.choices) < 2:
                raise ValueError(
                    f"question_id={self.question_id}: 'choices' required for type={self.type}"
                )
        return self

    @model_validator(mode="after")
    def prerequisites_are_valid_skill_ids(self) -> "QuestionModel":
        import re
        pattern = re.compile(r"^SK-[A-Z][0-9]{2}$")
        for p in self.prerequisites:
            if not pattern.match(p):
                raise ValueError(
                    f"question_id={self.question_id}: invalid prerequisite skill_id '{p}'"
                )
        return self

    model_config = {"extra": "forbid"}


class LessonModel(BaseModel):
    lesson_id: str = Field(pattern=r"^L[0-9]{2}$")
    task_id: Optional[str] = None
    title_en: str = Field(min_length=3)
    title_ar: str = Field(min_length=3)
    week: int = Field(ge=1, le=2)
    difficulty: int = Field(ge=1, le=5)
    sprint: Optional[str] = None
    prerequisites: List[str]
    skills_covered: List[str] = Field(min_length=1)
    learning_objectives: List[str] = Field(min_length=1)
    reading_passage: Optional[dict] = None
    questions: List[QuestionModel] = Field(min_length=3)

    @model_validator(mode="after")
    def skills_covered_are_valid(self) -> "LessonModel":
        import re
        pattern = re.compile(r"^SK-[A-Z][0-9]{2}$")
        for s in self.skills_covered:
            if not pattern.match(s):
                raise ValueError(
                    f"lesson_id={self.lesson_id}: invalid skill_id '{s}' in skills_covered"
                )
        return self

    @model_validator(mode="after")
    def question_ids_are_unique(self) -> "LessonModel":
        ids = [q.question_id for q in self.questions]
        if len(ids) != len(set(ids)):
            raise ValueError(
                f"lesson_id={self.lesson_id}: duplicate question_id values detected"
            )
        return self

    model_config = {"extra": "forbid"}


class ScoringModel(BaseModel):
    total_questions: int = Field(ge=1)
    pass_threshold: int = Field(ge=1)
    score_mapping: dict

    model_config = {"extra": "forbid"}


class AssessmentModel(BaseModel):
    assessment_id: str = Field(min_length=3)
    task_id: Optional[str] = None
    title_en: str = Field(min_length=3)
    title_ar: str = Field(min_length=3)
    instructions_en: str = Field(min_length=10)
    instructions_ar: str = Field(min_length=10)
    duration_minutes: int = Field(ge=1)
    usage: str = Field(min_length=10)
    questions: List[QuestionModel] = Field(min_length=5)
    scoring: ScoringModel

    @model_validator(mode="after")
    def question_ids_are_unique(self) -> "AssessmentModel":
        ids = [q.question_id for q in self.questions]
        if len(ids) != len(set(ids)):
            raise ValueError(
                f"assessment_id={self.assessment_id}: duplicate question_id values detected"
            )
        return self

    model_config = {"extra": "forbid"}


class PilotCohortModel(BaseModel):
    target_learners: str = Field(min_length=10)
    learner_count: int = Field(ge=5, le=5)
    duration_days: int = Field(ge=14, le=14)
    cefr_level: str = Field(pattern=r"^A1$")
    primary_language: str = Field(min_length=3)

    model_config = {"extra": "forbid"}


class PilotEndpointModel(BaseModel):
    name: str = Field(min_length=3)
    method: str = Field(pattern=r"^(GET|POST|PUT|PATCH|DELETE)$")
    path: str = Field(min_length=2)
    purpose: str = Field(min_length=10)

    model_config = {"extra": "forbid"}


class PilotScheduleItemModel(BaseModel):
    day: int = Field(ge=0, le=14)
    activity_type: str = Field(min_length=3)
    lesson_id: Optional[str] = Field(default=None, pattern=r"^L[0-9]{2}$")
    assessment_id: Optional[str] = None
    objective: str = Field(min_length=10)
    expected_minutes: int = Field(ge=5, le=45)

    model_config = {"extra": "forbid"}


class PilotMeasurementModel(BaseModel):
    primary_metric: str = Field(min_length=10)
    secondary_metrics: List[str] = Field(min_length=3)
    pre_post_assessment_id: str = Field(min_length=3)
    recommendation_effectiveness_rule: str = Field(min_length=20)
    mastery_safety_rule: str = Field(min_length=20)

    @model_validator(mode="after")
    def speed_not_used_for_mastery(self) -> "PilotMeasurementModel":
        forbidden = ("response_time", "avg_response_time", "speed_score")
        text = " ".join(
            [
                self.primary_metric,
                *self.secondary_metrics,
                self.recommendation_effectiveness_rule,
                self.mastery_safety_rule,
            ]
        ).lower()
        if any(term in text for term in forbidden):
            raise ValueError("Pilot measurement must not use speed fields for mastery.")
        return self

    model_config = {"extra": "forbid"}


class PilotPlanModel(BaseModel):
    pilot_id: str = Field(pattern=r"^AIM-023$")
    title: str = Field(min_length=5)
    status: str = Field(pattern=r"^ready_for_manual_notion_review$")
    cohort: PilotCohortModel
    required_backend_endpoints: List[PilotEndpointModel] = Field(min_length=5)
    required_frontend_routes: List[str] = Field(min_length=5)
    schedule: List[PilotScheduleItemModel] = Field(min_length=12)
    measurement: PilotMeasurementModel
    safety_terms_allowed: List[str] = Field(min_length=3)
    safety_terms_forbidden: List[str] = Field(min_length=3)
    operator_checklist: List[str] = Field(min_length=6)

    @model_validator(mode="after")
    def pilot_scope_is_complete(self) -> "PilotPlanModel":
        lesson_ids = {item.lesson_id for item in self.schedule if item.lesson_id}
        if lesson_ids != {f"L{index:02d}" for index in range(1, 11)}:
            raise ValueError("Pilot schedule must include lessons L01 through L10.")

        activity_types = {item.activity_type for item in self.schedule}
        if "pre_test" not in activity_types or "post_test" not in activity_types:
            raise ValueError("Pilot schedule must include pre_test and post_test.")

        endpoint_paths = {endpoint.path for endpoint in self.required_backend_endpoints}
        required_paths = {
            "/students/{student_id}/lessons",
            "/students/{student_id}/lessons/{lesson_id}",
            "/students/{student_id}/lessons/{lesson_id}/sessions",
            "/students/{student_id}/sessions/{session_id}/attempts",
            "/students/{student_id}/sessions/{session_id}/adaptive-result",
            "/students/{student_id}/recommendation",
            "/admin/pilot/overview",
        }
        missing_paths = required_paths - endpoint_paths
        if missing_paths:
            raise ValueError(f"Pilot plan missing backend endpoints: {sorted(missing_paths)}")

        forbidden_text = " ".join(self.safety_terms_forbidden).lower()
        if "diagnosis" not in forbidden_text or "clinical" not in forbidden_text:
            raise ValueError("Pilot plan must forbid clinical or diagnosis language.")

        return self

    model_config = {"extra": "forbid"}


class PilotDailyOperationModel(BaseModel):
    day: int = Field(ge=0, le=14)
    operator_action: str = Field(min_length=20)
    learner_activity: str = Field(min_length=20)
    data_to_check: List[str] = Field(min_length=2)
    completion_signal: str = Field(min_length=15)

    model_config = {"extra": "forbid"}


class PilotIssueProtocolModel(BaseModel):
    issue_type: str = Field(min_length=5)
    severity: str = Field(pattern=r"^(low|medium|high)$")
    operator_response: str = Field(min_length=20)
    escalation_owner: str = Field(min_length=5)
    must_pause_student: bool = False

    model_config = {"extra": "forbid"}


class PilotDataExportModel(BaseModel):
    artifact_name: str = Field(min_length=5)
    source: str = Field(min_length=5)
    fields: List[str] = Field(min_length=2)
    cadence: str = Field(min_length=5)

    model_config = {"extra": "forbid"}


class PilotOperationsModel(BaseModel):
    operations_id: str = Field(pattern=r"^AIM-024$")
    linked_pilot_id: str = Field(pattern=r"^AIM-023$")
    title: str = Field(min_length=5)
    status: str = Field(pattern=r"^ready_for_manual_notion_review$")
    daily_operations: List[PilotDailyOperationModel] = Field(min_length=12)
    issue_protocols: List[PilotIssueProtocolModel] = Field(min_length=4)
    data_exports: List[PilotDataExportModel] = Field(min_length=4)
    review_cadence: List[str] = Field(min_length=3)
    closeout_checklist: List[str] = Field(min_length=6)
    forbidden_interpretations: List[str] = Field(min_length=3)

    @model_validator(mode="after")
    def operations_are_pilot_ready(self) -> "PilotOperationsModel":
        days = {item.day for item in self.daily_operations}
        required_days = {0, 13}
        required_days.update(range(1, 12))
        missing_days = required_days - days
        if missing_days:
            raise ValueError(f"Pilot operations missing days: {sorted(missing_days)}")

        issue_types = {item.issue_type for item in self.issue_protocols}
        required_issues = {
            "login_access",
            "lesson_submission",
            "high_frustration_signal",
            "data_quality_gap",
        }
        missing_issues = required_issues - issue_types
        if missing_issues:
            raise ValueError(f"Pilot operations missing issue protocols: {sorted(missing_issues)}")

        export_names = {item.artifact_name for item in self.data_exports}
        required_exports = {
            "pre_post_scores",
            "session_attempts",
            "adaptive_recommendations",
            "admin_daily_snapshot",
        }
        missing_exports = required_exports - export_names
        if missing_exports:
            raise ValueError(f"Pilot operations missing exports: {sorted(missing_exports)}")

        forbidden_text = " ".join(self.forbidden_interpretations).lower()
        if "diagnosis" not in forbidden_text or "clinical" not in forbidden_text:
            raise ValueError("Pilot operations must forbid clinical or diagnosis language.")

        return self

    model_config = {"extra": "forbid"}


class PilotAnalysisMetricModel(BaseModel):
    metric_id: str = Field(min_length=3)
    label: str = Field(min_length=5)
    source_artifact: str = Field(min_length=5)
    calculation: str = Field(min_length=20)
    success_direction: str = Field(pattern=r"^(increase|decrease|stable|complete)$")
    required_for_closeout: bool = True

    model_config = {"extra": "forbid"}


class PilotReportSectionModel(BaseModel):
    section_id: str = Field(min_length=3)
    title: str = Field(min_length=5)
    required_evidence: List[str] = Field(min_length=1)
    interpretation_rule: str = Field(min_length=20)

    model_config = {"extra": "forbid"}


class PilotDecisionGateModel(BaseModel):
    gate_id: str = Field(min_length=3)
    title: str = Field(min_length=5)
    condition: str = Field(min_length=20)
    pass_action: str = Field(min_length=10)
    fail_action: str = Field(min_length=10)

    model_config = {"extra": "forbid"}


class PilotAnalysisPlanModel(BaseModel):
    analysis_id: str = Field(pattern=r"^AIM-025$")
    linked_operations_id: str = Field(pattern=r"^AIM-024$")
    title: str = Field(min_length=5)
    status: str = Field(pattern=r"^ready_for_manual_notion_review$")
    metrics: List[PilotAnalysisMetricModel] = Field(min_length=6)
    report_sections: List[PilotReportSectionModel] = Field(min_length=6)
    decision_gates: List[PilotDecisionGateModel] = Field(min_length=4)
    required_artifacts: List[str] = Field(min_length=4)
    safety_notes: List[str] = Field(min_length=3)
    next_phase_options: List[str] = Field(min_length=3)

    @model_validator(mode="after")
    def analysis_scope_is_complete(self) -> "PilotAnalysisPlanModel":
        metric_ids = {metric.metric_id for metric in self.metrics}
        required_metrics = {
            "learning_gain",
            "completion_rate",
            "recommendation_effectiveness",
            "mastery_movement",
            "retention_movement",
            "weakness_reduction",
        }
        missing_metrics = required_metrics - metric_ids
        if missing_metrics:
            raise ValueError(f"Pilot analysis missing metrics: {sorted(missing_metrics)}")

        artifact_names = set(self.required_artifacts)
        required_artifacts = {
            "pre_post_scores",
            "session_attempts",
            "adaptive_recommendations",
            "admin_daily_snapshot",
        }
        missing_artifacts = required_artifacts - artifact_names
        if missing_artifacts:
            raise ValueError(f"Pilot analysis missing artifacts: {sorted(missing_artifacts)}")

        section_ids = {section.section_id for section in self.report_sections}
        required_sections = {
            "cohort_summary",
            "learning_gain",
            "aim_recommendations",
            "safety_review",
            "data_quality",
            "next_phase_decision",
        }
        missing_sections = required_sections - section_ids
        if missing_sections:
            raise ValueError(f"Pilot analysis missing sections: {sorted(missing_sections)}")

        gate_ids = {gate.gate_id for gate in self.decision_gates}
        required_gates = {
            "learning_signal",
            "algorithm_safety",
            "data_completeness",
            "operator_readiness",
        }
        missing_gates = required_gates - gate_ids
        if missing_gates:
            raise ValueError(f"Pilot analysis missing decision gates: {sorted(missing_gates)}")

        joined = " ".join(
            [
                *(metric.calculation for metric in self.metrics),
                *(section.interpretation_rule for section in self.report_sections),
                *self.safety_notes,
            ]
        ).lower()
        forbidden_speed_terms = ("response_time", "avg_response_time", "speed_score")
        if any(term in joined for term in forbidden_speed_terms):
            raise ValueError("Pilot analysis must not use speed fields for mastery.")
        if "diagnosis" not in joined or "clinical" not in joined:
            raise ValueError("Pilot analysis must explicitly forbid clinical diagnosis language.")

        return self

    model_config = {"extra": "forbid"}
