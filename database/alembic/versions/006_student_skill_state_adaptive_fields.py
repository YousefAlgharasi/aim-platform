"""
TODO 3: Add adaptive student skill state fields.

Revision ID: 006_student_skill_state_adaptive_fields
Revises:     005_recommendations
"""

from alembic import op
import sqlalchemy as sa


revision = "006_student_skill_state_adaptive_fields"
down_revision = "005_recommendations"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "student_skill_states",
        sa.Column("current_difficulty", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "student_skill_states",
        sa.Column("consistency", sa.Float(), nullable=False, server_default="100"),
    )
    op.add_column(
        "student_skill_states",
        sa.Column("retry_rate", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "student_skill_states",
        sa.Column("context_memory", sa.JSON(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("student_skill_states", "context_memory")
    op.drop_column("student_skill_states", "retry_rate")
    op.drop_column("student_skill_states", "consistency")
    op.drop_column("student_skill_states", "current_difficulty")
