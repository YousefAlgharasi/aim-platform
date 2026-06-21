# Production Readiness Criteria

**Task:** P16-003
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define the required checks that must pass before the AIM Platform is
approved for production deployment. Each criterion specifies what is
checked, how it is verified, and its current status.

## 1. Correctness

| Check | Verification Method | Status |
|-------|---------------------|--------|
| All backend unit tests pass | `npm run test` in `services/backend-api/` — 256 spec files | Requires CI run |
| All AIM Engine tests pass | `pytest` in `services/aim-engine/` | Requires CI run |
| All Flutter tests pass | `flutter test` in `apps/mobile/` | Requires CI run |
| Admin dashboard builds without errors | `npm run typecheck && npm run build` in `apps/admin-dashboard/` | Requires CI run |
| Backend-authority rule enforced | No controller accepts client-supplied mastery, grades, difficulty, or report outputs | Verified in assessments (`no-client-authority-api.spec.ts`), analytics (access guard), billing (ownership guard) |
| No speed-as-mastery logic | Response time never used as direct mastery signal | Enforced by guard tests since Phase 1 |
| API contracts match implementation | Controller routes match `docs/phase-15/analytics-api-contracts.md` | Requires Phase 16 audit |
| Database seeds load without errors | `prisma/seeds/` and `database/supabase/seed/seed.sql` apply cleanly | Requires staging validation |

## 2. Security

| Check | Verification Method | Status |
|-------|---------------------|--------|
| No secrets in committed code | Grep for `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `SUPABASE_JWT_SECRET` in source files (excluding `.env.example`) | `.env.example` uses placeholders only; `.gitignore` excludes `.env` and `.env.local` |
| JWT authentication on all API endpoints | All controllers use `SupabaseJwtAuthGuard` | Verified in auth module; guard is applied globally via app module |
| Role-based access control | `RoleGuard`, `PermissionGuard`, `ProfileOwnershipGuard` on protected routes | Present in `src/auth/authorization/` with spec files |
| Parent-child access isolation | `ParentChildAccessGuard` + consent verification on child data endpoints | Verified in `src/features/parents/` |
| Analytics access control | `AnalyticsAccessGuard` + `AnalyticsAccessPolicyService` with audit logging | Verified in `src/features/analytics/` |
| Billing ownership guard | `BillingOwnershipGuard` prevents cross-user billing access | Verified with `billing-ownership.guard.spec.ts` |
| RLS policies defined | Row-level security overview at `database/supabase/policies/rls_overview.sql` | Exists; requires review for completeness |
| CORS configured | `CORS_ORIGINS` env var limits allowed origins | Defined in `.env.example`; requires production value review |
| No `eval()` or dynamic code execution | Static analysis of backend code | Requires audit |
| Webhook signature verification | Payment provider webhook validates signatures | Requires review of `webhook.controller.ts` |

## 3. Privacy

| Check | Verification Method | Status |
|-------|---------------------|--------|
| COPPA/child-data compliance | Parent consent required before child data access | Enforced via `parent-consent.service.ts` |
| Minimum cohort size enforced | Analytics cohort queries reject groups smaller than 5 | Verified in `cohort.service.spec.ts` |
| PII stripping at analytics ingestion | `analytics-event-ingestion.service.ts` strips unsafe metadata | Verified with spec tests |
| No PII in aggregate entities | Analytics aggregate tables do not store names, emails, or identifiers | Schema review required |
| Data retention policy defined | Events older than retention period are archived/deleted | Not yet implemented (flagged in Phase 15 readiness) |
| Export scope enforcement | Export jobs scoped to authorized data only | Verified in `analytics-export.service.ts` |

## 4. Performance

| Check | Verification Method | Status |
|-------|---------------------|--------|
| API p95 response time < 500ms | Load test with 100 concurrent users | Not yet tested |
| Database queries use appropriate indexes | Review migration files for index creation | Index migrations exist (`add_placement_performance_indexes`, `add_aim_integration_indexes`, `add_billing_db_constraints`, `add_analytics_db_constraints`) |
| No unbounded queries | All list endpoints support pagination | Requires audit |
| Mobile cold start < 3 seconds | Device testing on mid-range Android | Not yet tested |
| Admin dashboard SSR < 2 seconds | Page load measurement | Not yet tested |
| AIM Engine recommendation < 1 second | Benchmark with realistic student data | Not yet tested |

## 5. Uptime

| Check | Verification Method | Status |
|-------|---------------------|--------|
| Health check endpoint responds | `GET /health` returns 200 | `src/health/` module exists |
| Graceful shutdown handling | NestJS app handles SIGTERM | Requires verification |
| Database connection pool configured | Prisma connection pool settings | Requires review |
| AIM Engine health check | `aim-health-check.service.ts` monitors engine availability | Present with spec test |
| Service restart recovery | Application recovers state after restart | Requires testing |

## 6. Data Integrity

| Check | Verification Method | Status |
|-------|---------------------|--------|
| All 114 migrations apply in order | Fresh database migration from zero | Requires staging test |
| Foreign key constraints enforced | Prisma schema defines relations; migration SQL includes FK constraints | Present in migration files |
| Unique constraints on critical fields | Users, roles, billing records have uniqueness guards | Present in migration files |
| Idempotent billing operations | `billing-idempotency.service.ts` prevents duplicate charges | Present with webhook idempotency spec |
| Assessment grading consistency | Integration tests verify grading produces consistent results | `assessment-grading.integration.spec.ts` exists |
| Audit logging for sensitive operations | Auth, analytics, billing, parent access, curriculum, notification, and placement modules have audit services | All present |

## 7. Rollback

| Check | Verification Method | Status |
|-------|---------------------|--------|
| Prisma migration rollback tested | `prisma migrate reset` or manual DOWN scripts | Requires testing; Prisma supports reset but not individual rollback by default |
| Service rollback procedure documented | Container image versioning allows rollback to previous version | Requires documentation |
| Feature flag support | Ability to disable new features without full rollback | Not yet implemented |
| Database backup before migration | Automated backup before applying new migrations | Requires operational procedure |
| Client app rollback | Mobile app store rollback; web app deploy revert | Requires procedure documentation |

## 8. Monitoring

| Check | Verification Method | Status |
|-------|---------------------|--------|
| Structured logging | Backend API produces JSON-structured logs | Requires verification |
| Error tracking | Unhandled exceptions captured and alerted | Requires setup (e.g., Sentry) |
| Request tracing | Correlation IDs propagated across services | Requires implementation |
| Database monitoring | Query performance, connection pool, migration status | Requires Supabase dashboard setup |
| Alerting rules defined | CPU, memory, error rate, response time alerts | Requires configuration |
| Audit log monitoring | Security-sensitive audit events trigger alerts | Requires configuration |

## Summary

### Ready

- Backend-authority rule enforcement
- Security guard architecture (JWT, role, permission, ownership)
- Privacy controls (consent, cohort minimum, PII stripping)
- Database schema with constraints and indexes
- Audit logging across all sensitive modules
- CI pipeline structure (5 workflows)
- 256 backend unit test files

### Requires Phase 16 Work

- Load testing and performance benchmarking
- Migration rollback testing
- Monitoring and alerting setup
- Data retention policy implementation
- Request tracing / correlation IDs
- Feature flag infrastructure
- Production environment variable validation
- Structured logging verification
