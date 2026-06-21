# Phase 15 — Analytics API Contract Map

## Purpose

Document the backend analytics/reporting APIs needed by admin, parent, and
student UIs so UI implementation aligns with backend authority and access
scope.

## Conventions

- All endpoints are server-validated for role and scope before returning data.
- All responses contain backend-computed values only — no client-side
  recomputation is expected or permitted.
- All endpoints record an `analytics_access_audit_logs` entry (allow or deny).

## Events (Internal/System Only)

- `POST /internal/analytics/events` — backend-internal event ingestion
  (not exposed to UI clients).

## Metrics

- `GET /analytics/metrics` — list metric definitions visible to caller's role.
- `GET /analytics/metrics/:key/aggregate` — get a metric aggregate for a scope
  and period (query: `scopeType`, `scopeId`, `periodType`, `from`, `to`).

## Dashboards

- `GET /analytics/dashboards/:dashboardKey/widgets` — list widgets and their
  backend-resolved values for a dashboard (`admin_overview`, `parent_summary`,
  `student_summary`).

## Reports

- `GET /analytics/reports` — list report definitions visible to caller's role.
- `POST /analytics/reports/:key/run` — request a report run with parameters;
  returns a `report_runs` record (queued/running/completed/failed).
- `GET /analytics/report-runs/:id` — get report run status and result
  reference.

## Exports

- `POST /analytics/exports` — request an export job for a report run
  (`reportRunId`, `exportType`); permission/scope-checked, audited.
- `GET /analytics/exports/:id` — get export job status and file reference once
  completed.

## Cohorts

- `GET /analytics/cohorts` — list cohorts visible to caller's role (admin only
  by default).

## Domain-Specific Report Endpoints

- `GET /analytics/reports/learning` — learning reports (admin: aggregate;
  parent/student: own/child scope).
- `GET /analytics/reports/curriculum` — curriculum reports (admin aggregate).
- `GET /analytics/reports/assessments` — assessment reports (admin aggregate;
  parent/student: own/child scope).
- `GET /analytics/reports/notifications` — notification reports (admin
  aggregate).
- `GET /analytics/reports/billing` — billing/revenue reports (admin aggregate;
  parent: own account summary).
- `GET /analytics/reports/users` — user reports (admin aggregate).

## Error / Denial Contract

- `403` with `{ reason }` when the access policy denies the request (also
  logged as `analytics.access_denied`).
- `404` when the referenced report/metric/export does not exist or is not
  visible to the caller's role.

## Dependencies

- P15-005 — Analytics KPI Catalog.
- P15-007 — Reporting Access Map.
