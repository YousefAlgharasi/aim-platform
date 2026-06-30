-- Extend lesson_assets types and add lesson xp_value.
--
-- Scope:
-- Curriculum & Content System only. Purely additive — no behavioral change
-- to existing rows or to the AIM Engine, which never reads xp_value or
-- lesson_assets.type. xp_value is a standalone gamification display field
-- (lesson list "blocks/XP" UI), entirely separate from mastery scoring,
-- weakness detection, and recommendations.
--
-- Security rules:
-- - Backend is the source of truth for xp_value and asset type; clients
--   must not write these directly.
-- - No secrets, service-role keys, or AI provider keys here.

-- ============================================================
-- Lesson asset types: add text, vocabulary, exercise
-- ============================================================
-- Existing types (image, audio, video, document, external_reference) covered
-- rich-media content. The student-facing lesson detail screen also renders
-- inline text blocks, vocabulary lists, and practice exercises as
-- first-class lesson steps — these need their own asset type rather than
-- being shoehorned into "document".

ALTER TABLE lesson_assets
  DROP CONSTRAINT lesson_assets_type_check;

ALTER TABLE lesson_assets
  ADD CONSTRAINT lesson_assets_type_check
  CHECK (type IN ('text', 'image', 'audio', 'video', 'document', 'vocabulary', 'exercise', 'external_reference'));

COMMENT ON COLUMN lesson_assets.type IS
  'Asset type. Set on creation only — cannot be changed. '
  'Allowed values: text, image, audio, video, document, vocabulary, exercise, external_reference.';

-- ============================================================
-- lessons.xp_value — gamification points awarded on completion
-- ============================================================

ALTER TABLE lessons
  ADD COLUMN xp_value INTEGER NOT NULL DEFAULT 0;

ALTER TABLE lessons
  ADD CONSTRAINT lessons_xp_value_check
  CHECK (xp_value >= 0);

COMMENT ON COLUMN lessons.xp_value IS
  'Gamification points awarded to the student on lesson completion. '
  'Backend-owned, display-only — never read by the AIM Engine, mastery scoring, '
  'weakness detection, or recommendation logic. Defaults to 0 for existing lessons.';
