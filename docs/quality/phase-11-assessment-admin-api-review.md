# Phase 11 — Assessment Admin API Review

**Task:** P11-037  
**Goal:** Verify Phase 10 APIs support admin assessment management or identify missing endpoints.  
**Date:** 2026-06-20  
**Reviewer:** GHOST3030

---

## 1. Executive Summary

Phase 10 delivered a **student-facing assessment system** (quizzes and exams) with grading, deadlines, feedback, and audit logging. However, **no admin management endpoints exist** for assessments. Admin permissions are not defined for assessments (unlike placement, which has `ADMIN_PLACEMENT_PERMISSIONS`). Building the admin quizzes/exams UI will require new backend controllers, services, and permission constants.

The placement system (Phase 4) is more mature: admin permissions are defined (`placement.permissions.ts`) but admin controllers are also absent.

---

## 2. Existing Assessment Infrastructure

### 2.1 Student-Facing Controller

**File:** `services/backend-api/src/features/assessments/assessment.controller.ts`  
**Base path:** `/student/assessments`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/student/assessments` | List published assessments |
| GET | `/student/assessments/deadlines` | Student's deadlines grouped by status |
| GET | `/student/assessments/:id` | Assessment detail with deadline state |
| GET | `/student/assessments/:id/history` | Result history for an assessment |
| POST | `/student/assessments/:id/attempts` | Start an attempt |
| GET | `/student/assessments/attempts/:attemptId/resume` | Resume active attempt |
| POST | `/student/assessments/attempts/:attemptId/submit` | Submit attempt & trigger grading |
| GET | `/student/assessments/attempts/:attemptId/result` | Get backend-approved result |

### 2.2 Services

| Service | Purpose |
|---------|---------|
| `assessment.service.ts` | List/detail/deadline enrichment for students |
| `assessment-attempt.service.ts` | Start/resume/expire attempt lifecycle |
| `assessment-deadline.service.ts` | Backend deadline status computation |
| `assessment-grading.service.ts` | Grade submitted attempts, compute correctness |
| `assessment-score-policy.service.ts` | Section weighting and pass threshold |
| `assessment-submission-flow.service.ts` | Submit → grade → persist pipeline |
| `assessment-result.service.ts` | Persist results & result history |
| `assessment-feedback.service.ts` | Feedback gated by feedback_policy |
| `question-delivery.service.ts` | Deliver questions stripped of grading metadata |
| `answer-submission.service.ts` | Answer persistence without correctness |
| `assessment-audit.service.ts` | Audit logging |

### 2.3 Security Guards

| Guard | Purpose |
|-------|---------|
| `AssessmentPermissionGuard` | Role enforcement (STUDENT, ADMIN, SUPER_ADMIN) |
| `AssessmentAttemptOwnershipGuard` | Verify student owns the attempt |
| `AssessmentResultOwnershipGuard` | Verify student owns the result |

### 2.4 Data Model (from types)

| Type | Values |
|------|--------|
| `AssessmentType` | `quiz`, `exam` |
| `AssessmentStatus` | `draft`, `published`, `archived` |
| `AttemptStatus` | `started`, `in_progress`, `submitted`, `graded`, `expired` |
| `DeadlineStatus` | `upcoming`, `open`, `closed`, `missed`, `late`, `extended`, `expired` |
| `FeedbackPolicy` | `none`, `after_submission`, `after_deadline`, `after_review` |

### 2.5 Key DB Tables

- `assessments` — Core assessment entity (id, type, title, description, status, created_by)
- `assessment_sections` — Sections with ordering and weight (backend scoring)
- `assessment_question_links` — Links questions to assessments/sections with points and ordering
- `assessment_settings` — Settings per assessment (deadlines, time limits, attempt limits)
- `assessment_attempts` — Student attempt tracking
- `assessment_attempt_answers` — Individual answers per attempt
- `assessment_results` — Graded results with scores
- `assessment_result_breakdowns` — Per-section score breakdowns
- `assessment_audit_logs` — Audit trail

---

## 3. Existing Placement Admin Infrastructure

### 3.1 Admin Permissions Defined (No Controller)

**File:** `services/backend-api/src/features/placement/placement.permissions.ts`

| Permission Constant | String Value |
|---------------------|-------------|
| `PLACEMENT_ADMIN_TESTS_READ` | `placement:admin:tests:read` |
| `PLACEMENT_ADMIN_TEST_CREATE` | `placement:admin:test:create` |
| `PLACEMENT_ADMIN_TEST_UPDATE` | `placement:admin:test:update` |
| `PLACEMENT_ADMIN_TEST_PUBLISH` | `placement:admin:test:publish` |
| `PLACEMENT_ADMIN_SECTIONS_MANAGE` | `placement:admin:sections:manage` |
| `PLACEMENT_ADMIN_QUESTIONS_MANAGE` | `placement:admin:questions:manage` |
| `PLACEMENT_ADMIN_SKILL_LINKS_MANAGE` | `placement:admin:skill-links:manage` |
| `PLACEMENT_ADMIN_RESULTS_READ` | `placement:admin:results:read` |

### 3.2 Placement Student Controller

**File:** `services/backend-api/src/features/placement/placement.controller.ts`  
**Base path:** `/placement`

7 student-facing endpoints (active test, attempts, sections, questions, answers, complete, result). No admin endpoints.

---

## 4. Gap Analysis — Missing Admin APIs

### 4.1 Assessment Admin APIs (Required)

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/admin/assessments` | GET | List all assessments (draft, published, archived) | P0 |
| `/admin/assessments` | POST | Create new assessment (quiz or exam) | P0 |
| `/admin/assessments/:id` | GET | Get assessment detail with sections/settings | P0 |
| `/admin/assessments/:id` | PATCH | Update assessment metadata | P0 |
| `/admin/assessments/:id/sections` | GET | List sections for an assessment | P0 |
| `/admin/assessments/:id/sections` | POST | Add section to assessment | P0 |
| `/admin/assessments/:id/sections/:sectionId` | PATCH | Update section (title, order, weight) | P0 |
| `/admin/assessments/:id/sections/:sectionId` | DELETE | Remove section | P1 |
| `/admin/assessments/:id/questions` | GET | List linked questions with section/order/points | P0 |
| `/admin/assessments/:id/questions` | POST | Link question to assessment | P0 |
| `/admin/assessments/:id/questions/:linkId` | PATCH | Update question link (order, points, section) | P1 |
| `/admin/assessments/:id/questions/:linkId` | DELETE | Unlink question from assessment | P1 |
| `/admin/assessments/:id/settings` | GET | Get assessment settings (deadlines, limits) | P0 |
| `/admin/assessments/:id/settings` | PUT | Update assessment settings | P0 |
| `/admin/assessments/:id/publish` | POST | Publish assessment (via content-status-workflow) | P0 |
| `/admin/assessments/:id/archive` | POST | Archive assessment | P1 |
| `/admin/assessments/:id/restore` | POST | Restore archived assessment to draft | P1 |
| `/admin/assessments/:id/results` | GET | List all student results for an assessment | P1 |

### 4.2 Assessment Admin Permissions (Required)

No assessment admin permissions exist. Needed:

```typescript
// Recommended permission constants (assessment-admin.permissions.ts)
export const ASSESSMENT_ADMIN_READ       = 'assessment:admin:read';
export const ASSESSMENT_ADMIN_CREATE     = 'assessment:admin:create';
export const ASSESSMENT_ADMIN_UPDATE     = 'assessment:admin:update';
export const ASSESSMENT_ADMIN_PUBLISH    = 'assessment:admin:publish';
export const ASSESSMENT_ADMIN_ARCHIVE    = 'assessment:admin:archive';
export const ASSESSMENT_ADMIN_SECTIONS   = 'assessment:admin:sections:manage';
export const ASSESSMENT_ADMIN_QUESTIONS  = 'assessment:admin:questions:manage';
export const ASSESSMENT_ADMIN_SETTINGS   = 'assessment:admin:settings:manage';
export const ASSESSMENT_ADMIN_RESULTS    = 'assessment:admin:results:read';
```

### 4.3 Placement Admin APIs (Required)

Placement has admin permissions defined but no admin controller. Needed:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/placement/tests` | GET | List all placement tests |
| `/admin/placement/tests` | POST | Create placement test |
| `/admin/placement/tests/:id` | PATCH | Update placement test |
| `/admin/placement/tests/:id/publish` | POST | Publish test |
| `/admin/placement/tests/:id/sections` | GET/POST | Manage sections |
| `/admin/placement/tests/:id/sections/:sectionId` | PATCH/DELETE | Update/remove section |
| `/admin/placement/tests/:id/questions` | GET/POST | Manage questions |
| `/admin/placement/tests/:id/questions/:qId/skills` | GET/POST/DELETE | Manage skill links |
| `/admin/placement/results` | GET | List all student placement results |

---

## 5. Security Considerations

### 5.1 What Must Remain Backend-Only

- **Grading:** Score computation, correctness evaluation, pass/fail determination
- **Deadline status:** Backend-derived from timestamps; admin UI must display as-is
- **Section weights:** Used for scoring; admin may configure but never exposed to students
- **Pass thresholds:** Backend enforces; admin UI may set but not override at display time
- **Late penalties:** Configured via settings, applied by backend grading service
- **Correct answers:** Never included in student-facing responses; admin may view via question bank

### 5.2 Admin UI Boundaries

The admin dashboard for assessments must:
- Display assessment metadata, sections, question links, settings, and results
- Send create/update/publish/archive actions through protected admin API endpoints
- **Not** compute scores, deadlines, or pass/fail status
- **Not** expose grading internals (section weights, penalties) to student-facing views
- Use `SupabaseJwtAuthGuard` + `PermissionGuard` on all admin endpoints

---

## 6. Reusable Infrastructure

### 6.1 Content Status Workflow

**File:** `services/backend-api/src/features/curriculum/content-status-workflow/`

The existing generic publish/archive/restore workflow at `/curriculum/workflow/:entityType/:entityId/...` could potentially be extended to support assessment status transitions, or a parallel assessment-specific workflow can be created.

### 6.2 Repository Pattern

`assessment.repository.ts` already has SQL queries for reading assessment data. Admin-specific queries (list all assessments regardless of status, read settings, manage sections/questions) need to be added.

### 6.3 Validation Helpers

`assessment-validation.helpers.ts` rejects client-supplied grading fields. Admin validation helpers should similarly reject client-supplied scores, deadline statuses, and attempt results.

---

## 7. Recommendations

1. **Create `assessment-admin.controller.ts`** — New controller at `/admin/assessments` with full CRUD + section/question/settings management.
2. **Create `assessment-admin.permissions.ts`** — Define admin permission constants following the placement pattern.
3. **Create `assessment-admin.service.ts`** — Admin-specific business logic (list all statuses, manage sections, configure settings).
4. **Extend `assessment.repository.ts`** — Add queries for admin operations (list all, create, update settings, manage links).
5. **Create placement admin controller** — Implement endpoints matching the already-defined `ADMIN_PLACEMENT_PERMISSIONS`.
6. **Register permissions in seed** — Add assessment admin permissions to the roles/permissions seed data.

---

## 8. Summary Table

| Area | Student APIs | Admin APIs | Admin Permissions | Admin UI |
|------|:---:|:---:|:---:|:---:|
| Assessment (Quiz/Exam) | 8 endpoints | None | None | Not started |
| Placement | 7 endpoints | None | 8 defined | Partial (shell exists) |
| Question Bank | — | 5+ endpoints | Via curriculum perms | Exists (P11-032) |
| Curriculum (Courses/Levels/etc.) | — | Full CRUD | Full set | Exists |

**Bottom line:** Assessment admin management requires new backend work before the admin UI can be built. The placement system is closer to ready (permissions defined) but also needs a controller. The question bank and curriculum patterns provide a clear template to follow.
