-- Vocabulary library: a catalogue of words (with an Arabic translation of the word only and an English
-- example sentence) that students browse, listen to and save into "My words" (saved_words).
-- Managed from the admin dashboard.

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  word             text        NOT NULL CHECK (char_length(btrim(word)) BETWEEN 1 AND 60),
  translation_ar   text        NOT NULL CHECK (char_length(btrim(translation_ar)) BETWEEN 1 AND 200),
  example_sentence text        NOT NULL CHECK (char_length(btrim(example_sentence)) BETWEEN 1 AND 300),
  part_of_speech   text        CHECK (part_of_speech IS NULL OR part_of_speech IN
                                 ('noun','verb','adjective','adverb','preposition','conjunction','pronoun','phrase')),
  level            text        NOT NULL CHECK (level IN ('beginner','intermediate','advanced')),
  sort_order       integer     NOT NULL DEFAULT 0,
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS vocabulary_words_word_uq ON vocabulary_words (lower(btrim(word)));
CREATE INDEX IF NOT EXISTS vocabulary_words_level_idx ON vocabulary_words (level, is_active, sort_order, word);

ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;

-- Words saved from the library are tagged so My words can show where they came from.
ALTER TABLE saved_words DROP CONSTRAINT IF EXISTS saved_words_source_check;
ALTER TABLE saved_words ADD CONSTRAINT saved_words_source_check
  CHECK (source = ANY (ARRAY['manual'::text, 'chat'::text, 'lesson'::text, 'voice'::text, 'library'::text]));
