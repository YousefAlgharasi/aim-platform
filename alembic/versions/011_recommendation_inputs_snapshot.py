"""
TODO 10: Add recommendation input snapshots.

Revision ID: 011_recommendation_inputs_snapshot
Revises:     010_retention_schedules
"""

from alembic import op
import sqlalchemy as sa


revision = "011_recommendation_inputs_snapshot"
down_revision = "010_retention_schedules"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "recommendations",
        sa.Column("inputs_snapshot", sa.JSON(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("recommendations", "inputs_snapshot")
