# AIM Platform — Database Plan

> **Status:** Stub — schema must be written and reviewed before any migrations are created.

## Database

PostgreSQL via Supabase.

## Core Entity Groups

### Users & Auth
- `users` — learner and staff accounts (managed by Supabase Auth)
- `profiles` — extended learner profile (language background, preferences)
- `roles` — role assignments (learner, teacher, admin, analyst)

### Skill Tree
- `skill_categories` — top-level categories (Reading, Listening, Speaking, Writing, Vocabulary, Grammar)
- `skills` — individual skills within a category (86 A1 skills across all categories)
- `skill_dependencies` — prerequisite relationships between skills

### Content
- `exercises` — individual exercise items
- `exercise_options` — answer choices for multiple-choice exercises
- `media_assets` — audio files, images referenced by exercises

### Learner Progress
- `learner_skills` — mastery level per learner per skill
- `sessions` — individual learning sessions
- `session_items` — exercise attempts within a session (response, score, latency)

### Journeys & Cohorts
- `journeys` — curated learning paths
- `journey_skills` — skills assigned to a journey in order
- `cohorts` — groups of learners
- `cohort_members` — learner-cohort membership

### Analytics
- `events` — raw engagement event log

## Sections To Complete

- [ ] Full column definitions for every table
- [ ] Index strategy
- [ ] Row-level security (RLS) policies
- [ ] Migration file plan
- [ ] Seed data requirements

---
*Last updated: 2026-06-09*
