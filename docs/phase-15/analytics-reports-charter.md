# Phase 15 — Analytics and Reports Charter

## Purpose

Phase 15 gives AIM a backend-controlled analytics and reporting system: analytics
events, metric definitions, metric aggregation, dashboard widgets, reports, report
runs, exports, cohorts, an analytics access policy, analytics audit logs, and the
admin/parent/student-facing surfaces that display backend-approved analytics output.

## In Scope

- Analytics event ingestion (backend-defined event taxonomy, safe metadata only).
- Metric definitions and a controlled metrics dictionary (KPI catalog).
- Metric aggregation (backend-computed, not client-computed).
- Dashboard widgets backed by backend-approved aggregate data.
- Report definitions, report runs, and report output storage.
- Controlled, permissioned, audited exports.
- Cohorts (backend-defined segment membership for reporting).
- An analytics access policy mapping roles to allowed reports/metric scopes.
- Analytics audit logs (safe, non-sensitive).
- Learning, curriculum, assessment, notification, billing, and user metric
  integrations sourced from existing Phase 3/8/9/10/12/13/14 data.
- Admin, parent, and student analytics/report UI (backend-approved display only).

## Out of Scope

- Voice AI, AI Teacher, AI Prompt Management, AI Cost Control implementation.
- Student Web App expansion.
- Parent Dashboard expansion beyond analytics/report surfaces.
- Admin Dashboard expansion beyond analytics.
- Payment implementation beyond reporting/metrics (Phase 14 owns payment processing).
- Notification delivery implementation beyond reporting/metrics (Phase 13 owns delivery).
- Phase 16 deployment/performance/QA, except readiness documentation when a task
  explicitly requests it.

Any of the above may only be touched as readiness documentation when a specific
task explicitly requests it — never as implementation.

## Authority Rules (Backend Owns Analytics)

The backend is the sole source of truth for:

- Metric definitions and metric values.
- Aggregation logic and aggregate results.
- Report definitions, report runs, and report output.
- Export scope, export contents, and export audit trail.
- Cohort membership.
- Analytics access policy (who can see what).
- Analytics audit log entries.

UI clients (admin, parent, student) may only:

- Display backend-approved analytics, dashboards, and report output.
- Apply allowed filters through protected backend APIs.
- Request controlled exports through protected backend APIs.

No client may calculate, derive, or assert final metrics, aggregates, reports,
exports, progress summaries, AIM outputs, or assessment/notification/billing
outcomes.

## Privacy Rules

- Analytics outputs must never include secrets, service-role keys, database
  credentials, raw AIM outputs, raw payment provider payloads, sensitive answers,
  private child data outside consent scope, unauthorized PII, or raw logs
  containing sensitive payloads.
- Parent reports must respect Phase 12 consent and child-scope rules (see
  `docs/phase-12/parent-data-retention-rules.md` and
  `docs/phase-12/parent-privacy-consent-rules.md`).
- Billing reports must respect Phase 14 sensitive payment data rules (see
  `docs/phase-14/` payment privacy/audit documentation).
- Analytics audit logs store safe, non-sensitive content only.

## Dependencies

- P14-082 — Phase 14 readiness/closure output that Phase 15 analytics build on.

## Design System

All Phase 15 UI must use the approved AIM design system at
`docs/design/source/aim-design-system` — tokens, typography, spacing, radius/
elevation, shared components, responsive layout, Arabic/RTL readiness, and
accessibility-safe states. No one-off styling.
