# P16-044: Security Test Plan

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Plan Defined — Awaiting Execution

---

## 1. Purpose

Define the comprehensive security validation plan for the AIM Platform, covering authentication, authorization, API security, client security, data protection, and operational security. This plan serves as the test matrix for security sign-off before production launch.

---

## 2. Test Categories

| Category | ID Range | Scope |
|----------|----------|-------|
| Authentication (AuthN) | SEC-AUTH-001 to SEC-AUTH-015 | JWT, sessions, login, token lifecycle |
| Authorization (AuthZ) | SEC-AUTHZ-001 to SEC-AUTHZ-020 | Roles, permissions, ownership |
| API Security | SEC-API-001 to SEC-API-015 | Input validation, rate limiting, headers |
| Secrets Management | SEC-SEC-001 to SEC-SEC-010 | Env vars, key storage, exposure |
| Data Storage | SEC-DATA-001 to SEC-DATA-010 | Supabase RLS, encryption, PII |
| Webhook Security | SEC-HOOK-001 to SEC-HOOK-005 | Signature verification, replay |
| Export/Report Security | SEC-EXP-001 to SEC-EXP-005 | PII in exports, scope |
| Logging Security | SEC-LOG-001 to SEC-LOG-005 | Secret redaction, PII |
| Client Security | SEC-CLI-001 to SEC-CLI-010 | Token storage, direct calls |

---

## 3. Authentication Tests

### 3.1 JWT Validation

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTH-001 | Send request without Authorization header | 401 Unauthorized | `auth/supabase-jwt-auth.guard.ts` |
| SEC-AUTH-002 | Send request with malformed JWT | 401 Unauthorized | `auth/supabase-jwt-verifier.service.ts` |
| SEC-AUTH-003 | Send request with expired JWT | 401 Unauthorized | `auth/supabase-jwt-verifier.service.ts` |
| SEC-AUTH-004 | Send request with JWT signed by wrong key | 401 Unauthorized | `auth/supabase-jwt-verifier.service.ts` |
| SEC-AUTH-005 | Send request with valid JWT but wrong audience | 401 Unauthorized | Config: `SUPABASE_JWT_AUDIENCE` |
| SEC-AUTH-006 | Send request with valid JWT but wrong issuer | 401 Unauthorized | Config: `SUPABASE_JWT_ISSUER` |
| SEC-AUTH-007 | Access public route without JWT | 200 OK | `auth/public-route.decorator.ts` |
| SEC-AUTH-008 | Verify @CurrentUser() extracts correct user | User matches JWT claims | `auth/current-user.decorator.ts` |

### 3.2 Session Validation

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTH-009 | Valid session continues to authenticate | 200 OK | `auth/session-validation.service.ts` |
| SEC-AUTH-010 | Revoked session returns 401 | 401 Unauthorized | `auth/session-validation.service.ts` |
| SEC-AUTH-011 | Session from different device/IP handled | Per policy | `auth/session-validation.types.ts` |

### 3.3 Profile Bootstrap

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTH-012 | First login creates profile with correct role | Profile created, role assigned | `auth/auth-profile-bootstrap.service.ts` |
| SEC-AUTH-013 | Subsequent logins do not duplicate profile | Existing profile returned | `auth/auth-profile-bootstrap.service.ts` |
| SEC-AUTH-014 | Auth logging captures login events | Audit log entry created | `auth/auth-logging.service.ts` |
| SEC-AUTH-015 | Bearer token extraction handles edge cases | Graceful handling | `auth/bearer-token.ts` |

---

## 4. Authorization Tests

### 4.1 Role-Based Access

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTHZ-001 | Admin can access admin endpoints | 200 OK | `auth/authorization/role.guard.ts` |
| SEC-AUTHZ-002 | Parent cannot access admin endpoints | 403 Forbidden | `auth/authorization/role.guard.ts` |
| SEC-AUTHZ-003 | Student cannot access admin endpoints | 403 Forbidden | `auth/authorization/role.guard.ts` |
| SEC-AUTHZ-004 | Parent can access parent endpoints | 200 OK | `auth/authorization/role.guard.ts` |
| SEC-AUTHZ-005 | Student cannot access parent endpoints | 403 Forbidden | `auth/authorization/role.guard.ts` |
| SEC-AUTHZ-006 | @RequiredRoles() decorator enforced globally | No undecorated protected routes | `auth/authorization/required-roles.decorator.ts` |

### 4.2 Ownership Guards

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTHZ-007 | Parent can access own child's data | 200 OK | `auth/authorization/student-ownership.guard.ts` |
| SEC-AUTHZ-008 | Parent cannot access other parent's child | 403 Forbidden | `auth/authorization/student-ownership.guard.ts` |
| SEC-AUTHZ-009 | Profile owner can access own profile | 200 OK | `auth/authorization/profile-ownership.guard.ts` |
| SEC-AUTHZ-010 | User cannot access another user's profile | 403 Forbidden | `auth/authorization/profile-ownership.guard.ts` |

### 4.3 Permission Guards

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTHZ-011 | @RequiredPermissions() decorator enforced | Permission check runs | `auth/authorization/required-permissions.decorator.ts` |
| SEC-AUTHZ-012 | PermissionGuard blocks unauthorized actions | 403 Forbidden | `auth/authorization/permission.guard.ts` |
| SEC-AUTHZ-013 | Ownership policy correctly scopes data | Data filtered to owner | `auth/authorization/ownership-policy.ts` |

### 4.4 Feature-Specific Authorization

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-AUTHZ-014 | Billing ownership guard scopes invoices | Only own invoices visible | `features/billing/billing-ownership.guard.ts` |
| SEC-AUTHZ-015 | Notification ownership guard scopes inbox | Only own notifications visible | `features/notifications/guards/notification-ownership.guard.ts` |
| SEC-AUTHZ-016 | Notification admin guard requires admin role | 403 for non-admins | `features/notifications/guards/notification-admin.guard.ts` |
| SEC-AUTHZ-017 | Analytics access guard enforces policy | Scoped to authorized data | `features/analytics/analytics-access.guard.ts` |
| SEC-AUTHZ-018 | Analytics access policy service validates actor | Actor-based filtering | `features/analytics/analytics-access-policy.service.ts` |
| SEC-AUTHZ-019 | Assessment guards enforce student ownership | Only own assessments | `features/assessments/guards/` |
| SEC-AUTHZ-020 | Parent guards in parents feature enforce scope | Parent-child relationship verified | `features/parents/guards/` |

---

## 5. API Security Tests

| ID | Test | Expected Result | Files Under Test |
|----|------|----------------|-----------------|
| SEC-API-001 | SQL injection in query parameters | No SQL execution, input sanitized | All controllers |
| SEC-API-002 | XSS in text input fields | HTML entities escaped | All DTOs |
| SEC-API-003 | CORS rejects unauthorized origins | Request blocked | `main.ts` (CORS config) |
| SEC-API-004 | CORS allows configured origins | Request allowed | Config: `CORS_ORIGINS` |
| SEC-API-005 | Request body size limit enforced | 413 for oversized payloads | NestJS default or custom |
| SEC-API-006 | Content-Type validation | 415 for wrong type | NestJS default |
| SEC-API-007 | Rate limiting on auth endpoints | 429 after threshold | NOT IMPLEMENTED (finding) |
| SEC-API-008 | Rate limiting on AI teacher endpoints | 429 after threshold | `features/ai-teacher/rate-limit-policy/` |
| SEC-API-009 | Rate limiting on voice teacher | 429 after threshold | `features/voice-teacher/rate-limit-policy/` |
| SEC-API-010 | Rate limiting on notification send | Rate enforced | `features/notifications/notification-rate-limit.service.ts` |
| SEC-API-011 | API versioning headers correct | Version in response | NOT VERIFIED |
| SEC-API-012 | OpenAPI spec does not expose internal types | No internal DTOs leaked | `openapi/openapi.config.ts` |
| SEC-API-013 | Swagger UI disabled in production | 404 for /api/docs | `openapi/openapi.config.ts` |
| SEC-API-014 | Error responses do not leak stack traces | Generic error in production | NestJS exception filter |
| SEC-API-015 | Health endpoint accessible without auth | 200 OK | `health/health.controller.ts` |

---

## 6. Secrets Management Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-SEC-001 | SUPABASE_SERVICE_ROLE_KEY not in client bundle | Not present in built JS |
| SEC-SEC-002 | SUPABASE_JWT_SECRET not in logs | Grep logs for secret values |
| SEC-SEC-003 | AIM_ENGINE_SERVICE_TOKEN not in API responses | Not in any response body |
| SEC-SEC-004 | AI_PROVIDER_API_KEY not in client code | Not in mobile/web builds |
| SEC-SEC-005 | STT_PROVIDER_API_KEY not exposed | Not in responses or logs |
| SEC-SEC-006 | TTS_PROVIDER_API_KEY not exposed | Not in responses or logs |
| SEC-SEC-007 | DATABASE_URL not in logs or responses | Not exposed |
| SEC-SEC-008 | .env files in .gitignore | Verified |
| SEC-SEC-009 | No hardcoded secrets in source code | Grep for patterns |
| SEC-SEC-010 | Config validation fails on missing secrets | `BackendConfigValidationError` thrown |

---

## 7. Data Storage Security Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-DATA-001 | Supabase RLS policies enforce row-level access | Users only see own data |
| SEC-DATA-002 | Service role key bypass is backend-only | Client apps use anon key |
| SEC-DATA-003 | Student PII not accessible cross-parent | Ownership enforced |
| SEC-DATA-004 | Billing data (card details) not stored in DB | Payment provider handles |
| SEC-DATA-005 | Assessment results scoped to student | Cross-student access blocked |
| SEC-DATA-006 | Chat history scoped to student session | Cross-session access blocked |
| SEC-DATA-007 | Device tokens scoped to user | Other users' tokens not accessible |
| SEC-DATA-008 | Audit logs tamper-resistant | Append-only pattern |
| SEC-DATA-009 | Database connection uses SSL | `DATABASE_URL` uses sslmode |
| SEC-DATA-010 | Supabase storage buckets have access policies | Files scoped to owner |

---

## 8. Webhook Security Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-HOOK-001 | Webhook signature verification | Invalid signatures rejected |
| SEC-HOOK-002 | Webhook replay protection | Duplicate events idempotent |
| SEC-HOOK-003 | Webhook endpoint not publicly enumerable | Not in OpenAPI spec |
| SEC-HOOK-004 | Webhook payloads validated | Malformed payloads rejected |
| SEC-HOOK-005 | Webhook errors do not leak internal state | Generic error response |

---

## 9. Export & Report Security Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-EXP-001 | Admin exports scoped to authorized data | Role-filtered | 
| SEC-EXP-002 | Parent exports scoped to own children | Ownership enforced |
| SEC-EXP-003 | Export files not publicly accessible | Auth required for download |
| SEC-EXP-004 | PII redaction in exports where required | Sensitive fields masked |
| SEC-EXP-005 | Export audit logging | Downloads tracked |

---

## 10. Logging Security Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-LOG-001 | JWT tokens not logged | Tokens redacted |
| SEC-LOG-002 | Passwords/secrets not logged | Values masked |
| SEC-LOG-003 | PII (student names, emails) not in debug logs | Redacted or ID-only |
| SEC-LOG-004 | Billing data not in logs | Card numbers, etc. absent |
| SEC-LOG-005 | Correlation IDs present in log entries | Request traceability |

---

## 11. Client Security Tests

| ID | Test | Expected Result |
|----|------|----------------|
| SEC-CLI-001 | Mobile app stores JWT securely | Secure storage (Keychain/Keystore) |
| SEC-CLI-002 | Web app stores JWT in httpOnly cookie or secure storage | Not in localStorage |
| SEC-CLI-003 | Mobile app does not call Supabase directly for writes | Backend-authority enforced |
| SEC-CLI-004 | Web app does not call Supabase directly for writes | Backend-authority enforced |
| SEC-CLI-005 | Mobile app does not call AIM engine directly | Backend-authority enforced |
| SEC-CLI-006 | No secrets in mobile app build | Grep APK/IPA for keys |
| SEC-CLI-007 | No secrets in web app build | Grep bundle for keys |
| SEC-CLI-008 | Certificate pinning on mobile (if applicable) | MITM protection |
| SEC-CLI-009 | Web CSP headers configured | XSS mitigation |
| SEC-CLI-010 | Deep link validation on mobile | No open redirect |

---

## 12. Test Execution Plan

### Phase 1: Automated (CI)
- SEC-AUTH-001 through SEC-AUTH-008 (JWT validation — existing spec files)
- SEC-AUTHZ-001 through SEC-AUTHZ-006 (role guard — `role.guard.spec.ts`)
- SEC-AUTHZ-007 through SEC-AUTHZ-010 (ownership — `profile-ownership.guard.spec.ts`)
- SEC-API-008, SEC-API-009 (rate limiting — existing spec files)

### Phase 2: Manual Verification
- SEC-SEC-001 through SEC-SEC-009 (secrets scanning)
- SEC-CLI-001 through SEC-CLI-010 (client inspection)
- SEC-DATA-001 through SEC-DATA-010 (Supabase RLS verification)

### Phase 3: Penetration Testing
- SEC-API-001, SEC-API-002 (injection testing)
- SEC-HOOK-001 through SEC-HOOK-005 (webhook manipulation)
- SEC-EXP-001 through SEC-EXP-005 (export boundary testing)

---

## 13. Existing Test Coverage

The following spec files provide partial automated coverage:

| Spec File | Coverage |
|-----------|----------|
| `auth/supabase-jwt-auth.guard.spec.ts` | JWT guard logic |
| `auth/supabase-jwt-verifier.service.spec.ts` | JWT verification |
| `auth/session-validation.service.spec.ts` | Session validation |
| `auth/current-user.decorator.spec.ts` | User extraction |
| `auth/authorization/role.guard.spec.ts` | Role guard |
| `auth/authorization/profile-ownership.guard.spec.ts` | Profile ownership |
| `auth/authorization/permission.guard.spec.ts` | Permission guard |
| `features/billing/billing-ownership.guard.spec.ts` | Billing ownership |
| `features/billing/billing-permissions.spec.ts` | Billing permissions |
| `features/billing/webhook-idempotency.spec.ts` | Webhook idempotency |
| `features/billing/sensitive-data.spec.ts` | Sensitive data handling |
| `features/notifications/notification-permission.spec.ts` | Notification permissions |
| `features/notifications/notification-privacy.spec.ts` | Notification privacy |
| `features/analytics/analytics-access-policy.service.spec.ts` | Analytics access |
| `features/analytics/analytics-access.guard.spec.ts` | Analytics guard |
| `features/analytics/analytics-export.service.spec.ts` | Export security |
| `features/analytics/analytics-export.controller.spec.ts` | Export controller |

---

## 14. Sign-Off Requirements

| Area | Sign-Off Owner | Status |
|------|----------------|--------|
| Authentication | Security Lead | PENDING |
| Authorization | Security Lead | PENDING |
| API Security | Backend Lead | PENDING |
| Secrets Management | DevOps Lead | PENDING |
| Data Storage | Database Lead | PENDING |
| Client Security | Frontend/Mobile Lead | PENDING |
| Overall Security | CISO / Security Lead | PENDING |
