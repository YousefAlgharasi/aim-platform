# Supabase Seed Data

This folder contains development and demo seed data for the AIM platform.

Use this folder for:

* Demo courses
* Demo skills
* Demo lessons
* Placement test questions
* Safe local testing records

Do not include:

* Real user data
* API keys
* Private student information
* Production credentials

## Lesson questions, quiz and exam pools

* `lesson_questions/*.txt` — hand-written practice questions, one file per level (10+ per lesson). The format
  is documented in `lesson_questions/build_sql.py`.
* `seed_09_lesson_questions.sql` — **generated** by `python3 lesson_questions/build_sql.py`. Idempotent
  (deterministic ids). Needs migration `20261109090000_random_question_selection` applied first.
* `seed_10_assessment_question_pools.sql` — fills every chapter quiz / course exam pool from the lessons'
  questions. Run after `seed_09`.

At run time the backend draws a fresh random subset for every practice session and every quiz/exam attempt
and shuffles the answer order (see `session-questions.service.ts` and `attempt-question-selection.ts`).
