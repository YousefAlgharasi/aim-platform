# Phase 15 — Parent Analytics E2E Check

**Task:** P15-080
**Date:** 2026-06-21
**Reviewer:** yo0sf

## Summary

End-to-end review of the parent-facing analytics and reporting pages
introduced in P15-068 through P15-071. All three pages are backend-driven:
report definitions, run status, and result references come exclusively
from `ReportDefinitionService` / `ReportRunnerService` via the parent
reporting API (`listParentReportDefinitions`, `runParentReport`,
`getParentReportRunStatus`). No page computes, estimates, or grades data
client-side.

## Pages Verified

| Page | Data Source | States Handled |
|---|---|---|
| ParentAnalyticsReports | `listParentReportDefinitions`, `runParentReport`, `getParentReportRunStatus` | loading, ready, empty, error |
| ParentProgressReport | `runParentReport('learning-progress', { childId })`, `getParentReportRunStatus` | loading, ready, empty, error |
| ParentAssessmentReport | `listParentReportDefinitions` (filtered to `category === 'assessment'`), `runParentReport`, `getParentReportRunStatus` | loading, ready, empty, error |

## Navigation Flow

1. **ParentAnalyticsReports** loads all backend-approved report
   definitions on mount. Each row exposes a "تشغيل التقرير" action button
   that calls `runParentReport(reportKey)`. If the run starts in
   `queued`/`running`, the page immediately polls
   `getParentReportRunStatus(run.id)` once and updates the row's status
   badge (`STATUS_VARIANT`/`STATUS_LABEL` map queued/running/completed/failed
   to info/info/success/error variants). Run failures are caught and
   rendered as a `failed` badge with the thrown error message.
2. **ParentProgressReport** is a focused single-report view fixed to the
   `learning-progress` report key. On mount (and whenever `childId`
   changes) it starts the run, optionally scoping it with
   `{ childId }`, polls status if still in flight, and renders the final
   badge. On `completed` it shows the backend `resultRef` pointer; on
   `failed` it shows `errorMessage` in an `role="alert"` element.
3. **ParentAssessmentReport** mirrors ParentAnalyticsReports' list/run/poll
   pattern but pre-filters the definition list to `category === 'assessment'`
   client-side (filtering only, not computing results) and forwards
   `childId` as a run parameter when present.

All three pages use the same shared primitives
(`ParentCard`, `ParentTable`, `ParentBadge`, `ParentLoadingState`,
`ParentEmptyState`, `ParentErrorState`) and the same Arabic status labels,
giving a consistent UX across the reporting surface. Buttons share the
`parent-form__btn` class and disable themselves (showing "جاري
التشغيل...") while their specific report run is in flight, preventing
duplicate run requests per row.

## Findings

- All three pages correctly treat the backend as the sole source of truth
  for report content, run status, and result references; no client-side
  aggregation or scoring was found.
- Error states are handled both at the initial load (`ParentErrorState`)
  and at the per-run level (inline failed badge / alert text), so a
  failed run never silently leaves the UI in a loading state.
- Empty states are explicit (`ParentEmptyState`) for both "no definitions
  available" and "no progress report available" cases.
- Status polling is a single fire-and-forget follow-up call rather than a
  continuous poll loop; a report that stays `queued`/`running` past that
  one follow-up will show a stale badge until the user retriggers the
  run. This is consistent with the current backend contract and not a
  defect introduced by these pages, but is worth tracking if
  `ReportRunnerService` execution times grow.
- Supporting automated coverage: `apps/web/src/features/parent-dashboard/__tests__/parent-reporting-ui.test.js`
  (P15-071) exercises all three pages' loading/ready/empty/error states
  and the run/poll interaction, with 11 passing tests confirmed via
  `react-scripts test`.
