# Phase 11 Readiness Checklist — From Phase 10

**Produced by:** P10-075  
**Date:** 2026-06-20  
**Purpose:** Identify what the Admin Dashboard (Phase 11) needs to manage quizzes/exams. No Admin UI is implemented here — documentation only.

---

## 1. What Phase 10 Delivered (Admin Can Build On)

### 1.1 Database Tables (all on Supabase/PostgreSQL)

| Table | Admin Use |
|---|---|
| `assessments` | CRUD for quiz/exam records |
| `assessment_sections` | Manage question groups within an assessment |
| `assessment_settings` | Configure time limits, max attempts, grading mode |
| `assessment_question_links` | Link questions from question bank to assessments |
| `assessment_deadlines` | Set/extend per-student or global deadlines |
| `assessment_attempts` | Read-only: view student attempt history |
| `assessment_attempt_answers` | Read-only: review submitted answers |
| `assessment_results` | Read-only: view scores, pass/fail |
| `assessment_result_breakdowns` | Read-only: per-question breakdown |
| `assessment_audit_logs` | Read-only: event trail for compliance |
| `deadline_events` | Read-only: deadline change history |

### 1.2 Backend Services Phase 11 Can Extend

| Service | What Admin Needs |
|---|---|
| `AssessmentService` | Add admin CRUD endpoints (list all, create, update, delete) |
| `AssessmentDeadlineService` | Add admin endpoint to extend/override deadlines |
| `AssessmentResultService` | Add admin endpoint to view results across all students |
| `AssessmentAuditService` | Add admin read endpoint for audit log queries |
| `AssessmentGradingService` | No change needed — backend authority already enforced |

### 1.3 Guards Phase 11 Must Use

| Guard | Phase 11 Requirement |
|---|---|
| `AssessmentPermissionGuard` | Add `AuthorizedRole.ADMIN` to admin routes |
| `AssessmentAttemptOwnershipGuard` | Admin bypasses ownership — add admin exemption or separate admin route |
| `AssessmentResultOwnershipGuard` | Same — admin reads across students |

---

## 2. Phase 11 Admin API Endpoints to Build

These endpoints do **not** exist yet. Phase 11 must implement them.

### Assessments Management
- `GET /admin/assessments` — list all assessments
- `POST /admin/assessments` — create quiz/exam
- `PUT /admin/assessments/:id` — update quiz/exam metadata
- `DELETE /admin/assessments/:id` — soft-delete assessment
- `POST /admin/assessments/:id/sections` — add section
- `PUT /admin/assessments/:id/settings` — update time limit, max attempts, grading mode
- `POST /admin/assessments/:id/questions` — link questions from question bank
- `DELETE /admin/assessments/:id/questions/:linkId` — unlink question

### Deadline Management
- `POST /admin/assessments/:id/deadlines` — set deadline for student or cohort
- `PUT /admin/assessments/:id/deadlines/:deadlineId` — extend deadline
- `GET /admin/assessments/:id/deadlines` — list deadlines

### Results & Reporting (Read-Only)
- `GET /admin/assessments/:id/results` — all student results for an assessment
- `GET /admin/students/:studentId/results` — all results for a student
- `GET /admin/assessments/:id/audit-logs` — audit trail for an assessment

---

## 3. Phase 11 Backend Rules (Must Carry Forward)

These Phase 10 rules apply unchanged in Phase 11:

- **Backend is the final authority** for grading, scoring, pass/fail, deadlines, and attempts — Admin UI displays backend values only.
- **No correct answers exposed** in admin list/edit endpoints unless explicitly required and gated by role.
- **`student_id` / `session_id`** never accepted from admin client — always backend-resolved or path-param validated.
- **Audit logs** must remain append-only; no admin delete endpoint.
- **AssessmentAuditService** must be called on all admin mutations (create, update, deadline extension).
- **No secrets** (AI provider keys, service-role keys, DB credentials) in any admin API response or log.

---

## 4. Phase 11 Flutter / Admin Web Requirements

- Admin Dashboard is a **Next.js** app (`apps/admin/`) — not Flutter.
- Must consume the admin endpoints above via authenticated API calls only.
- Must display backend-returned grading/deadline/result values — no local computation.
- Admin UI for quiz builder is the primary Phase 11 deliverable.

---

## 5. Phase 10 Outputs Available as Foundation

| Output | Location |
|---|---|
| Domain map | `docs/phase-10/assessment-domain-map.md` |
| Authority rules | `docs/phase-10/assessment-authority-rules.md` |
| API contract map | `docs/phase-10/assessment-api-contract-map.md` |
| Security review | `docs/quality/phase-10-assessment-security-review.md` |
| Architecture review | `docs/quality/phase-10-assessment-architecture-review.md` |
| No-client-authority review | `docs/quality/phase-10-no-client-authority-review.md` |
| Completeness review | `docs/quality/phase-10-output-completeness-review.md` |

---

## 6. Checklist for Phase 11 Entry

- [ ] Phase 10 completeness review approved (P10-074) ✅
- [ ] Admin module scaffold created in `services/backend-api/src/features/admin-assessments/`
- [ ] Admin role (`AuthorizedRole.ADMIN`) verified in auth module
- [ ] Admin assessment CRUD endpoints implemented and guarded
- [ ] Admin deadline management endpoints implemented
- [ ] Admin result read endpoints implemented (cross-student, no ownership guard)
- [ ] Audit logging wired into all admin mutations
- [ ] No correct-answer leakage in admin quiz-editor responses
- [ ] Next.js admin dashboard consumes new admin endpoints
- [ ] Phase 11 security review completed before handoff
