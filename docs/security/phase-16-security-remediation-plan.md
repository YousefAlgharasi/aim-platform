# P16-050: Security Remediation Plan

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Plan Documented — Awaiting Prioritization

---

## 1. Purpose

This document consolidates all security findings from P16-044 through P16-049, assigns severity levels, identifies owners, tracks fix status, and states go/no-go decisions for production launch.

---

## 2. Vulnerability Summary by Severity

### CRITICAL (Must fix before any production deployment)

| ID | Finding | Source | Owner | Fix Status |
|----|---------|--------|-------|------------|
| SEC-C-001 | Webhook signature verification not confirmed | P16-047 (BIL-HOOK-002/003) | Backend / Billing | NEEDS VERIFICATION |
| SEC-C-002 | No card data must be stored in AIM database | P16-047 (BIL-DATA-002/003) | Backend / Billing | NEEDS VERIFICATION |
| SEC-C-003 | Prices must be server-side, not client-submitted | P16-047 (BIL-PRICE-001/002) | Backend / Billing | NEEDS VERIFICATION |
| SEC-C-004 | Parent-child scope must be enforced at query level | P16-048 (ANA-SCOPE-004/007) | Backend / Analytics | NEEDS VERIFICATION |
| SEC-C-005 | Device tokens must be bound to authenticated user | P16-049 (NOT-TOK-003/004) | Backend / Notifications | NEEDS VERIFICATION |
| SEC-C-006 | No SERVICE_ROLE_KEY in client bundles | P16-046 (WEB-SEC-002, MOB-SEC-002) | Frontend / Mobile | NEEDS VERIFICATION |
| SEC-C-007 | No direct Supabase DB writes from clients | P16-046 (MOB-DB-002, WEB-DB-004) | Frontend / Mobile | NEEDS VERIFICATION |
| SEC-C-008 | No AIM engine URL in client configs | P16-046 (MOB-AIM-001, WEB-AIM-001) | Frontend / Mobile | NEEDS VERIFICATION |
| SEC-C-009 | Refund amount cannot exceed original payment | P16-047 (BIL-REF-003) | Backend / Billing | NEEDS VERIFICATION |
| SEC-C-010 | Entitlements cannot be granted without valid payment | P16-047 (BIL-ENT-002) | Backend / Billing | NEEDS VERIFICATION |
| SEC-C-011 | Provider credentials (FCM/APNs/email) not hardcoded | P16-049 (NOT-CRED-004/005) | Backend / Notifications | NEEDS VERIFICATION |

### HIGH (Must fix before production, may allow controlled pilot)

| ID | Finding | Source | Owner | Fix Status |
|----|---------|--------|-------|------------|
| SEC-H-001 | No rate limiting on auth endpoints | P16-045 (RATE-003) | Backend | NOT IMPLEMENTED |
| SEC-H-002 | No global rate limiting | P16-045 (RATE-005) | Backend | NOT IMPLEMENTED |
| SEC-H-003 | Verify global JWT guard application | P16-045 (AUTHZ-005) | Backend | NEEDS VERIFICATION |
| SEC-H-004 | Verify no endpoint missing guard decorator | P16-045 (AUTHZ-006) | Backend | NEEDS VERIFICATION |
| SEC-H-005 | Verify global ValidationPipe | P16-045 (VAL-001/002) | Backend | NEEDS VERIFICATION |
| SEC-H-006 | Verify stack trace stripping in production | P16-045 (ERR-001/002) | Backend | NEEDS VERIFICATION |
| SEC-H-007 | Verify mobile token uses secure storage | P16-046 (MOB-TOK-003) | Mobile | NEEDS VERIFICATION |
| SEC-H-008 | Verify web JWT storage mechanism | P16-046 (WEB-TOK-001) | Frontend | NEEDS VERIFICATION |
| SEC-H-009 | Remove AimDemo/AlgorithmTester from production build | P16-046 (WEB-AIM-002) | Frontend | NEEDS VERIFICATION |
| SEC-H-010 | Verify exports scoped to actor access level | P16-048 (ANA-EXP-004) | Backend / Analytics | NEEDS VERIFICATION |
| SEC-H-011 | Verify export files not publicly accessible | P16-048 (ANA-EXP-005) | Backend / Analytics | NEEDS VERIFICATION |
| SEC-H-012 | Verify lock-screen payloads safe | P16-049 (NOT-PAY-001/004) | Backend / Notifications | NEEDS VERIFICATION |
| SEC-H-013 | Verify delivery logs don't contain device tokens | P16-049 (NOT-LOG-003) | Backend / Notifications | NEEDS VERIFICATION |
| SEC-H-014 | Consolidate two Supabase client files in web app | P16-046 (WEB-DB-001) | Frontend | NEEDS INVESTIGATION |
| SEC-H-015 | Verify safe-user.dto excludes sensitive fields | P16-045 (FIELD-001) | Backend / Admin | NEEDS VERIFICATION |

### MEDIUM (Should fix before production)

| ID | Finding | Source | Owner | Fix Status |
|----|---------|--------|-------|------------|
| SEC-M-001 | Billing provider secrets not in centralized config | P16-047 (BIL-SEC-004) | Backend / Billing | FINDING |
| SEC-M-002 | Notification provider secrets not in centralized config | P16-049 (NOT-CRED-006) | Backend / Notifications | FINDING |
| SEC-M-003 | Verify CORS wildcard not used in production | P16-045 | Backend / DevOps | NEEDS VERIFICATION |
| SEC-M-004 | Verify webhook endpoint not in OpenAPI spec | P16-045 (HOOK-003) | Backend | NEEDS VERIFICATION |
| SEC-M-005 | Verify Swagger UI disabled in production | P16-045 (SEC-API-013) | Backend | NEEDS VERIFICATION |
| SEC-M-006 | Coupon brute-force protection | P16-047 (BIL-COUP-001) | Backend / Billing | NEEDS VERIFICATION |
| SEC-M-007 | Verify string length limits on text inputs | P16-045 (VAL-003) | Backend | NEEDS VERIFICATION |

---

## 3. Remediation Actions

### 3.1 Immediate Verification Tasks (1-2 days)

These items may already be implemented but need explicit verification:

| Task | How to Verify | Owner |
|------|--------------|-------|
| Global JWT guard | Check `app.module.ts` for `APP_GUARD` provider | Backend Lead |
| Global ValidationPipe | Check `main.ts` for `app.useGlobalPipes()` | Backend Lead |
| Stack trace stripping | Check NestJS exception filter config for production | Backend Lead |
| Webhook signature verification | Read `webhook.controller.ts` implementation | Billing Lead |
| Safe-user DTO filtering | Read `safe-user.dto.ts` fields | Backend Lead |
| Client bundle secrets scan | Run `grep -r "SERVICE_ROLE_KEY\|AI_PROVIDER_API_KEY" apps/` | DevOps |
| Supabase client usage audit | Grep for Supabase write operations in client code | Frontend Lead |

### 3.2 Implementation Tasks (3-5 days)

| Task | Effort | Owner |
|------|--------|-------|
| Add NestJS ThrottlerModule for global rate limiting | 1 day | Backend |
| Add rate limiting to auth endpoints (login, signup) | 1 day | Backend |
| Remove AimDemo/AlgorithmTester from production build | 0.5 day | Frontend |
| Consolidate Supabase client files in web app | 0.5 day | Frontend |
| Add billing/notification provider secrets to centralized config | 1 day | Backend |
| Add CSP headers to web app | 0.5 day | Frontend / DevOps |
| Disable Swagger UI in production mode | 0.5 day | Backend |

### 3.3 Deep Verification Tasks (3-5 days)

| Task | Effort | Owner |
|------|--------|-------|
| Verify parent-child scope at repository/query level | 2 days | Backend / Security |
| Verify billing payment flow (client-side tokenization, no card storage) | 1 day | Billing Lead |
| Verify entitlement lifecycle (grant/revoke on payment/refund) | 1 day | Billing Lead |
| Verify notification payload content safety | 1 day | Notifications Lead |
| Verify export file access control and cleanup | 1 day | Analytics Lead |
| Verify mobile secure storage implementation | 0.5 day | Mobile Lead |

---

## 4. Existing Security Strengths

The following security patterns are well-implemented and serve as a strong foundation:

1. **Three-layer authorization**: Role guard + Permission guard + Ownership guard
2. **Feature-specific guards**: Billing, notifications, analytics, assessments all have dedicated ownership guards
3. **Dedicated security tests**: `billing-permissions.spec.ts`, `notification-permission.spec.ts`, `notification-privacy.spec.ts`, `sensitive-data.spec.ts`, `parent-no-authority.test.js`
4. **Idempotency service**: Webhook duplicate processing prevention
5. **Audit services**: Billing audit, analytics audit, notification audit
6. **Presenter pattern**: Auth responses filtered via presenter
7. **Custom error types**: Feature-specific errors prevent information leakage
8. **Validation infrastructure**: DTOs and validation specs across features
9. **Noop provider pattern**: Safe development without real provider calls
10. **Backend-authority architecture**: Clients use API clients, not direct DB access

---

## 5. Risk Assessment

### 5.1 Risk Matrix

| Risk | Likelihood | Impact | Overall |
|------|-----------|--------|---------|
| Unauthorized data access (cross-parent) | LOW | CRITICAL | HIGH |
| Payment manipulation | LOW | CRITICAL | HIGH |
| Secret exposure in client bundle | MEDIUM | CRITICAL | CRITICAL |
| Brute-force on auth endpoints | HIGH | HIGH | HIGH |
| XSS via notification content | LOW | MEDIUM | LOW |
| Webhook replay attacks | MEDIUM | MEDIUM | MEDIUM |
| Information leakage via errors | MEDIUM | LOW | LOW |

### 5.2 Threat Model Summary

| Threat Actor | Primary Target | Mitigations |
|-------------|---------------|-------------|
| Unauthenticated attacker | Auth endpoints, public APIs | Rate limiting, input validation |
| Authenticated parent (malicious) | Other children's data, billing manipulation | Ownership guards, server-side pricing |
| Authenticated student | Elevated permissions, grade manipulation | Role guards, backend-authority |
| External system (webhook spoofing) | Payment state manipulation | Signature verification, idempotency |

---

## 6. Go/No-Go Decision

### 6.1 Decision Framework

| Gate | Criteria | Status |
|------|----------|--------|
| **CRITICAL gate** | All SEC-C-xxx items verified/fixed | PENDING |
| **HIGH gate** | All SEC-H-xxx items verified/fixed | PENDING |
| **MEDIUM gate** | SEC-M-xxx items tracked with timeline | PENDING |

### 6.2 Current Assessment

**Overall: NO-GO until CRITICAL verification is complete.**

The architecture and security patterns are strong. The primary risk is that critical items have not been explicitly verified — many may already be correctly implemented but need confirmation.

**Estimated time to reach GO decision:**
- Verification sprint: 3-5 days
- Implementation of missing items: 3-5 additional days
- Total: 6-10 days from start of security sprint

### 6.3 Decision Owners

| Decision | Owner | Date |
|----------|-------|------|
| CRITICAL gate sign-off | Security Lead | PENDING |
| HIGH gate sign-off | Engineering Manager | PENDING |
| Overall GO decision | CTO / Product Owner | PENDING |

---

## 7. Post-Launch Security Plan

After production launch, the following ongoing security activities should be established:

1. **Weekly** — Review auth failure logs and rate limit triggers
2. **Monthly** — Dependency vulnerability scanning (`npm audit`, `flutter pub outdated`)
3. **Quarterly** — Penetration test on production environment
4. **Per-release** — Security checklist review for new features
5. **Ongoing** — Bug bounty or responsible disclosure program (when scale justifies)
