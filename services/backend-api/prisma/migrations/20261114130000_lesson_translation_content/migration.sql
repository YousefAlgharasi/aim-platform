-- Arabic (and other non-English) lesson teaching content, reusing lesson_translations.
--
-- lesson_translations.content JSONB NULL:
--   { "explanation": <same shape as lessons.explanation>,
--     "teachingOutline": string[],
--     "assets": { "<lessonAssetId>": { "title"?, "description"?, "metadata"? } } }
-- question_bank.translations / question_choices.translations JSONB NULL, keyed by locale:
--   question_bank:    {"ar": {"stem", "hint"?, "explanation"?}}
--   question_choices: {"ar": {"text"}}
-- English source columns are unchanged; NULL means "no translation" (readers fall back to English).
-- Purely additive: nullable columns, no defaults, no backfill, no table rewrite.

ALTER TABLE lesson_translations ADD COLUMN IF NOT EXISTS content JSONB NULL;
ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS translations JSONB NULL;
ALTER TABLE question_choices ADD COLUMN IF NOT EXISTS translations JSONB NULL;
