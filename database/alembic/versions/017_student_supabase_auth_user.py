"""Link students to Supabase Auth users.

Revision ID: 017_student_supabase_auth_user
Revises:     016_pilot_content_tables
"""

from alembic import op
import sqlalchemy as sa


revision = "017_student_supabase_auth_user"
down_revision = "016_pilot_content_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS auth_user_id uuid")
        op.execute(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_indexes
                    WHERE schemaname = 'public'
                      AND tablename = 'students'
                      AND indexdef ILIKE '%(auth_user_id)%'
                ) THEN
                    CREATE UNIQUE INDEX ix_students_auth_user_id
                    ON students (auth_user_id);
                END IF;
            END
            $$;
            """
        )
        return

    op.add_column("students", sa.Column("auth_user_id", sa.String(), nullable=True))
    op.create_index("ix_students_auth_user_id", "students", ["auth_user_id"], unique=True)


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.execute("DROP INDEX IF EXISTS ix_students_auth_user_id")
        op.execute("ALTER TABLE students DROP COLUMN IF EXISTS auth_user_id")
        return

    op.drop_index("ix_students_auth_user_id", table_name="students")
    op.drop_column("students", "auth_user_id")
