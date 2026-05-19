"""
T-10 Migration: Create recommendations table

Revision ID: 005_recommendations
Revises:     004_retention_system
"""

from alembic import op
import sqlalchemy as sa

revision = "005_recommendations"
down_revision = "004_retention_system"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("action_type", sa.String(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=True),
        sa.Column("difficulty", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(), nullable=False),
        sa.Column("was_followed", sa.Boolean(), nullable=True),
        sa.Column("mastery_before", sa.Float(), nullable=True),
        sa.Column("mastery_after", sa.Float(), nullable=True),
        sa.Column("mastery_improved_after", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_recommendations_student_id", "recommendations", ["student_id"])
    op.create_index("ix_recommendations_action_type", "recommendations", ["action_type"])
    op.create_index("ix_recommendations_skill_id", "recommendations", ["skill_id"])


def downgrade() -> None:
    op.drop_table("recommendations")
