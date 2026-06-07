"""
TODO 4: Create skill mastery history table.

Revision ID: 007_skill_mastery_history
Revises:     006_student_skill_state_adaptive_fields
"""

from alembic import op
import sqlalchemy as sa


revision = "007_skill_mastery_history"
down_revision = "006_student_skill_state_adaptive_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "skill_mastery_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("mastery", sa.Float(), nullable=False),
        sa.Column("accuracy", sa.Float(), nullable=False),
        sa.Column("speed_score", sa.Float(), nullable=False),
        sa.Column("consistency", sa.Float(), nullable=False),
        sa.Column("retention", sa.Float(), nullable=False),
        sa.Column("difficulty_performance", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_skill_mastery_history_student_id", "skill_mastery_history", ["student_id"])
    op.create_index("ix_skill_mastery_history_skill_id", "skill_mastery_history", ["skill_id"])


def downgrade() -> None:
    op.drop_table("skill_mastery_history")
