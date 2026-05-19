"""
TODO 9: Create retention schedules table.

Revision ID: 010_retention_schedules
Revises:     009_error_pattern_records
"""

from alembic import op
import sqlalchemy as sa


revision = "010_retention_schedules"
down_revision = "009_error_pattern_records"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "retention_schedules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("due_at", sa.DateTime(), nullable=False),
        sa.Column("retention", sa.Float(), nullable=False),
        sa.Column("retention_lambda", sa.Float(), nullable=False),
        sa.Column("review_priority", sa.Float(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(
        "ix_retention_schedules_student_id",
        "retention_schedules",
        ["student_id"],
    )
    op.create_index(
        "ix_retention_schedules_skill_id",
        "retention_schedules",
        ["skill_id"],
    )
    op.create_index(
        "ix_retention_schedules_due_at",
        "retention_schedules",
        ["due_at"],
    )
    op.create_index(
        "ix_retention_schedules_completed_at",
        "retention_schedules",
        ["completed_at"],
    )


def downgrade() -> None:
    op.drop_table("retention_schedules")
