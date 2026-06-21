# Phase 15 — Reporting Access Map

## Purpose

Map admin, parent, student, and internal/system roles to allowed reports and
metric scopes, to prevent unauthorized metric visibility.

## Roles

- `admin` — platform staff with analytics oversight permissions.
- `parent` — guardian account scoped to their own consented children.
- `student` — learner account scoped to their own data.
- `system` — backend-internal processes (aggregation jobs, schedulers); never a
  client-facing role.

## Access Matrix

| Report / Dashboard Category | Admin | Parent | Student |
|---|---|---|---|
| Admin platform overview (aggregate-only) | view | — | — |
| Learning reports (cohort/platform aggregate) | view | — | — |
| Learning summary (own/child scope) | — | view (own children) | view (self) |
| Curriculum reports (aggregate) | view | — | — |
| Assessment reports (aggregate) | view | — | — |
| Assessment summary (own/child scope) | — | view (own children) | view (self) |
| Notification reports (aggregate) | view | — | — |
| Billing/revenue reports (aggregate, platform) | view | — | — |
| Billing summary (own account) | — | view (own account) | — |
| User reports (aggregate, platform) | view | — | — |
| Parent reports (own children only) | — | view | — |
| Student summaries (own data only) | — | view (own children) | view (self) |
| Exports of any of the above | request (per scope) | request (own scope) | request (own scope) |

`view` = the role may view backend-approved output for the indicated scope.
`request` = the role may request a backend-generated export within the same
scope they're permitted to view.

## Scope Rules

- Admin: aggregate/cohort-level only by default. Row-level child or student
  data is never exposed to admin through Phase 15 surfaces.
- Parent: limited to children within their Phase 12 consented scope. A parent
  must never see another parent's child, or platform-wide aggregates beyond
  what's explicitly approved as benchmark context (e.g. "average completion
  rate" shown without any other student's identity).
- Student: limited to their own data only. No access to other students' data,
  cohort comparisons that could re-identify peers, or platform aggregates
  beyond non-identifying benchmark context.
- System: internal aggregation/report-runner jobs operate with elevated
  backend privileges but never expose unscoped data to a client response.

## Enforcement

- Every analytics/report/export endpoint resolves the caller's role and scope
  server-side, evaluates it against this access map (via the Analytics Access
  Policy Service, P15-034), and denies/allows accordingly.
- Every access decision (allow or deny) is recorded in
  `analytics_access_audit_logs`.
- This map must be kept in sync with Phase 11 (admin roles/permissions) and
  Phase 12 (parent consent/child-scope rules).

## Dependencies

- P15-003 — Analytics Authority Rules.
- P15-004 — Analytics Privacy and Data Safety Rules.
- Phase 11 admin role/permission outputs.
- Phase 12 parent consent/child-scope outputs.
