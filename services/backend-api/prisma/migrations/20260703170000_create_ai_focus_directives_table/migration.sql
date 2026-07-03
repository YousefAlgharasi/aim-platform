-- P20-003: Persist the AI Teacher's per-student "focus directive"
-- Scope: ai_focus_directives table only. No application code wiring —
-- that is a separate task (P20-013).

CREATE TABLE ai_focus_directives (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID          NOT NULL REFERENCES student_profiles (id) ON DELETE CASCADE,
    skill_id          TEXT          NOT NULL,
    directive_text    TEXT          NOT NULL,
    source            TEXT          NOT NULL
                                    CHECK (source IN ('weakness_record', 'recommendation', 'difficulty_decision')),
    source_id         UUID          NULL,
    generated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    active            BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX ai_focus_directives_student_id_active_idx
    ON ai_focus_directives (student_id, active);

COMMENT ON TABLE ai_focus_directives IS
    'Current AI Teacher focus directive per student — a single engine-maintained sentence(s) telling the AI Teacher what to emphasize/practice, separate from lesson content (lessons.system_prompt). Superseding a directive sets active=false rather than deleting it, for an audit trail.';

COMMENT ON COLUMN ai_focus_directives.skill_id IS
    'AIM-engine skill identifier. Same type/semantics as student_skill_states.skill_id/weakness_records.skill_id (text, not necessarily an FK to skills.id) — confirmed against the live schema before choosing this type.';

COMMENT ON COLUMN ai_focus_directives.directive_text IS
    'The sentence(s) injected into the AI Teacher prompt, e.g. describing a weakness to address.';

COMMENT ON COLUMN ai_focus_directives.source IS
    'Which AIM output triggered this directive.';

COMMENT ON COLUMN ai_focus_directives.source_id IS
    'id of the weakness_records/recommendations/difficulty_decisions row that produced this directive, for auditability. Nullable since the source table is not enforced via FK (varies by source).';

COMMENT ON COLUMN ai_focus_directives.active IS
    'Only one active directive per student should be current. Superseding sets the old row active=false instead of deleting it.';
