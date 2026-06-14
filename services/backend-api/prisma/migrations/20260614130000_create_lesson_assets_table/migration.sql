-- Phase 3 — P3-025
-- Create lesson_assets table — content assets attached to lessons
-- (images, audio, video, documents, external references).
--
-- Scope:
-- Curriculum & Content System only.
--
-- Security rules:
-- - Backend is the source of truth for asset status, ordering, and lesson linkage.
-- - Clients must not directly write asset records to the database.
-- - No secrets, service-role keys, database credentials, JWT secrets, storage upload
--   credentials, CDN signing keys, or AI provider keys are stored here.
-- - Status transitions are backend-owned and follow the Phase 3 content status lifecycle.
-- - An asset cannot be published if its parent lesson is in 'draft' status (enforced at backend).
-- - Do not implement onboarding, placement execution, learner lesson delivery, practice attempts,
--   sessions, AIM runtime integration, dashboard recommendations, review/retention, progress reports,
--   AI Teacher, or Student Web App tables.
--
-- Dependencies:
-- P3-022 (lessons table migration — lesson_assets references lessons)
-- P3-013 (lesson asset contract — field definitions, types, and status lifecycle)

CREATE TABLE IF NOT EXISTS lesson_assets (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent lesson reference — set on creation, never changed
  lesson_id         UUID        NOT NULL REFERENCES lessons(id) ON DELETE RESTRICT,

  -- Asset type — set on creation, never changed
  -- Values: image | audio | video | document | external_reference
  type              TEXT        NOT NULL,

  -- Human-readable label for the asset
  title             TEXT        NOT NULL,

  -- Optional description or caption
  description       TEXT        DEFAULT NULL,

  -- Storage URL or embed URL (conditionally required by type, enforced at backend)
  url               TEXT        DEFAULT NULL,

  -- MIME type of the asset (e.g. image/png, video/mp4)
  mime_type         TEXT        DEFAULT NULL,

  -- File size in bytes (not applicable to external_reference)
  size_bytes        BIGINT      DEFAULT NULL,

  -- Duration in seconds (audio/video assets only)
  duration_seconds  INTEGER     DEFAULT NULL,

  -- Accessibility alt text — required before an image asset can be published (backend enforced)
  alt_text          TEXT        DEFAULT NULL,

  -- Thumbnail preview URL (video, image, document)
  thumbnail_url     TEXT        DEFAULT NULL,

  -- Display order within the parent lesson — positive, unique per lesson
  "order"           INTEGER     NOT NULL,

  -- Backend-owned content lifecycle status
  -- Values: draft | published | archived
  status            TEXT        NOT NULL DEFAULT 'draft',

  -- Type-specific metadata (e.g. width_px, format, captions_url) — see P3-013 contract
  metadata          JSONB       DEFAULT NULL,

  -- Audit timestamps — set and updated by backend only
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Type constraint aligned with the Phase 3 lesson asset contract (P3-013)
  CONSTRAINT lesson_assets_type_check
    CHECK (type IN ('image', 'audio', 'video', 'document', 'external_reference')),

  -- Status constraint aligned with the Phase 3 content status lifecycle (P3-007)
  CONSTRAINT lesson_assets_status_check
    CHECK (status IN ('draft', 'published', 'archived')),

  -- Title must be non-empty
  CONSTRAINT lesson_assets_title_nonempty_check
    CHECK (char_length(trim(title)) > 0),

  -- Order must be a positive integer
  CONSTRAINT lesson_assets_order_check
    CHECK ("order" > 0),

  -- Size, when present, must be non-negative
  CONSTRAINT lesson_assets_size_bytes_check
    CHECK (size_bytes IS NULL OR size_bytes >= 0),

  -- Duration, when present, must be non-negative
  CONSTRAINT lesson_assets_duration_check
    CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

  -- Order must be unique within the parent lesson
  CONSTRAINT lesson_assets_lesson_order_unique
    UNIQUE (lesson_id, "order")
);

-- Index for parent lesson queries
CREATE INDEX IF NOT EXISTS lesson_assets_lesson_id_idx
  ON lesson_assets (lesson_id);

CREATE INDEX IF NOT EXISTS lesson_assets_status_idx
  ON lesson_assets (status);

CREATE INDEX IF NOT EXISTS lesson_assets_type_idx
  ON lesson_assets (type);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_lesson_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lesson_assets_set_updated_at ON lesson_assets;

CREATE TRIGGER lesson_assets_set_updated_at
BEFORE UPDATE ON lesson_assets
FOR EACH ROW
EXECUTE FUNCTION set_lesson_assets_updated_at();

COMMENT ON TABLE lesson_assets IS
  'Content assets attached to lessons (images, audio, video, documents, external references). '
  'Backend is the source of truth for status, ordering, and lesson linkage. '
  'An asset cannot be published while its parent lesson is in draft status — enforced at the backend. '
  'Do not store learner progress, delivery state, mastery, session, or AIM runtime data here. '
  'Never store storage upload credentials, CDN signing keys, or service-role tokens here.';

COMMENT ON COLUMN lesson_assets.lesson_id IS
  'Parent lesson reference. Set on creation only — cannot be changed. '
  'Cascade delete is restricted; assets must be archived or removed explicitly (no hard delete).';

COMMENT ON COLUMN lesson_assets.type IS
  'Asset type. Set on creation only — cannot be changed. '
  'Allowed values: image, audio, video, document, external_reference.';

COMMENT ON COLUMN lesson_assets.status IS
  'Backend-owned content lifecycle status. Allowed values: draft, published, archived. '
  'An image asset must have alt_text set before it can be published (backend enforced).';

COMMENT ON COLUMN lesson_assets."order" IS
  'Display order within the parent lesson. Must be a positive integer, '
  'unique per lesson. Backend ensures uniqueness; clients must not rely on local ordering.';

COMMENT ON COLUMN lesson_assets.metadata IS
  'Type-specific metadata object (e.g. width_px/height_px/format for image, '
  'bitrate_kbps/transcript_url for audio, captions_url for video). See P3-013 lesson asset contract.';
