# P16-043: Performance Remediation Plan

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Plan Documented — Awaiting Prioritization

---

## 1. Purpose

This document consolidates all failed performance thresholds identified in P16-041 (Admin/Parent Dashboard Audit) and P16-042 (Worker/Queue Review), assigns owners, defines remediation actions, and states go/no-go implications for production launch.

---

## 2. Failed Thresholds — Summary

| ID | Finding | Source | Severity | Go/No-Go Impact |
|----|---------|--------|----------|-----------------|
| PERF-001 | No route-level code splitting | P16-041 | CRITICAL | BLOCKING |
| PERF-002 | No API response caching for dashboards | P16-041 | HIGH | BLOCKING |
| PERF-003 | No server-side pagination on list endpoints | P16-041 | HIGH | BLOCKING at scale |
| PERF-004 | No performance monitoring infrastructure | P16-041 | HIGH | BLOCKING |
| PERF-005 | No table virtualization for large datasets | P16-041 | MEDIUM | Non-blocking |
| PERF-006 | No chart data downsampling | P16-041 | MEDIUM | Non-blocking |
| PERF-007 | No filter debouncing | P16-041 | MEDIUM | Non-blocking |
| PERF-008 | No dedicated queue infrastructure | P16-042 | HIGH | BLOCKING at scale |
| PERF-009 | Synchronous billing webhook processing | P16-042 | CRITICAL | BLOCKING |
| PERF-010 | No dead-letter queues | P16-042 | HIGH | BLOCKING |
| PERF-011 | Synchronous report generation | P16-042 | HIGH | Non-blocking (pilot) |
| PERF-012 | No circuit breaker for AIM engine | P16-042 | MEDIUM | Non-blocking |
| PERF-013 | No pre-computed analytics aggregations | P16-042 | HIGH | BLOCKING at scale |
| PERF-014 | Admin-only code shipped to parent bundle | P16-041 | HIGH | BLOCKING |

---

## 3. Remediation Items — Detailed

### PERF-001: Route-Level Code Splitting (CRITICAL)

**Problem:** All admin and parent dashboard code ships in a single bundle. No `React.lazy()` or dynamic imports detected in `apps/web/src/`.

**Fix:**
1. Wrap `AdminAnalyticsShell` in `React.lazy()` in the router.
2. Wrap `ParentDashboardShell` in `React.lazy()` in the router.
3. Add `Suspense` boundaries with loading fallbacks.
4. Verify with `webpack-bundle-analyzer` that chunks are split.

**Files to modify:**
- `apps/web/src/app/App.js` (router configuration)
- `apps/web/src/features/admin-analytics/index.js` (lazy export)
- `apps/web/src/features/parent-dashboard/index.js` (lazy export)

**Owner:** Frontend Team
**Effort:** 1-2 days
**Go/No-Go:** BLOCKING — must complete before launch

---

### PERF-002: Dashboard API Response Caching (HIGH)

**Problem:** Dashboard aggregation endpoints recompute on every request. No caching layer exists in `dashboard.service.ts` or analytics controllers.

**Fix:**
1. Add in-memory cache (or Redis if available) to `DashboardService`.
2. Set TTL of 5 minutes for dashboard aggregations.
3. Add cache invalidation on data mutation.
4. Consider NestJS `CacheModule` integration.

**Files to modify:**
- `services/backend-api/src/features/analytics/dashboard.service.ts`
- `services/backend-api/src/features/analytics/analytics.module.ts`

**Owner:** Backend Team
**Effort:** 2-3 days
**Go/No-Go:** BLOCKING — dashboards will be slow without caching

---

### PERF-003: Server-Side Pagination (HIGH)

**Problem:** List endpoints may return unbounded result sets. `admin-users-list-query.dto.ts` suggests pagination exists for users, but other endpoints need verification.

**Fix:**
1. Audit all list/query endpoints for pagination parameters.
2. Add `page`/`pageSize` or cursor-based pagination to missing endpoints.
3. Set default page size of 25, max page size of 100.
4. Add total count to response for UI pagination controls.

**Files to verify/modify:**
- `services/backend-api/src/features/admin/users/admin-users-list-query.dto.ts` (may already have pagination)
- All controllers with list endpoints in analytics, notifications, billing, curriculum

**Owner:** Backend Team
**Effort:** 3-5 days
**Go/No-Go:** BLOCKING at scale — acceptable for pilot with small user counts

---

### PERF-004: Performance Monitoring (HIGH)

**Problem:** `reportWebVitals.js` exists but is not connected to any monitoring backend. No server-side metrics collection.

**Fix:**
1. Connect `reportWebVitals.js` to a monitoring service (DataDog, New Relic, or self-hosted).
2. Add NestJS interceptor for API response time tracking.
3. Add Lighthouse CI to build pipeline.
4. Set up performance regression alerts.

**Files to modify:**
- `apps/web/src/reportWebVitals.js`
- New: Backend interceptor for request timing
- CI pipeline configuration

**Owner:** DevOps / Platform Team
**Effort:** 3-5 days
**Go/No-Go:** BLOCKING — cannot operate blind in production

---

### PERF-009: Async Billing Webhook Processing (CRITICAL)

**Problem:** `webhook.controller.ts` appears to process webhooks synchronously. Payment providers (Stripe, etc.) expect responses within 5-10 seconds or will retry.

**Fix:**
1. Store raw webhook payload immediately upon receipt.
2. Return 200 to provider within 1 second.
3. Process webhook asynchronously via job queue.
4. Add webhook replay capability from stored payloads.

**Files to modify:**
- `services/backend-api/src/features/billing/webhook.controller.ts`
- `services/backend-api/src/features/billing/provider-webhook.service.ts`

**Owner:** Backend Team / Billing Lead
**Effort:** 3-5 days
**Go/No-Go:** BLOCKING — required before accepting real payments

---

### PERF-010: Dead-Letter Queues (HIGH)

**Problem:** No DLQ exists for any async processing path. Failed jobs are lost.

**Fix:**
1. Implement DLQ for notification delivery failures.
2. Implement DLQ for webhook processing failures.
3. Add DLQ monitoring and alerting.
4. Create admin endpoint to inspect/replay DLQ items.

**Owner:** Backend Team
**Effort:** 3-5 days
**Go/No-Go:** BLOCKING — lost notifications/payments are unacceptable

---

### PERF-013: Pre-Computed Analytics (HIGH)

**Problem:** `metric-aggregation.service.ts` likely computes metrics on-demand from raw events.

**Fix:**
1. Create materialized summary tables for key metrics (daily active students, completion rates, revenue).
2. Schedule aggregation jobs to run hourly/daily.
3. Dashboard service reads from summary tables instead of raw events.

**Owner:** Backend Team / Analytics Lead
**Effort:** 5-8 days
**Go/No-Go:** BLOCKING at scale — acceptable for pilot

---

## 4. Remediation Priority Matrix

### Must-Fix Before Launch (P0)

| Item | Effort | Owner |
|------|--------|-------|
| PERF-001: Code splitting | 1-2 days | Frontend |
| PERF-009: Async webhooks | 3-5 days | Backend |
| PERF-004: Performance monitoring | 3-5 days | DevOps |
| PERF-014: Bundle separation by role | 1-2 days | Frontend |

### Must-Fix Before Scale (P1)

| Item | Effort | Owner |
|------|--------|-------|
| PERF-002: Dashboard caching | 2-3 days | Backend |
| PERF-003: Pagination | 3-5 days | Backend |
| PERF-008: Queue infrastructure | 5-8 days | Backend/DevOps |
| PERF-010: Dead-letter queues | 3-5 days | Backend |
| PERF-013: Pre-computed analytics | 5-8 days | Backend |

### Should-Fix (P2)

| Item | Effort | Owner |
|------|--------|-------|
| PERF-005: Table virtualization | 2-3 days | Frontend |
| PERF-006: Chart downsampling | 1-2 days | Frontend |
| PERF-007: Filter debouncing | 1 day | Frontend |
| PERF-011: Async reports | 3-5 days | Backend |
| PERF-012: Circuit breaker | 2-3 days | Backend |

---

## 5. Timeline Estimate

| Phase | Items | Duration | Gate |
|-------|-------|----------|------|
| Sprint 1 | P0 items (PERF-001, -004, -009, -014) | 1 week | Launch gate |
| Sprint 2 | P1 items (PERF-002, -003, -010) | 1 week | Scale gate |
| Sprint 3 | P1 items (PERF-008, -013) | 1 week | Scale gate |
| Backlog | P2 items | Ongoing | Quality gate |

**Total estimated effort for P0 items: 8-14 developer-days.**

---

## 6. Go/No-Go Decision

### Current Assessment: CONDITIONAL GO

The platform can launch for a controlled pilot (100-200 students) with the following conditions:

1. **P0 items must be completed** before any public-facing launch.
2. **P1 items must be completed** before scaling beyond pilot.
3. **P2 items** are quality-of-life improvements that can be addressed post-launch.

### Decision Owners

| Decision | Owner | Status |
|----------|-------|--------|
| Frontend P0 approval | Frontend Lead | PENDING |
| Backend P0 approval | Backend Lead | PENDING |
| DevOps P0 approval | DevOps Lead | PENDING |
| Overall go/no-go | Engineering Manager | PENDING |
