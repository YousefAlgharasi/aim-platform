"""001_student_state

Revision ID: 001
Revises:
Create Date: 2025-05-10
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "students",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_table(
        "student_skill_states",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column(
            "student_id",
            UUID(as_uuid=True),
            sa.ForeignKey("students.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("skill_id", sa.String(100), nullable=False),
        sa.Column("mastery", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("confidence", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("avg_speed", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("retention", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("weakness_score", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("frustration_score", sa.Float, nullable=False, server_default="0.0"),
        sa.Column(
            "learning_style", sa.String(50), nullable=False, server_default="unknown"
        ),
        sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "uq_student_skill",
        "student_skill_states",
        ["student_id", "skill_id"],
    )

    op.create_index(
        "ix_student_skill_states_student_id",
        "student_skill_states",
        ["student_id"],
    )

    op.create_index(
        "ix_student_skill_states_skill_id",
        "student_skill_states",
        ["skill_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_student_skill_states_skill_id", table_name="student_skill_states")
    op.drop_index("ix_student_skill_states_student_id", table_name="student_skill_states")
    op.drop_constraint("uq_student_skill", "student_skill_states", type_="unique")
    op.drop_table("student_skill_states")
    op.drop_table("students")
