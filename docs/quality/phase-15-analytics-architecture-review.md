# Phase 15 — Analytics Architecture Review

**Task:** P15-077
**Date:** 2026-06-21
**Reviewer:** GHOST3030

## Scope

Review backend aggregation, API, UI, and export architecture for the
analytics/reporting system introduced in Phase 15. Evaluate feature
boundaries, maintainability, and readiness for production use.

## 1. Backend Architecture

### Module Structure

`services/backend-api/src/features/analytics/analytics.module.ts` is the
single NestJS module that owns all analytics concerns:

| Layer | Files | Responsibility |
|---|---|---|
| **Ingestion** | `analytics-event-ingestion.service.ts` | Accepts domain events, strips unsafe metadata, persists `AnalyticsEvent` entities |
| **Definitions** | `metric-definition.service.ts`, `report-definition.service.ts` | Seed and query metric/report definitions, role-filtered |
| **Aggregation** | `metric-aggregation.service.ts` | Compute `MetricAggregate` values from events within scope/period, enforce min cohort size |
| **Cohort** | `cohort.service.ts` | Resolve reportable cohort members, enforce minimum aggregate size |
| **Reporting** | `report-runner.service.ts` | Create/execute report runs, produce `resultRef` pointers |
| **Dashboard** | `dashboard.service.ts` | Assemble dashboard widget data from aggregates/definitions |
| **Export** | `analytics-export.service.ts`, `analytics-export.controller.ts` | Export request lifecycle (request → ownership check → status tracking) |
| **Access** | `analytics-access-policy.service.ts`, `analytics-access.guard.ts`, `analytics-access.decorator.ts` | Role/scope authorization |
| **Audit** | `analytics-audit.service.ts` | Log analytics access events |
| **Validation** | `analytics.validation.ts` | Shared validation (cohort size, scope, period format) |
| **Persistence** | `analytics.repository.ts`, `analytics.entities.ts`, `analytics.dtos.ts` | Data access, entity/DTO definitions |

**Verdict: PASS** — Clean single-module boundary. Each service has a single
responsibility. No circular dependencies detected.

### API Controllers

| Controller | Routes | Role Access |
|---|---|---|
| `admin-analytics-dashboard.controller.ts` | `GET /api/analytics/admin/dashboard` | admin |
| `admin-learning-reports.controller.ts` | `GET/POST /api/analytics/admin/reports/learning` | admin |
| `admin-assessment-reports.controller.ts` | `GET/POST /api/analytics/admin/reports/assessment` | admin |
| `admin-revenue-reports.controller.ts` | `GET/POST /api/analytics/admin/reports/revenue` | admin |
| `parent-reports.controller.ts` | `GET/POST /api/analytics/parent/reports` | parent |
| `student-analytics-summary.controller.ts` | `GET /api/analytics/student/summary` | student |
| `analytics-export.controller.ts` | `POST/GET /api/analytics/exports` | admin, parent |

All controllers are guarded by `SupabaseJwtAuthGuard` + `AnalyticsAccessGuard`
with per-route `@RequireAnalyticsAccess` decorators.

**Verdict: PASS.**

## 2. UI Architecture

### Web — Admin Analytics (`apps/web/src/features/admin-analytics/`)

| Component | Purpose |
|---|---|
| `AdminAnalyticsShell` | Feature shell with loading/empty/error/forbidden states |
| `AnalyticsPageLayout` | Sidebar + content layout, responsive |
| `AnalyticsKpiCard`, `AnalyticsChartShell`, `AnalyticsTableShell`, `AnalyticsFilterBar` | Shared analytics primitives |
| `AdminPlatformOverview`, `AdminLearningReports`, `AdminCurriculumReports`, `AdminAssessmentReports`, `AdminNotificationReports`, `AdminRevenueReports`, `AdminUserReports` | Page components — each calls backend API, renders response |
| `AdminExportManager` | Export request/status page |
| `adminAnalyticsApiClient.js` | HTTP client wrapping `/api/analytics/admin/*` endpoints |

### Web — Parent Analytics (`apps/web/src/features/parent-dashboard/pages/`)

- `ParentAnalyticsReports`, `ParentProgressReport`, `ParentAssessmentReport`
- All use `parentAnalyticsApiClient.js` to call `/api/analytics/parent/*`
- Share `ParentCard`, `ParentTable`, `ParentBadge` primitives

### Mobile — Student Analytics (`apps/mobile/lib/features/analytics_summary/`)

- Clean Architecture layers: data (datasource, model, repository impl),
  logic (entity, provider, repository interface), UI (page)
- Provider-based state management via Riverpod
- Single page (`AnalyticsSummaryPage`) calls backend summary endpoint

**Verdict: PASS** — Feature-first architecture. Each surface has its own
folder, API client, and primitives. No cross-feature imports.

## 3. Data Flow

```
Domain Event → EventIngestionService → AnalyticsEvent (persisted)
                                            ↓
MetricDefinitionService ← defines →  MetricAggregationService
                                            ↓
                                     MetricAggregate (persisted)
                                            ↓
ReportDefinitionService → ReportRunnerService → ReportRun (resultRef)
                                            ↓
DashboardService ← reads ← aggregates/definitions
                                            ↓
ExportService ← reads ← completed report runs
                                            ↓
Controllers → Guards/Access Policy → JSON Response → UI renders
```

All computation happens server-side. UI receives pre-computed values and
renders them. No client-side aggregation detected.

**Verdict: PASS.**

## 4. Export Architecture

- `AnalyticsExportService.requestExport()` validates ownership
  (`reportRun.requestedByUserId === requestedByUserId`), requires
  `reportRun.status === 'completed'`, and creates an `ExportJob` entity
  with status tracking.
- Export artifacts are referenced by `resultRef` (pointer), not inline data.
- Export scope is enforced at the service level — the controller cannot
  bypass it.
- **Verdict: PASS.**

## 5. Feature Boundaries

| Boundary | Enforced? |
|---|---|
| Analytics ↔ Auth | Yes — analytics reads user/role from auth context, never writes |
| Analytics ↔ Curriculum | Yes — analytics references curriculum IDs in events, never modifies curriculum |
| Analytics ↔ Billing | Yes — revenue metrics consume billing events, never invoke billing operations |
| Analytics ↔ Notifications | Yes — notification metrics consume notification events, never send notifications |
| Admin UI ↔ Parent UI | Yes — separate feature folders, separate API clients, no shared state |

**Verdict: PASS.**

## 6. Maintainability Assessment

- **Strengths:** Single module with clear internal layering, role-based
  access policy as a composable service, consistent controller pattern
  (guard + decorator + service call), feature-first UI organization.
- **Concerns:** `ReportRunnerService.execute()` is still a stub returning
  only `resultRef` — actual report content assembly is deferred. This is
  documented and intentional for Phase 15 but must be implemented before
  production use.
- **Test coverage:** Backend has unit tests for ingestion, aggregation,
  report runner, export, cohort, validation, access guard, and access
  policy. UI has test suites for parent reporting and admin analytics.

## Overall Verdict

**APPROVED** — Analytics architecture is well-structured with clear
boundaries, consistent patterns, and appropriate separation of concerns.
Ready for Phase 16 deployment/performance work.

## Recommendations

1. Implement `ReportRunnerService.execute()` content assembly before
   production deployment.
2. Consider extracting the ownership-check pattern from individual
   controllers into the shared guard for consistency.
3. Add integration tests that exercise the full ingestion → aggregation →
   report → export pipeline.
