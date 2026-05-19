"""
TODO 13: Add lesson and assessment history tables.

Revision ID: 013_lesson_course_history
Revises:     012_prompt_adaptation_instructions
"""

from alembic import op
import sqlalchemy as sa


revision = "013_lesson_course_history"
down_revision = "012_prompt_adaptation_instructions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "lesson_attempts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.String(), nullable=False),
        sa.Column("course_id", sa.String(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("ended_at", sa.DateTime(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("early_exit", sa.Boolean(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("frustration_score", sa.Float(), nullable=False),
        sa.Column("recommendation_id", sa.Integer(), nullable=True),
    )
    op.create_index("ix_lesson_attempts_student_id", "lesson_attempts", ["student_id"])
    op.create_index("ix_lesson_attempts_lesson_id", "lesson_attempts", ["lesson_id"])
    op.create_index("ix_lesson_attempts_course_id", "lesson_attempts", ["course_id"])
    op.create_index(
        "ix_lesson_attempts_recommendation_id",
        "lesson_attempts",
        ["recommendation_id"],
    )

    op.create_table(
        "assessment_results",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("assessment_id", sa.String(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("mastery_before", sa.Float(), nullable=False),
        sa.Column("mastery_after", sa.Float(), nullable=False),
        sa.Column("difficulty_level", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_assessment_results_student_id",
        "assessment_results",
        ["student_id"],
    )
    op.create_index(
        "ix_assessment_results_assessment_id",
        "assessment_results",
        ["assessment_id"],
    )
    op.create_index("ix_assessment_results_skill_id", "assessment_results", ["skill_id"])


def downgrade() -> None:
    op.drop_table("assessment_results")
    op.drop_table("lesson_attempts")
