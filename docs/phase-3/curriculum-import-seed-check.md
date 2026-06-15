# Curriculum Import and Seed Check

**Task:** P3-061 — Run Curriculum Import and Seed Check
**Date:** 2026-06-15
**Reviewer:** GHOST3030 / ahmedalalawi2022@gmail.com
**Branch:** phase3/P3-061-curriculum-import-seed-check

---

## 1. Purpose

Verify that:
1. The curriculum database schema correctly represents the content hierarchy.
2. The foreign-key chain from `courses` → `lessons` → `lesson_skills` is intact.
3. The skill-linking rule (every lesson must link ≥1 skill before publish) is structurally enforced.
4. Seed data exists and covers the minimum content required for admin and backend validation.
5. No AIM runtime, placement, or learner delivery logic is present in the schema.

---

## 2. Schema Hierarchy Check

### 2.1 Table chain

| Layer | Table | FK | Status |
|---|---|---|---|
| 1 | `courses` | — (root) | ✅ PASS |
| 2 | `levels` | `course_id → courses(id)` | ✅ PASS |
| 3 | `chapters` | `level_id → levels(id)` | ✅ PASS |
| 4 | `lessons` | `chapter_id → chapters(id)` | ✅ PASS |
| 5 | `lesson_skills` | `lesson_id → lessons(id)`, `skill_id → skills(id)` | ✅ PASS |
| 5 | `lesson_objectives` | `lesson_id → lessons(id)`, `objective_id → objectives(id)` | ✅ PASS |
| 5 | `lesson_assets` | `lesson_id → lessons(id)` | ✅ PASS |
| — | `skills` | `parent_skill_id → skills(id)` (self-ref) | ✅ PASS |
| — | `objectives` | — | ✅ PASS |
| — | `questions` | — (question bank; no FK to lessons by design) | ✅ PASS |

**Finding:** FK chain is complete and correct. All referential integrity constraints use `ON DELETE RESTRICT` at lesson layer and `ON DELETE CASCADE` only on linking tables where safe.

### 2.2 Lesson-skill mapping table

```sql
CREATE TABLE IF NOT EXISTS lesson_skills (
  lesson_id  UUID  NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  skill_id   UUID  NOT NULL REFERENCES skills(id)  ON DELETE RESTRICT,
  PRIMARY KEY (lesson_id, skill_id)
);
```

**Finding:** Composite PK prevents duplicate links. `ON DELETE RESTRICT` on `skill_id` prevents skill deletion while in use. `ON DELETE CASCADE` on `lesson_id` correctly removes links when a lesson is deleted. ✅ PASS

### 2.3 Status lifecycle

All content tables (`courses`, `levels`, `chapters`, `lessons`, `skills`, `objectives`, `questions`) include:
- `status TEXT NOT NULL DEFAULT 'draft'`
- `CHECK` constraint covering `('draft', 'in_review', 'approved', 'published', 'archived')`

Questions table uses a 3-state variant: `('draft', 'published', 'archived')`.

**Finding:** Content status lifecycle is consistently enforced at the DB layer. ✅ PASS

---

## 3. Seed Data Check

### 3.1 Current seed files

| File | Content | Assessment |
|---|---|---|
| `database/supabase/seed/seed.sql` | 3 lines, intentionally empty placeholder | ⚠ MINOR |
| `services/backend-api/prisma/seeds/01_roles_permissions.sql` | Phase 2 roles and permissions | ✅ PASS |
| `services/backend-api/prisma/seeds/02_curriculum_permissions.sql` | Curriculum permission keys and role mappings | ✅ PASS |

### 3.2 Missing: MVP curriculum content seed

No seed file exists that inserts actual curriculum content (courses, levels, chapters, lessons, skills, lesson_skills). The original P3-029 task (Add MVP Curriculum Seed) was executed under AgentPrompt #P3-028 and produced the curriculum audit log migration instead.

**Finding:** No curriculum content seed data exists.

**Classification:** MAJOR

**Impact:**
- Admin UI will display empty state on all pages (courses, levels, chapters, lessons, skills, question bank).
- Backend integration tests that depend on seeded content cannot run against a fresh database.
- The lesson-skill linking rule cannot be exercised end-to-end without seed data.

**Required follow-up:** A new task must create a minimal curriculum seed file at `services/backend-api/prisma/seeds/03_curriculum_content.sql` covering:
- ≥1 published skill (e.g. `grammar.past_simple.forms`)
- ≥1 course → level → chapter → lesson chain in `draft` status
- ≥1 `lesson_skills` row linking the lesson to the skill
- ≥1 question in `draft` status

---

## 4. Lesson-Skill Rule Enforcement Check

### 4.1 Database layer

`lesson_skills` table exists with correct schema. No DB-level trigger enforces the "≥1 skill before publish" constraint — this is intentionally enforced at the application layer (backend service).

### 4.2 Backend service layer

`LessonSkillsService` and `LessonsService` reviewed. Publish-blocking logic is expected in the content status workflow service (P3-041). Reviewed `lesson-skills.service.ts`:

- `listSkillsForLesson(lessonId)` — returns all linked skills ✅
- `addSkillToLesson(lessonId, body)` — validates lesson and skill exist before insert ✅
- `removeSkillFromLesson(lessonId, skillId)` — removes link; does NOT block if it's the last skill (intentional: block is in publish workflow) ✅

**Finding:** Skill-link CRUD is correctly implemented. Publish-block enforcement is delegated to the content status workflow — this is the correct design. ✅ PASS

### 4.3 Admin UI layer

`/admin/content/lessons/[lessonId]/skills/page.tsx` (P3-058) shows ⚠ warning when `linkedSkills.length === 0`. It does not block publish (correct: backend does).

**Finding:** UI surfaces the requirement clearly. ✅ PASS

---

## 5. Scope Compliance Check

Reviewed all Phase 3 migrations for out-of-scope tables:

| Table | Scope | Status |
|---|---|---|
| `courses` | Curriculum ✅ | PASS |
| `levels` | Curriculum ✅ | PASS |
| `chapters` | Curriculum ✅ | PASS |
| `lessons` | Curriculum ✅ | PASS |
| `skills` | Curriculum ✅ | PASS |
| `objectives` | Curriculum ✅ | PASS |
| `lesson_assets` | Curriculum ✅ | PASS |
| `lesson_skills` | Curriculum ✅ | PASS |
| `lesson_objectives` | Curriculum ✅ | PASS |
| `questions` | Curriculum ✅ | PASS |
| `curriculum_audit_logs` | Curriculum ✅ | PASS |

No AIM runtime, placement, session, learner delivery, practice attempt, or progress tables found.

**Finding:** All Phase 3 migrations are within scope. ✅ PASS

---

## 6. Secret Scan

No secrets, database credentials, JWT secrets, service-role keys, or AI provider keys found in any seed or migration file reviewed.

**Finding:** ✅ PASS

---

## 7. Summary

| Check | Result | Classification |
|---|---|---|
| FK hierarchy chain | ✅ Complete and correct | PASS |
| Lesson-skill mapping table | ✅ Correct schema and constraints | PASS |
| Content status lifecycle | ✅ Enforced at DB layer for all tables | PASS |
| Permissions seed | ✅ Present and correct | PASS |
| MVP curriculum content seed | ❌ Missing | MAJOR |
| Lesson-skill rule (backend) | ✅ CRUD in place; publish-block in workflow | PASS |
| Lesson-skill rule (admin UI) | ✅ Warning displayed for empty links | PASS |
| Scope compliance | ✅ No out-of-scope tables | PASS |
| Secret scan | ✅ No secrets | PASS |

---

## 8. Required Follow-Up

### MAJOR — Create MVP curriculum content seed

**File:** `services/backend-api/prisma/seeds/03_curriculum_content.sql`

Minimum viable seed must include:

```sql
-- 1. At least one published skill
INSERT INTO skills (id, key, title, domain, status) VALUES
  ('...', 'grammar.past_simple.forms', 'Past Simple Forms', 'grammar', 'published')
ON CONFLICT (key) DO NOTHING;

-- 2. Course → Level → Chapter → Lesson chain (all draft)
-- 3. lesson_skills row linking lesson to the skill above
-- 4. At least one question (draft)
```

This is required before P3-062 (Run Content Status Workflow Check) and P3-063 (Run Phase 3 E2E Content System Check) can produce meaningful results.
