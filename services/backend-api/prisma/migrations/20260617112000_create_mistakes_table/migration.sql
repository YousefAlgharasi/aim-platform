-- P5-034: Create Mistakes Migration
-- Branch: phase5/P5-034-mistakes-migration
-- Dependencies:
--   P5-013 (Weakness Record Contract) — weakness detection consumes mistake records
--   P5-033 (answers migration)        — mistakes are derived from incorrect answers
-- Scope: Backend-controlled persistence for incorrect-answer mistake records.
--        One row per distinct (student_id, item_id, skill_id) mistake instance,
--        accumulating evidence across attempts. The AIM Engine reads aggregated
--        mistake context as behavioral input to weakness detection (P5-013) and
--        error-pattern analysis (P5-035). The AIM Engine never writes to this table.
--
-- What a mistake is:
--   A mistake row records that a particular student answered a particular item
--   incorrectly for a skill. It accumulates:
--     - How many times the student got this item/skill wrong (occurrence_count)
--     - Which answer rows captured the incorrect submissions (answer_ids JSONB)
--     - When the mistake was first observed and last updated
--   Mistake rows are created on the first incorrect answer for a
--   (student_id, item_id, skill_id) triple and updated on subsequent incorrect
--   answers. A correct answer after mistakes does NOT delete the row — the
--   AIM Engine decides how to interpret recovery.
--
-- Backend authority rules (enforced at this migration layer):
--   - mistake rows are created/updated only by backend persistence services;
--     clients never write to this table directly.
--   - skill_id is backend-resolved from curriculum skill-mapping data, never
--     accepted verbatim from a client-supplied value.
--   - occurrence_count is backend-counted from answer history, never trusted
--     from a client counter.
--   - answer_ids accumulates the UUIDs of incorrect answer rows (from the
--     answers table, P5-033); it is append-only, never replaced.
--   - is_resolved is set only when the AIM Engine or backend logic determines
--     the skill weakness has been addressed; clients must never set it.
--   - Speed and response-time signals must never feed is_resolved or
--     occurrence_count logic — those belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: mistakes
-- ============================================================

CREATE TABLE mistakes (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity triple: one mistake record per student/item/skill combination.
    -- The UNIQUE constraint below enforces this.
    student_id          UUID            NOT NULL,
    item_id             UUID            NOT NULL,
    skill_id            TEXT            NOT NULL,

    -- Accumulated evidence
    -- occurrence_count: backend-counted number of incorrect submissions for
    -- this (student, item, skill) triple. Starts at 1, incremented on each
    -- subsequent incorrect answer. Never decremented.
    occurrence_count    INTEGER         NOT NULL DEFAULT 1,

    -- answer_ids: JSONB array of UUID strings referencing the answers table
    -- rows that were incorrect. Append-only — never replaced on update.
    answer_ids          JSONB           NOT NULL DEFAULT '[]'::jsonb,

    -- Resolution state. FALSE by default; set TRUE only by backend persistence
    -- logic acting on an AIM Engine weakness-resolved output. Clients must
    -- never set this field.
    is_resolved         BOOLEAN         NOT NULL DEFAULT FALSE,
    resolved_at         TIMESTAMPTZ     NULL,

    -- Timestamps
    first_seen_at       TIMESTAMPTZ     NOT NULL,
    last_seen_at        TIMESTAMPTZ     NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    -- --------------------------------------------------------
    -- Uniqueness: one mistake record per (student, item, skill)
    -- --------------------------------------------------------
    CONSTRAINT mistakes_student_item_skill_unique
        UNIQUE (student_id, item_id, skill_id),

    -- --------------------------------------------------------
    -- Integrity constraints
    -- --------------------------------------------------------

    -- occurrence_count must be at least 1 (row is created on first mistake)
    CONSTRAINT mistakes_occurrence_count_positive_check
        CHECK (occurrence_count >= 1),

    -- answer_ids must be a JSONB array
    CONSTRAINT mistakes_answer_ids_is_array_check
        CHECK (jsonb_typeof(answer_ids) = 'array'),

    -- skill_id must be non-empty
    CONSTRAINT mistakes_skill_id_non_empty_check
        CHECK (LENGTH(TRIM(skill_id)) > 0),

    -- Temporal ordering: first_seen_at <= last_seen_at
    CONSTRAINT mistakes_first_before_last_check
        CHECK (first_seen_at <= last_seen_at),

    -- Resolution consistency: resolved_at must be set iff is_resolved = TRUE
    CONSTRAINT mistakes_resolved_at_consistency_check
        CHECK (
            (is_resolved = TRUE  AND resolved_at IS NOT NULL)
            OR (is_resolved = FALSE AND resolved_at IS NULL)
        ),

    -- resolved_at must be after first_seen_at
    CONSTRAINT mistakes_resolved_after_first_seen_check
        CHECK (resolved_at IS NULL OR resolved_at >= first_seen_at)
);

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON TABLE mistakes IS
    'Backend-owned mistake records: one row per (student, item, skill) incorrect-answer instance. '
    'Accumulates incorrect submission evidence across attempts. Feeds AIM Engine weakness detection '
    '(P5-013) and error-pattern analysis (P5-035). AIM Engine reads this table as behavioral context; '
    'it never writes to it.';

COMMENT ON COLUMN mistakes.id IS
    'Primary key. Backend-issued UUID.';

COMMENT ON COLUMN mistakes.student_id IS
    'Backend-resolved student id from authenticated session context. Never taken from wire payload.';

COMMENT ON COLUMN mistakes.item_id IS
    'Backend-issued identifier of the question or item the student answered incorrectly.';

COMMENT ON COLUMN mistakes.skill_id IS
    'Curriculum skill key resolved by the backend from skill-mapping data for the item. '
    'Never accepted verbatim from a client-supplied value.';

COMMENT ON COLUMN mistakes.occurrence_count IS
    'Backend-counted number of incorrect submissions for this (student, item, skill) triple. '
    'Starts at 1 on row creation and is incremented on each subsequent incorrect answer. '
    'Never decremented, never trusted from a client counter.';

COMMENT ON COLUMN mistakes.answer_ids IS
    'JSONB array of UUID strings referencing the incorrect answers table rows (P5-033) that '
    'contributed to this mistake record. Append-only — never replaced on update. Provides '
    'the AIM Engine with the evidence trail for this mistake instance.';

COMMENT ON COLUMN mistakes.is_resolved IS
    'Set TRUE only by backend persistence logic acting on an AIM Engine weakness-resolved output. '
    'Clients must never set this field directly. FALSE by default.';

COMMENT ON COLUMN mistakes.resolved_at IS
    'ISO-8601 UTC timestamp of when the mistake was marked resolved. '
    'Non-null iff is_resolved = TRUE, enforced by constraint.';

COMMENT ON COLUMN mistakes.first_seen_at IS
    'ISO-8601 UTC timestamp of the first incorrect submission for this triple. '
    'Set on row creation and never updated.';

COMMENT ON COLUMN mistakes.last_seen_at IS
    'ISO-8601 UTC timestamp of the most recent incorrect submission. '
    'Updated on each subsequent incorrect answer for this triple.';

COMMENT ON COLUMN mistakes.created_at IS
    'Backend-set row creation timestamp. Never updated after insert.';

COMMENT ON COLUMN mistakes.updated_at IS
    'Backend-set on every update (occurrence_count increment, resolution). '
    'Used by the AIM Engine state assembly service to page through recent changes.';

-- ============================================================
-- Indexes
-- ============================================================

-- Primary lookup: all mistakes for a given student (per-student weakness input
-- to the AIM Engine state assembly, Stage 2 of the backend pipeline map).
CREATE INDEX mistakes_student_id_idx
    ON mistakes (student_id);

-- Per-student, per-skill mistakes (feeds weakness detection which groups by
-- student + skill to surface skill-level struggle patterns).
CREATE INDEX mistakes_student_id_skill_id_idx
    ON mistakes (student_id, skill_id);

-- Unresolved mistakes per student (the primary AIM Engine input: only open
-- mistakes are relevant to current weakness state).
CREATE INDEX mistakes_student_id_unresolved_idx
    ON mistakes (student_id)
    WHERE is_resolved = FALSE;

-- Per-item mistakes across all students (feeds error-pattern analysis P5-035
-- which identifies common incorrect-answer patterns per item).
CREATE INDEX mistakes_item_id_idx
    ON mistakes (item_id);

-- Recency ordering: most-recently-seen mistakes for a student (used by
-- state assembly to prioritize recent struggle signals over old ones).
CREATE INDEX mistakes_student_id_last_seen_at_idx
    ON mistakes (student_id, last_seen_at DESC);
