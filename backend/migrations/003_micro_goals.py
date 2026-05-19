"""
T-06 Migration: Create micro_goals table

Revision ID: 003_micro_goals
Revises:     002_question_attempts
"""

from alembic import op
import sqlalchemy as sa

revision = "003_micro_goals"
down_revision = "002_question_attempts"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "micro_goals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=True),
        sa.Column("goal_type", sa.String(), nullable=False),
        sa.Column("text", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_micro_goals_student_id", "micro_goals", ["student_id"])
    op.create_index("ix_micro_goals_skill_id", "micro_goals", ["skill_id"])
    op.create_index("ix_micro_goals_goal_type", "micro_goals", ["goal_type"])


def downgrade() -> None:
    op.drop_table("micro_goals")
