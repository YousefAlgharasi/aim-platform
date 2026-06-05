"""Add pilot content and audit tables.

Revision ID: 016_pilot_content_tables
Revises:     015_aim_v2_adaptive_audit_fields
"""

from alembic import op
import sqlalchemy as sa


revision = "016_pilot_content_tables"
down_revision = "015_aim_v2_adaptive_audit_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        _upgrade_postgresql()
        return

    op.create_table(
        "courses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("course_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("level", sa.String(), nullable=False, server_default="A1"),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("course_id", name="uq_courses_course_id"),
    )
    op.create_index("ix_courses_id", "courses", ["id"])
    op.create_index("ix_courses_level", "courses", ["level"])

    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lesson_id", sa.String(), nullable=False),
        sa.Column("course_id", sa.String(), nullable=False),
        sa.Column("chapter_id", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("lesson_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("level", sa.String(), nullable=False, server_default="A1"),
        sa.Column("skill_focus", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("main_skill_id", sa.String(), nullable=True),
        sa.Column("prerequisites", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("estimated_minutes", sa.Integer(), nullable=False, server_default="15"),
        sa.Column("difficulty", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("content", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("lesson_id", name="uq_lessons_lesson_id"),
    )
    op.create_index("ix_lessons_id", "lessons", ["id"])
    op.create_index("ix_lessons_course_id", "lessons", ["course_id"])
    op.create_index("ix_lessons_chapter_id", "lessons", ["chapter_id"])
    op.create_index("ix_lessons_level", "lessons", ["level"])
    op.create_index("ix_lessons_main_skill_id", "lessons", ["main_skill_id"])
    op.create_index("ix_lessons_difficulty", "lessons", ["difficulty"])

    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question_id", sa.String(), nullable=False),
        sa.Column("lesson_id", sa.String(), nullable=True),
        sa.Column("skill_id", sa.String(), nullable=False),
        sa.Column("question_type", sa.String(), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("correct_answer", sa.Text(), nullable=True),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("points", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("concept", sa.String(), nullable=False, server_default=""),
        sa.Column("choices", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("prerequisites", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("common_error_tags", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("question_id", name="uq_questions_question_id"),
    )
    op.create_index("ix_questions_id", "questions", ["id"])
    op.create_index("ix_questions_lesson_id", "questions", ["lesson_id"])
    op.create_index("ix_questions_skill_id", "questions", ["skill_id"])
    op.create_index("ix_questions_question_type", "questions", ["question_type"])
    op.create_index("ix_questions_difficulty", "questions", ["difficulty"])
    op.create_index("ix_questions_concept", "questions", ["concept"])

    op.create_table(
        "question_choices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question_id", sa.String(), nullable=False),
        sa.Column("choice_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("choice_text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_question_choices_id", "question_choices", ["id"])
    op.create_index("ix_question_choices_question_id", "question_choices", ["question_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("actor_student_id", sa.Integer(), nullable=True),
        sa.Column("action", sa.String(), nullable=False),
        sa.Column("entity_type", sa.String(), nullable=False),
        sa.Column("entity_id", sa.String(), nullable=True),
        sa.Column("before_state", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("after_state", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_id", "audit_logs", ["id"])
    op.create_index("ix_audit_logs_actor_student_id", "audit_logs", ["actor_student_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_entity_type", "audit_logs", ["entity_type"])
    op.create_index("ix_audit_logs_entity_id", "audit_logs", ["entity_id"])


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        for table in ("audit_logs", "question_choices", "questions", "lessons", "courses"):
            op.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
        return

    op.drop_table("audit_logs")
    op.drop_table("question_choices")
    op.drop_table("questions")
    op.drop_table("lessons")
    op.drop_table("courses")


def _upgrade_postgresql() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS courses (
            id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            course_id text NOT NULL UNIQUE,
            title text NOT NULL,
            description text,
            level text NOT NULL DEFAULT 'A1',
            language text NOT NULL DEFAULT 'en',
            is_active boolean NOT NULL DEFAULT true,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS lessons (
            id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            lesson_id text NOT NULL UNIQUE,
            course_id text NOT NULL,
            chapter_id text,
            title text NOT NULL,
            lesson_order integer NOT NULL DEFAULT 0,
            level text NOT NULL DEFAULT 'A1',
            skill_focus jsonb NOT NULL DEFAULT '[]'::jsonb,
            main_skill_id text,
            prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
            estimated_minutes integer NOT NULL DEFAULT 15,
            difficulty integer NOT NULL DEFAULT 1,
            content jsonb NOT NULL DEFAULT '{}'::jsonb,
            is_active boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS questions (
            id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            question_id text NOT NULL UNIQUE,
            lesson_id text,
            skill_id text NOT NULL,
            question_type text NOT NULL,
            prompt text NOT NULL,
            correct_answer text,
            explanation text,
            difficulty integer NOT NULL DEFAULT 1,
            points double precision NOT NULL DEFAULT 1.0,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            concept text NOT NULL DEFAULT '',
            choices jsonb NOT NULL DEFAULT '[]'::jsonb,
            prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
            common_error_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
            is_active boolean NOT NULL DEFAULT true,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS question_choices (
            id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            question_id text NOT NULL,
            choice_order integer NOT NULL DEFAULT 0,
            choice_text text NOT NULL,
            is_correct boolean NOT NULL DEFAULT false,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_logs (
            id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            actor_student_id integer,
            action text NOT NULL,
            entity_type text NOT NULL,
            entity_id text,
            before_state jsonb NOT NULL DEFAULT '{}'::jsonb,
            after_state jsonb NOT NULL DEFAULT '{}'::jsonb,
            metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
            created_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )

    for statement in (
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS concept text NOT NULL DEFAULT ''",
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS choices jsonb NOT NULL DEFAULT '[]'::jsonb",
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb",
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS common_error_tags jsonb NOT NULL DEFAULT '[]'::jsonb",
    ):
        op.execute(statement)

    for table in ("courses", "lessons", "questions", "question_choices", "audit_logs"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")

    for statement in (
        "CREATE INDEX IF NOT EXISTS ix_courses_id ON courses (id)",
        "CREATE INDEX IF NOT EXISTS ix_courses_level ON courses (level)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_id ON lessons (id)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_course_id ON lessons (course_id)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_chapter_id ON lessons (chapter_id)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_level ON lessons (level)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_main_skill_id ON lessons (main_skill_id)",
        "CREATE INDEX IF NOT EXISTS ix_lessons_difficulty ON lessons (difficulty)",
        "CREATE INDEX IF NOT EXISTS ix_questions_id ON questions (id)",
        "CREATE INDEX IF NOT EXISTS ix_questions_lesson_id ON questions (lesson_id)",
        "CREATE INDEX IF NOT EXISTS ix_questions_skill_id ON questions (skill_id)",
        "CREATE INDEX IF NOT EXISTS ix_questions_question_type ON questions (question_type)",
        "CREATE INDEX IF NOT EXISTS ix_questions_difficulty ON questions (difficulty)",
        "CREATE INDEX IF NOT EXISTS ix_questions_concept ON questions (concept)",
        "CREATE INDEX IF NOT EXISTS ix_question_choices_id ON question_choices (id)",
        "CREATE INDEX IF NOT EXISTS ix_question_choices_question_id ON question_choices (question_id)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_id ON audit_logs (id)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_actor_student_id ON audit_logs (actor_student_id)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs (action)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_type ON audit_logs (entity_type)",
        "CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_id ON audit_logs (entity_id)",
    ):
        op.execute(statement)
