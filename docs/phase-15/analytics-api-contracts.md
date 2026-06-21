# Analytics API Contracts

Backend-authoritative contracts for the dashboard, report, export, and
summary endpoints introduced in Phase 15. All endpoints below are guarded
by `SupabaseJwtAuthGuard` + `AnalyticsAccessGuard`, require a bearer token,
and are protected per-route by `@RequireAnalyticsAccess({ category, action })`,
which defers the allow/deny decision to `AnalyticsAccessPolicyService`
(every decision is written to the analytics access audit log, allowed or
denied).

No endpoint accepts a client-supplied metric value, aggregate value, report
output, export scope, or privileged filter. All output is assembled
server-side by `DashboardService` / `ReportRunnerService` /
`AnalyticsExportService` / `ReportDefinitionService`.

## Admin Dashboard

### `GET /admin/analytics/dashboard/:dashboardKey`
- Access: `category: 'admin'`, `action: 'view_dashboard'` (admin role only).
- Path params: `dashboardKey` — one of `admin_overview` | `parent_summary` | `student_summary`.
- Response: `ResolvedDashboardWidget[]` resolved by `DashboardService.getDashboard()`.

## Admin Reports (Learning / Assessment / Revenue)

These three controllers share an identical shape, scoped to their report
category:

| Category     | Base path                              |
|--------------|-----------------------------------------|
| `learning`   | `/admin/analytics/reports/learning`     |
| `assessment` | `/admin/analytics/reports/assessment`   |
| `admin` (revenue) | `/admin/analytics/reports/revenue` |

### `GET <base path>`
- Access: `action: 'view_dashboard'`.
- Response: `ReportDefinition[]` visible to the requester's resolved role.

### `POST <base path>/:reportKey/run`
- Access: `action: 'run_report'`.
- Body: `RunReportDto { parameters?: Record<string, unknown> }`.
- Response: `ReportRun` (status starts `queued`/`running`, transitions to
  `completed` or `failed`; `resultRef` is only populated for `completed`).

### `GET <base path>/runs/:runId`
- Access: `action: 'view_dashboard'`.
- Response: `ReportRun` — current status/result reference of a prior run.

## Parent Reports

### `GET /parent/analytics/reports`
- Access: `category: 'parent'`, `action: 'view_dashboard'` (parent role only).
- Response: `ReportDefinition[]` visible to the `parent` role.

### `POST /parent/analytics/reports/:reportKey/run`
- Access: `category: 'parent'`, `action: 'run_report'`.
- Body: `RunReportDto`.
- Response: `ReportRun`.

### `GET /parent/analytics/reports/runs/:runId`
- Access: `category: 'parent'`, `action: 'view_dashboard'`.
- Response: `ReportRun`. Returns 403 if the run was not requested by the
  calling parent (ownership is checked against `run.requestedByUserId`).

Note: per-child progress/assessment/activity/report reads remain on
`ParentsController` (`/api/v1/parent/children/:childId/...`), gated by
`ParentChildAccessGuard` + consent type — those are unrelated to report
definitions/runs and are not duplicated here.

## Student Analytics Summary

### `GET /student/analytics/summary`
- Access: `category: 'student'`, `action: 'view_dashboard'` (student role only).
- Response: `ReportDefinition[]` visible to the `student` role.

## Analytics Exports

### `POST /analytics/exports`
- Access: `category: 'admin'`, `action: 'request_export'`.
- Body: `RequestExportDto { reportRunId: string; exportType: 'csv' | 'json' | 'pdf'; scope?: Record<string, unknown> }`.
- Response: `ExportJob`. The requester must own the referenced `reportRunId`
  (`AnalyticsExportService` rejects with 403 otherwise) and the run must be
  `completed`, or the job is created with `status: 'denied'`.

### `GET /analytics/exports/:exportJobId`
- Access: `category: 'admin'`, `action: 'request_export'`.
- Response: `ExportJob` (status, `fileRef` download reference once
  `completed`, `denialReason` if denied/failed). Returns 403 if the export
  job was not requested by the caller.

## Shared types

See `services/backend-api/src/features/analytics/analytics.entities.ts` for
`ReportDefinition`, `ReportRun`, `ExportJob`, `DashboardWidget`/
`ResolvedDashboardWidget`, and `AnalyticsAccessAuditLog`. See
`analytics.dtos.ts` for `RunReportDto`, `RequestExportDto`,
`GetDashboardWidgetsDto`, `GetMetricAggregateDto`.

## Authority and privacy invariants

- Clients never assemble metrics, aggregates, report output, dashboard
  output, or export content — every read above is server-computed.
- Every access decision (allowed or denied) is written to the analytics
  access audit log by `AnalyticsAccessPolicyService.evaluateAccess()`.
- Exports are only ever generated from the requester's own completed report
  runs; export content is derived from the run's already-approved result,
  never from request-time client input.
