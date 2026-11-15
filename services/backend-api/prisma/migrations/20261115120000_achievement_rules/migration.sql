-- Data-driven achievements: each definition carries an unlock rule (type + threshold)
-- so admins can create/edit achievements without a code change. Additive only.
ALTER TABLE achievement_definitions ADD COLUMN IF NOT EXISTS rule_type TEXT NULL;
ALTER TABLE achievement_definitions ADD COLUMN IF NOT EXISTS rule_threshold INTEGER NULL;

-- Rules for the five existing achievements (same behaviour as the old key-based logic).
UPDATE achievement_definitions SET rule_type = 'lessons_completed',  rule_threshold = 1 WHERE key = 'first_lesson_complete'  AND rule_type IS NULL;
UPDATE achievement_definitions SET rule_type = 'lessons_completed',  rule_threshold = 5 WHERE key = 'five_lessons_complete'  AND rule_type IS NULL;
UPDATE achievement_definitions SET rule_type = 'assessments_passed', rule_threshold = 1 WHERE key = 'first_assessment_passed' AND rule_type IS NULL;
UPDATE achievement_definitions SET rule_type = 'streak_days',        rule_threshold = 3 WHERE key = 'three_day_streak'       AND rule_type IS NULL;
UPDATE achievement_definitions SET rule_type = 'streak_days',        rule_threshold = 7 WHERE key = 'seven_day_streak'       AND rule_type IS NULL;

INSERT INTO achievement_definitions (key, title, description, icon, category, rule_type, rule_threshold) VALUES
  ('ten_lessons_complete',    'Double Digits',      'Complete 10 lessons.',                         'emoji_events',          'lessons',    'lessons_completed',  10),
  ('twentyfive_lessons',      'Quarter Century',    'Complete 25 lessons.',                         'emoji_events',          'lessons',    'lessons_completed',  25),
  ('fifty_lessons_complete',  'Lesson Machine',     'Complete 50 lessons.',                         'military_tech',         'lessons',    'lessons_completed',  50),
  ('hundred_lessons_complete','Century Club',       'Complete 100 lessons.',                        'military_tech',         'lessons',    'lessons_completed',  100),
  ('fourteen_day_streak',     'Two Weeks Strong',   'Keep a 14-day learning streak.',               'local_fire_department', 'streak',     'streak_days',        14),
  ('thirty_day_streak',       'Monthly Master',     'Keep a 30-day learning streak.',               'local_fire_department', 'streak',     'streak_days',        30),
  ('three_assessments_passed','Test Taker',         'Pass 3 quizzes or exams.',                     'workspace_premium',     'assessment', 'assessments_passed', 3),
  ('ten_assessments_passed',  'Exam Expert',        'Pass 10 quizzes or exams.',                    'workspace_premium',     'assessment', 'assessments_passed', 10),
  ('perfect_score',           'Perfectionist',      'Score 100% on a quiz or exam.',                'stars',                 'assessment', 'perfect_scores',     1),
  ('fifty_correct_answers',   'Sharp Mind',         'Answer 50 practice questions correctly.',      'check_circle',          'milestone',  'correct_answers',    50),
  ('two_hundred_correct',     'Question Crusher',   'Answer 200 practice questions correctly.',     'check_circle',          'milestone',  'correct_answers',    200),
  ('thousand_correct',        'Unstoppable',        'Answer 1,000 practice questions correctly.',   'bolt',                  'milestone',  'correct_answers',    1000),
  ('first_speaking',          'Say It Out Loud',    'Finish your first speaking practice.',         'record_voice_over',     'milestone',  'speaking_practices', 1),
  ('ten_speaking',            'Confident Speaker',  'Finish 10 speaking practices.',                'record_voice_over',     'milestone',  'speaking_practices', 10),
  ('first_writing',           'Pen to Paper',       'Finish your first writing practice.',          'edit_note',             'milestone',  'writing_practices',  1),
  ('ten_writing',             'Wordsmith',          'Finish 10 writing practices.',                 'edit_note',             'milestone',  'writing_practices',  10),
  ('first_mistake_fixed',     'Learning From Errors','Fix your first mistake.',                     'build_circle',          'milestone',  'mistakes_fixed',     1),
  ('twenty_mistakes_fixed',   'Mistake Master',     'Fix 20 mistakes.',                             'build_circle',          'milestone',  'mistakes_fixed',     20),
  ('five_skills_mastered',    'Skill Collector',    'Master 5 skills (80% or more).',               'psychology',            'milestone',  'skills_mastered',    5),
  ('course_complete',         'Course Graduate',    'Complete a whole course and earn a certificate.','school',              'milestone',  'courses_completed',  1),
  ('thousand_xp',             'XP Hunter',          'Earn 1,000 XP.',                               'trending_up',           'milestone',  'xp_total',           1000),
  ('five_thousand_xp',        'XP Legend',          'Earn 5,000 XP.',                               'trending_up',           'milestone',  'xp_total',           5000)
ON CONFLICT (key) DO NOTHING;
