"""
TODO 11: Create prompt adaptation instructions table.

Revision ID: 012_prompt_adaptation_instructions
Revises:     011_recommendation_inputs_snapshot
"""

from alembic import op
import sqlalchemy as sa


revision = "012_prompt_adaptation_instructions"
down_revision = "011_recommendation_inputs_snapshot"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "prompt_adaptation_instructions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("lesson_id", sa.String(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("tone", sa.String(), nullable=False),
        sa.Column("difficulty", sa.String(), nullable=False),
        sa.Column("teaching_strategy", sa.String(), nullable=False),
        sa.Column("focus_weaknesses", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("avoid_patterns", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("micro_goal", sa.String(), nullable=False),
        sa.Column("instruction_text", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_prompt_adaptation_instructions_student_id",
        "prompt_adaptation_instructions",
        ["student_id"],
    )
    op.create_index(
        "ix_prompt_adaptation_instructions_lesson_id",
        "prompt_adaptation_instructions",
        ["lesson_id"],
    )
    op.create_index(
        "ix_prompt_adaptation_instructions_skill_id",
        "prompt_adaptation_instructions",
        ["skill_id"],
    )


def downgrade() -> None:
    op.drop_table("prompt_adaptation_instructions")
