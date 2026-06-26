-- Phase 4 — P4-027
-- Seed data for placement test, sections, and sample questions.
--
-- Scope:
-- Placement Test system only.
--
-- Security rules:
-- - No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys are stored here.
-- - correct_answer values are stored server-side only; this seed file must never be exposed to clients.
-- - This seed must be executed only by backend-controlled tooling (e.g. prisma db seed or psql pipeline).
-- - Backend remains the final authority for placement scoring, level assignment, and result generation.
-- - Do not seed AIM Engine runtime data, lesson delivery, practice attempts, session state,
--   progress dashboard, AI Teacher, or Student Web App data here.
--
-- Usage:
-- Run after P4-017 (placement_tests), P4-018 (placement_sections), P4-019 (placement_questions),
-- and P4-020 (placement_question_skills) migrations are applied.
-- Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.
--
-- Blueprint conformance:
-- Seeded per docs/phase-4/placement-blueprint-rules.md (P4-029):
--   - 3 sections: Grammar (10q), Vocabulary (10q), Listening (10q)
--   - All questions are multiple_choice with 4 options per P4-029 §3.1–3.3
--   - Listening questions include audio prompt reference in prompt field per P4-029 §3.3
--   - correct_answer values are backend-only; never exposed to students
--
-- Dependencies:
-- P4-019 (placement_questions migration)
-- P4-020 (placement_question_skills migration)

-- -----------------------------------------------------------------------
-- 1. Placement Test
-- -----------------------------------------------------------------------

INSERT INTO placement_tests (
  id,
  title,
  status,
  estimated_minutes,
  total_sections,
  created_at,
  updated_at
)
VALUES (
  'f4000000-0000-0000-0000-000000000001',
  'AIM Phase 4 Placement Test',
  'published',
  20,
  3,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 2. Placement Sections
-- Blueprint: 3 sections in fixed order — Grammar, Vocabulary, Listening
-- -----------------------------------------------------------------------

INSERT INTO placement_sections (
  id,
  placement_test_id,
  title,
  skill_code,
  order_index,
  total_questions,
  created_at,
  updated_at
)
VALUES
  (
    'f4000000-0000-0000-0001-000000000001',
    'f4000000-0000-0000-0000-000000000001',
    'Grammar',
    'grammar',
    1,
    10,
    now(),
    now()
  ),
  (
    'f4000000-0000-0000-0001-000000000002',
    'f4000000-0000-0000-0000-000000000001',
    'Vocabulary',
    'vocabulary',
    2,
    10,
    now(),
    now()
  ),
  (
    'f4000000-0000-0000-0001-000000000003',
    'f4000000-0000-0000-0000-000000000001',
    'Listening',
    'listening',
    3,
    10,
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 3. Grammar Questions (10 questions)
-- Blueprint §3.1: verb forms (3), subject-verb agreement (2),
--   articles & prepositions (2), sentence structure & negation (2), question forms (1)
-- All multiple_choice, 4 options, correct_answer is backend-only
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (
  id,
  placement_section_id,
  question_type,
  prompt,
  media_url,
  order_index,
  correct_answer,
  created_at,
  updated_at
)
VALUES
  -- Verb forms (Q1–Q3)
  (
    'f4000000-0000-0000-0002-000000000001',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'She ___ to school every day. (A) go (B) goes (C) going (D) gone',
    NULL,
    1,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0002-000000000002',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'They ___ football last Saturday. (A) play (B) plays (C) played (D) playing',
    NULL,
    2,
    'C',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0002-000000000003',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'By next year, she ___ here for ten years. (A) will work (B) has worked (C) will have worked (D) was working',
    NULL,
    3,
    'C',
    now(), now()
  ),
  -- Subject-verb agreement (Q4–Q5)
  (
    'f4000000-0000-0000-0002-000000000004',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'The students ___ very tired after the exam. (A) is (B) are (C) was (D) be',
    NULL,
    4,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0002-000000000005',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'Neither the teacher nor the students ___ ready. (A) is (B) are (C) was (D) were',
    NULL,
    5,
    'B',
    now(), now()
  ),
  -- Articles and prepositions (Q6–Q7)
  (
    'f4000000-0000-0000-0002-000000000006',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'I saw ___ interesting film last night. (A) a (B) an (C) the (D) —',
    NULL,
    6,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0002-000000000007',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'She is good ___ mathematics. (A) in (B) on (C) at (D) for',
    NULL,
    7,
    'C',
    now(), now()
  ),
  -- Sentence structure and negation (Q8–Q9)
  (
    'f4000000-0000-0000-0002-000000000008',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'He ___ come to the party last night. (A) did not (B) does not (C) is not (D) was not',
    NULL,
    8,
    'A',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0002-000000000009',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    'Which sentence is correct? (A) She not like coffee. (B) She does not likes coffee. (C) She does not like coffee. (D) She do not like coffee.',
    NULL,
    9,
    'C',
    now(), now()
  ),
  -- Question forms (Q10)
  (
    'f4000000-0000-0000-0002-000000000010',
    'f4000000-0000-0000-0001-000000000001',
    'multiple_choice',
    '___ does the class start? (A) What (B) When (C) Where (D) Which',
    NULL,
    10,
    'B',
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 4. Vocabulary Questions (10 questions)
-- Blueprint §3.2: word meaning & synonyms (3), word in context fill-in (3),
--   reading comprehension (4)
-- All multiple_choice, 4 options
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (
  id,
  placement_section_id,
  question_type,
  prompt,
  media_url,
  order_index,
  correct_answer,
  created_at,
  updated_at
)
VALUES
  -- Word meaning and synonyms (Q1–Q3)
  (
    'f4000000-0000-0000-0003-000000000001',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'What is the best synonym for "happy"? (A) sad (B) joyful (C) angry (D) tired',
    NULL,
    1,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000002',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'What does "enormous" mean? (A) very small (B) very fast (C) very large (D) very quiet',
    NULL,
    2,
    'C',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000003',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Which word means "to begin"? (A) end (B) start (C) pause (D) stop',
    NULL,
    3,
    'B',
    now(), now()
  ),
  -- Word in context / fill-in (Q4–Q6)
  (
    'f4000000-0000-0000-0003-000000000004',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Please ___ the door when you leave. (A) open (B) close (C) break (D) paint',
    NULL,
    4,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000005',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'The weather is very ___ today — you should bring an umbrella. (A) sunny (B) warm (C) rainy (D) cold',
    NULL,
    5,
    'C',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000006',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'She ___ her keys and could not enter the house. (A) found (B) lost (C) bought (D) made',
    NULL,
    6,
    'B',
    now(), now()
  ),
  -- Reading comprehension (Q7–Q10)
  -- Passage: "Tom works at a library. He arrives at 9 am and leaves at 5 pm.
  --           He helps people find books and uses a computer to manage records."
  (
    'f4000000-0000-0000-0003-000000000007',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Passage: "Tom works at a library. He arrives at 9 am and leaves at 5 pm. He helps people find books and uses a computer to manage records." — Where does Tom work? (A) a school (B) a hospital (C) a library (D) a shop',
    NULL,
    7,
    'C',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000008',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Passage (same as above) — What time does Tom arrive? (A) 8 am (B) 9 am (C) 10 am (D) 5 pm',
    NULL,
    8,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000009',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Passage (same as above) — What does Tom use to manage records? (A) a typewriter (B) books (C) a phone (D) a computer',
    NULL,
    9,
    'D',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0003-000000000010',
    'f4000000-0000-0000-0001-000000000002',
    'multiple_choice',
    'Passage (same as above) — How many hours does Tom work per day? (A) 6 (B) 7 (C) 8 (D) 9',
    NULL,
    10,
    'C',
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 5. Listening Questions (10 questions)
-- Blueprint §3.3: spoken instruction comprehension (3), dialogue comprehension (4),
--   time and number comprehension (3)
-- All multiple_choice, 4 options
-- Audio prompt reference included in prompt field per P4-029 §3.3
-- media_url set to placeholder path — replace with real CDN URLs before production
-- -----------------------------------------------------------------------

INSERT INTO placement_questions (
  id,
  placement_section_id,
  question_type,
  prompt,
  media_url,
  order_index,
  correct_answer,
  created_at,
  updated_at
)
VALUES
  -- Spoken instruction comprehension (Q1–Q3)
  (
    'f4000000-0000-0000-0004-000000000001',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q1-instruction.mp3] Listen and choose what the speaker is asking you to do. (A) Open the window (B) Close the door (C) Turn off the light (D) Sit down',
    'audio/placement/listen-q1-instruction.mp3',
    1,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000002',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q2-instruction.mp3] Listen and choose what the speaker wants you to bring. (A) a pen (B) a book (C) a bag (D) a chair',
    'audio/placement/listen-q2-instruction.mp3',
    2,
    'A',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000003',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q3-instruction.mp3] Listen and choose where the speaker is directing you to go. (A) upstairs (B) downstairs (C) outside (D) the kitchen',
    'audio/placement/listen-q3-instruction.mp3',
    3,
    'C',
    now(), now()
  ),
  -- Dialogue comprehension (Q4–Q7)
  (
    'f4000000-0000-0000-0004-000000000004',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q4-dialogue.mp3] Listen to the dialogue. Why is the woman calling? (A) to order food (B) to book a table (C) to cancel a reservation (D) to ask for directions',
    'audio/placement/listen-q4-dialogue.mp3',
    4,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000005',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q5-dialogue.mp3] Listen to the dialogue. What does the man decide to do? (A) go home (B) go to the gym (C) go shopping (D) go to the cinema',
    'audio/placement/listen-q5-dialogue.mp3',
    5,
    'D',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000006',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q6-dialogue.mp3] Listen to the dialogue. How does the woman feel? (A) happy (B) nervous (C) angry (D) confused',
    'audio/placement/listen-q6-dialogue.mp3',
    6,
    'B',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000007',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q7-dialogue.mp3] Listen to the dialogue. Where are they talking? (A) at a bank (B) at a hotel (C) at an airport (D) at a school',
    'audio/placement/listen-q7-dialogue.mp3',
    7,
    'C',
    now(), now()
  ),
  -- Time and number comprehension (Q8–Q10)
  (
    'f4000000-0000-0000-0004-000000000008',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q8-time.mp3] Listen and choose the time you hear. (A) 3:15 (B) 3:50 (C) 4:15 (D) 4:50',
    'audio/placement/listen-q8-time.mp3',
    8,
    'A',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000009',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q9-number.mp3] Listen and choose the phone number you hear. (A) 555-1234 (B) 555-1243 (C) 555-1324 (D) 555-1342',
    'audio/placement/listen-q9-number.mp3',
    9,
    'C',
    now(), now()
  ),
  (
    'f4000000-0000-0000-0004-000000000010',
    'f4000000-0000-0000-0001-000000000003',
    'multiple_choice',
    '[Audio: listen-q10-price.mp3] Listen and choose the price you hear. (A) $12.50 (B) $12.15 (C) $21.50 (D) $21.15',
    'audio/placement/listen-q10-price.mp3',
    10,
    'A',
    now(), now()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 6. Placement Question Skills Mapping (sample — primary skill per question)
-- Maps each question to a skill from the Phase 3 skills table.
-- Skill keys follow P3-006 dot-delimited convention.
-- Only primary skill links are seeded here; secondary links can be added via admin UI (P4-057).
-- NOTE: skill UUIDs below must match rows in the skills table.
--       Update to real skill IDs before production; these are placeholder UUIDs for dev/test only.
-- -----------------------------------------------------------------------

-- Grammar skill UUIDs (placeholder dev UUIDs — replace with real IDs)
-- grammar.verb_forms   => 'b3000000-0000-0000-0001-000000000001'
-- grammar.agreement    => 'b3000000-0000-0000-0001-000000000002'
-- grammar.articles     => 'b3000000-0000-0000-0001-000000000003'
-- grammar.negation     => 'b3000000-0000-0000-0001-000000000004'
-- grammar.questions    => 'b3000000-0000-0000-0001-000000000005'

-- Vocabulary skill UUIDs (placeholder)
-- vocabulary.synonyms  => 'b3000000-0000-0000-0002-000000000001'
-- vocabulary.context   => 'b3000000-0000-0000-0002-000000000002'
-- vocabulary.reading   => 'b3000000-0000-0000-0002-000000000003'

-- Listening skill UUIDs (placeholder)
-- listening.instruction => 'b3000000-0000-0000-0003-000000000001'
-- listening.dialogue    => 'b3000000-0000-0000-0003-000000000002'
-- listening.numbers     => 'b3000000-0000-0000-0003-000000000003'

-- IMPORTANT: The INSERT below is commented out because skill UUIDs must be
-- confirmed against the skills table before execution.
-- Uncomment and replace placeholder UUIDs with real skill IDs from the skills table.

/*
INSERT INTO placement_question_skills (
  placement_question_id,
  skill_id,
  is_primary,
  created_at
)
VALUES
  -- Grammar Q1–Q3: verb forms
  ('f4000000-0000-0000-0002-000000000001', 'b3000000-0000-0000-0001-000000000001', true, now()),
  ('f4000000-0000-0000-0002-000000000002', 'b3000000-0000-0000-0001-000000000001', true, now()),
  ('f4000000-0000-0000-0002-000000000003', 'b3000000-0000-0000-0001-000000000001', true, now()),
  -- Grammar Q4–Q5: subject-verb agreement
  ('f4000000-0000-0000-0002-000000000004', 'b3000000-0000-0000-0001-000000000002', true, now()),
  ('f4000000-0000-0000-0002-000000000005', 'b3000000-0000-0000-0001-000000000002', true, now()),
  -- Grammar Q6–Q7: articles
  ('f4000000-0000-0000-0002-000000000006', 'b3000000-0000-0000-0001-000000000003', true, now()),
  ('f4000000-0000-0000-0002-000000000007', 'b3000000-0000-0000-0001-000000000003', true, now()),
  -- Grammar Q8–Q9: negation
  ('f4000000-0000-0000-0002-000000000008', 'b3000000-0000-0000-0001-000000000004', true, now()),
  ('f4000000-0000-0000-0002-000000000009', 'b3000000-0000-0000-0001-000000000004', true, now()),
  -- Grammar Q10: question forms
  ('f4000000-0000-0000-0002-000000000010', 'b3000000-0000-0000-0001-000000000005', true, now()),
  -- Vocabulary Q1–Q3: synonyms
  ('f4000000-0000-0000-0003-000000000001', 'b3000000-0000-0000-0002-000000000001', true, now()),
  ('f4000000-0000-0000-0003-000000000002', 'b3000000-0000-0000-0002-000000000001', true, now()),
  ('f4000000-0000-0000-0003-000000000003', 'b3000000-0000-0000-0002-000000000001', true, now()),
  -- Vocabulary Q4–Q6: context/fill-in
  ('f4000000-0000-0000-0003-000000000004', 'b3000000-0000-0000-0002-000000000002', true, now()),
  ('f4000000-0000-0000-0003-000000000005', 'b3000000-0000-0000-0002-000000000002', true, now()),
  ('f4000000-0000-0000-0003-000000000006', 'b3000000-0000-0000-0002-000000000002', true, now()),
  -- Vocabulary Q7–Q10: reading comprehension
  ('f4000000-0000-0000-0003-000000000007', 'b3000000-0000-0000-0002-000000000003', true, now()),
  ('f4000000-0000-0000-0003-000000000008', 'b3000000-0000-0000-0002-000000000003', true, now()),
  ('f4000000-0000-0000-0003-000000000009', 'b3000000-0000-0000-0002-000000000003', true, now()),
  ('f4000000-0000-0000-0003-000000000010', 'b3000000-0000-0000-0002-000000000003', true, now()),
  -- Listening Q1–Q3: instruction
  ('f4000000-0000-0000-0004-000000000001', 'b3000000-0000-0000-0003-000000000001', true, now()),
  ('f4000000-0000-0000-0004-000000000002', 'b3000000-0000-0000-0003-000000000001', true, now()),
  ('f4000000-0000-0000-0004-000000000003', 'b3000000-0000-0000-0003-000000000001', true, now()),
  -- Listening Q4–Q7: dialogue
  ('f4000000-0000-0000-0004-000000000004', 'b3000000-0000-0000-0003-000000000002', true, now()),
  ('f4000000-0000-0000-0004-000000000005', 'b3000000-0000-0000-0003-000000000002', true, now()),
  ('f4000000-0000-0000-0004-000000000006', 'b3000000-0000-0000-0003-000000000002', true, now()),
  ('f4000000-0000-0000-0004-000000000007', 'b3000000-0000-0000-0003-000000000002', true, now()),
  -- Listening Q8–Q10: time/numbers
  ('f4000000-0000-0000-0004-000000000008', 'b3000000-0000-0000-0003-000000000003', true, now()),
  ('f4000000-0000-0000-0004-000000000009', 'b3000000-0000-0000-0003-000000000003', true, now()),
  ('f4000000-0000-0000-0004-000000000010', 'b3000000-0000-0000-0003-000000000003', true, now())
ON CONFLICT (placement_question_id, skill_id) DO NOTHING;
*/
