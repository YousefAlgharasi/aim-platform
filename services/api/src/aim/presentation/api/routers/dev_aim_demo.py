"""Development-only AIM visual demo endpoint backed by the real AIM pipeline."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from aim.application.errors import ApplicationError
from aim.application.demo.aim_demo_scenarios import (
    SCENARIOS,
    DemoScenario,
)
from aim.application.use_cases.sessions import SessionUseCases
from aim.domain.services.performance_analyzer import AttemptRecord
from aim.infrastructure.database.base import Base
import aim.infrastructure.database.models  # noqa: F401
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.infrastructure.database.unit_of_work import SqlAlchemyUnitOfWork


router = APIRouter(prefix="/dev/aim", tags=["development"])

ScenarioName = Literal[
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
]


class AimDemoSessionRequest(BaseModel):
    scenario: ScenarioName


@router.post(
    "/demo-session",
    summary="Development-only AIM demo session",
    description=(
        "Development/demo-only endpoint for the frontend AIM visual dashboard. "
        "It creates isolated scenario input data, executes the real AIM adaptive "
        "session pipeline, and maps the real result into the visual dashboard "
        "shape. It is not intended for production student sessions."
    ),
)
def run_demo_session(
    body: AimDemoSessionRequest,
) -> dict[str, Any]:
    """Execute the real AIM pipeline for deterministic demo input data."""
    scenario = SCENARIOS.get(body.scenario)
    if scenario is None:
        raise HTTPException(status_code=400, detail="Unknown AIM demo scenario.")

    session_id = f"dev-aim-{scenario.key}-{uuid4().hex[:10]}"
    db = _create_isolated_demo_session()
    try:
        student = _create_demo_student(db, scenario)
        student_id = student.id
        inputs = _build_attempt_records(
            scenario=scenario,
            student_id=student_id,
            session_id=session_id,
        )
        pipeline_result = SessionUseCases(SqlAlchemyUnitOfWork(db)).record_attempts(
            session_id,
            inputs,
        )
    except ApplicationError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive dev endpoint guard
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"AIM demo pipeline failed: {exc}",
        ) from exc
    finally:
        db.close()

    return _map_pipeline_result(
        scenario=scenario,
        student_id=student_id,
        session_id=session_id,
        attempts=inputs,
        pipeline_result=pipeline_result,
    )


def _create_isolated_demo_session() -> Session:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    demo_session_factory = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )
    return demo_session_factory()


def _create_demo_student(db: Session, scenario: DemoScenario) -> StudentORM:
    suffix = uuid4().hex[:12]
    student = StudentORM(
        name=scenario.student_name,
        email=f"dev-aim-{scenario.key}-{suffix}@example.test",
    )
    db.add(student)
    db.flush()
    db.refresh(student)

    db.add(
        StudentSkillStateORM(
            student_id=student.id,
            skill_id=scenario.skill_id,
            mastery=scenario.previous_mastery,
            confidence=scenario.previous_confidence,
            attempts=0,
            avg_speed=scenario.previous_avg_speed,
            retry_rate=0.0,
            hesitation_index=0.0,
            consistency=100.0,
            current_difficulty=scenario.previous_difficulty,
            retention=scenario.previous_retention,
            retention_lambda=0.15,
            review_due=scenario.previous_retention < 70.0,
            weakness_score=0.0,
            frustration_score=0.0,
            last_reviewed_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
    )
    for state in scenario.related_skill_states:
        db.add(
            StudentSkillStateORM(
                student_id=student.id,
                skill_id=state.skill_id,
                mastery=state.mastery,
                confidence=state.confidence,
                attempts=0,
                avg_speed=state.avg_speed,
                retry_rate=0.0,
                hesitation_index=0.0,
                consistency=state.consistency,
                current_difficulty=state.current_difficulty,
                retention=state.retention,
                retention_lambda=0.15,
                review_due=state.retention < 70.0,
                weakness_score=0.0,
                frustration_score=0.0,
                last_reviewed_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )
        )
    db.flush()
    return student


def _build_attempt_records(
    *,
    scenario: DemoScenario,
    student_id: int,
    session_id: str,
) -> list[AttemptRecord]:
    return [
        AttemptRecord(
            student_id=student_id,
            skill_id=scenario.skill_id,
            question_id=attempt.question_id,
            session_id=session_id,
            is_correct=attempt.is_correct,
            response_time=attempt.response_time,
            attempts=attempt.attempts,
            difficulty=attempt.difficulty,
            hint_used=attempt.hint_used,
            skip=attempt.skip,
            answer_changed=attempt.answer_changed,
            time_of_day=attempt.time_of_day,
            session_position=index,
        )
        for index, attempt in enumerate(scenario.attempts, start=1)
    ]


def _map_pipeline_result(
    *,
    scenario: DemoScenario,
    student_id: int,
    session_id: str,
    attempts: list[AttemptRecord],
    pipeline_result: dict[str, Any],
) -> dict[str, Any]:
    metrics = pipeline_result["performance_metrics"]
    mastery = pipeline_result["mastery_result"]
    weakness = pipeline_result["weakness_result"]
    error_pattern = pipeline_result["error_pattern"]
    retention = pipeline_result["retention_result"]
    difficulty = pipeline_result["difficulty_decision"]
    recommendation = pipeline_result["recommendation"]
    prompt = pipeline_result["prompt_adaptation_instruction"]
    updated_state = pipeline_result.get("updated_skill_state") or {}

    mastery_after = _round(mastery["mastery"])
    difficulty_after = difficulty["target_difficulty"]
    weakness_label = (
        scenario.skill_label
        if float(weakness["weakness_score"]) > 0.0
        else "None"
    )
    recommendation_action = _display_action(recommendation["action_type"])
    prompt_text = prompt["instruction_text"]

    return {
        "data_source": "real_aim_pipeline",
        "session_id": session_id,
        "student_profile": {
            "student_id": student_id,
            "student_name": scenario.student_name,
            "course": scenario.course,
            "level": scenario.level,
            "lesson": scenario.lesson,
            "target_skill": scenario.skill_label,
            "skill_id": scenario.skill_id,
            "previous_mastery": scenario.previous_mastery,
            "previous_difficulty": scenario.previous_difficulty,
            "previous_retention": scenario.previous_retention,
            "previous_weakness": scenario.previous_weakness,
        },
        "submitted_attempts": [
            {
                "question_id": attempt.question_id,
                "skill": scenario.skill_label,
                "skill_id": attempt.skill_id,
                "is_correct": attempt.is_correct,
                "response_time": attempt.response_time,
                "attempts": attempt.attempts,
                "difficulty": attempt.difficulty,
                "hint_used": attempt.hint_used,
                "skipped": attempt.skip,
                "answer_changed": attempt.answer_changed,
            }
            for attempt in attempts
        ],
        "performance_metrics": {
            "accuracy": metrics["accuracy"],
            "average_response_time": metrics["avg_speed"],
            "retry_rate": metrics["retry_rate"],
            "hesitation_index": metrics["hesitation_index"],
            "consistency": mastery["consistency"],
            "difficulty_performance": mastery["difficulty_performance"],
        },
        "mastery_update": {
            "mastery_before": scenario.previous_mastery,
            "mastery_after": mastery_after,
            "formula_inputs": _formula_inputs(mastery),
            "accuracy_contribution": _weighted(mastery["accuracy"], 0.40),
            "consistency_contribution": _weighted(mastery["consistency"], 0.20),
            "retention_contribution": _weighted(mastery["retention"], 0.15),
            "difficulty_performance_contribution": _weighted(
                mastery["difficulty_performance"],
                0.20,
            ),
            "evidence_quality_contribution": _weighted(
                mastery["evidence_quality_score"],
                0.05,
            ),
            "reliability": mastery["reliability"],
            "attempt_count": mastery["attempt_count"],
        },
        "weakness_detection": {
            "detected_weak_skill": weakness_label,
            "weakness_score": weakness["weakness_score"],
            "error_frequency": weakness["error_frequency"],
            "repeated_mistake_count": weakness["repeated_mistakes"],
            "explanation": _weakness_explanation(scenario, weakness),
        },
        "error_pattern": {
            "pattern_type": error_pattern["pattern_type"],
            "evidence": _evidence_text(error_pattern["evidence"]),
            "evidence_json": error_pattern["evidence"],
            "treatment_recommendation": error_pattern["treatment_recommendation"],
        },
        "emotional_state": {
            "frustration_score": pipeline_result["frustration_score"],
            "emotional_label": _emotional_label(pipeline_result["frustration_score"]),
            "reason": _frustration_reason(pipeline_result["frustration_score"], attempts),
            "suggested_tone": prompt["tone"],
        },
        "difficulty_adaptation": {
            "difficulty_before": difficulty["current_difficulty"],
            "difficulty_score": difficulty["score"],
            "decision": difficulty["action"].lower(),
            "difficulty_after": difficulty_after,
            "explanation": _difficulty_explanation(difficulty),
        },
        "recommendation": {
            "action": recommendation_action,
            "reason": recommendation["reason"],
            "priority": _priority(
                pipeline_result["frustration_score"],
                weakness["weakness_score"],
                recommendation["action_type"],
            ),
            "next_skill_or_lesson_suggestion": _next_suggestion(
                recommendation,
                scenario,
            ),
            "raw_action_type": recommendation["action_type"],
            "inputs_snapshot": recommendation["inputs_snapshot"],
        },
        "prompt_adaptation_instruction": {
            **prompt,
            "instruction_text": prompt_text,
        },
        "before_after": {
            "before": {
                "mastery": scenario.previous_mastery,
                "difficulty": scenario.previous_difficulty,
                "retention": scenario.previous_retention,
                "weakness": scenario.previous_weakness,
            },
            "after": {
                "mastery": mastery_after,
                "difficulty": difficulty_after,
                "retention": retention["retention"],
                "weakness": weakness_label,
                "recommendation": recommendation_action,
                "next_prompt_instruction": prompt_text,
            },
        },
        "real_pipeline_output": {
            "updated_skill_state": updated_state,
            "retention_result": retention,
            "adaptive_result_keys": sorted(pipeline_result.keys()),
        },
    }


def _formula_inputs(mastery: dict[str, Any]) -> str:
    return (
        f"Accuracy {mastery['accuracy']} x 0.40 + "
        f"Consistency {mastery['consistency']} x 0.20 + "
        f"Retention {mastery['retention']} x 0.15 + "
        f"Difficulty {mastery['difficulty_performance']} x 0.20 + "
        f"Evidence {mastery['evidence_quality_score']} x 0.05"
    )


def _weighted(value: float, weight: float) -> float:
    return _round(float(value) * weight)


def _round(value: float) -> float:
    return round(float(value), 2)


def _display_action(action_type: str) -> str:
    names = {
        "EASY_WIN": "Easy Win + Encourage",
        "RETEACH_CONCEPT": "Reteach Concept",
        "TIMED_PRACTICE": "Timed Practice",
        "CONFIDENCE_BUILDER": "Confidence Builder",
        "FILL_PREREQUISITE_GAP": "Fill Gaps First",
        "CONTINUE_CURRENT_SKILL": "Continue",
        "WARM_UP": "Needs Warmup",
    }
    return names.get(action_type, action_type.replace("_", " ").title())


def _weakness_explanation(scenario: DemoScenario, weakness: dict[str, Any]) -> str:
    repeated = int(weakness["repeated_mistakes"])
    if repeated == 0:
        return "The real weakness detector found no repeated wrong answers for this skill."
    return (
        f"The real weakness detector found {repeated} repeated mistake(s) "
        f"for {scenario.skill_label}, with error frequency "
        f"{weakness['error_frequency']}."
    )


def _evidence_text(evidence: dict[str, Any]) -> str:
    if not evidence:
        return "No evidence details were returned."
    return ", ".join(f"{key}: {value}" for key, value in evidence.items())


def _emotional_label(frustration_score: float) -> str:
    score = float(frustration_score)
    if score > 70.0:
        return "highly frustrated"
    if score >= 50.0:
        return "frustrated"
    if score > 0.0:
        return "uncertain"
    return "calm"


def _frustration_reason(
    frustration_score: float,
    attempts: list[AttemptRecord],
) -> str:
    wrong = sum(1 for attempt in attempts if not attempt.is_correct and not attempt.skip)
    skipped = sum(1 for attempt in attempts if attempt.skip)
    slow = sum(1 for attempt in attempts if attempt.response_time >= 18.0)
    return (
        f"The real emotional detector produced a frustration score of "
        f"{frustration_score}. Session evidence: {wrong} wrong answer(s), "
        f"{slow} slow response(s), and {skipped} skipped question(s)."
    )


def _difficulty_explanation(difficulty: dict[str, Any]) -> str:
    action = difficulty["action"].lower()
    if action == "increase":
        return "The real difficulty adapter raised the level from the computed difficulty score."
    if action == "decrease":
        return "The real difficulty adapter reduced the level from the computed difficulty score."
    return "The real difficulty adapter kept the level stable from the computed difficulty score."


def _priority(
    frustration_score: float,
    weakness_score: float,
    action_type: str,
) -> str:
    if float(frustration_score) > 70.0 or action_type == "EASY_WIN":
        return "Critical"
    if float(weakness_score) >= 50.0 or action_type in {
        "RETEACH_CONCEPT",
        "TIMED_PRACTICE",
        "REVIEW",
    }:
        return "High"
    return "Medium"


def _next_suggestion(
    recommendation: dict[str, Any],
    scenario: DemoScenario,
) -> str:
    skill_id = recommendation.get("skill_id") or scenario.skill_id
    difficulty = recommendation.get("difficulty")
    return f"{skill_id} at difficulty {difficulty}"
