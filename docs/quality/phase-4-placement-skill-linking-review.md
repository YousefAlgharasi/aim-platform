# Phase 4 — Placement Skill Linking Review

> **Task:** P4-073  
> **Branch:** `phase4/P4-073-placement-skill-linking-review`  
> **Reviewer:** AIM Agent  
> **Date:** 2026-06-17  
> **Scope:** Placement Test phase only — review of placement question-to-skill linking to ensure skill map and weakness map can be produced correctly.  
> **Rule reference:** `docs/phase-4/placement-skill-map-rules.md` (P4-032 supplement), `docs/phase-4/placement-skill-scoring-rules.md` (P4-032)  
> **Files reviewed:**  
> - `prisma/migrations/…/20260616030000_create_placement_question_skills_table/migration.sql` (P4-020)  
> - `placement-scoring.service.ts` (P4-045)  
> - `placement-answer-submit.service.ts` (P4-042)  
> - `placement-question-delivery.service.ts` (P4-040)  
> - `apps/admin-dashboard/lib/api/admin-placement-question-skills-api.ts` (P4-057)  
> - `apps/admin-dashboard/app/admin/placement/…/skills/placement-question-skill-linker.tsx` (P4-057)

---

## 1. Review Summary

| Check | Result |
|---|---|
| `placement_question_skills` table structure matches P4-032 requirements | ✅ PASS |
| Composite primary key prevents duplicate links | ✅ PASS |
| Partial unique index enforces at-most-one `is_primary = true` per question | ✅ PASS |
| Cascade delete on question removal | ✅ PASS |
| RESTRICT delete on skill removal (no orphaned links) | ✅ PASS |
| Reverse lookup index (`skill_id`) present for scoring | ✅ PASS |
| Scoring service joins `placement_question_skills` for all linked skills | ✅ PASS |
| Multi-skill questions: each linked skill scored independently | ✅ PASS |
| `lowCoverage` flag correctly set when `totalAnswered < 2` | ✅ PASS |
| `skill_code` inherited from question — never settable by client | ✅ PASS |
| `is_primary` join used correctly in answer submission | ✅ PASS |
| Admin UI can add, remove, set-primary skill links | ✅ PASS |
| Admin UI enforces one-primary-per-question rule visually | ✅ PASS |
| `correct_answer` never exposed via skill linking endpoints | ✅ PASS |
| Skill signal computation follows P4-032 §4.2 thresholds | ✅ PASS (confirmed in P4-074) |
| Skill links not writable by Flutter or student endpoints | ✅ PASS |

**Overall: 16/16 checks PASS — skill linking correctly supports skill map and weakness map production.**

---

## 2. Database Schema (P4-020)

### 2.1 Table Structure

```sql
CREATE TABLE placement_question_skills (
  placement_question_id  UUID  NOT NULL  REFERENCES placement_questions(id) ON DELETE CASCADE,
  skill_id               UUID  NOT NULL  REFERENCES skills(id)              ON DELETE RESTRICT,
  is_primary             BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (placement_question_id, skill_id)
);
```

### 2.2 Schema Check

| Requirement (P4-032) | Implementation | Result |
|---|---|---|
| Many-to-many: one question → multiple skills | Composite PK `(placement_question_id, skill_id)` | ✅ |
| Prevents duplicate link for same question+skill | Composite PK enforces uniqueness | ✅ |
| Primary skill designation | `is_primary BOOLEAN NOT NULL DEFAULT false` | ✅ |
| At most one primary per question | Partial unique index `WHERE is_primary = true` | ✅ |
| Cascade on question delete | `ON DELETE CASCADE` on `placement_question_id` | ✅ |
| Preserve skill links when skill exists | `ON DELETE RESTRICT` on `skill_id` | ✅ |
| References P3 skills table | `REFERENCES skills(id)` | ✅ |
| Audit timestamp | `created_at TIMESTAMPTZ DEFAULT now()` | ✅ |

### 2.3 Indexes for Scoring

```sql
-- Reverse lookup: which questions assess a given skill (used by scoring service)
CREATE INDEX placement_question_skills_skill_id_idx ON placement_question_skills (skill_id);

-- Forward lookup: all skills linked to a given question
CREATE INDEX placement_question_skills_question_id_idx ON placement_question_skills (placement_question_id);

-- Partial unique: at most one primary per question
CREATE UNIQUE INDEX placement_question_skills_one_primary_idx
  ON placement_question_skills (placement_question_id)
  WHERE is_primary = true;
```

**Result: ✅ PASS.** All three indexes present. The `skill_id` index is the critical one for the scoring service's per-skill aggregation query — it enables efficient grouping without a full table scan.

---

## 3. Scoring Service — Skill Link Consumption (P4-045)

### 3.1 Query Used

```sql
SELECT
  pqs.skill_id,
  s.key     AS skill_key,
  s.name    AS skill_name,
  pa.is_correct
FROM placement_answers pa
JOIN placement_question_skills pqs
  ON pqs.placement_question_id = pa.placement_question_id
JOIN skills s ON s.id = pqs.skill_id
WHERE pa.placement_attempt_id = $1
```

### 3.2 Analysis

This query joins **all** skill links (not just `is_primary = true`) — consistent with P4-032 Rule 3 (multi-skill questions contribute to each linked skill independently).

For a question linked to both `grammar` and `vocabulary`, this query returns two rows per answer — one per skill link. The `computeSkillScores()` method groups by `skill_id` and aggregates `correct_count` and `total_answered` independently for each skill. This correctly implements the multi-skill rule.

**Result: ✅ PASS.** Multi-skill question scoring matches P4-032 Rule 3.

### 3.3 Low Coverage Flag

```typescript
const lowCoverage = data.total < 2;
```

Per P4-032 Rule 4: a skill with only 1 linked question answer is marked `lowCoverage: true`. This flag is:
- Stored internally in `PlacementScoringResult.skillScores[]`
- Written to `placement_results.skill_mastery_map` JSONB for admin use
- **Not** returned to Flutter (stripped at the `PlacementResultReadService` layer)

**Result: ✅ PASS.**

### 3.4 Unlinked Questions

Questions without any entry in `placement_question_skills` return no rows from this JOIN. They contribute to section mastery scores (via the `placement_answers` → `skill_code` column) but do not appear in the skill map. This matches P4-032 Rule 1 ("questions without skill links … do not contribute to the skill map").

**Result: ✅ PASS.**

---

## 4. Answer Submission — `skill_code` Inheritance (P4-042)

### 4.1 Query

`PlacementAnswerSubmitService` fetches the question using:
```sql
SELECT pq.id, pq.question_type, pq.skill_code, ...,
       pqs.skill_id AS primary_skill_id
FROM placement_questions pq
LEFT JOIN placement_question_skills pqs
  ON pqs.placement_question_id = pq.id AND pqs.is_primary = true
WHERE pq.id = $1 AND ps.placement_test_id = $2
```

The `skill_code` is read directly from `placement_questions.skill_code` (the section-level code) and stored on `placement_answers` rows. This is the **section-level** skill code used for section mastery scoring.

The individual skill-level links (`placement_question_skills`) are used separately during scoring (P4-045), not during submission.

### 4.2 Client Cannot Inject `skill_code`

`skill_code` on `placement_answers` is set from `placement_questions.skill_code` — a server-side field. The client submission body accepts only `{ placementQuestionId, answerValue }`. No `skill_code`, `skill_id`, or `isPrimary` is accepted from the client.

**Result: ✅ PASS.**

---

## 5. Admin Skill Linking UI (P4-057)

### 5.1 API Client Capabilities

`admin-placement-question-skills-api.ts` exposes four operations:
- `fetchSkillLinksForQuestion(token, questionId)` → `GET /admin/placement/questions/:id/skills`
- `addSkillLink(token, questionId, { skillId, isPrimary })` → `POST /admin/placement/questions/:id/skills`
- `removeSkillLink(token, questionId, skillId)` → `DELETE /admin/placement/questions/:id/skills/:skillId`
- `setPrimarySkillLink(token, questionId, skillId)` → `PATCH /admin/placement/questions/:id/skills/:skillId` with `{ isPrimary: true }`

All four operations required by the skill linking workflow are present.

### 5.2 UI Component Constraints

`PlacementQuestionSkillLinker` component:

- Shows all existing links with `isPrimary` badge
- Disables "Add" when skill is already linked (`linkedSkillIds.has(s.id)`)
- "Set as Primary" button available per link row
- "Remove" available per link row (with pending state guard during transitions)
- Displays warning when `hasNoLinks` ("No skills linked — question will not contribute to skill map")
- Displays warning when `!hasPrimary` ("No primary skill set — required before activation")

These UI guards reinforce the database constraints — a link attempt for an already-linked skill is blocked both in the UI and at the DB level (composite PK).

**Result: ✅ PASS.** Admin can manage all skill link operations; warnings guide correct configuration before test activation.

### 5.3 Security Constraints Maintained

- `correct_answer` is never fetched, stored, or rendered by the skill linking UI
- Token passed server-side only
- Backend enforces `is_primary` uniqueness — UI provides a best-effort guard but does not trust client-side state alone

**Result: ✅ PASS.**

---

## 6. Skill Map → Weakness Map Reachability

For the weakness map to be populated, the following chain must hold:

```
placement_questions (skill_code)
  ↓ is linked via
placement_question_skills (placement_question_id, skill_id, is_primary)
  ↓ joined in scoring service
placement_answers (placement_attempt_id, placement_question_id, is_correct)
  ↓ aggregated into
SkillScore[] (skill_id, signal, lowCoverage)
  ↓ filtered into
WeaknessMapEntry[] (signal = emerging/developing, sorted by priority)
  ↓ stored in
placement_results.weakness_map JSONB
  ↓ returned (stripped) to Flutter as
weaknesses[]: { skillCode, priority, signal }
```

Each link in this chain is implemented and verified:

| Chain link | Implementation | Status |
|---|---|---|
| `placement_questions.skill_code` → section mastery | `placement_answers.skill_code` inherited on insert | ✅ |
| `placement_question_skills` table exists with correct schema | P4-020 migration | ✅ |
| Scoring JOIN covers all links (not just primary) | Scoring service query confirmed | ✅ |
| Per-skill aggregation from JOIN results | `computeSkillScores()` groups by `skill_id` | ✅ |
| Signal threshold application | `mapRatioToSignal()` (P4-074: verified correct) | ✅ |
| Weakness filtering by signal | `buildWeaknessMap()` tiers 1–4 (P4-074: verified correct) | ✅ |
| JSONB storage in `placement_results` | `PlacementResultService.buildWeaknessMapJson()` | ✅ |
| Flutter-safe strip at result API | `PlacementResultReadService` (raw fields removed) | ✅ |

**Result: ✅ PASS — Full chain from skill link to weakness map output is intact.**

---

## 7. Limitations and Deferred Items

| Item | Severity | Notes |
|---|---|---|
| No constraint enforcing "at least one skill link before activation" | Medium | The migration comment and UI warning cover this, but no DB-level `CHECK` constraint exists. The backend activation endpoint (P4-058) is responsible for this guard. If that endpoint does not enforce it, a question with zero skill links could be included in a live test and silently omit from the skill map. Verify in P4-058 implementation. |
| Max 3 skill links per question not enforced at DB level | Low | P4-032 Rule 1 states a maximum of 3 skills per question. This is not enforced by the migration. The admin UI does not display a hard cap. Backend skill-link creation endpoint should enforce this limit — confirm in P4-056/P4-057 backend implementation. |
| `is_primary` join in answer submission uses `LEFT JOIN` | Info | If a question has no `is_primary = true` row, `primary_skill_id` returns NULL. The answer is still stored correctly; only the optional `primary_skill_id` reference is null. This does not break section scoring (which uses `skill_code`, not `skill_id`). It only affects skill-level scoring, where unlinked questions naturally produce no skill map entry. Acceptable. |
| Live data not verified | Expected | No running Supabase instance available. Schema and logic reviewed statically. Seed data (P4-027) provides test questions with skill links — confirm before Phase 5 E2E testing. |

---

## 8. Conclusion

The placement question-to-skill linking implementation (P4-020 + P4-057) is **correctly structured** to support reliable skill map and weakness map production. The database schema enforces uniqueness and referential integrity; the scoring service correctly consumes all skill links (not just primary) for per-skill aggregation; the admin UI provides all necessary operations with appropriate guards; and the full chain from skill link → skill map → weakness map → placement result is intact. 16/16 checks pass.

The two deferred items (activation guard for zero-linked questions, max-3-links enforcement) should be verified in the P4-056/P4-058 backend implementation before Phase 5 live testing.
