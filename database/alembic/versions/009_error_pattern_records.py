"""
TODO 6: Create error pattern records table.

Revision ID: 009_error_pattern_records
Revises:     008_weakness_records
"""

from alembic import op
import sqlalchemy as sa


revision = "009_error_pattern_records"
down_revision = "008_weakness_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "error_pattern_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("pattern_type", sa.String(), nullable=False),
        sa.Column("evidence_json", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("treatment_recommendation", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_error_pattern_records_student_id",
        "error_pattern_records",
        ["student_id"],
    )
    op.create_index(
        "ix_error_pattern_records_skill_id",
        "error_pattern_records",
        ["skill_id"],
    )
    op.create_index(
        "ix_error_pattern_records_pattern_type",
        "error_pattern_records",
        ["pattern_type"],
    )


def downgrade() -> None:
    op.drop_table("error_pattern_records")
