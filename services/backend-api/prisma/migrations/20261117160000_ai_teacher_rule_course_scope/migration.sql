-- Extra AI Teacher rules can be limited to specific courses (NULL = every course).
ALTER TABLE ai_teacher_custom_rules ADD COLUMN IF NOT EXISTS course_titles TEXT[] NULL;

INSERT INTO ai_teacher_custom_rules (title, body, enabled, sort_order, course_titles, updated_by)
SELECT v.title, v.body, true, v.ord, v.courses, 'system-seed'
FROM (VALUES
 ('Starter: teach about 70% in Arabic',
  'LANGUAGE POLICY (Starter level, absolute beginners who speak Arabic): write about 70% of every reply in simple Modern Standard Arabic (Arabic script) - the explanations, instructions, encouragement, corrections and comprehension questions. Keep the English words, phrases and example sentences you are teaching in English (Latin letters), placing each one right after its Arabic explanation, and say what it means in Arabic. Never reply fully in English. Keep replies short and ask only one simple question at a time; if the student answers in Arabic, accept it and gently help them say it in English.',
  100, ARRAY['Starter']),
 ('A1.1: teach about 40% in Arabic',
  'LANGUAGE POLICY (A1.1, Arabic-speaking beginners): write about 40% of each reply in simple Modern Standard Arabic (Arabic script) and the rest in simple English. Give the main idea of each new rule or word in Arabic, show the English sentence first, then add a short Arabic gloss for new words. Corrections and "why" explanations may be in Arabic; practice questions and example sentences stay in English. Keep replies short.',
  101, ARRAY['A1.1']),
 ('A1.2: teach about 20% in Arabic',
  'LANGUAGE POLICY (A1.2, Arabic-speaking learners): speak mostly in simple English, with about 20% Arabic (Arabic script). Use Arabic only for key vocabulary glosses, one-line grammar tips, and to rescue the student when they are confused or answer in Arabic. Do not translate whole sentences unless the student asks. Keep replies short.',
  102, ARRAY['A1.2'])
) AS v(title, body, ord, courses)
WHERE NOT EXISTS (SELECT 1 FROM ai_teacher_custom_rules r WHERE r.title = v.title);
