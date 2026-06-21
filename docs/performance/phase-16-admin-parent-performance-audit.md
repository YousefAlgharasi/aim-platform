# P16-041: Admin & Parent Dashboard Performance Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit covers performance characteristics of both the **admin dashboard** and **parent dashboard** in the AIM Platform web application (`apps/web/src/`), including:

- Bundle size and code splitting
- Page load times and initial render
- Table rendering with large datasets
- Filter and search responsiveness
- Chart/report rendering
- API response times for dashboard endpoints

---

## 2. Admin Dashboard — Component Inventory

### 2.1 Pages Audited

| Page File | Feature Area |
|-----------|-------------|
| `apps/web/src/pages/AdminDashboard.jsx` | Main admin shell |
| `apps/web/src/features/admin-analytics/pages/AdminPlatformOverview.js` | Platform overview with KPI cards |
| `apps/web/src/features/admin-analytics/pages/AdminUserReports.js` | User management reports |
| `apps/web/src/features/admin-analytics/pages/AdminLearningReports.js` | Learning progress reports |
| `apps/web/src/features/admin-analytics/pages/AdminAssessmentReports.js` | Assessment analytics |
| `apps/web/src/features/admin-analytics/pages/AdminRevenueReports.js` | Revenue/billing reports |
| `apps/web/src/features/admin-analytics/pages/AdminCurriculumReports.js` | Curriculum analytics |
| `apps/web/src/features/admin-analytics/pages/AdminNotificationReports.js` | Notification analytics |
| `apps/web/src/features/admin-analytics/pages/AdminExportManager.js` | Export management |
| `apps/web/src/features/admin-notifications/pages/AdminNotificationMonitor.jsx` | Notification monitoring |
| `apps/web/src/features/admin-notifications/pages/AdminTemplateMonitor.jsx` | Template management |

### 2.2 Shared Components

| Component | Purpose |
|-----------|---------|
| `AnalyticsFilterBar.js` | Date range, cohort, and dimension filters |
| `AnalyticsKpiCard.js` | KPI metric display cards |
| `AnalyticsChartShell.js` | Chart container with loading states |
| `AnalyticsTableShell.js` | Data table with pagination/sorting |
| `AnalyticsPageLayout.js` | Consistent page layout wrapper |

---

## 3. Parent Dashboard — Component Inventory

### 3.1 Pages Audited

| Page File | Feature Area |
|-----------|-------------|
| `apps/web/src/pages/ParentDashboard.jsx` | Parent dashboard shell |
| `ParentDashboardHome.js` | Home overview |
| `ParentProgressReport.js` | Child progress report |
| `ParentProgressSummary.js` | Progress summary view |
| `ParentAssessments.js` | Assessment history |
| `ParentAssessmentReport.js` | Detailed assessment report |
| `ParentBilling.js` | Billing overview |
| `ParentInvoices.js` | Invoice listing |
| `ParentSubscription.js` | Subscription management |
| `ParentNotifications.js` | Notification center |
| `ParentNotificationPreferences.js` | Notification settings |
| `ParentAnalyticsReports.js` | Parent-scoped analytics |
| `ParentSkillState.js` | Skill mastery status |
| `ParentWeaknessRecommendation.js` | Weakness/recommendation view |
| `ParentActivity.js` | Recent activity feed |
| `ParentDeadlineReminders.js` | Deadline tracking |
| `ParentDeadlineStatus.js` | Deadline status board |

### 3.2 Shared Components

| Component | Purpose |
|-----------|---------|
| `ParentCard.js` | Content card container |
| `ParentTable.js` | Data table for parent views |
| `ParentChartShell.js` | Chart rendering container |
| `ParentProgressBlock.js` | Progress visualization |
| `ParentBadge.js` | Status badge component |
| `ParentLoadingState.js` | Loading skeleton |
| `ParentErrorState.js` | Error display |
| `ParentEmptyState.js` | Empty data state |

---

## 4. Bundle Size Assessment

### 4.1 Current State

The web app uses Create React App (`apps/web/`). Key observations:

- **No code splitting detected**: The `App.js` entry point and `apps/web/src/app/App.js` do not use `React.lazy()` or dynamic `import()` for route-level splitting.
- **No tree-shaking verification**: No bundle analysis tooling (e.g., `webpack-bundle-analyzer`, `source-map-explorer`) is configured.
- **Chart library impact unknown**: `AnalyticsChartShell.js` likely imports a charting library but the exact dependency and its bundle impact are not measured.

### 4.2 Estimated Risk

| Concern | Severity | Notes |
|---------|----------|-------|
| No route-level code splitting | HIGH | All dashboard code ships in one bundle |
| Chart library potentially large | MEDIUM | Libraries like recharts/chart.js add 100-300KB gzipped |
| Admin-only code sent to parents | HIGH | No role-based bundle separation |

### 4.3 Recommendations

1. Implement `React.lazy()` with `Suspense` for admin-analytics, admin-notifications, and parent-dashboard feature shells.
2. Add `webpack-bundle-analyzer` to the build pipeline.
3. Set a bundle budget (target: <300KB gzipped for initial load).

---

## 5. Page Load Performance

### 5.1 API Endpoints Driving Dashboards

Backend controllers providing dashboard data:

| Controller | File | Concern |
|------------|------|---------|
| `AdminAnalyticsDashboardController` | `services/backend-api/src/features/analytics/admin-analytics-dashboard.controller.ts` | Platform-wide aggregations |
| `AdminLearningReportsController` | `services/backend-api/src/features/analytics/admin-learning-reports.controller.ts` | Learning metrics |
| `AdminAssessmentReportsController` | `services/backend-api/src/features/analytics/admin-assessment-reports.controller.ts` | Assessment reports |
| `AdminRevenueReportsController` | `services/backend-api/src/features/analytics/admin-revenue-reports.controller.ts` | Revenue data |
| `ParentReportsController` | `services/backend-api/src/features/analytics/parent-reports.controller.ts` | Parent-scoped data |
| `StudentAnalyticsSummaryController` | `services/backend-api/src/features/analytics/student-analytics-summary.controller.ts` | Student summary |
| `DashboardService` | `services/backend-api/src/features/analytics/dashboard.service.ts` | Dashboard aggregation |

### 5.2 Performance Concerns

| Issue | Impact | Status |
|-------|--------|--------|
| No caching layer on aggregation queries | HIGH — repeated dashboard loads hit DB every time | NOT IMPLEMENTED |
| No pagination on admin user/learning reports | MEDIUM — will degrade at scale | NEEDS VERIFICATION |
| No debounce on filter bar API calls | MEDIUM — rapid filter changes cause request floods | NEEDS VERIFICATION |
| Report generation may block API thread | HIGH — long-running reports block NestJS event loop | NEEDS VERIFICATION |

---

## 6. Table Rendering Performance

### 6.1 Admin Tables

`AnalyticsTableShell.js` provides table rendering for admin views. Audit findings:

- **Virtualization**: No evidence of virtual scrolling (e.g., `react-virtualized`, `react-window`). Tables render all rows to DOM.
- **Pagination**: Server-side pagination status unknown — admin-users endpoint (`admin-users-list-query.dto.ts`) has query DTO suggesting pagination support exists for user lists.
- **Sorting**: Client-side sorting is likely for small datasets but will fail at scale.

### 6.2 Parent Tables

`ParentTable.js` renders parent-facing data tables. Similar concerns apply:

- No virtualization detected
- Invoice and assessment tables may grow unbounded

### 6.3 Recommendations

1. Implement server-side pagination for all list endpoints (target: 25-50 items per page).
2. Add virtual scrolling for tables exceeding 100 rows.
3. Implement cursor-based pagination for invoice and notification lists.

---

## 7. Chart & Report Rendering

### 7.1 Components

- `AnalyticsChartShell.js` — admin chart container
- `ParentChartShell.js` — parent chart container

### 7.2 Findings

- Chart rendering library is abstracted behind shell components, which is good for swapability.
- No evidence of data downsampling for large time-series datasets.
- No lazy loading of chart components detected.
- Report export (`AdminExportManager.js`, `analytics-export.controller.ts`, `analytics-export.service.ts`) exists but performance characteristics of export generation are unknown.

### 7.3 Recommendations

1. Implement data downsampling for time-series beyond 1000 data points.
2. Lazy-load chart library code only when chart components mount.
3. Move report export generation to a background job (see P16-042 worker queue review).

---

## 8. Filter & Search Responsiveness

### 8.1 Admin Filters

`AnalyticsFilterBar.js` provides filtering for admin analytics pages. Concerns:

- No debounce mechanism observed in filter bar implementation
- Each filter change likely triggers a full API request
- Date range selection with large datasets may cause slow responses

### 8.2 Parent Filters

Parent dashboard uses `ParentChildSelector.js` for child scope switching. This is a critical path — switching children should not cause a full page reload.

### 8.3 Recommendations

1. Add 300ms debounce to text search inputs.
2. Implement optimistic UI updates for filter state.
3. Cache previously fetched filter results for back-navigation.

---

## 9. Performance Thresholds

| Metric | Target | Current Status |
|--------|--------|----------------|
| Initial page load (LCP) | < 2.5s | NOT MEASURED |
| Time to interactive (TTI) | < 3.5s | NOT MEASURED |
| API response time (p95) | < 500ms | NOT MEASURED |
| Table render (100 rows) | < 100ms | NOT MEASURED |
| Chart render (initial) | < 200ms | NOT MEASURED |
| Bundle size (gzipped) | < 300KB | NOT MEASURED |
| Filter-to-result latency | < 500ms | NOT MEASURED |

**Status: No performance measurement infrastructure is in place.** Web Vitals reporting exists (`reportWebVitals.js`) but is not connected to any monitoring backend.

---

## 10. Summary & Go/No-Go Impact

### Critical Findings

1. **No code splitting** — all code ships in one bundle. Must fix before production.
2. **No caching on dashboard aggregations** — will cause poor UX under load.
3. **No performance monitoring** — cannot measure or alert on degradation.

### Recommended Before Launch

- [ ] Implement route-level code splitting for admin and parent features
- [ ] Add bundle size budget to CI
- [ ] Implement API response caching for dashboard endpoints
- [ ] Add server-side pagination to all list endpoints
- [ ] Connect `reportWebVitals.js` to a monitoring service
- [ ] Run Lighthouse CI audit and establish baseline scores

### Go/No-Go Assessment

**Current: NO-GO** — Without code splitting and pagination, the dashboards will not perform acceptably at scale. These are blocking items for production readiness.
