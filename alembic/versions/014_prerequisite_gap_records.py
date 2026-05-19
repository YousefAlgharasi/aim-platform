"""
TODO 14: Add prerequisite gap records table.

Revision ID: 014_prerequisite_gap_records
Revises:     013_lesson_course_history
"""

from alembic import op
import sqlalchemy as sa


revision = "014_prerequisite_gap_records"
down_revision = "013_lesson_course_history"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "prerequisite_gap_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("missing_prerequisite_skill_id", sa.String(), nullable=False),
        sa.Column("severity", sa.Float(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
    )
    op.create_index(
        "ix_prerequisite_gap_records_student_id",
        "prerequisite_gap_records",
        ["student_id"],
    )
    op.create_index(
        "ix_prerequisite_gap_records_skill_id",
        "prerequisite_gap_records",
        ["skill_id"],
    )
    op.create_index(
        "ix_prerequisite_gap_records_missing_prerequisite_skill_id",
        "prerequisite_gap_records",
        ["missing_prerequisite_skill_id"],
    )
    op.create_index(
        "ix_prerequisite_gap_records_status",
        "prerequisite_gap_records",
        ["status"],
    )


def downgrade() -> None:
    op.drop_table("prerequisite_gap_records")
