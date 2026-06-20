# Phase 11 — Question Bank Admin API Review

**Task:** P11-031  
**Date:** 2026-06-20  
**Scope:** Verify APIs for question listing, filtering, creation, editing, choices, skills, and validation are safe and sufficient for admin dashboard question bank UI.

---

## 1. Architecture Overview

Question bank endpoints live under `/curriculum/questions` and use **permission-based authorization** (PermissionGuard with `@RequirePermissions()`). No separate admin question controllers exist — the admin dashboard consumes the same curriculum endpoints via permission checks.

**Authentication:** Supabase JWT (`SupabaseJwtAuthGuard`)  
**Authorization:** `PermissionGuard` at class level on all question bank controllers  
**Module:** `QuestionBankModule` (imports `AuthModule`, `DatabaseModule`, `RolesModule`, `UsersModule`)

---

## 2. Endpoint Coverage Matrix

### 2.1 Question CRUD

| Operation | Route | Method | Permission | File |
|---|---|---|---|---|
| List questions | `/curriculum/questions` | GET | `curriculum.content.read.draft` | `question-bank.controller.ts` |
| Get question | `/curriculum/questions/:id` | GET | `curriculum.content.read.draft` | `question-bank.controller.ts` |
| Create question | `/curriculum/questions` | POST | `curriculum.content.update` | `question-bank.controller.ts` |
| Update question | `/curriculum/questions/:id` | PATCH | `curriculum.content.update` | `question-bank.controller.ts` |

### 2.2 Question-Skill Linking

| Operation | Route | Method | Permission | File |
|---|---|---|---|---|
| List skills for question | `/curriculum/questions/:questionId/skills` | GET | `curriculum.content.read.draft` | `question-skills.controller.ts` |
| Link skill to question | `/curriculum/questions/:questionId/skills` | POST | `curriculum.skill_links.manage` | `question-skills.controller.ts` |
| Set primary skill | `/curriculum/questions/:questionId/skills/:skillId/primary` | PUT | `curriculum.skill_links.manage` | `question-skills.controller.ts` |
| Remove skill link | `/curriculum/questions/:questionId/skills/:skillId` | DELETE | `curriculum.skill_links.manage` | `question-skills.controller.ts` |

### 2.3 Publishing & Status Workflow

| Action | Route | Permission |
|---|---|---|
| Publish question | PATCH `/curriculum/workflow/questions/:entityId/publish` | `curriculum.content.publish` |
| Archive question | PATCH `/curriculum/workflow/questions/:entityId/archive` | `curriculum.content.archive` |
| Restore question | PATCH `/curriculum/workflow/questions/:entityId/restore` | `curriculum.content.restore` (SUPER_ADMIN) |

Status flow: `draft` → `published` → `archived` → `draft` (restore requires SUPER_ADMIN).

---

## 3. Listing & Filtering

**Service:** `QuestionBankService.listQuestions()`  
**File:** `question-bank/question-bank.service.ts`

### 3.1 Supported Filters

| Filter | Query Param | Values | Validation |
|---|---|---|---|
| Type | `type` | `multiple_choice`, `multiple_select`, `true_false`, `fill_in_the_blank`, `short_answer`, `ordering`, `matching` | `validateType()` — rejects unknown values with 400 |
| Difficulty | `difficulty` | `beginner`, `elementary`, `intermediate`, `upper_intermediate`, `advanced` | `validateDifficulty()` — rejects unknown values with 400 |
| Status | `status` | `draft`, `published`, `archived` | `validateStatus()` — rejects unknown values with 400 |
| Text search | `q` | free text | ILIKE across `stem`, `explanation`, `hint`, `tags` |

### 3.2 Pagination

- Page/limit from query string, parsed with `parseInt` and fallback defaults
- `DEFAULT_PAGE = 1`, `DEFAULT_LIMIT = 20`, `MAX_LIMIT = 100`
- Limit clamped to `[1, 100]`
- Response: `{ questions: QuestionBankSummary[], total, page, limit }`

### 3.3 Security Notes

- Parameterized SQL (`$1`, `$2`, etc.) — no SQL injection risk
- ILIKE search parameter is parameterized (not interpolated)
- Answer correctness excluded from list response (summary omits `rich_stem`, `explanation`, `hint`)
- All queries use the `question_bank` table directly (no views or joins in list)

**Verdict:** Listing and filtering are safe and sufficient for admin UI.

---

## 4. Question Detail

**Service:** `QuestionBankService.getQuestion()`

- Returns full detail: `id`, `type`, `stem`, `richStem`, `difficulty`, `explanation`, `hint`, `tags`, `status`, `createdBy`, `createdAt`, `updatedAt`
- `ParseUUIDPipe` validates `:id` param format
- Returns 404 if question not found

**Verdict:** Safe. No answer correctness data exposed (choices are a separate entity).

---

## 5. Question Creation

**Service:** `QuestionBankService.createQuestion()`

### 5.1 Validation

| Field | Rule |
|---|---|
| `type` | Required, must be valid `QuestionType` |
| `stem` | Required, non-empty after trim |
| `difficulty` | Required, must be valid `QuestionDifficulty` |
| `richStem` | Optional, object or null |
| `explanation` | Optional, string |
| `hint` | Optional, string |
| `tags` | Optional, string array |

### 5.2 Behavior

- Always creates in `draft` status (hardcoded in SQL)
- `createdBy` set from JWT `req.user.sub` (not client-supplied)
- Returns full question detail after insert

### 5.3 DTO Validation (question.dto.ts)

The `validateCreateQuestionRequest()` function in `dto/question.dto.ts` provides a second validation layer:
- Rejects client-writable `status` field (`rejectClientWritableStatus`)
- Validates type, stem, difficulty with specific error codes
- Validates optional fields (explanation, hint, tags, richStem)

**Verdict:** Safe. Status is server-controlled. Author identity from JWT.

---

## 6. Question Editing

**Service:** `QuestionBankService.updateQuestion()`

### 6.1 Validation

| Rule | Detail |
|---|---|
| Draft-only editing | Returns 403 FORBIDDEN if question status ≠ `draft` |
| Stem validation | Cannot be set to empty string |
| Difficulty validation | Must be valid `QuestionDifficulty` if provided |
| Type immutability | Not accepted by update endpoint (type is creation-only) |
| Status immutability | `rejectClientWritableStatus` in DTO layer rejects client status changes |
| No-op safety | Returns existing question if no fields changed |

### 6.2 Update Mechanism

- Dynamic SET clause construction with parameterized values
- Only provided fields are updated
- Returns full question detail after update

### 6.3 DTO Validation (question.dto.ts)

The `validateUpdateQuestionRequest()` function enforces:
- `type` field rejected with `QUESTION_TYPE_IMMUTABLE` error
- `status` field rejected via `rejectClientWritableStatus`

**Verdict:** Safe. Draft-only guard prevents editing published/archived questions. Type and status immutable on update.

---

## 7. Question-Skill Linking

**Service:** `QuestionSkillsService`  
**File:** `question-skills/question-skills.service.ts`

### 7.1 Operations

| Operation | Validation | Transaction |
|---|---|---|
| List skills | Asserts question exists | No |
| Add skill | Asserts question + skill exist, rejects duplicates (409) | Yes — unsets previous primary if `isPrimary=true` |
| Set primary | Asserts question exists + link exists | Yes — unsets previous primary, sets new |
| Remove skill | Asserts question exists, returns 404 if link missing | No |

### 7.2 Safety

- `hasPublishedPrimarySkill()` — used by publish validation to enforce "question must have a published primary skill" rule
- Primary skill constraint: exactly one `is_primary=true` per question, enforced by transaction
- All IDs validated with `ParseUUIDPipe`

**Verdict:** Safe. Proper transaction handling for primary skill updates. Duplicate prevention.

---

## 8. Answer Choices

### 8.1 Validation (question.dto.ts)

The DTO layer defines choice validation:

| Operation | Validation |
|---|---|
| Create choice | Requires `questionId` (UUID), `text` (non-empty), `isCorrect` (boolean), `order` (positive integer) |
| Update choice | Rejects `questionId` changes (immutable), validates all optional fields |
| Choice set validation | Per-type rules: `multiple_choice` requires exactly 1 correct, `multiple_select` requires ≥1 correct, `true_false` requires exactly 2 choices with 1 correct |

### 8.2 Gap: No Dedicated Choice Controller

**Finding:** There is no `question-choices.controller.ts` in the codebase. The DTO validation functions (`validateCreateQuestionChoiceRequest`, `validateUpdateQuestionChoiceRequest`, `validateQuestionChoiceSet`) exist in `dto/question.dto.ts`, but no REST endpoint exposes choice CRUD operations.

**Impact on Admin UI:**
- Admin UI cannot create, update, or delete individual answer choices via API
- Choice management may be handled inline within question creation/update (embedded in the question payload) or may require a future endpoint
- The `question_choices` table exists (referenced in `publish-validation.service.ts` SQL), but no controller exposes it

**Recommendation:** A dedicated choice management API (`/curriculum/questions/:questionId/choices`) should be added before the admin UI can fully manage answer choices. This is out of scope for P11-031 but should be noted for downstream tasks.

---

## 9. Permission Guard Coverage

### 9.1 Controller-Level Guards

All three controllers apply guards at class level:

```typescript
@UseGuards(SupabaseJwtAuthGuard, PermissionGuard)
```

| Controller | File | Guards |
|---|---|---|
| `QuestionBankController` | `question-bank.controller.ts` | SupabaseJwtAuthGuard, PermissionGuard |
| `QuestionSkillsController` | `question-skills.controller.ts` | SupabaseJwtAuthGuard, PermissionGuard |
| `ContentStatusWorkflowController` | `content-status-workflow.controller.ts` | SupabaseJwtAuthGuard, PermissionGuard |

### 9.2 Method-Level Permissions

| Endpoint | Permission |
|---|---|
| List/read questions | `curriculum.content.read.draft` |
| Create/update questions | `curriculum.content.update` |
| List question skills | `curriculum.content.read.draft` |
| Add/set/remove question skills | `curriculum.skill_links.manage` |
| Publish | `curriculum.content.publish` |
| Archive | `curriculum.content.archive` |
| Restore | `curriculum.content.restore` |

### 9.3 Test Coverage

`question-bank.controller.spec.ts` verifies:
- Class-level guards (SupabaseJwtAuthGuard, PermissionGuard) are applied
- `listQuestions` requires `CONTENT_READ_DRAFT`
- `createQuestion` requires `CONTENT_UPDATE`

**Verdict:** All endpoints are properly guarded. No unauthenticated or unpermissioned access possible.

---

## 10. API Contract Alignment

Comparing implementation against `docs/phase-11/admin-api-contract-map.md` Section 6:

| Contract Spec | Implementation | Status |
|---|---|---|
| GET `/curriculum/questions` with pagination + filters | Implemented with `type`, `difficulty`, `status`, `q`, `page`, `limit` | **Match** |
| GET `/curriculum/questions/:id` | Implemented | **Match** |
| POST `/curriculum/questions` | Implemented, creates in draft | **Match** |
| PATCH `/curriculum/questions/:id` | Implemented, draft-only | **Match** |
| PATCH `/curriculum/question-skills/:questionId` (contract) | Implemented as nested resource: POST/PUT/DELETE `/curriculum/questions/:questionId/skills` | **Route differs** — contract shows flat route, implementation uses nested RESTful pattern. Admin UI should use the nested pattern. |
| PATCH `/curriculum/workflow/questions/:id/publish` | Implemented via generic workflow controller | **Match** |

**Note:** The contract map specifies `skillId` as a filter param on question listing. The implementation does not support `skillId` filtering. Admin UI would need to use the question-skills endpoint to find questions by skill, or a `skillId` filter would need to be added to `listQuestions`.

---

## 11. Data Types Summary

### 11.1 QuestionBankSummary (list response)

```typescript
{
  id: string;
  type: QuestionType;        // 7 types
  stem: string;
  difficulty: QuestionDifficulty;  // 5 levels
  tags: string[];
  status: QuestionStatus;    // draft | published | archived
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### 11.2 QuestionBankDetail (single response)

Extends summary with: `richStem`, `explanation`, `hint`.

### 11.3 QuestionSkillLink

```typescript
{
  questionId: string;
  skillId: string;
  isPrimary: boolean;
  createdAt: string;
}
```

---

## 12. Findings Summary

### 12.1 Safe for Admin UI

| Area | Verdict |
|---|---|
| Authentication | All endpoints behind SupabaseJwtAuthGuard |
| Authorization | Permission-based guards on every method |
| Input validation | Type/difficulty/status validated server-side, parameterized SQL |
| Status control | Server-controlled (draft on create, draft-only updates, workflow for transitions) |
| Identity | `createdBy` from JWT, not client input |
| SQL injection | All queries parameterized |
| Data exposure | Answer correctness not exposed in list; choices not exposed in question endpoints |

### 12.2 Gaps and Recommendations

| # | Gap | Severity | Impact on Admin UI |
|---|---|---|---|
| 1 | No choice management API (controller missing) | Medium | Admin cannot manage answer choices per question. Validation DTOs exist but no REST endpoint. |
| 2 | No `skillId` filter on question listing | Low | Admin cannot filter questions by linked skill directly. Must use question-skills endpoint separately. |
| 3 | Contract route mismatch for question-skills | Info | Contract says `PATCH /curriculum/question-skills/:questionId`, implementation uses nested `POST/PUT/DELETE /curriculum/questions/:questionId/skills`. Admin UI should follow implementation. |

### 12.3 No Admin Authority Violations

- Backend controls all status transitions
- Backend controls question creation identity
- Backend enforces publish prerequisites (published primary skill required)
- No scoring, grading, or correctness calculation exposed to admin
- Admin UI can safely consume these APIs for read and CRUD operations

---

## 13. Conclusion

The existing question bank APIs are **safe and sufficient** for building the admin question bank list UI (P11-032) and basic question management. All endpoints are properly guarded with authentication and permission checks. Input validation is thorough with parameterized SQL.

The main gap is the missing answer choice management controller — the DTO validation layer is ready, but no REST endpoint exists. This does not block the question bank list UI but will be needed for full question editing capabilities in future tasks.

Admin UI should:
- Use `/curriculum/questions` for listing with filters
- Use `/curriculum/questions/:id` for detail views
- Use `/curriculum/questions/:questionId/skills` for skill linking (not the contract map route)
- Use `/curriculum/workflow/questions/:id/publish|archive|restore` for status transitions
- Never calculate correctness, scoring, or assessment results client-side
