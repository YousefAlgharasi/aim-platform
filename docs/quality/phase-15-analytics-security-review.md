# Phase 15 — Analytics Security Review

**Scope:** Permission guards, role-based access control, scope-ownership
enforcement, audit logging, result-pointer design, and client/UI authority
boundaries across `services/backend-api/src/features/analytics/` and the
parent web / student mobile analytics UI surfaces.

## 1. Permission Guards

- Every analytics controller is decorated at the class level with
  `@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)` plus a per-route
  `@RequireAnalyticsAccess({ category, action })` decorator
  (`parent-reports.controller.ts:21,29`,
  `student-analytics-summary.controller.ts:19,24`,
  `admin-assessment-reports.controller.ts:20,28`).
- `AnalyticsAccessGuard` resolves the Supabase-authenticated user to an
  internal user record (requiring `status === 'active'`), derives a role via
  `RolesService`, normalizes `admin`/`super_admin` to `admin`, and defers the
  allow/deny decision to `AnalyticsAccessPolicyService.evaluateAccess()`,
  throwing `ForbiddenException` on denial.
- **Verdict: PASS** — no analytics route is reachable without passing both
  the JWT guard and the access-policy check.

## 2. Role-Based Category Access

- `AnalyticsAccessPolicyService` maintains a `CATEGORY_ALLOWED_ROLES`
  allowlist per `ReportCategory` (e.g. `learning`/`assessment`:
  `['admin', 'parent', 'student']`, `parent`: `['parent']`, `student`:
  `['student']`, `curriculum`/`notification`/`user`/`admin`: `['admin']`
  only).
- `ReportDefinitionService.listVisibleToRole` filters definitions by
  `definition.allowedRoles.includes(role)` before they are ever returned to
  a client, and `getByKeyForRole` independently calls `assertRoleAllowed`
  before a report run is created — a second, defense-in-depth check beneath
  the guard/policy layer.
- **Verdict: PASS.**

## 3. Scope-Ownership Enforcement

- `AnalyticsAccessGuard.resolveScopeOwnerUserId` only reads
  `params.userId`/`params.studentId`/`params.parentId`. None of the actual
  analytics routes (`parent/analytics/reports`,
  `student/analytics/summary`) declare these params, so the guard's
  scope-ownership check is effectively a no-op for these endpoints; the
  guard only enforces the role/category allowlist for them.
- Real ownership enforcement instead happens ad hoc in controllers/services:
  `ParentReportsController.getRunStatus` manually checks
  `run.requestedByUserId !== actor.userId` and throws 403 on mismatch
  (`parent-reports.controller.ts:61-65`); `AnalyticsExportService.requestExport`
  enforces `reportRun.requestedByUserId === requestedByUserId` (403
  otherwise) and additionally requires `reportRun.status === 'completed'`,
  else it records a `status: 'denied'` export job rather than serving it.
- `AdminAssessmentReportsController.getRunStatus` has no equivalent
  per-request ownership check, but the route is admin-only via the guard,
  so cross-user run access is an intentional admin capability, not a gap.
- **Verdict: PARTIAL.** Ownership checks are correct everywhere they are
  needed today, but they are implemented per-controller rather than
  uniformly inside the guard. Any new parent/student analytics route that
  forgets to add its own ownership check would not be caught by the shared
  guard. Recommend wiring scope-owner resolution into the guard (or a
  shared decorator) so this protection isn't left to be reimplemented by
  hand on every new controller.

## 4. Audit Logging

- Every access decision (allow or deny) made by
  `AnalyticsAccessPolicyService.evaluateAccess()` is written unconditionally
  to the `analytics_access_audit_logs` table, regardless of outcome.
- Export request/denial paths in `AnalyticsExportService` are also written
  to the audit log table on both the granted and denied branches.
- **Verdict: PASS** — denials are recorded, not silently dropped, which
  supports later forensic review of access-control behavior.

## 5. Result-Pointer Design (No Embedded Data in Run Records)

- `ReportRunnerService.execute()` sets `resultRef = report-run:${reportRunId}`
  — a pointer string, never the actual report payload
  (`report-runner.service.ts:65`). The same pattern is used by
  `AnalyticsExportService.process()`, which sets
  `fileRef = export-job:${exportJobId}`.
- This means a completed run's status response never leaks computed
  report content through the run/export endpoints themselves — the actual
  resolution of a `resultRef`/`fileRef` to real data is not yet implemented
  anywhere in this codebase.
- **Verdict: PARTIAL / FORWARD-LOOKING GAP.** The pointer design is sound
  and avoids accidental data exposure today, but because no service yet
  resolves a `resultRef` to actual stored content, this must be re-reviewed
  once that resolution path is built, to confirm the same role/ownership
  checks are re-applied at fetch time and not just at run-creation time.

## 6. Client-Supplied Authority

- No analytics endpoint accepts a client-supplied metric value, aggregate,
  report output, or `requestedByUserId` — request bodies are limited to
  `RunReportDto.parameters` (report input parameters only) and
  `RequestExportDto`. The acting user's identity is always resolved
  server-side from the authenticated request, never trusted from the
  client (confirmed by the absence of any hardcoded `requestedByUserId:`
  pattern in parent/student UI API clients).
- **Verdict: PASS.**

## 7. Client/UI Authority Boundaries

- The parent web reporting UI (`apps/web/src/features/parent-dashboard/`)
  and the student mobile analytics summary UI
  (`apps/mobile/lib/features/analytics_summary/`) are read-only consumers:
  they list backend-approved report definitions, trigger report runs, and
  display backend-returned status/`resultRef`/`errorMessage` verbatim. No
  UI component computes mastery, progress, or report content locally; the
  parent assessment-report view filters an already-authorized list
  client-side by `category` only, which does not grant any access the
  backend wouldn't have already permitted.
- **Verdict: PASS.**

## 8. Privacy / Cohort-Size Suppression

- `docs/phase-15/analytics-privacy-data-safety-rules.md` specifies a
  minimum cohort size of 5 and prohibits raw transcripts, payment
  payloads, or raw answer content from appearing in analytics events, and
  requires Phase 12 consent scoping for child/student data.
- No aggregation or minimum-cohort-size suppression logic was found in the
  analytics feature's services reviewed here (`report-runner.service.ts`,
  `report-definition.service.ts`, `analytics-access-policy.service.ts`,
  `analytics-export.service.ts`). This rule may be enforced elsewhere
  (e.g. a metric-aggregation service not in scope of this review) but
  could not be confirmed as implemented from the files reviewed.
- **Verdict: UNVERIFIED.** Requires a follow-up review of whatever service
  actually computes aggregate metrics before this rule can be marked PASS.

## Summary

| Area | Status |
|------|--------|
| Permission guards on analytics endpoints | PASS |
| Role-based category access control | PASS |
| Scope-ownership enforcement | PARTIAL — correct but per-controller, not centralized |
| Audit logging of access decisions | PASS |
| Result-pointer design (no embedded data) | PARTIAL — sound today, unresolved fetch path |
| Client-supplied authority | PASS |
| Client/UI authority boundaries | PASS |
| Privacy / minimum cohort-size suppression | UNVERIFIED |

**Overall verdict: PRODUCTION-VIABLE WITH FOLLOW-UPS.** The analytics
feature's permission, role, and audit-logging layers are sound and
consistently enforced through guards and policy services. Two items
should be tracked before broader rollout: (1) centralize scope-ownership
enforcement into the shared guard rather than relying on each controller to
reimplement it, and (2) verify minimum-cohort-size suppression is actually
enforced wherever aggregate metrics are computed, since that logic was not
found in the services reviewed here.
