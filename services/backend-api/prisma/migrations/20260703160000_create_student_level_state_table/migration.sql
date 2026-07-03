-- P20-002: Persist the student's computed proficiency level and unlock ceiling
-- Scope: student_level_state table only. No population/read wiring — that is
-- P20-006 (populate from AIM engine) and P20-010 (gating read path).

CREATE TABLE student_level_state (
    id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id               UUID          NOT NULL REFERENCES student_profiles (id) ON DELETE CASCADE,
    track_slug               TEXT          NOT NULL DEFAULT 'english',
    current_cefr_rank        SMALLINT      NOT NULL,
    max_unlocked_cefr_rank   SMALLINT      NOT NULL,
    source                   TEXT          NOT NULL
                                          CHECK (source IN ('placement', 'aim_engine')),
    last_computed_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT student_level_state_student_track_key UNIQUE (student_id, track_slug)
);

CREATE INDEX student_level_state_student_id_idx
    ON student_level_state (student_id);

CREATE OR REPLACE FUNCTION set_student_level_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER student_level_state_set_updated_at
BEFORE UPDATE ON student_level_state
FOR EACH ROW
EXECUTE FUNCTION set_student_level_state_updated_at();

COMMENT ON TABLE student_level_state IS
    'Current, engine-maintained proficiency level per student per track. One row per (student_id, track_slug), upserted in place. Not a history/audit log — see aim_context_snapshots-style tables for that.';

COMMENT ON COLUMN student_level_state.track_slug IS
    'Subject/track this state belongs to. Only ''english'' exists today — read this column, do not hardcode it.';

COMMENT ON COLUMN student_level_state.current_cefr_rank IS
    'Engine''s current best estimate of the student''s level, as a rank matching courses.cefr_rank (1 = A1, 2 = A2, ...).';

COMMENT ON COLUMN student_level_state.max_unlocked_cefr_rank IS
    'The actual gating ceiling. Usually equal to current_cefr_rank, but only advances once a course is completed, not merely recommended (see P20-011).';

COMMENT ON COLUMN student_level_state.source IS
    'Which computation produced this row: ''placement'' (initial placement test) or ''aim_engine'' (later recompute).';
