# Phase 17 — Readiness from Phase 16

**Document ID:** P16-079
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document captures the post-launch operations, iteration, and maintenance readiness items that should be addressed in Phase 17. It consolidates all Phase 16 findings that were deferred, identified as gaps, or recommended for post-launch improvement.

---

## 1. Phase 17 Scope Recommendation

Phase 17 should focus on three pillars:
1. **Operational readiness** — Monitoring, alerting, observability, and incident response tooling
2. **Technical debt reduction** — Legacy service cleanup, automated testing, performance optimization
3. **Feature hardening** — Complete billing integration, push notifications, offline support

---

## 2. Operational Readiness Items

### 2.1 Monitoring and Observability (Priority: Critical)

**Source:** P16-046 (Observability Plan), P16-047 (Logging Review), P16-077 (Architecture Review)

| Item | Description | Priority |
|------|-------------|----------|
| Error tracking | Integrate Sentry or similar for backend API and web app | P0 |
| Crash reporting | Integrate Firebase Crashlytics or Sentry for mobile app | P0 |
| Uptime monitoring | Configure health endpoint monitoring with alerts | P0 |
| Structured logging | Switch NestJS from default logger to structured JSON logging | P1 |
| Log aggregation | Set up centralized log storage (ELK, Loki, CloudWatch) | P1 |
| APM | Integrate application performance monitoring (New Relic, Datadog) | P1 |
| Alerting | Configure alert channels for error rate spikes, downtime, latency | P1 |
| Web vitals reporting | Connect `reportWebVitals.js` to an analytics endpoint | P2 |
| Distributed tracing | Trace requests across backend API and AIM engine | P3 |

### 2.2 Incident Response Tooling (Priority: High)

**Source:** P16-070 (Incident Response Runbook)

| Item | Description | Priority |
|------|-------------|----------|
| On-call rotation | Establish on-call schedule and rotation | P0 |
| Status page | Set up a public-facing status page (e.g., Statuspage.io) | P1 |
| Incident management | Choose an incident management tool (PagerDuty, OpsGenie) | P1 |
| Runbook automation | Automate common runbook steps (health checks, rollback) | P2 |

### 2.3 Backup and Recovery (Priority: High)

**Source:** P16-062 (Database Backup/Restore Runbook)

| Item | Description | Priority |
|------|-------------|----------|
| PITR verification | Verify Supabase plan includes Point-in-Time Recovery | P0 |
| Backup monitoring | Alert on failed backups | P1 |
| Backup testing | Regular restore tests (monthly) | P1 |
| Backup retention policy | Define and document retention periods | P1 |

---

## 3. Infrastructure Items

### 3.1 Environment Provisioning (Priority: Critical)

**Source:** P16-006 (Release Environment Map), P16-068 (Release Candidate Report)

| Item | Description | Priority |
|------|-------------|----------|
| Staging environment | Provision complete staging environment for testing | P0 |
| Production environment | Provision production environment for launch | P0 |
| SSL/TLS certificates | Configure HTTPS for all endpoints | P0 |
| DNS configuration | Set up production domains for API, web app | P0 |
| CDN configuration | Deploy web app to CDN for global distribution | P1 |

### 3.2 CI/CD Improvements (Priority: High)

**Source:** P16-041 through P16-045 (CI/CD Audits)

| Item | Description | Priority |
|------|-------------|----------|
| Deployment pipeline | Add CD (continuous deployment) to CI pipelines | P0 |
| Web app CI workflow | Create workflow for `apps/web/` (currently only legacy admin) | P1 |
| Automated smoke tests | Run smoke tests automatically after deployment | P1 |
| Dependency vulnerability scanning | Add `npm audit` / `pip audit` to CI | P1 |
| Staging deployment | Automatic deployment to staging on merge to main | P2 |

### 3.3 Deployment Improvements (Priority: Medium)

**Source:** P16-061 (Rollback Runbook), P16-077 (Architecture Review)

| Item | Description | Priority |
|------|-------------|----------|
| Blue-green deployment | Enable zero-downtime deployments | P2 |
| Feature flags | Implement feature flag system (LaunchDarkly or similar) | P2 |
| Canary releases | Gradual rollout for backend API changes | P3 |
| Automated rollback | Auto-rollback on error rate threshold breach | P3 |

---

## 4. Technical Debt Items

### 4.1 Legacy Service Cleanup (Priority: Medium)

**Source:** P16-077 (Architecture Review)

| Item | Description | Priority |
|------|-------------|----------|
| Deprecate `services/backend/` | Remove or archive legacy Python backend | P1 |
| Deprecate `services/api/` | Remove or archive legacy API service | P1 |
| Consolidate admin dashboards | Clarify relationship between `apps/admin-dashboard/` and `apps/web/` | P1 |
| Version number update | Update all components from 0.1.0 to proper semantic versions | P0 |

### 4.2 Testing Infrastructure (Priority: High)

**Source:** P16-009 (QA Master Test Plan), P16-010 (E2E Test Matrix), P16-067 (Smoke Test Execution)

| Item | Description | Priority |
|------|-------------|----------|
| Automated E2E tests | Implement Cypress or Playwright tests for web dashboards | P1 |
| Mobile integration tests | Implement Flutter integration tests | P1 |
| API contract tests | Add contract tests for backend API endpoints | P2 |
| Load testing framework | Set up k6 or Artillery for load testing | P1 |
| Visual regression testing | Set up Percy or Chromatic for UI regression | P2 |

### 4.3 Database Improvements (Priority: Medium)

**Source:** P16-037 (Database Performance Review), P16-062 (Backup/Restore Runbook)

| Item | Description | Priority |
|------|-------------|----------|
| Migration versioning | Add versioned migration files to repository | P1 |
| Down-migration scripts | Create rollback scripts for each migration | P1 |
| Index audit | Audit and document database indexes | P1 |
| Query performance profiling | Profile queries with production-like data | P2 |
| Read replica | Evaluate read replica for analytics queries | P3 |

---

## 5. Feature Hardening Items

### 5.1 Mobile App (Priority: High)

**Source:** P16-063 (Mobile Release Readiness)

| Item | Description | Priority |
|------|-------------|----------|
| App signing configuration | Document and configure Android keystore and iOS provisioning | P0 |
| Store metadata | Prepare bilingual store listings, screenshots, descriptions | P0 |
| Privacy policy | Publish privacy policy URL | P0 |
| Privacy labels | Complete Apple privacy labels and Google data safety | P0 |
| Crash reporting SDK | Integrate Firebase Crashlytics or Sentry | P0 |
| Push notifications | Implement FCM (Android) and APNS (iOS) push notifications | P1 |
| Offline mode | Enable offline lesson access | P2 |
| Deep linking | Implement universal links / app links | P2 |

### 5.2 Billing (Priority: Medium)

**Source:** P16-017 (Billing Regression), P16-032 (Billing Security Audit)

| Item | Description | Priority |
|------|-------------|----------|
| Payment provider integration | Complete Stripe/Paddle integration | P1 |
| Webhook processing | Implement secure webhook handlers | P1 |
| Subscription management | Full subscription lifecycle (create, upgrade, cancel) | P1 |
| Payment retry logic | Implement failed payment retry with exponential backoff | P2 |
| Receipt validation | Implement App Store / Play Store receipt validation | P2 |

### 5.3 Notifications (Priority: Medium)

**Source:** P16-016 (Notifications Regression), P16-065 (Worker Release Readiness)

| Item | Description | Priority |
|------|-------------|----------|
| Push notification delivery | Mobile push via FCM/APNS | P1 |
| Email notification delivery | Parent email notifications | P1 |
| Notification digest | Daily/weekly digest emails | P2 |
| Notification preferences | Granular user preferences for notification channels | P2 |

### 5.4 Backend Improvements (Priority: Medium)

**Source:** P16-065 (Worker Release Readiness), P16-075 (Security Review)

| Item | Description | Priority |
|------|-------------|----------|
| Job queue (BullMQ/Redis) | Async job processing for notifications, analytics, billing | P1 |
| Worker service | Separate worker process for background jobs | P1 |
| Rate limiting | Add `@nestjs/throttler` for API rate limiting | P1 |
| Scheduler | Add `@nestjs/schedule` for periodic jobs | P2 |
| Caching layer | Add Redis caching for curriculum and analytics | P2 |
| API versioning | Implement API version strategy (path or header) | P2 |
| Swagger protection | Disable or protect Swagger UI in production | P1 |

### 5.5 Security Improvements (Priority: High)

**Source:** P16-075 (Final Security Release Review)

| Item | Description | Priority |
|------|-------------|----------|
| Dependency vulnerability scan | Run and address findings from `npm audit` / `pip audit` | P0 |
| Admin action audit logging | Log all admin actions for accountability | P1 |
| AI content moderation | Implement content filtering for AI teacher responses | P1 |
| Data retention policy | Define and implement data retention periods | P1 |
| CSP headers | Configure Content Security Policy for web app | P2 |
| Account deletion | Implement self-service account deletion | P2 |
| Data export | Implement self-service data export | P2 |

---

## 6. Phase 17 Recommended Milestones

### Milestone 1: Launch Prerequisites (Week 1-2)

Focus: Items required before any production launch.

- [ ] Provision staging and production environments
- [ ] Configure SSL/TLS and DNS
- [ ] Run dependency vulnerability scans
- [ ] Configure mobile app signing
- [ ] Prepare store metadata and privacy policy
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Update version numbers to 1.0.0
- [ ] Execute smoke tests on staging

### Milestone 2: Operational Foundation (Week 3-4)

Focus: Minimum viable operations for a live service.

- [ ] Set up on-call rotation
- [ ] Implement structured logging
- [ ] Set up log aggregation
- [ ] Configure alerting
- [ ] Verify database backup and PITR
- [ ] Create deployment pipeline (CD)
- [ ] Protect Swagger UI in production
- [ ] Add API rate limiting

### Milestone 3: Feature Completeness (Week 5-8)

Focus: Complete deferred features.

- [ ] Payment provider integration
- [ ] Push notification delivery
- [ ] Email notification delivery
- [ ] Mobile crash reporting
- [ ] Automated E2E tests for web
- [ ] Load testing baseline

### Milestone 4: Hardening (Week 9-12)

Focus: Technical debt and operational maturity.

- [ ] Legacy service cleanup
- [ ] Job queue infrastructure (BullMQ/Redis)
- [ ] Caching layer
- [ ] Admin audit logging
- [ ] AI content moderation
- [ ] Visual regression testing
- [ ] Data retention policy implementation
- [ ] Offline mode for mobile

---

## 7. Risk Carry-Forward

The following risks from Phase 16 carry forward into Phase 17:

| Risk | Severity | Mitigation Status |
|------|----------|-------------------|
| No production environment | High | Must be provisioned in Milestone 1 |
| No monitoring/alerting | High | Must be implemented in Milestones 1-2 |
| No load testing data | Medium | Must be completed in Milestone 3 |
| Billing integration incomplete | Medium | Must be completed in Milestone 3 |
| No feature flags | Medium | Recommended for Milestone 4 |
| AI provider single point of failure | Medium | Add timeout and fallback in Milestone 2 |
| No automated E2E tests | Medium | Must be implemented in Milestone 3 |

---

## 8. Phase 17 Entry Criteria

Phase 17 can begin when:

1. All Phase 16 documents are complete (verified in P16-078).
2. The Phase 16 final review (P16-080) is approved.
3. The go/no-go checklist (P16-069) decision is recorded.
4. A Phase 17 team and timeline are established.
