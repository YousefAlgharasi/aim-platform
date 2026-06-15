# Question Bank Skill Coverage Check

> Phase 3 — P3-064
> Scope: Curriculum & Content System only.
> Date: 2026-06-15
> Branch: phase3/P3-064-question-bank-skill-coverage-check
> Dependencies verified: P3-041, P3-042, P3-059

---

## 1. Purpose

Verify that the question bank infrastructure supports skill linking, that no practice or session logic has been introduced, and that the system is safe for future learner-facing use.

Findings are classified as:

| Class | Meaning |
|---|---|
| PASS | Requirement satisfied with no action needed |
| MINOR | Small gap or inconsistency; does not block Phase 3 completion |
| MAJOR | Gap that must be resolved before Phase 3 closes |
| CRITICAL | Blocking issue; violates a Phase 3 non-negotiable |

---

## 2. Files Inspected

| File | Task | Description |
|---|---|---|
| `services/backend-api/prisma/migrations/20260614160000_create_question_skills_table/migration.sql` | P3-027 | `question_skills` table DDL |
| `services/backend-api/src/features/curriculum/question-skills/question-skills.types.ts` | P3-042 | Question-skill mapping types |
| `services/backend-api/src/features/curriculum/question-skills/question-skills.service.ts` | P3-042 | Question-skill service |
| `services/backend-api/src/features/curriculum/question-skills/question-skills.controller.ts` | P3-042 | Question-skill controller |
| `services/backend-api/src/features/curriculum/question-bank/question-bank.service.ts` | P3-041 | Question bank CRUD service |
| `apps/admin-dashboard/app/admin/content/question-bank/page.tsx` | P3-059 | Admin question bank UI |
| `packages/shared-contracts/api/question-bank-contracts.md` | P3-014 | Question bank contract |

---

## 3. Findings

### 3.1 question_skills Table Schema

**Finding:** `question_skills(question_id, skill_id, is_primary, created_at)` exists on main with:
- `PRIMARY KEY (question_id, skill_id)` — prevents duplicate links
- `UNIQUE INDEX question_skills_one_primary_idx ON question_skills(question_id) WHERE is_primary = true` — enforces at most one primary skill per question at the database level
- `ON DELETE CASCADE` on `question_id` — links removed when question is deleted
- `ON DELETE RESTRICT` on `skill_id` — prevents deleting a skill still linked to questions
- Index `question_skills_skill_id_idx` — supports reverse lookups (which questions assess a given skill)

**Classification: PASS**

### 3.2 Skill Linking API (QuestionSkillsService)

**Finding:** The following operations are implemented and verified:

| Method | Route | Permission | Status |
|---|---|---|---|
| `listSkillsForQuestion` | `GET /curriculum/questions/:id/skills` | `CONTENT_READ_DRAFT` | PASS |
| `addSkillToQuestion` | `POST /curriculum/questions/:id/skills` | `SKILL_LINKS_MANAGE` | PASS |
| `setPrimarySkill` | `PUT /curriculum/questions/:id/skills/:skillId/primary` | `SKILL_LINKS_MANAGE` | PASS |
| `removeSkillFromQuestion` | `DELETE /curriculum/questions/:id/skills/:skillId` | `SKILL_LINKS_MANAGE` | PASS |

`setPrimarySkill` uses a database transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) to atomically unset the prior primary before setting the new one. Correct per P3-014 Section 7.2.

**Classification: PASS**

### 3.3 Publish Gate Check

**Finding:** `hasPublishedPrimarySkill(questionId)` is implemented in `QuestionSkillsService`. It queries:

```sql
SELECT COUNT(*) FROM question_skills qs
JOIN skills s ON s.id = qs.skill_id
WHERE qs.question_id = $1
  AND qs.is_primary = true
  AND s.status = 'published'
```

Returns `boolean`. This method is available for wiring into the publish workflow endpoint (P3-044/P3-043). It correctly checks that the primary skill is itself published — not just that any skill is linked.

**Classification: PASS**

### 3.4 Question Bank Service — Status Ownership

**Finding:** In `QuestionBankService`:
- `createQuestion` hardcodes `status = 'draft'` — status is never client-settable on create
- `updateQuestion` rejects any question that is not in `draft` status (`'Only draft questions can be updated'`)
- No `status` field is accepted in `UpdateQuestionInput`

Status transitions (publish, archive, restore) are exclusively owned by the backend workflow endpoints (P3-043). No client can bypass this.

**Classification: PASS**

### 3.5 Scope Isolation — No Practice or Session Logic

**Finding:** All inspected files were checked for the following out-of-scope patterns:

- Practice attempts: not present
- Learning sessions: not present
- AIM runtime integration: not present
- Placement execution: not present
- Learner delivery: not present
- Review / retention: not present
- Progress reports: not present
- AI Teacher: not present
- Student Web App: not present

The admin question bank UI (`page.tsx`) explicitly notes in a comment block:
> "This page does NOT implement learner practice, sessions, or AIM runtime."

And in the rendered boundary note:
> "Question status (publish, archive), answer correctness, and skill mapping are controlled by backend APIs only. This UI does not implement learner practice or AIM session logic."

**Classification: PASS**

### 3.6 Secret and Credential Scan

**Finding:** No secrets, service-role keys, database credentials, JWT secrets, or AI provider keys were found in any inspected file. Auth token in the admin UI is read server-side from an HTTP-only cookie and never returned to the browser.

**Classification: PASS**

### 3.7 Admin Question-Skill Linking UI (P3-060)

**Finding:** The admin question bank page (`P3-059`) references skill mapping as a "separate dedicated UI (P3-060)". P3-060 is not yet complete. Currently, question-skill linking can only be done via the backend API directly (`POST /curriculum/questions/:id/skills`). Content managers using the admin dashboard cannot yet link skills to questions through a UI.

This does not break backend correctness or the skill coverage check — the API is fully functional. However, admin workflow is incomplete.

**Classification: MINOR** — Required follow-up: Complete P3-060 (Admin Question-Skill Linking UI).

### 3.8 `is_correct` Exposure Risk

**Finding:** The `question_choices` table has an `is_correct` column (set in `question-bank` migration). The question bank contract (P3-014) states:
> "`is_correct` must never be exposed to learner-facing clients during active sessions."

The current `QuestionBankService` does not return `is_correct` in its list/get responses (it does not join `question_choices`). No learner-facing endpoint exists. Risk is currently contained.

**Classification: PASS** (contained) — Noted for Phase 4 API design: any learner-facing question endpoint must exclude `is_correct` and `question_choices.is_correct`.

### 3.9 Skill Identifier Discipline

**Finding:** All skill references in `question_skills` use `skill_id` (UUID), not display labels. The skills table stores stable `key` values (e.g. `grammar.past_simple.forms`). The `question_bank_contracts.md` (P3-014) specifies skill mapping by UUID reference with stable key as the human-readable identifier. No display label is used as a primary identifier anywhere in the inspected code.

**Classification: PASS**

---

## 4. Summary

| # | Area | Finding | Classification |
|---|---|---|---|
| 1 | `question_skills` table schema | Correct schema, indexes, constraints | PASS |
| 2 | Skill linking API | All CRUD + primary-set endpoints present and guarded | PASS |
| 3 | Publish gate | `hasPublishedPrimarySkill()` implemented correctly | PASS |
| 4 | Status ownership | Status is backend-owned; no client bypass possible | PASS |
| 5 | Scope isolation | Zero practice/session/AIM runtime code in inspected files | PASS |
| 6 | Secret scan | No credentials or keys present | PASS |
| 7 | Admin skill linking UI | P3-060 not yet complete; API works, UI absent | MINOR |
| 8 | `is_correct` exposure | Not exposed; risk noted for Phase 4 | PASS |
| 9 | Skill identifier discipline | UUID + stable key used throughout; no display labels | PASS |

**Overall status: PASS with 1 MINOR finding.**

---

## 5. Required Follow-up

| Priority | Item | Owner |
|---|---|---|
| P2 | Complete P3-060 (Admin Question-Skill Linking UI) | Next sprint |
| P3 | Phase 4 API design must exclude `is_correct` from all learner-facing question responses | Phase 4 planning |

---

## 6. Conclusion

The question bank skill coverage infrastructure is complete and correct at the backend level. Questions can be linked to one or more skills, with exactly one primary skill enforced at both the database (partial unique index) and application (`setPrimarySkill` transaction) layers. No practice, session, or AIM runtime logic has been introduced. The system is safe for future learner-facing use once P3-060 and the publish validation workflow (P3-044) are complete.
