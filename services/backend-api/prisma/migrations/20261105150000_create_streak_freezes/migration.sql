-- Streak freezes: a student can cover one missed day so the day streak survives.
-- student_id is the same id the engagement tables use (JWT user id), so there is no foreign key, like student_learning_goals.
-- One row per covered date; the allowance (freezes per UTC month) is enforced by the service, atomically, on insert.

CREATE TABLE IF NOT EXISTS streak_freezes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid        NOT NULL,
  frozen_date date        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT streak_freezes_student_date_uq UNIQUE (student_id, frozen_date)
);

CREATE INDEX IF NOT EXISTS streak_freezes_student_created_idx ON streak_freezes (student_id, created_at DESC);

COMMENT ON TABLE streak_freezes IS
  'Days a student covered with a streak freeze. Counted as part of the streak chain but not as active days.';

ALTER TABLE streak_freezes ENABLE ROW LEVEL SECURITY;
