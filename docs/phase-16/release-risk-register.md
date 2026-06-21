# Release Risk Register

**Task:** P16-004
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document launch risks for the AIM Platform production release, including
severity, ownership, mitigation strategies, and unresolved blockers. Risks
are categorized by subsystem and ranked by severity.

## Risk Severity Scale

| Level | Definition |
|-------|------------|
| **Critical** | Blocks launch. Must be resolved before production deployment. |
| **High** | Significant risk to user experience, data integrity, or security. Should be resolved before launch; may proceed with documented mitigation. |
| **Medium** | Notable risk that should be addressed soon after launch. Mitigation plan required. |
| **Low** | Minor risk with minimal impact. Can be addressed in subsequent releases. |

## Risk Register

### R-001: Report Runner Stub Not Implemented

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Owner** | Backend team |
| **System** | Analytics (`services/backend-api/src/features/analytics/`) |
| **Description** | `ReportRunnerService.execute()` is a stub as noted in `docs/phase-16/readiness-from-phase-15.md`. Admin and parent report endpoints will return empty results. |
| **Mitigation** | Implement actual report data assembly with field-level selection, pagination, and format rendering before launch. Alternatively, disable report endpoints behind a feature gate. |
| **Status** | Unresolved blocker |

### R-002: No Load Testing Performed

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Owner** | Backend team + Platform team |
| **System** | Backend API, AIM Engine |
| **Description** | No load tests have been run against any backend service. Performance targets (p95 < 500ms) are defined but unvalidated. |
| **Mitigation** | Run load tests against staging with realistic data volumes (10K+ events, 1K+ students) before production deployment. |
| **Status** | Unresolved |

### R-003: Data Retention Policy Not Implemented

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Owner** | Backend team |
| **System** | Analytics |
| **Description** | Analytics events accumulate indefinitely. No auto-archive or TTL-based cleanup exists. Flagged in Phase 15 readiness review. |
| **Mitigation** | Implement retention policy or defer with monitoring on table sizes. Set alerting threshold for analytics_events row count. |
| **Status** | Unresolved |

### R-004: No Monitoring or Alerting Infrastructure

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Owner** | Platform team |
| **System** | All services |
| **Description** | No error tracking (Sentry), no structured logging pipeline, no alerting rules, no request tracing. Issues in production will be invisible until user reports. |
| **Mitigation** | Set up basic error tracking and health check monitoring before launch. Full observability can follow in subsequent releases. |
| **Status** | Unresolved |

### R-005: Migration Rollback Not Tested

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Owner** | Backend team + DBA |
| **System** | Database (114 Prisma migrations) |
| **Description** | Prisma does not natively support individual migration rollback (only `migrate reset` which destroys all data). If a migration fails in production, manual SQL intervention is required. |
| **Mitigation** | Prepare manual rollback SQL scripts for the last 10 migrations. Test rollback procedure on staging. Consider a pre-migration database snapshot. |
| **Status** | Unresolved |

### R-006: Payment Provider Integration Not Live-Tested

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Owner** | Backend team |
| **System** | Billing (`services/backend-api/src/features/billing/`) |
| **Description** | Billing uses `payment-provider.adapter.ts` which abstracts the payment provider. Live integration with an actual payment processor has not been tested. Webhook signature verification is implemented but untested against real webhooks. |
| **Mitigation** | Complete sandbox integration testing with the chosen payment provider. Verify webhook delivery, signature validation, and idempotency handling. |
| **Status** | Unresolved |

### R-007: Per-Event-Type Metadata Validation Missing

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Backend team |
| **System** | Analytics |
| **Description** | Event ingestion only applies a forbidden-pattern regex to strip secrets. The event taxonomy's per-type field allowlist is not enforced at ingestion time, meaning unexpected metadata fields can leak through. |
| **Mitigation** | Implement per-event-type validation against the event taxonomy. Log violations for audit. |
| **Status** | Unresolved |

### R-008: No Feature Flag Infrastructure

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Platform team |
| **System** | All services |
| **Description** | No feature flag system exists. If a launched feature causes issues, the only options are full rollback or code hotfix. |
| **Mitigation** | Implement basic feature flags for high-risk features (billing, AI teacher, voice mode). Can use environment variables as a simple toggle initially. |
| **Status** | Unresolved |

### R-009: Mobile App Store Review Delay

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Mobile team |
| **System** | Mobile App |
| **Description** | App Store and Google Play review processes introduce unpredictable delays. A critical bug fix may take 24-72 hours to reach users after submission. |
| **Mitigation** | Submit the initial release early to establish the app listing. Use backend-controlled feature gates where possible. Ensure API versioning supports older app versions. |
| **Status** | Accepted risk |

### R-010: AIM Engine Single Point of Failure

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Algorithm team + Platform team |
| **System** | AIM Engine (`services/aim-engine/`) |
| **Description** | The AIM Engine runs as a single internal service. If it becomes unavailable, adaptive learning recommendations stop. The backend has `aim-health-check.service.ts` but no fallback behavior. |
| **Mitigation** | Implement graceful degradation in the backend — serve cached recommendations or a default learning path when the AIM Engine is unreachable. Monitor health check frequency. |
| **Status** | Unresolved |

### R-011: Admin Dashboard No Automated Tests

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Frontend team |
| **System** | Admin Dashboard (`apps/admin-dashboard/`) |
| **Description** | The CI workflow runs typecheck and build but no automated tests. The `__tests__/` directory exists but test coverage is unknown. UI regressions may go undetected. |
| **Mitigation** | Add basic smoke tests for critical admin flows (login, curriculum management, billing overview). |
| **Status** | Unresolved |

### R-012: CORS Configuration Not Production-Hardened

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Owner** | Backend team |
| **System** | Backend API |
| **Description** | `CORS_ORIGINS` defaults to `http://localhost:3001,http://localhost:3002` in `.env.example`. Production values must be set to actual domain origins. If misconfigured, either the apps cannot reach the API or the API is open to unauthorized origins. |
| **Mitigation** | Define production CORS origins in deployment configuration. Validate during staging deployment. |
| **Status** | Unresolved |

### R-013: RTL/Arabic Rendering Edge Cases

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Owner** | Mobile team + Frontend team |
| **System** | Mobile App, Admin Dashboard, Web App |
| **Description** | Arabic/RTL support is a platform requirement. While the design system includes RTL foundations, edge cases (mixed LTR/RTL content, numeric formatting, bi-directional text in forms) may not be fully tested. |
| **Mitigation** | Conduct manual RTL testing pass with native Arabic speakers before launch. |
| **Status** | Unresolved |

### R-014: Notification Delivery Reliability

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Owner** | Backend team |
| **System** | Notifications |
| **Description** | Notification delivery uses noop provider adapters (`noop-email-provider.adapter.ts`, `noop-push-provider.adapter.ts`). Real email/push providers must be configured before launch. |
| **Mitigation** | Integrate actual email and push notification providers. Test delivery in staging. |
| **Status** | Unresolved |

## Unresolved Blockers Summary

| Risk ID | Title | Severity |
|---------|-------|----------|
| R-001 | Report Runner Stub | Critical |
| R-002 | No Load Testing | High |
| R-005 | Migration Rollback Not Tested | High |
| R-006 | Payment Provider Not Live-Tested | High |

All Critical and High severity items must be resolved or have documented
mitigation plans approved by the tech lead before production deployment
proceeds.
