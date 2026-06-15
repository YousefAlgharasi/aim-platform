# Curriculum Seed Strategy

**Task:** P3-026 — Add Curriculum Seed Strategy
**Phase:** Phase 3 — Curriculum & Content System
**Status:** Document

---

## 1. Purpose

Define a repeatable, safe strategy for inserting curriculum seed data into the AIM Platform database for development, testing, and admin validation. This document does not define production content — it defines the structure, rules, and conventions for seed data only.

---

## 2. Scope

### In scope

- Courses, levels, chapters, lessons (curriculum hierarchy)
- Skills and skill taxonomy (stable key identifiers)
- Lesson-skill links (lesson_skills table)
- Objectives (lesson_objectives table)
- Lesson assets (lesson_assets table)
- Questions (question bank — questions table)
- Curriculum permission rows (permissions, role_permissions)

### Out of scope

- Learner accounts, student profiles, onboarding data
- Placement test results, AIM session records, practice attempts
- Progress reports, review schedules, retention data
- AI Teacher configurations, model keys, provider credentials

---

## 3. Seed File Conventions

### 3.1 File naming

All curriculum seed files live under `services/backend-api/prisma/seeds/` and follow sequential numbering:

```
01_roles_permissions.sql       — Phase 2: roles and permissions
02_curriculum_permissions.sql  — Phase 3: curriculum permission keys
03_curriculum_content.sql      — Phase 3: MVP curriculum hierarchy and skills
```

New seed files must increment the prefix and use a descriptive name.

### 3.2 Idempotency requirement

Every seed file must be safe to run multiple times. All INSERTs must use:

```sql
ON CONFLICT (id) DO NOTHING;
-- or
ON CONFLICT (key) DO NOTHING;  -- for skills
ON CONFLICT DO NOTHING;        -- for composite PKs (lesson_skills)
```

Never use bare INSERT without conflict handling.

### 3.3 Fixed UUIDs

Development seed data must use fixed, deterministic UUIDs so that:
- Seed runs are reproducible across environments
- Tests can reference known IDs without querying
- Conflicts with real data are prevented (see Section 4)

Pattern:

```
a0000000-0000-0000-0000-00000000000N  — skills
b0000000-0000-0000-0000-00000000000N  — courses, levels, chapters, lessons
c0000000-0000-0000-0000-00000000000N  — questions
d0000000-0000-0000-0000-00000000000N  — objectives
```

### 3.4 Default status

All seed content must default to `'draft'` status except published skills used for lesson-skill linking validation, which may be `'published'` to allow testing of the publish-gate rule.

---

## 4. Seed Data Safety Rules

1. **No production keys in seed files.** No JWT secrets, Supabase service-role keys, AI provider keys, or database credentials.
2. **No mastery or AIM data.** Seed files must not insert into `aim_sessions`, `practice_attempts`, `progress_snapshots`, `mastery_scores`, or any AIM runtime table.
3. **No learner data.** Seed files must not insert into `student_profiles`, `onboarding_records`, `placement_results`, or any learner delivery table.
4. **Backend remains authority.** Seed data establishes test fixtures only. It does not establish content publishing authority — that remains with backend APIs.
5. **Lesson-skill rule.** Every lesson in seed data must have at least one skill linked in `lesson_skills` before any test attempts to publish it. This validates the Phase 3 P0 rule in the seed layer.

---

## 5. Minimum Viable Seed (MVS) Structure

The MVS must cover one complete hierarchy path from course to lesson with skills linked:

```
Course (draft)
└── Level (draft)
    └── Chapter (draft)
        ├── Lesson A (draft)
        │   └── lesson_skills: [grammar.past_simple.forms, vocabulary.everyday_actions]
        └── Lesson B (draft)
            └── lesson_skills: [grammar.past_simple.negative, vocabulary.everyday_actions]

Skills (published)
├── grammar.past_simple.forms
├── grammar.past_simple.negative
├── grammar.past_simple.questions
└── vocabulary.everyday_actions

Questions (draft)
├── Q1: multiple_choice — past simple affirmative gap fill
└── Q2: true_false — past simple negative rule
```

This MVS is implemented in `03_curriculum_content.sql`.

---

## 6. Running Seed Files

Seed files are plain SQL and must be run in order against the development database:

```bash
# Via psql (development only)
psql $DATABASE_URL -f services/backend-api/prisma/seeds/01_roles_permissions.sql
psql $DATABASE_URL -f services/backend-api/prisma/seeds/02_curriculum_permissions.sql
psql $DATABASE_URL -f services/backend-api/prisma/seeds/03_curriculum_content.sql
```

Or via Supabase SQL editor in the development project.

**Never run seed files against a production or staging database.**

---

## 7. Extending the Seed

When adding new seed content:

1. Decide whether it belongs in an existing seed file (extending `03_curriculum_content.sql`) or a new numbered file.
2. Use the fixed UUID pattern from Section 3.3.
3. Ensure all FK dependencies are seeded in the same file or a prior file.
4. Ensure every seeded lesson has at least one `lesson_skills` row.
5. Verify the file is idempotent by running it twice against a dev database and confirming no errors.
6. Do not seed questions with correctness metadata in this layer — that is managed via the question choices API.

---

## 8. Relationship to Other Phase 3 Documents

| Document | Relationship |
|---|---|
| `curriculum-data-model-map.md` | Source of truth for table schemas this seed populates |
| `lesson-skill-linking-rules.md` | Defines the ≥1 skill rule enforced in seed data |
| `content-status-lifecycle.md` | Defines valid status values used in seed data |
| `curriculum-source-of-truth.md` | Backend authority principle applies to seed conventions |
| `curriculum-import-seed-check.md` | Audit of actual seed state against this strategy |
