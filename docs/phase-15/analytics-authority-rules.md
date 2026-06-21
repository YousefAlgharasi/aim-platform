# Phase 15 — Analytics Authority Rules

## Purpose

Define backend authority for metrics, aggregation, reporting, exports, and
dashboard data, and prevent client-side analytics authority anywhere in AIM.

## Backend Is Sole Authority For

- Metric definitions (`metric_definitions`): what a metric means, how it's
  computed, and which event types feed it.
- Metric values (`metric_aggregates`): the computed value for a metric at a
  given scope and period.
- Report definitions and report runs: what a report contains and the result of
  executing it.
- Dashboard widget data: the value rendered behind any widget.
- Export contents and export scope: what data an export job is permitted to
  contain.
- Cohort membership: which users/students belong to a cohort.
- Analytics access policy decisions: whether a given role/user may view a
  metric, report, dashboard, or request an export.
- Analytics audit log entries: the record of who accessed what.

## Client/UI May Only

- Request backend-approved dashboards, reports, and metrics via protected APIs.
- Apply filters that the backend validates and authorizes (no client-side
  filter bypass of role/scope).
- Request exports via protected APIs and receive backend-generated export
  artifacts.
- Render values exactly as returned by the backend — no recomputation,
  re-aggregation, derivation, rounding-with-business-meaning, or combination of
  multiple backend values into a new authoritative figure.

## Explicitly Forbidden in Client/UI

- Calculating or estimating: metrics, aggregates, KPIs, reports, exports,
  learning/progress summaries, AIM outputs, assessment outcomes, notification
  outcomes, billing/revenue outcomes, or retention/user-count figures used as
  official reporting.
- Caching a backend value and locally mutating/recombining it into a new
  authoritative number.
- Inferring access scope (e.g. which children a parent may see) — scope must
  come from a backend-evaluated access policy response.
- Bypassing backend pagination/aggregation by fetching raw rows and summarizing
  client-side.

## Enforcement Points

- All analytics/report/export endpoints must validate caller role and scope
  server-side before returning data (see `docs/phase-15/reporting-access-map.md`).
- All metric/aggregate computation lives in backend services
  (`MetricAggregationService`, `ReportRunnerService`) — never in frontend code.
- Export jobs are generated server-side and recorded in
  `analytics_access_audit_logs` before the file reference is returned to the
  client.

## Dependencies

- P15-001 — Analytics and Reports Charter.
