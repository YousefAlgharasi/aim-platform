# P16-052: Logging Standardization Review

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Review Complete — Findings Documented

---

## 1. Scope

Review the AIM Platform's logging implementation for:

- Consistency across modules
- Correlation ID propagation
- PII redaction
- Secret safety
- Event coverage completeness

---

## 2. Current Logging Infrastructure

### 2.1 Backend API (NestJS)

The NestJS framework provides a built-in `Logger` class. The AIM Platform backend uses:

| Component | Logging Mechanism | Location |
|-----------|------------------|----------|
| Application bootstrap | NestJS default | `main.ts` |
| Health checks | Service return values (no explicit logging) | `health/health.service.ts` |
| Auth events | Dedicated auth logging service | `auth/auth-logging.service.ts` |
| Auth logging types | Structured types | `auth/auth-logging.types.ts` |
| Billing events | Billing audit service | `features/billing/billing-audit.service.ts` |
| Notification events | Notification audit service | `features/notifications/notification-audit.service.ts` |
| Analytics events | Analytics audit service | `features/analytics/analytics-audit.service.ts` |

### 2.2 Positive Findings

1. **Dedicated auth logging** — `auth-logging.service.ts` with typed events (`auth-logging.types.ts`) indicates structured auth event logging.
2. **Feature-specific audit services** — Billing, notifications, and analytics each have dedicated audit services, suggesting a pattern of domain-specific logging.
3. **Auth logging tests** — `auth-logging.service.spec.ts` exists, verifying logging behavior.

---

## 3. Consistency Assessment

### 3.1 Logging Pattern by Module

| Module | Has Logger | Has Audit Service | Has Typed Events | Consistency |
|--------|-----------|-------------------|-----------------|-------------|
| Auth | YES | YES (`auth-logging.service.ts`) | YES (`auth-logging.types.ts`) | GOOD |
| Billing | UNKNOWN | YES (`billing-audit.service.ts`) | UNKNOWN | PARTIAL |
| Notifications | UNKNOWN | YES (`notification-audit.service.ts`) | UNKNOWN | PARTIAL |
| Analytics | UNKNOWN | YES (`analytics-audit.service.ts`) | UNKNOWN | PARTIAL |
| AIM Engine | UNKNOWN | NO | NO | GAP |
| AI Teacher | UNKNOWN | NO | NO | GAP |
| Voice Teacher | UNKNOWN | NO | NO | GAP |
| Curriculum | UNKNOWN | NO | NO | GAP |
| Admin | UNKNOWN | NO | NO | GAP |
| Placement | UNKNOWN | NO | NO | GAP |

### 3.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| LOG-CON-001 | Auth module has exemplary logging pattern (service + types + spec) | N/A | PASS |
| LOG-CON-002 | Billing, notifications, analytics have audit services but may lack typed events | MEDIUM | NEEDS VERIFICATION |
| LOG-CON-003 | AIM engine adapter has no dedicated logging | HIGH | GAP |
| LOG-CON-004 | AI/Voice teacher modules have no audit logging | MEDIUM | GAP |
| LOG-CON-005 | Curriculum module has no audit logging | MEDIUM | GAP |
| LOG-CON-006 | No standard logging interceptor for all API requests | HIGH | GAP |

### 3.3 Recommendations

1. Create a standard `LoggingInterceptor` (NestJS interceptor) that logs all API requests with method, path, status, and duration.
2. Adopt the auth module's pattern (service + types + spec) as the standard for all modules.
3. Add audit logging to AIM engine calls (critical for debugging adaptive learning issues).
4. Add curriculum change logging for content management audit trail.

---

## 4. Correlation ID Assessment

### 4.1 Current State

**No correlation ID system detected.** The codebase does not appear to have:

- A request-level correlation ID middleware
- A correlation ID header (`X-Correlation-Id` or `X-Request-Id`)
- Correlation ID propagation to external service calls
- Correlation ID in log entries

### 4.2 Impact

Without correlation IDs:
- Cannot trace a single request across log entries
- Cannot correlate backend logs with AIM engine calls
- Cannot trace async job processing back to the originating request
- Cannot correlate webhook processing with the triggering user action

### 4.3 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| LOG-COR-001 | No correlation ID middleware exists | HIGH | NOT IMPLEMENTED |
| LOG-COR-002 | No correlation ID in log entries | HIGH | NOT IMPLEMENTED |
| LOG-COR-003 | No correlation ID propagation to AIM engine calls | MEDIUM | NOT IMPLEMENTED |
| LOG-COR-004 | No correlation ID in async job processing | MEDIUM | NOT IMPLEMENTED |

### 4.4 Recommendations

1. Add a NestJS middleware that generates a UUID correlation ID for each request.
2. Store correlation ID in `AsyncLocalStorage` (Node.js) for propagation without passing through parameters.
3. Include correlation ID in all log entries automatically.
4. Pass correlation ID as a header to AIM engine and other external service calls.
5. Store correlation ID with queued notifications/jobs for traceability.

---

## 5. PII Redaction Assessment

### 5.1 What Needs Redaction

| Data Type | Risk Level | Expected Treatment |
|-----------|-----------|-------------------|
| Student names | HIGH | Use ID only in logs |
| Parent names | HIGH | Use ID only in logs |
| Email addresses | HIGH | Redact or use ID |
| Phone numbers | HIGH | Never log |
| Student age/grade | MEDIUM | Acceptable in aggregate |
| Learning performance | LOW | Acceptable in logs |
| Device tokens | HIGH | Truncate to last 8 chars |
| IP addresses | MEDIUM | Retain for security |

### 5.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| LOG-PII-001 | Auth logging service may log user identifiers — need to verify format | HIGH | NEEDS VERIFICATION |
| LOG-PII-002 | Need to verify notification logs do not include student names | HIGH | NEEDS VERIFICATION |
| LOG-PII-003 | Need to verify billing logs do not include parent contact details | HIGH | NEEDS VERIFICATION |
| LOG-PII-004 | Need to verify analytics logs do not include student PII | MEDIUM | NEEDS VERIFICATION |
| LOG-PII-005 | No centralized PII redaction utility detected | HIGH | GAP |
| LOG-PII-006 | NestJS default logging may log full request bodies (including PII) | HIGH | NEEDS VERIFICATION |

### 5.3 Recommendations

1. Create a `LogSanitizer` utility that redacts known PII patterns (emails, phone numbers, names).
2. Configure NestJS logging to exclude request bodies in production or apply sanitization.
3. Use user IDs instead of names/emails in all log messages.
4. Add PII redaction tests to CI pipeline.

---

## 6. Secret Safety Assessment

### 6.1 Secrets at Risk

From `backend-config.validation.ts`, the following secrets are loaded:

| Secret | Env Var | Risk if Logged |
|--------|---------|---------------|
| Supabase service role key | `SUPABASE_SERVICE_ROLE_KEY` | CRITICAL — full DB access |
| Supabase JWT secret | `SUPABASE_JWT_SECRET` | CRITICAL — JWT forgery |
| AIM engine service token | `AIM_ENGINE_SERVICE_TOKEN` | HIGH — unauthorized AIM access |
| AI provider API key | `AI_PROVIDER_API_KEY` | HIGH — API abuse/billing |
| STT provider API key | `STT_PROVIDER_API_KEY` | HIGH — API abuse/billing |
| TTS provider API key | `TTS_PROVIDER_API_KEY` | HIGH — API abuse/billing |
| Database URL | `DATABASE_URL` | CRITICAL — contains credentials |

### 6.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| LOG-SEC-001 | Config validation comments note secrets should not be logged | N/A | POSITIVE |
| LOG-SEC-002 | `AIM_ENGINE_SERVICE_TOKEN` comment says "never logged, never returned to clients" | N/A | POSITIVE |
| LOG-SEC-003 | Need to verify config startup logging does not dump env vars | CRITICAL | NEEDS VERIFICATION |
| LOG-SEC-004 | Need to verify error messages do not include connection strings | HIGH | NEEDS VERIFICATION |
| LOG-SEC-005 | Need to verify NestJS debug mode is disabled in production | HIGH | NEEDS VERIFICATION |
| LOG-SEC-006 | Need to verify no `console.log` statements leak secrets in development | MEDIUM | NEEDS VERIFICATION |

### 6.3 Recommendations

1. Add a startup validation that logs which env vars are SET (not their values).
2. Create a secret masking utility that replaces known secret patterns with `[REDACTED]`.
3. Add a CI check (`eslint` or custom rule) that flags `console.log` with secret-named variables.

---

## 7. Event Coverage Assessment

### 7.1 Critical Events That Must Be Logged

| Event | Currently Logged | Module |
|-------|-----------------|--------|
| User login success | LIKELY (auth-logging) | Auth |
| User login failure | LIKELY (auth-logging) | Auth |
| JWT validation failure | LIKELY (auth guard) | Auth |
| Permission denied | UNKNOWN | Authorization |
| AIM analysis request | UNKNOWN | AIM |
| AIM analysis failure/timeout | UNKNOWN | AIM |
| Notification queued | UNKNOWN | Notifications |
| Notification delivered | UNKNOWN | Notifications |
| Notification failed | UNKNOWN | Notifications |
| Payment webhook received | LIKELY (billing-audit) | Billing |
| Payment completed | LIKELY (billing-audit) | Billing |
| Entitlement change | UNKNOWN | Billing |
| Report/export generated | LIKELY (analytics-audit) | Analytics |
| Admin role change | UNKNOWN | Admin |
| Curriculum published | UNKNOWN | Curriculum |
| Assessment completed | UNKNOWN | Assessments |

### 7.2 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| LOG-EVT-001 | Auth events likely covered by auth-logging service | LOW | POSITIVE |
| LOG-EVT-002 | Billing events likely covered by billing-audit service | LOW | POSITIVE |
| LOG-EVT-003 | AIM engine call logging is a critical gap | HIGH | GAP |
| LOG-EVT-004 | Permission denied events may not be logged | MEDIUM | NEEDS VERIFICATION |
| LOG-EVT-005 | Admin role changes should be audit logged | HIGH | NEEDS VERIFICATION |
| LOG-EVT-006 | Curriculum publish events should be audit logged | MEDIUM | NEEDS VERIFICATION |

---

## 8. Summary

### Current State

The AIM Platform has a partially implemented logging infrastructure with strong patterns in some areas (auth logging with typed events) and gaps in others (no correlation IDs, no standard request logging, missing module coverage).

### Priority Remediation

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Add logging interceptor for all API requests | 1 day |
| P0 | Add correlation ID middleware | 1 day |
| P0 | Verify no secrets in log output | 0.5 day |
| P1 | Add AIM engine call logging | 0.5 day |
| P1 | Create PII redaction utility | 1 day |
| P1 | Configure structured JSON logging for production | 1 day |
| P2 | Add audit logging to curriculum, admin modules | 2 days |
| P2 | Add permission-denied event logging | 0.5 day |

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — Auth, billing, and notification audit logging exists. The critical gaps (correlation IDs, request logging interceptor, secret safety verification) should be addressed before production but are not blocking for a controlled pilot.
