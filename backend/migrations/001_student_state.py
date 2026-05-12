"""
T-03 Migration: Create students and student_skill_states tables

Revision ID: 001_student_state
Revises:     None (first migration)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision      = "001_student_state"
down_revision = None
branch_labels = None
depends_on    = None


def upgrade() -> None:
    # ── 1. students ──────────────────────────────────────────────────────────
    op.create_table(
        "students",
        sa.Column("id",         sa.Integer(), primary_key=True),
        sa.Column("name",       sa.String(),  nullable=False),
        sa.Column("email",      sa.String(),  nullable=False, unique=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_students_email", "students", ["email"], unique=True)

    # ── 2. student_skill_states ───────────────────────────────────────────────
    op.create_table(
        "student_skill_states",
        sa.Column("id",         sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("skill_id",   sa.String(),  nullable=False),

        # Core metrics
        sa.Column("mastery",    sa.Float(), nullable=False, server_default="0"),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0"),
        sa.Column("attempts",   sa.Integer(), nullable=False, server_default="0"),
        sa.Column("avg_speed",  sa.Float(), nullable=False, server_default="0"),
        sa.Column("retention",  sa.Float(), nullable=False, server_default="100"),

        # Weakness & frustration
        sa.Column("weakness_score",    sa.Float(), nullable=False, server_default="0"),
        sa.Column("frustration_score", sa.Float(), nullable=False, server_default="0"),  # ⭐

        # Learning style & session history
        sa.Column("learning_style",      sa.String(), nullable=True),                    # ⭐
        sa.Column("session_performance", sa.JSON(),   nullable=False, server_default="[]"),  # ⭐

        # Timestamps
        sa.Column("last_reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_student_skill_states_student_id", "student_skill_states", ["student_id"])
    op.create_index("ix_student_skill_states_skill_id",   "student_skill_states", ["skill_id"])

    # Enforce uniqueness: one row per (student, skill)
    op.create_unique_constraint(
        "uq_student_skill",
        "student_skill_states",
        ["student_id", "skill_id"],
    )


def downgrade() -> None:
    op.drop_table("student_skill_states")
    op.drop_table("students")
