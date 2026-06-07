"""
TODO 5: Create weakness records table.

Revision ID: 008_weakness_records
Revises:     007_skill_mastery_history
"""

from alembic import op
import sqlalchemy as sa


revision = "008_weakness_records"
down_revision = "007_skill_mastery_history"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "weakness_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("weakness_score", sa.Float(), nullable=False),
        sa.Column("error_frequency", sa.Float(), nullable=False),
        sa.Column("difficulty_weight", sa.Float(), nullable=False),
        sa.Column("repeated_mistakes", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_weakness_records_student_id", "weakness_records", ["student_id"])
    op.create_index("ix_weakness_records_skill_id", "weakness_records", ["skill_id"])


def downgrade() -> None:
    op.drop_table("weakness_records")
