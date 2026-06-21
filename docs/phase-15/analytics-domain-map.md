# Phase 15 — Analytics Domain Map

## Purpose

Establish the analytics/reporting domain model before implementation. This map
defines the core entities, their relationships, and the boundary between
backend-owned analytics data and UI-displayed analytics output.

## Core Entities

### Analytics Event (`analytics_events`)

A single recorded occurrence emitted by the backend describing user/system
activity relevant to reporting (e.g. lesson completed, assessment submitted,
notification delivered, payment succeeded).

- Fields: id, event_type, actor_role, actor_id (nullable for system events),
  subject_type, subject_id, occurred_at, metadata (safe JSON only), created_at.
- Always backend-emitted. Never accepted as a raw client-submitted final value.

### Metric Definition (`metric_definitions`)

A named, versioned definition of a computable metric (e.g. `daily_active_students`,
`assessment_completion_rate`, `mrr`).

- Fields: id, key, name, description, domain (learning/curriculum/assessment/
  notification/billing/user/operations), value_type, aggregation_method,
  source_event_types, is_active, version, created_at, updated_at.

### Metric Aggregate (`metric_aggregates`)

A computed, time-bucketed value for a metric definition.

- Fields: id, metric_definition_id, scope_type (platform/cohort/role/student/
  parent), scope_id (nullable for platform-wide), period_type (day/week/month),
  period_start, period_end, value, computed_at.

### Report Definition (`report_definitions`)

A named, reusable report specification (which metrics, filters, and grouping it
exposes).

- Fields: id, key, name, description, category (learning/curriculum/assessment/
  notification/billing/user/admin/parent/student), allowed_roles, parameters_schema,
  is_active, created_at, updated_at.

### Report Run (`report_runs`)

A single execution of a report definition with concrete parameters and a result
reference.

- Fields: id, report_definition_id, requested_by_user_id, requested_role,
  parameters, status (queued/running/completed/failed), result_ref, error_message,
  started_at, completed_at, created_at.

### Dashboard Widget (`dashboard_widgets`)

A backend-defined widget configuration rendering a metric/report on a dashboard
surface.

- Fields: id, dashboard_key (admin_overview/parent_summary/student_summary/...),
  widget_type (kpi/chart/table), metric_definition_id (nullable), report_definition_id
  (nullable), config, display_order, is_active.

### Export Job (`export_jobs`)

A permissioned, audited request to export report/metric output.

- Fields: id, requested_by_user_id, requested_role, report_run_id (nullable),
  export_type (csv/json/pdf), scope, status (queued/processing/completed/failed/
  denied), file_ref, denial_reason, created_at, completed_at.

### Analytics Cohort (`analytics_cohorts`)

A backend-defined segment of users/students for reporting/filtering.

- Fields: id, key, name, description, cohort_type (static/dynamic), definition
  (criteria, for dynamic cohorts), is_active, created_at, updated_at.

### Analytics Access Audit Log (`analytics_access_audit_logs`)

An audit record of analytics/report/export access.

- Fields: id, actor_user_id, actor_role, action (view_dashboard/run_report/
  request_export/access_denied), target_type, target_id, scope, result
  (allowed/denied), created_at.

## Relationships

- A Metric Definition has many Metric Aggregates (one per scope/period).
- A Report Definition has many Report Runs.
- A Report Run may produce zero or one Export Job.
- A Dashboard Widget references exactly one Metric Definition or Report Definition.
- An Analytics Cohort can be used as a `scope_id` for Metric Aggregates and as a
  filter parameter for Report Runs.
- Every analytics/report/export access is recorded in the Analytics Access Audit
  Log.

## Backend vs UI Boundary

- Backend owns: event ingestion, metric definitions, aggregation, report
  definitions/runs, export generation, cohort membership, access policy
  evaluation, audit logging.
- UI owns: rendering backend-approved widgets, dashboards, and report output;
  submitting filter/export requests through protected APIs; never computing
  metric, aggregate, report, or export values itself.

## Dependencies

- P15-001 — Analytics and Reports Charter.
