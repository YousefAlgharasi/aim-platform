-- Restore question_skills to its documented purpose and seed the links that
-- make session question delivery gradeable.
--
-- Background (verified against the live DB):
--   - question_skills was created (20260614160000) with
--     question_id REFERENCES question_bank(id) — "Maps reusable question
--     bank items to one or more skills," per its own table comment.
--   - The live FK was changed out-of-band to reference the separate
--     `questions` table, and 3 rows were inserted pointing at legacy pilot
--     demo questions (question.grammar.past_simple.* / c0000000-... ids).
--   - Meanwhile question_bank — the only table with real answer choices
--     (question_choices) and answer keys (question_answers) — had zero
--     skill links, so session question delivery (which now reads
--     question_bank via question_skills) had no content path.
--
-- This migration:
--   1. Deletes the 3 stray rows that reference the legacy `questions` table.
--   2. Restores the FK to question_bank(id) ON DELETE CASCADE, matching the
--      original 20260614160000 DDL.
--   3. Seeds one primary skill link per published question_bank item, mapped
--      from each item's tags to the published en.* skill taxonomy.
--
-- Seeding notes:
--   - ab...0002-000000000003 (past continuous) is intentionally NOT linked:
--     no published skill covers past continuous (en.a2.gra.* has only
--     present_continuous), and linking to the wrong skill would corrupt
--     mastery attribution. It stays undelivered until such a skill exists.
--   - ab...0002-000000000004 ("person who serves food") links to
--     en.a3.voc.work_jobs — the only work/jobs vocabulary skill; the item is
--     tagged a2 but the topic match is exact.
--   - "opposite of big" and "sky color" both link to en.a1.voc.colors_shapes,
--     the closest published A1 vocabulary skill for size/color adjectives.

DELETE FROM question_skills qs
 WHERE NOT EXISTS (SELECT 1 FROM question_bank qb WHERE qb.id = qs.question_id);

ALTER TABLE question_skills
  DROP CONSTRAINT question_skills_question_id_fkey;

ALTER TABLE question_skills
  ADD CONSTRAINT question_skills_question_id_fkey
  FOREIGN KEY (question_id) REFERENCES question_bank(id) ON DELETE CASCADE;

INSERT INTO question_skills (question_id, skill_id, is_primary)
SELECT v.question_id::uuid, s.id, true
FROM (VALUES
  ('ab000000-0000-0000-0001-000000000001', 'en.a1.gra.to_be_affirmative'),
  ('ab000000-0000-0000-0001-000000000002', 'en.a1.voc.colors_shapes'),
  ('ab000000-0000-0000-0001-000000000003', 'en.a1.gra.articles_a_an'),
  ('ab000000-0000-0000-0001-000000000004', 'en.a1.voc.greetings'),
  ('ab000000-0000-0000-0001-000000000005', 'en.a1.gra.present_simple_aff'),
  ('ab000000-0000-0000-0001-000000000006', 'en.a1.gra.prepositions_place'),
  ('ab000000-0000-0000-0001-000000000007', 'en.a1.pho.letter_recognition'),
  ('ab000000-0000-0000-0001-000000000008', 'en.a1.voc.family'),
  ('ab000000-0000-0000-0001-000000000009', 'en.a1.gra.present_simple_aff'),
  ('ab000000-0000-0000-0001-000000000010', 'en.a1.voc.colors_shapes'),
  ('ab000000-0000-0000-0002-000000000001', 'en.a2.gra.past_simple_irregular'),
  ('ab000000-0000-0000-0002-000000000002', 'en.a2.gra.comparatives'),
  ('ab000000-0000-0000-0002-000000000004', 'en.a3.voc.work_jobs'),
  ('ab000000-0000-0000-0002-000000000005', 'en.a2.gra.present_continuous'),
  ('ab000000-0000-0000-0003-000000000001', 'en.a3.gra.present_perfect'),
  ('ab000000-0000-0000-0003-000000000002', 'en.a3.gra.second_conditional'),
  ('ab000000-0000-0000-0003-000000000003', 'en.a3.gra.passive_past'),
  ('ab000000-0000-0000-0003-000000000004', 'en.a3.gra.relative_clauses'),
  ('ab000000-0000-0000-0003-000000000005', 'en.a3.gra.gerunds_infinitives')
) AS v(question_id, skill_key)
JOIN skills s ON s.key = v.skill_key AND s.status = 'published'
ON CONFLICT (question_id, skill_id) DO NOTHING;
