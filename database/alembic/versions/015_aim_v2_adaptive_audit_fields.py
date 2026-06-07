"""Add AIM V2 adaptive audit fields.

Revision ID: 015_aim_v2_adaptive_audit_fields
Revises:     014_prerequisite_gap_records
"""

from alembic import op
import sqlalchemy as sa


revision = "015_aim_v2_adaptive_audit_fields"
down_revision = "014_prerequisite_gap_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("student_skill_states", sa.Column("hint_usage_rate", sa.Float(), nullable=False, server_default="0"))
    op.add_column("student_skill_states", sa.Column("skip_rate", sa.Float(), nullable=False, server_default="0"))
    op.add_column("student_skill_states", sa.Column("reliability", sa.Float(), nullable=False, server_default="0"))
    op.add_column("student_skill_states", sa.Column("learning_response_pattern", sa.String(), nullable=True))

    op.add_column("skill_mastery_history", sa.Column("previous_mastery", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("mastery_raw", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("mastery_adjusted", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("final_mastery", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("reliability", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("evidence_quality_score", sa.Float(), nullable=False, server_default="0"))
    op.add_column("skill_mastery_history", sa.Column("penalties_json", sa.JSON(), nullable=False, server_default="{}"))

    op.add_column("recommendations", sa.Column("evidence", sa.JSON(), nullable=False, server_default="{}"))
    op.add_column("recommendations", sa.Column("confidence", sa.String(), nullable=False, server_default="medium"))
    op.add_column("recommendations", sa.Column("decision_priority", sa.String(), nullable=False, server_default="continue_current_skill"))
    op.add_column("recommendations", sa.Column("fairness_risk_level", sa.String(), nullable=False, server_default="low"))

    op.add_column("weakness_records", sa.Column("hint_usage_rate", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("retry_rate", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("skip_rate", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("hesitation_index", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("retention_drop", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("prerequisite_gap_score", sa.Float(), nullable=False, server_default="0"))
    op.add_column("weakness_records", sa.Column("main_weaknesses", sa.JSON(), nullable=False, server_default="[]"))
    op.add_column("weakness_records", sa.Column("weakness_evidence", sa.JSON(), nullable=False, server_default="{}"))
    op.add_column("weakness_records", sa.Column("severity", sa.String(), nullable=False, server_default="low"))

    op.create_table(
        "question_quality_stats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question_id", sa.String(), nullable=False),
        sa.Column("question_error_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("avg_response_time", sa.Float(), nullable=False, server_default="0"),
        sa.Column("hint_usage_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("skip_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("discrimination_index", sa.Float(), nullable=False, server_default="0"),
        sa.Column("quality_score", sa.Float(), nullable=False, server_default="100"),
        sa.Column("flag_for_review", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_question_quality_stats_question_id", "question_quality_stats", ["question_id"], unique=True)

    op.create_table(
        "fairness_audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("fairness_risk_level", sa.String(), nullable=False),
        sa.Column("fairness_warnings", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("suggested_correction", sa.String(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_fairness_audit_logs_student_id", "fairness_audit_logs", ["student_id"])
    op.create_index("ix_fairness_audit_logs_skill_id", "fairness_audit_logs", ["skill_id"])

    op.create_table(
        "learning_response_patterns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("learning_response_pattern", sa.String(), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_learning_response_patterns_student_id", "learning_response_patterns", ["student_id"])
    op.create_index("ix_learning_response_patterns_skill_id", "learning_response_patterns", ["skill_id"])

    op.create_table(
        "outcome_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("recommendation_id", sa.Integer(), nullable=False),
        sa.Column("mastery_before", sa.Float(), nullable=False),
        sa.Column("mastery_after", sa.Float(), nullable=False),
        sa.Column("retention_before", sa.Float(), nullable=False),
        sa.Column("retention_after", sa.Float(), nullable=False),
        sa.Column("weakness_before", sa.Float(), nullable=False),
        sa.Column("weakness_after", sa.Float(), nullable=False),
        sa.Column("outcome", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_outcome_records_recommendation_id", "outcome_records", ["recommendation_id"])

    op.create_table(
        "explanation_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("decision_type", sa.String(), nullable=False),
        sa.Column("explanation", sa.String(), nullable=False),
        sa.Column("evidence", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_explanation_logs_student_id", "explanation_logs", ["student_id"])
    op.create_index("ix_explanation_logs_skill_id", "explanation_logs", ["skill_id"])


def downgrade() -> None:
    op.drop_table("explanation_logs")
    op.drop_table("outcome_records")
    op.drop_table("learning_response_patterns")
    op.drop_table("fairness_audit_logs")
    op.drop_table("question_quality_stats")
    for column in [
        "severity", "weakness_evidence", "main_weaknesses",
        "prerequisite_gap_score", "retention_drop", "hesitation_index",
        "skip_rate", "retry_rate", "hint_usage_rate",
    ]:
        op.drop_column("weakness_records", column)
    for column in ["fairness_risk_level", "decision_priority", "confidence", "evidence"]:
        op.drop_column("recommendations", column)
    for column in [
        "penalties_json", "evidence_quality_score", "reliability",
        "final_mastery", "mastery_adjusted", "mastery_raw", "previous_mastery",
    ]:
        op.drop_column("skill_mastery_history", column)
    for column in [
        "learning_response_pattern", "reliability", "skip_rate", "hint_usage_rate",
    ]:
        op.drop_column("student_skill_states", column)
