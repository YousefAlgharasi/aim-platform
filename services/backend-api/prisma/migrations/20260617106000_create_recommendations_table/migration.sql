-- P5-038: Create AIM Recommendations Migration
-- Branch: phase5/P5-038-aim-recommendations-migration
-- Dependency: P5-015 (AIM Recommendation Contract)
-- Scope: Backend-controlled persistence for AIM Engine recommendation outputs.
--
-- Backend authority rules (enforced at this migration layer):
--   - kind, target_skill_id, target_lesson_id, rank, reason, based_on_weakness_id,
--     generated_at, and expires_at are exclusively AIM Engine outputs.
--   - status is the one backend-managed lifecycle field on this table, never
--     accepted from the AIM Engine wire output.
--   - student_id is backend-resolved from session context; clients must never
--     submit it directly to a write path against this table.
--   - Recommendations are replaced as a full set per response, not merged
--     item-by-item: each new response marks prior active rows superseded and
--     inserts a fresh ranked set. Rank is only meaningful within one set.
--   - target_lesson_id references an existing, published lesson; FK uses
--     ON DELETE SET NULL so a later lesson removal does not destroy history.
--   - based_on_weakness_id intentionally has no FK to weakness_records: the
--     reference is validated by the backend persistence service at write
--     time per P5-015, consistent with the established convention of not
--     hard-coupling AIM-output tables to each other at the schema level.
--   - Speed and response time must never feed rank or reason — those signals
--     belong to behavioral context only.
--
-- Scope guard:
--   - No AI Teacher tables.
--   - No payment tables.
--   - No parent dashboard tables.
--   - No client authority introduced.
--   - No secrets, service-role keys, database credentials, or AI provider keys.

-- ============================================================
-- Table: recommendations
-- ============================================================

CREATE TABLE recommendations (
    id                     UUID            PRIMARY KEY,
    student_id             UUID            NOT NULL,

    kind                   TEXT            NOT NULL,
    target_skill_id        TEXT            NOT NULL,
    target_lesson_id       UUID            NULL
                                            REFERENCES lessons (id)
                                            ON DELETE SET NULL,
    rank                   SMALLINT        NOT NULL,
    reason                 TEXT            NOT NULL,
    based_on_weakness_id   UUID            NULL,

    generated_at           TIMESTAMPTZ     NOT NULL,
    expires_at             TIMESTAMPTZ     NULL,

    status                 TEXT            NOT NULL DEFAULT 'active',

    created_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT recommendations_kind_check
        CHECK (kind IN (
            'lesson',
            'targeted_practice',
            'review_session'
        )),

    CONSTRAINT recommendations_rank_positive_check
        CHECK (rank >= 1),

    CONSTRAINT recommendations_reason_check
        CHECK (reason IN (
            'addresses_weakness',
            'reinforces_recent_skill',
            'next_in_sequence',
            'review_due'
        )),

    CONSTRAINT recommendations_status_check
        CHECK (status IN (
            'active',
            'superseded',
            'expired',
            'dismissed'
        )),

    CONSTRAINT recommendations_lesson_kind_consistency_check
        CHECK (kind != 'lesson' OR target_lesson_id IS NOT NULL),

    CONSTRAINT recommendations_weakness_reason_consistency_check
        CHECK (reason != 'addresses_weakness' OR based_on_weakness_id IS NOT NULL),

    CONSTRAINT recommendations_expires_after_generated_check
        CHECK (expires_at IS NULL OR expires_at > generated_at)
);

COMMENT ON TABLE recommendations IS
    'AIM Engine ranked recommendations referencing existing curriculum content. Values mirror the validated AimRecommendationOutput per P5-015 contract. Each new AIM response replaces the active set for a student; rank is only meaningful within one generated set.';

COMMENT ON COLUMN recommendations.id IS
    'Set equal to the AIM Engine-issued recommendationId on persistence.';

COMMENT ON COLUMN recommendations.student_id IS
    'Backend-resolved student id from authenticated session context per aim-session-input-contracts. Never taken from the wire payload.';

COMMENT ON COLUMN recommendations.kind IS
    'Category of recommended action: lesson, targeted_practice, or review_session.';

COMMENT ON COLUMN recommendations.target_skill_id IS
    'Skill key from the curriculum skill taxonomy that this recommendation targets.';

COMMENT ON COLUMN recommendations.target_lesson_id IS
    'Specific existing lesson reference, present when kind = lesson. Null for kind values that do not reference a single lesson. References an existing, published lesson at validation time.';

COMMENT ON COLUMN recommendations.rank IS
    'Position within the ranked set returned in one AIM response. Rank 1 is the top recommendation. Unique within one generated set, not across the table.';

COMMENT ON COLUMN recommendations.reason IS
    'Coarse, fixed-enum category describing why this recommendation was produced. Never a free-text explanation.';

COMMENT ON COLUMN recommendations.based_on_weakness_id IS
    'References a weakness_records id when reason = addresses_weakness. No DB-level FK by design; validated by the backend persistence service at write time.';

COMMENT ON COLUMN recommendations.generated_at IS
    'When the AIM Engine generated this recommendation.';

COMMENT ON COLUMN recommendations.expires_at IS
    'When this recommendation is no longer current. Null means no explicit expiry; remains current until superseded, dismissed, or naturally expired by backend sweep.';

COMMENT ON COLUMN recommendations.status IS
    'Backend-managed lifecycle status: active, superseded, expired, or dismissed. The only field on this table not sourced from the AIM Engine wire output.';

COMMENT ON COLUMN recommendations.created_at IS
    'Backend-set on first persistence. Never updated after.';

COMMENT ON COLUMN recommendations.updated_at IS
    'Backend-set on every persistence write for this record, including status transitions.';

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX recommendations_student_id_idx
    ON recommendations (student_id);

CREATE INDEX recommendations_target_skill_id_idx
    ON recommendations (target_skill_id);

CREATE INDEX recommendations_target_lesson_id_idx
    ON recommendations (target_lesson_id);

CREATE INDEX recommendations_based_on_weakness_id_idx
    ON recommendations (based_on_weakness_id);

CREATE INDEX recommendations_status_idx
    ON recommendations (status);

-- Partial index for the common "current active recommendations for a
-- student, in rank order" lookup used by the AIM result API.
CREATE INDEX recommendations_active_student_rank_idx
    ON recommendations (student_id, rank)
    WHERE status = 'active';
