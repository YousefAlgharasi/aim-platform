# Non-Functional Requirements Checklist

**Task:** P16-007
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define and track non-functional requirements across performance,
availability, scalability, security, accessibility, localization,
observability, and recovery for the AIM Platform production release.

## 1. Performance

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| API response time (p50) | < 200ms | Load test | Not tested |
| API response time (p95) | < 500ms | Load test | Not tested |
| API response time (p99) | < 1000ms | Load test | Not tested |
| Database query time (p95) | < 200ms | Query profiling | Not tested |
| Mobile app cold start | < 3 seconds | Device testing (mid-range Android) | Not tested |
| Mobile app hot start | < 1 second | Device testing | Not tested |
| Admin dashboard initial load | < 2 seconds | Lighthouse / WebPageTest | Not tested |
| Admin dashboard navigation | < 500ms | Browser timing API | Not tested |
| AIM Engine recommendation latency | < 1000ms | Benchmark test | Not tested |
| Analytics event ingestion throughput | > 100 events/second | Load test | Not tested |
| Report generation time | < 10 seconds | Benchmark with realistic data | Not tested (runner is stub) |
| Export file generation | < 30 seconds | Benchmark with max-scope export | Not tested |
| Concurrent user support | 100 simultaneous users | Load test | Not tested |
| Database connection pool | 20 connections default | Prisma config review | Requires review |
| API payload size limit | < 1MB per request | NestJS config | Requires review |

## 2. Availability

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| Backend API uptime | 99.5% (30-day rolling) | Uptime monitoring | Not configured |
| AIM Engine uptime | 99.0% | Health check monitoring | Health check service exists (`aim-health-check.service.ts`) |
| Database uptime | 99.9% (Supabase managed) | Supabase dashboard | Depends on Supabase SLA |
| Scheduled maintenance window | < 30 minutes | Deployment procedure | Requires procedure |
| Health check endpoint | Responds within 1 second | `GET /health` | Endpoint exists (`src/health/`) |
| Graceful degradation | App functional without AIM Engine | Backend fallback behavior | Not implemented |
| Zero-downtime deployment | Rolling update, no dropped requests | Container orchestration config | Requires setup |

## 3. Scalability

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| Horizontal scaling | Backend API stateless, horizontally scalable | Architecture review | Stateless design verified (no in-process state) |
| Database scaling | Read replicas for analytics queries | Supabase plan review | Not configured |
| Storage scaling | File uploads scale with CDN | Storage architecture review | Requires review |
| Event ingestion scaling | Queue-based ingestion with backpressure | `notification-queue.service.ts` exists | Partially implemented |
| Rate limiting | API-level and per-user rate limits | Middleware review | Not implemented for most endpoints |
| Pagination | All list endpoints paginated | Controller review | Requires audit |

## 4. Security

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| Authentication | Supabase JWT on all API endpoints | Guard coverage audit | `SupabaseJwtAuthGuard` exists with spec |
| Authorization | Role-based access control (admin/parent/student) | Guard coverage audit | `RoleGuard`, `PermissionGuard` exist with specs |
| Data isolation | Users cannot access other users' data | Ownership guard audit | `ProfileOwnershipGuard`, `BillingOwnershipGuard`, `ParentChildAccessGuard` exist |
| Secret management | No secrets in source code | Grep audit | `.env.example` uses placeholders; `.gitignore` excludes `.env` |
| HTTPS only | All client-server communication encrypted | Deployment config | Requires production validation |
| CORS policy | Restrict to known origins | `CORS_ORIGINS` env var | Requires production values |
| Input validation | All API inputs validated | `class-validator` decorators | Validation DTOs exist in billing, analytics, notifications, assessments, parents |
| SQL injection prevention | Parameterized queries via Prisma ORM | ORM usage audit | Prisma prevents raw SQL injection by default |
| XSS prevention | No dangerouslySetInnerHTML, sanitized outputs | Frontend code audit | Requires review |
| CSRF protection | Token-based API (not cookie-based sessions) | Architecture review | JWT bearer token approach inherently resistant to CSRF |
| Webhook signature verification | Payment provider webhooks validated | `webhook.controller.ts` review | Exists; requires live testing |
| Audit logging | All sensitive operations logged | Audit service audit | Auth, analytics, billing, parent access, curriculum, notification, placement audit services exist |
| Password policy | Supabase managed | Supabase auth config | Supabase default policies apply |
| Session timeout | JWT expiration configured | `SUPABASE_JWT_*` env vars | Requires production value review |

## 5. Accessibility

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| WCAG 2.1 AA compliance | Admin dashboard and web app | Lighthouse accessibility audit | Not tested |
| Screen reader support | Semantic HTML, ARIA labels | Manual testing | Requires review |
| Keyboard navigation | All interactive elements keyboard-accessible | Manual testing | Requires review |
| Color contrast | 4.5:1 minimum for text | Design system token review | Design system defines colors in `tokens/` |
| Focus indicators | Visible focus rings on interactive elements | Visual review | Requires review |
| Mobile accessibility | Flutter semantics widgets | Flutter accessibility testing | Requires review |
| Text scaling | UI remains usable at 200% text size | Manual testing | Requires review |

## 6. Localization

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| Arabic language support | Full Arabic translation | Translation file review | Requires audit |
| RTL layout support | All UI components support RTL | Visual testing | Design system includes RTL foundations |
| Bi-directional text | Mixed Arabic/English renders correctly | Manual testing | Requires review |
| Number formatting | Arabic/Eastern Arabic numerals where appropriate | Formatting review | Requires review |
| Date formatting | Locale-appropriate date/time display | Formatting review | Requires review |
| Currency formatting | Local currency display for billing | Billing UI review | Requires review |
| Error messages | Localized error messages | Translation file review | Requires review |

## 7. Observability

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| Structured logging | JSON-formatted logs with consistent fields | Logging config review | Requires verification |
| Request tracing | Correlation ID across service calls | Middleware review | Not implemented |
| Error tracking | Unhandled exceptions captured and alerted | Error tracking service config | Not configured |
| Performance metrics | Response time, throughput, error rate | Metrics collection config | Not configured |
| Database monitoring | Query performance, connection pool, slow queries | Supabase dashboard + Prisma logging | Supabase provides dashboard; Prisma logging requires config |
| Audit trail | Searchable audit log for compliance | Audit services exist | Audit services exist across all modules; search UI not built |
| Health dashboard | Real-time service status page | Monitoring tool config | Not configured |
| Alert rules | CPU > 80%, error rate > 1%, response time > 1s | Alerting config | Not configured |

## 8. Recovery

| Requirement | Target | Verification | Status |
|-------------|--------|--------------|--------|
| RTO (Recovery Time Objective) | < 1 hour | Recovery drill | Not tested |
| RPO (Recovery Point Objective) | < 1 hour (continuous backup) | Backup verification | Supabase provides point-in-time recovery |
| Database backup | Automated daily backups + point-in-time recovery | Supabase plan review | Depends on Supabase plan tier |
| Migration rollback | Ability to reverse last N migrations | Rollback testing | Not tested (Prisma limitations noted) |
| Service rollback | Revert to previous container image | Container registry review | Requires procedure |
| Data corruption recovery | Restore from backup + replay audit log | Recovery procedure | Not documented |
| Disaster recovery | Cross-region backup or failover | Infrastructure review | Not configured |

## Summary

| Category | Total Requirements | Met | Partially Met | Not Met |
|----------|-------------------|-----|---------------|---------|
| Performance | 15 | 0 | 0 | 15 |
| Availability | 7 | 2 | 1 | 4 |
| Scalability | 6 | 1 | 1 | 4 |
| Security | 14 | 10 | 2 | 2 |
| Accessibility | 7 | 0 | 1 | 6 |
| Localization | 7 | 0 | 1 | 6 |
| Observability | 8 | 1 | 1 | 6 |
| Recovery | 7 | 1 | 1 | 5 |
| **Total** | **71** | **15** | **8** | **48** |

Security is the strongest category due to the comprehensive auth guard and
audit logging architecture built across Phases 1-15. Performance,
accessibility, localization, and observability require the most Phase 16
work.
