"""
T-08 Migration: Add personalized retention fields

Revision ID: 004_retention_system
Revises:     003_micro_goals
"""

from alembic import op
import sqlalchemy as sa

revision = "004_retention_system"
down_revision = "003_micro_goals"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "student_skill_states",
        sa.Column("retention_lambda", sa.Float(), nullable=False, server_default="0.15"),
    )
    op.add_column(
        "student_skill_states",
        sa.Column("review_due", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.add_column(
        "student_skill_states",
        sa.Column("retention_history", sa.JSON(), nullable=False, server_default="[]"),
    )


def downgrade() -> None:
    op.drop_column("student_skill_states", "retention_history")
    op.drop_column("student_skill_states", "review_due")
    op.drop_column("student_skill_states", "retention_lambda")
