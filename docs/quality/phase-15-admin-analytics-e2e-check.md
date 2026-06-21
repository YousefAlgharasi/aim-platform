# Phase 15 — Admin Analytics E2E Check

**Task:** P15-079
**Date:** 2026-06-21
**Reviewer:** GHOST3030

## Summary

End-to-end review of the admin-facing analytics UI introduced in P15-057
through P15-066. All pages are backend-driven: dashboard data, report
definitions, report runs, and export status come exclusively from the
admin analytics API (`/api/analytics/admin/*`). No page computes,
estimates, or aggregates data client-side.

## Pages Verified

| Page | Data Source | States Handled |
|---|---|---|
| AdminPlatformOverview | `fetchDashboard()` | loading, ready, empty, error, forbidden |
| AdminLearningReports | `fetchLearningReports()`, `runLearningReport()` | loading, ready, empty, error, forbidden |
| AdminCurriculumReports | `fetchDashboard()` (curriculum section) | loading, ready, empty, error, forbidden |
| AdminAssessmentReports | `fetchAssessmentReports()`, `runAssessmentReport()` | loading, ready, empty, error, forbidden |
| AdminNotificationReports | `fetchDashboard()` (notification section) | loading, ready, empty, error, forbidden |
| AdminRevenueReports | `fetchRevenueReports()`, `runRevenueReport()` | loading, ready, empty, error, forbidden |
| AdminUserReports | `fetchDashboard()` (user section) | loading, ready, empty, error, forbidden |
| AdminExportManager | `requestExport()`, `fetchExportStatus()` | loading, ready, empty, error, forbidden |

## Navigation Flow

1. **AdminAnalyticsShell** wraps all pages with a consistent header
   ("لوحة التحليلات") and status-driven rendering (loading/error/empty/
   forbidden/ready). The shell gates content until a valid admin session
   is confirmed.

2. **AnalyticsPageLayout** provides sidebar navigation with links to each
   report page. Mobile breakpoint at 768px collapses the sidebar into a
   slide-out drawer. All navigation labels are in Arabic.

3. **AdminPlatformOverview** loads dashboard data on mount via
   `fetchDashboard()`. KPI cards render backend-returned `value`, `label`,
   and optional `trend` fields using `AnalyticsKpiCard`. Chart sections
   render inside `AnalyticsChartShell` containers. Data tables use
   `AnalyticsTableShell` with backend-supplied rows.

4. **Report pages** (Learning, Assessment, Revenue) follow the same
   pattern: load report definitions on mount, display each definition in
   a table row with a "تشغيل التقرير" action button. Running a report
   calls the corresponding API endpoint and transitions the row to a
   status badge (`queued` → `running` → `completed` / `failed`). No
   polling loop — a single follow-up status check after the initial run
   request.

5. **AdminExportManager** allows admin users to request data exports from
   completed report runs. The export request goes through
   `requestExport()`, and the page shows the export job status via
   `fetchExportStatus()`. Download is only available when the backend
   returns `status: 'completed'` with a valid `resultRef`.

## Filter Bar

`AnalyticsFilterBar` provides date range and category filter controls.
Filter state is submitted to backend APIs as query parameters — the UI
never filters already-fetched data to produce new aggregate values. This
preserves backend authority over all metric computations.

## Shared Primitives

| Primitive | Usage |
|---|---|
| `AnalyticsKpiCard` | Dashboard KPI widgets — label, value, trend, period |
| `AnalyticsChartShell` | Container for chart visualizations with accessible alt text |
| `AnalyticsTableShell` | Consistent table rendering with header, body, empty state |
| `AnalyticsFilterBar` | Date range and category filters, submitted to backend |

All primitives use AIM design system tokens (`--color-*`, `--space-*`,
`--type-*`, `--radius-*`, `--shadow-*`) and provide Arabic labels.

## Findings

- All pages correctly treat the backend as sole authority for dashboard
  data, report content, run status, and export artifacts.
- Error states are handled at both the shell level (`AdminAnalyticsShell`
  error state) and per-page level (inline error messages with
  `role="alert"`), so a failed API call never leaves the UI in a loading
  state.
- Empty states are explicit for both "no data available" and "no report
  definitions" cases.
- Forbidden state (403) is rendered when the access guard denies entry,
  showing "ليس لديك صلاحية لعرض هذه الصفحة" with appropriate guidance.
- The API client (`adminAnalyticsApiClient.js`) handles authentication
  token attachment and error response parsing consistently across all
  endpoints.

## Test Coverage

`apps/web/src/features/admin-analytics/__tests__/admin-analytics-ui.test.js`
(P15-067) exercises all page components' loading/ready/empty/error states
and the API interaction patterns.

## Verdict

**PASS** — Admin analytics E2E flow is complete, backend-driven, and
consistent with the AIM design system and analytics authority rules.
