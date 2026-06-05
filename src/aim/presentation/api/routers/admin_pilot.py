"""Admin/debug routes for monitoring the web pilot."""

from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from aim.infrastructure.database.models.content import AuditLogORM
from aim.infrastructure.database.models.outcome_record import OutcomeRecordORM
from aim.infrastructure.database.models.question_attempt import QuestionAttemptORM
from aim.infrastructure.database.models.recommendation import RecommendationLogORM
from aim.infrastructure.database.models.student import StudentORM, StudentSkillStateORM
from aim.presentation.api.auth import SupabaseUser, get_current_supabase_user
from aim.presentation.api.dependencies import get_db

router = APIRouter(prefix="/admin/pilot", tags=["admin-pilot"])


def _iso(value) -> str | None:
    return value.isoformat() if value else None


@router.get(
    "/overview",
    response_model=dict,
    summary="Get pilot monitoring data for the admin/debug dashboard",
)
def get_pilot_overview(
    db: Session = Depends(get_db),
    current_user: SupabaseUser | None = Depends(get_current_supabase_user),
) -> dict:
    students = db.query(StudentORM).order_by(StudentORM.id.asc()).all()
    states = db.query(StudentSkillStateORM).order_by(StudentSkillStateORM.updated_at.desc()).all()
    attempts = (
        db.query(QuestionAttemptORM)
        .order_by(QuestionAttemptORM.created_at.desc(), QuestionAttemptORM.id.desc())
        .limit(250)
        .all()
    )
    recommendations = (
        db.query(RecommendationLogORM)
        .order_by(RecommendationLogORM.created_at.desc(), RecommendationLogORM.id.desc())
        .limit(50)
        .all()
    )
    outcomes = (
        db.query(OutcomeRecordORM)
        .order_by(OutcomeRecordORM.created_at.desc(), OutcomeRecordORM.id.desc())
        .limit(50)
        .all()
    )
    audit_logs = (
        db.query(AuditLogORM)
        .order_by(AuditLogORM.created_at.desc(), AuditLogORM.id.desc())
        .limit(50)
        .all()
    )

    states_by_student: dict[int, list[StudentSkillStateORM]] = defaultdict(list)
    for state in states:
        states_by_student[state.student_id].append(state)

    attempts_by_session: dict[str, list[QuestionAttemptORM]] = defaultdict(list)
    for attempt in attempts:
        attempts_by_session[attempt.session_id].append(attempt)

    session_rows = []
    for session_id, session_attempts in attempts_by_session.items():
        correct = sum(1 for attempt in session_attempts if attempt.is_correct)
        first_attempt = session_attempts[0]
        session_rows.append(
            {
                "session_id": session_id,
                "student_id": first_attempt.student_id,
                "attempt_count": len(session_attempts),
                "accuracy": round(correct / len(session_attempts) * 100, 1),
                "latest_attempt_at": _iso(first_attempt.created_at),
            }
        )

    dashboard_students = []
    for student in students:
        student_states = states_by_student.get(student.id, [])
        latest_state = student_states[0] if student_states else None
        dashboard_students.append(
            {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "auth_user_id": str(student.auth_user_id) if student.auth_user_id else None,
                "skill_count": len(student_states),
                "latest_mastery": latest_state.mastery if latest_state else None,
                "latest_reliability": latest_state.reliability if latest_state else None,
                "latest_skill_id": latest_state.skill_id if latest_state else None,
                "updated_at": _iso(student.updated_at),
            }
        )

    return {
        "current_user_id": current_user.user_id if current_user else None,
        "summary": {
            "students": len(students),
            "sessions": len(session_rows),
            "attempts": len(attempts),
            "recommendations": len(recommendations),
            "outcomes": len(outcomes),
            "audit_events": len(audit_logs),
        },
        "students": dashboard_students,
        "sessions": session_rows[:25],
        "mastery_changes": [
            {
                "student_id": state.student_id,
                "skill_id": state.skill_id,
                "mastery": state.mastery,
                "confidence": state.confidence,
                "reliability": state.reliability,
                "current_difficulty": state.current_difficulty,
                "retention": state.retention,
                "updated_at": _iso(state.updated_at),
            }
            for state in states[:50]
        ],
        "recommendations": [
            {
                "id": recommendation.id,
                "student_id": recommendation.student_id,
                "action_type": recommendation.action_type,
                "skill_id": recommendation.skill_id,
                "difficulty": recommendation.difficulty,
                "reason": recommendation.reason,
                "was_followed": recommendation.was_followed,
                "mastery_before": recommendation.mastery_before,
                "mastery_after": recommendation.mastery_after,
                "created_at": _iso(recommendation.created_at),
            }
            for recommendation in recommendations
        ],
        "outcomes": [
            {
                "id": outcome.id,
                "recommendation_id": outcome.recommendation_id,
                "outcome": outcome.outcome,
                "mastery_delta": round(outcome.mastery_after - outcome.mastery_before, 2),
                "retention_delta": round(outcome.retention_after - outcome.retention_before, 2),
                "weakness_delta": round(outcome.weakness_after - outcome.weakness_before, 2),
                "created_at": _iso(outcome.created_at),
            }
            for outcome in outcomes
        ],
        "events": [
            {
                "id": event.id,
                "student_id": event.actor_student_id,
                "action": event.action,
                "entity_type": event.entity_type,
                "entity_id": event.entity_id,
                "created_at": _iso(event.created_at),
            }
            for event in audit_logs
        ],
    }
