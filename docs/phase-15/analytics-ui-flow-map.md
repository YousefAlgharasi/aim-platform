# Phase 15 — Analytics UI Flow Map

## Purpose

Document dashboard/report/export/filter flows across admin, parent, and
student surfaces to guide UI implementation using the AIM design system.
This is a flow map only — UI components are implemented in later Phase 15
tasks (P15-039+), not here.

## Design System Requirements

- Follow `docs/design/source/aim-design-system` for tokens, typography,
  spacing, radius/elevation, and shared components.
- Use shared chart, table, card, badge, dialog, and filter primitives rather
  than one-off styling.
- Support responsive layout, Arabic/RTL readiness, accessible labels, keyboard
  flow, and consistent loading/empty/error/forbidden states.

## Admin Flow

1. Admin opens the analytics dashboard shell → backend returns widgets for
   `admin_overview` (`GET /analytics/dashboards/admin_overview/widgets`).
2. Admin navigates to a domain report (learning/curriculum/assessments/
   notifications/billing/users) → UI calls the matching
   `GET /analytics/reports/:domain` endpoint.
3. Admin applies filters (date range, cohort) → filters are passed as query
   params to the backend; UI does not pre-filter or recompute locally.
4. Admin requests an export → `POST /analytics/exports`; UI polls
   `GET /analytics/exports/:id` until `completed` or `failed`, then surfaces a
   backend-provided file reference/download link.
5. Forbidden state: if the access policy denies a report/widget, UI renders a
   shared "forbidden" state, not an error stack trace or raw 403 body.

## Parent Flow

1. Parent opens their summary dashboard → backend returns widgets for
   `parent_summary`, scoped server-side to their consented children.
2. Parent selects a child (if more than one) → UI passes the selected child id
   as a scope parameter; backend re-validates the parent owns that child
   before returning data.
3. Parent views learning/assessment/billing summaries for the selected child or
   their own account (billing) → backend-approved summary fields only.
4. Parent requests an export of their own/child's data → same export flow as
   admin, scoped to the parent's own consented data.

## Student Flow

1. Student opens their summary dashboard → backend returns widgets for
   `student_summary`, scoped server-side to that student only.
2. Student views their own learning/assessment summaries — no mastery,
   recommendation, or progress-authority computation in the UI; values are
   rendered exactly as the backend returns them.

## Shared States

- Loading: shared skeleton/spinner component per design system.
- Empty: shared empty-state component when no data exists for the scope/period.
- Error: shared error-state component for backend/network failures, distinct
  from forbidden.
- Forbidden: shared forbidden-state component for access-denied responses.

## Dependencies

- P15-008 — Analytics API Contract Map.
