# Phase 16 Readiness Checklist — From Phase 15

**Task:** P15-082
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document QA, performance, and deployment readiness from the analytics and
reporting outputs delivered in Phase 15, identifying what Phase 16 must
address before production release.

## 1. Backend Readiness

### Ready for Deployment

- [x] Analytics module registered in NestJS app module
- [x] All database migrations created (analytics_events, metric_definitions,
      metric_aggregates, report_definitions, report_runs, dashboard_widgets,
      export_jobs, analytics_access_audit_logs, analytics_cohorts, constraints)
- [x] Seed data / fixtures for metric and report definitions
- [x] Event ingestion service with unsafe-metadata stripping
- [x] Metric definition and aggregation services
- [x] Report definition and runner services (stub execution)
- [x] Dashboard, export, cohort, access policy, audit services
- [x] All API controllers with guard/decorator protection
- [x] Unit tests for ingestion, aggregation, report runner, export, cohort,
      validation, access guard, access policy

### Requires Phase 16 Work

- [ ] **Report content assembly** — `ReportRunnerService.execute()` is a
      stub. Phase 16 must implement actual report data assembly, including
      field-level selection, pagination, and format rendering.
- [ ] **Per-event-type metadata validation** — Currently only the
      forbidden-pattern regex strips secrets. Phase 16 should enforce the
      event taxonomy's per-type field allowlist at ingestion time.
- [ ] **Integration tests** — End-to-end pipeline tests (ingestion →
      aggregation → report → export) are not yet implemented.
- [ ] **Database indexing** — Review query patterns and add appropriate
      indexes for analytics_events (eventType, timestamp, scope),
      metric_aggregates (metricKey, scope, period), and report_runs
      (requestedByUserId, status).
- [ ] **Connection pooling** — Verify analytics queries do not starve the
      shared connection pool under concurrent admin dashboard loads.

## 2. Frontend Readiness

### Ready for Deployment

- [x] Admin analytics feature shell with loading/empty/error/forbidden states
- [x] Admin analytics layout (sidebar, responsive, RTL-ready)
- [x] All admin report pages (overview, learning, curriculum, assessment,
      notification, revenue, user, export)
- [x] Admin analytics API client
- [x] Admin analytics UI tests
- [x] Parent reporting pages (analytics reports, progress, assessment)
- [x] Parent reporting API client and UI tests
- [x] Student analytics summary page (Flutter mobile)
- [x] Student analytics UI tests
- [x] AIM design system compliance verified (P15-074)

### Requires Phase 16 Work

- [ ] **Chart library integration** — Chart shells are placeholder
      containers. Phase 16 must integrate a chart rendering library and
      apply the design system's data-visualization color palette.
- [ ] **Real-time status polling** — Report run status uses a single
      follow-up check. Phase 16 should implement periodic polling or
      WebSocket updates for long-running reports.
- [ ] **Export download flow** — Export manager shows status but does not
      yet handle file download. Phase 16 must implement the download
      mechanism once `ExportService` generates actual artifacts.
- [ ] **Performance testing** — Load test the admin dashboard with
      realistic data volumes to verify render times stay under 2s.

## 3. Security Readiness

### Verified

- [x] All endpoints guarded by `SupabaseJwtAuthGuard` + `AnalyticsAccessGuard`
- [x] Role-based category access enforced via `AnalyticsAccessPolicyService`
- [x] Report definition visibility filtered by role
- [x] Export ownership check prevents cross-user data access
- [x] Audit logging for analytics access events
- [x] No secrets in committed code

### Requires Phase 16 Work

- [ ] **Rate limiting** — Analytics endpoints do not have rate limits.
      Phase 16 should add throttling to prevent dashboard refresh abuse.
- [ ] **Scope-ownership in guard** — Ownership checks are per-controller
      rather than in the shared guard. Recommend centralizing.

## 4. Privacy Readiness

### Verified

- [x] Minimum cohort size (5) enforced in code
- [x] Unsafe metadata stripped at ingestion (secrets, credentials, keys)
- [x] No PII fields on aggregate entities
- [x] Export scope enforced at service level
- [x] Child-data consent scope respected (parent access via ParentChildAccessGuard)

### Requires Phase 16 Work

- [ ] **Per-event-type field allowlist** — Enforce the event taxonomy's
      approved fields per event type, not just the forbidden-pattern regex.
- [ ] **Data retention** — Define and implement analytics event retention
      policies (e.g. auto-archive events older than N months).

## 5. Performance Readiness

### Requires Phase 16 Work

- [ ] **Query optimization** — Profile aggregation queries with realistic
      data volumes (10K+ events, 1K+ students).
- [ ] **Caching** — Consider Redis caching for frequently-accessed
      dashboard widget data with appropriate TTL.
- [ ] **Pagination** — Verify all list endpoints support pagination and
      are not returning unbounded result sets.
- [ ] **CDN** — If export artifacts are stored as files, serve them
      through CDN rather than the API server.

## 6. Deployment Checklist

- [ ] Run all analytics migrations in staging environment
- [ ] Verify seed data loads correctly
- [ ] Smoke test all API endpoints with admin/parent/student roles
- [ ] Verify mobile app analytics summary page connects to staging API
- [ ] Load test admin dashboard endpoint
- [ ] Verify audit logs are being written
- [ ] Review and approve production environment variables
- [ ] Plan rollback procedure for analytics migrations

## Summary

Phase 15 delivered a complete analytics architecture with 83 tasks covering
planning, database, backend services, APIs, tests, three UI surfaces, and
quality reviews. The system is architecturally sound and security/privacy
reviewed. Phase 16 must focus on: report content assembly, chart
integration, performance optimization, and deployment hardening before
production release.
