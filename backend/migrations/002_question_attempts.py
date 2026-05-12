"""
T-04 Migration: Create question_attempts table
         +  Add hesitation_index column to student_skill_states

Revision ID: 002_question_attempts
Revises:     001_student_state
"""

from alembic import op
import sqlalchemy as sa

revision = "002_question_attempts"
down_revision = "001_student_state"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. Create question_attempts ──────────────────────────────────────────
    op.create_table(
        "question_attempts",
        sa.Column("id",               sa.Integer(),   primary_key=True),
        sa.Column("student_id",       sa.Integer(),   nullable=False, index=True),
        sa.Column("skill_id",         sa.String(),    nullable=False, index=True),
        sa.Column("question_id",      sa.String(),    nullable=False),
        sa.Column("session_id",       sa.String(),    nullable=False, index=True),

        # Core answer data
        sa.Column("is_correct",       sa.Boolean(),   nullable=False),
        sa.Column("response_time",    sa.Float(),     nullable=False),
        sa.Column("attempts",         sa.Integer(),   nullable=False, server_default="1"),
        sa.Column("difficulty",       sa.Integer(),   nullable=False),

        # Behavioral signals
        sa.Column("hint_used",        sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("skip",             sa.Boolean(),   nullable=False, server_default="false"),
        sa.Column("answer_changed",   sa.Boolean(),   nullable=False, server_default="false"),  # ⭐

        # Context
        sa.Column("time_of_day",      sa.String(),    nullable=False),   # ⭐
        sa.Column("session_position", sa.Integer(),   nullable=False),   # ⭐

        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # ── 2. Add hesitation_index to student_skill_states (T-03 table) ─────────
    # ⭐ New metric from architecture doc — must not be skipped.
    op.add_column(
        "student_skill_states",
        sa.Column("hesitation_index", sa.Float(), nullable=True, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("student_skill_states", "hesitation_index")
    op.drop_table("question_attempts")
