# Assessment Feature Security Review

**Ticket**: P10-071
**Date**: 2026-06-20
**Scope**: All backend and Flutter assessment files
**Reviewed paths**:
- `services/backend-api/src/features/assessments/` (all files)
- `apps/mobile/lib/features/assessments/` (all files)

---

## 1. Authentication — PASS

All controller endpoints use `@UseGuards(SupabaseJwtAuthGuard, ...)` as the
first guard in the chain.

**Evidence**:
- `assessment.controller.ts` lines 113, 137, 159, 183, 209, 235, 261, 288 —
  every route applies `SupabaseJwtAuthGuard` via `@UseGuards`.
- No endpoint is unguarded.

---

## 2. Authorization — PASS

`AssessmentPermissionGuard` is applied on every controller endpoint and enforces
`@RequireRoles(AuthorizedRole.STUDENT)`.

**Evidence**:
- `assessment.controller.ts` — every route includes `AssessmentPermissionGuard`
  in its `@UseGuards` decorator and `@RequireRoles(AuthorizedRole.STUDENT)`.
- `guards/assessment-permission.guard.ts` — reads required roles via
  `Reflector`, resolves user roles from JWT, and throws `FORBIDDEN` (403) when
  the role check fails (lines 63-89).

---

## 3. Ownership — PASS

Attempt-scoped and result-scoped endpoints verify the authenticated student owns
the resource before proceeding.

**Evidence**:
- Resume and submit routes use `AssessmentAttemptOwnershipGuard`
  (`guards/assessment-attempt-ownership.guard.ts`) — looks up the attempt by ID
  and compares `attempt.student_id` to `user.id` from JWT (line 58).
- Result route uses `AssessmentResultOwnershipGuard`
  (`guards/assessment-result-ownership.guard.ts`) — looks up result by attempt
  ID scoped to the authenticated student (line 58).
- List, detail, deadlines, and history endpoints scope queries by `user.id`
  from JWT (controller passes `user.id` to service methods).

**Minor note**: `AttemptLifecycleService.resumeAttempt` (line 116) and
`submitAttempt` (line 135) contain defense-in-depth ownership checks that throw
`ForbiddenException` (403). In practice the guard runs first and returns 404,
so the 403 is unreachable on guarded routes. These are acceptable as belt-and-
suspenders checks but could be aligned to throw `NotFoundException` for
consistency. Low severity — no information leakage in practice.

---

## 4. Information Leakage — PASS

Ownership failures return 404, not 403, preventing existence probing.

**Evidence**:
- `guards/assessment-attempt-ownership.guard.ts` line 59: returns
  `NOT_FOUND` (404) when attempt is missing OR belongs to another student.
- `guards/assessment-result-ownership.guard.ts` line 62: same pattern.
- `assessment-errors.ts`: `attemptNotOwned()` returns 404 (line 58-62);
  `attemptNotFound()` returns 404 (line 49-55); `resultNotFound()` returns 404
  (line 129-134).
- Error messages contain no stack traces, internal IDs, or backend config
  values (pass_threshold, late_penalty_percent, correct_answer).
- API responses explicitly exclude pass_threshold, late_penalty_percent,
  section weights, and correct_answer (documented in controller comments and
  enforced by the service layer response shapes).

---

## 5. Deadline Enforcement — PASS

Deadline status is computed exclusively by the backend; Flutter displays the
backend-supplied value as-is.

**Evidence**:
- `assessment-deadline.service.ts`: `computeStatus()` (line 162) is the single
  source of truth for deadline status derivation from UTC timestamps.
- `DeadlineStatusResult` returned to Flutter contains `status` (string),
  `opensAt`, `closesAt`, `extendedClosesAt` — but never `late_window_seconds`
  or `late_penalty_percent` (lines 43-47).
- `assessment-validation.helpers.ts`: `rejectClientDeadlineStatus()` (line 121)
  rejects any client-supplied `status`, `deadlineStatus`, `isOpen`, `isClosed`.
- Flutter `DeadlinesNotifier` and `DeadlineStatusWidgets` display the backend
  string without recomputation.

---

## 6. Grading Authority — PASS

Score, correctness, and pass/fail are computed exclusively by the backend.
Flutter never calculates these values.

**Evidence**:
- `assessment-grading.service.ts`: `gradeAttempt()` fetches correct answers from
  `question_choices`, computes per-answer `isCorrect` and `pointsAwarded`,
  derives `passed` from `pass_threshold`, and applies late penalty — all
  backend-side (lines 83-227).
- `assessment-submission-flow.service.ts`: orchestrates submit -> grade ->
  persist pipeline; returns only `{attemptId, status, submittedAt, resultId}`
  — score/passed/latePenaltyApplied are excluded (lines 34-39).
- `assessment-validation.helpers.ts`: `rejectClientAttemptAuthorityFields()`
  (line 146) and `rejectClientScoringFields()` (line 76) reject any
  client-supplied scoring fields.
- Flutter notifiers (`result_notifier.dart`, `attempt_notifier.dart`) only
  call backend APIs and set state from the response — no local computation.

---

## 7. Attempt Eligibility — PASS

Max attempts and deadline windows are evaluated exclusively by the backend.

**Evidence**:
- `assessment-attempt.service.ts` `startAttempt()`:
  - Checks deadline eligibility via `deadlineSvc.checkSubmissionEligibility()`
    (line 68).
  - Checks max attempts via `repo.countAttemptsByStudent()` against
    `settings.max_attempts` (lines 76-85).
- `submitAttempt()` re-checks deadline eligibility before accepting (line 144).
- Flutter `StartAttemptNotifier` calls `repository.startAttempt()` and displays
  the result — no local eligibility check.

---

## 8. Secrets — PASS

No secrets, API keys, service-role keys, or database credentials are present in
committed assessment code.

**Evidence**:
- Grep for `service.role`, `supabase_key`, `api_key`, `secret`, `password`,
  `credential`, `SUPABASE_URL`, `SUPABASE_ANON` across all assessment files
  returned only comment lines documenting the absence of secrets.
- Database access uses injected `DatabaseService` — connection strings are
  resolved from environment configuration, not hardcoded.
- Flutter uses `BackendApiClient` with bearer tokens passed at call time.

---

## 9. Input Validation — PASS

All identity values (student_id, assessment_id for ownership) come from JWT or
backend lookups, never from client input.

**Evidence**:
- `assessment.controller.ts`: every handler receives `@CurrentUser() user` from
  JWT and passes `user.id` as `studentId` — no `student_id` body/query param.
- `assessment-validation.helpers.ts`: `rejectClientAttemptAuthorityFields()`
  rejects `score`, `isCorrect`, `passed`, `attemptEligible`, etc.
  `rejectClientScoringFields()` rejects `passThreshold`, `latePenaltyPercent`.
- Assessment IDs come from route params (`:id`, `:attemptId`) — ownership is
  verified by guards against the JWT-derived student ID.

---

## 10. Flutter Safety — PASS

The mobile app only displays backend-supplied data and never mutates assessment
state locally.

**Evidence**:
- `assessment_remote_datasource_impl.dart`: all methods are pure HTTP calls
  (GET/POST) to backend endpoints with bearer token auth. No local DB writes,
  no scoring logic, no deadline computation.
- `attempt_notifier.dart`: `StartAttemptNotifier`, `ResumeAttemptNotifier`,
  `SubmitAttemptNotifier` — each calls the repository and sets state from
  the backend response. No local eligibility or scoring computation.
- `result_notifier.dart`: `AttemptResultNotifier`, `ResultHistoryNotifier` —
  fetch and display only.
- UI pages (`assessment_list_page.dart`, `assessment_detail_page.dart`,
  `assessment_result_page.dart`, etc.) render notifier state with no local
  authority logic.
- `attempt_timer_widget.dart`: displays `expiresAt` from the backend for
  countdown — does not enforce expiry locally.

---

## Summary

| # | Area                  | Status |
|---|-----------------------|--------|
| 1 | Authentication        | PASS   |
| 2 | Authorization         | PASS   |
| 3 | Ownership             | PASS   |
| 4 | Information leakage   | PASS   |
| 5 | Deadline enforcement  | PASS   |
| 6 | Grading authority     | PASS   |
| 7 | Attempt eligibility   | PASS   |
| 8 | Secrets               | PASS   |
| 9 | Input validation      | PASS   |
| 10| Flutter safety        | PASS   |

**Overall**: All 10 security areas pass. One low-severity consistency note in
section 3 (defense-in-depth ownership checks in `AttemptLifecycleService` use
`ForbiddenException` instead of `NotFoundException`, but the guards prevent
these from being reached on guarded routes).
