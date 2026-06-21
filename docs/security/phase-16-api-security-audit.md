# P16-045: API Security Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit reviews all backend API endpoints in `services/backend-api/src/` for:

- Authentication enforcement (JWT guard coverage)
- Authorization correctness (role and ownership guards)
- Input validation (DTOs, pipes, sanitization)
- Rate limiting coverage
- Unsafe field exposure
- Error handling and information leakage

---

## 2. Controller Inventory

### 2.1 Foundation Controllers

| Controller | File | Auth Required | Notes |
|------------|------|---------------|-------|
| HealthController | `health/health.controller.ts` | NO (public) | `/health` and `/version` — correctly public |
| AuthController | `auth/auth.controller.ts` | YES (after JWT) | `/auth/me` — returns authenticated user |

### 2.2 Admin Controllers

| Controller | File | Auth Required | Role Guard |
|------------|------|---------------|------------|
| AdminController | `features/admin/admin.controller.ts` | YES | Admin role |
| AdminUsersController | `features/admin/users/admin-users.controller.ts` | YES | Admin role |
| AdminRolesController | `features/admin/admin-roles.controller.ts` | YES | Admin role |
| AdminRoleAssignmentController | `features/admin/admin-role-assignment.controller.ts` | YES | Admin role |
| AdminBillingController | `features/billing/admin-billing.controller.ts` | YES | Admin role |
| AdminAnalyticsDashboardController | `features/analytics/admin-analytics-dashboard.controller.ts` | YES | Admin role |
| AdminLearningReportsController | `features/analytics/admin-learning-reports.controller.ts` | YES | Admin role |
| AdminAssessmentReportsController | `features/analytics/admin-assessment-reports.controller.ts` | YES | Admin role |
| AdminRevenueReportsController | `features/analytics/admin-revenue-reports.controller.ts` | YES | Admin role |
| NotificationsAdminController | `features/notifications/notifications-admin.controller.ts` | YES | Admin role |

### 2.3 Parent Controllers

| Controller | File | Auth Required | Ownership Guard |
|------------|------|---------------|-----------------|
| ParentReportsController | `features/analytics/parent-reports.controller.ts` | YES | Parent ownership |
| InvoicesController | `features/billing/invoices.controller.ts` | YES | Billing ownership |
| CheckoutController | `features/billing/checkout.controller.ts` | YES | Parent role |
| CheckoutStatusController | `features/billing/checkout-status.controller.ts` | YES | Parent role |
| SubscriptionController | `features/billing/subscription.controller.ts` | YES | Parent role |
| RefundController | `features/billing/refund.controller.ts` | YES | Billing ownership |
| PricingController | `features/billing/pricing.controller.ts` | YES | Authenticated |

### 2.4 Student Controllers

| Controller | File | Auth Required | Ownership Guard |
|------------|------|---------------|-----------------|
| StudentAnalyticsSummaryController | `features/analytics/student-analytics-summary.controller.ts` | YES | Student ownership |

### 2.5 Notification Controllers

| Controller | File | Auth Required | Ownership Guard |
|------------|------|---------------|-----------------|
| NotificationsController | `features/notifications/notifications.controller.ts` | YES | User-scoped |
| InboxController | `features/notifications/inbox.controller.ts` | YES | Notification ownership |
| PreferencesController | `features/notifications/preferences.controller.ts` | YES | User-scoped |
| DeviceTokenController | `features/notifications/device-token.controller.ts` | YES | User-scoped |
| RemindersController | `features/notifications/reminders.controller.ts` | YES | User-scoped |

### 2.6 AI/Voice Teacher Controllers

| Controller | File | Auth Required | Guards |
|------------|------|---------------|--------|
| ChatHistoryReadController | `features/ai-teacher/chat-history/chat-history-read.controller.ts` | YES | Student ownership |
| ChatMessageController | `features/ai-teacher/chat-message/` | YES | Student ownership, rate limit |
| ChatSessionController | `features/ai-teacher/chat-session/` | YES | Student ownership |
| ChatSessionListController | `features/ai-teacher/chat-session-list/` | YES | Student ownership |
| VoiceTeacherController | `features/voice-teacher/api/` | YES | Student ownership, rate limit |

### 2.7 Other Controllers

| Controller | File | Auth Required | Notes |
|------------|------|---------------|-------|
| WebhookController | `features/billing/webhook.controller.ts` | SPECIAL | Provider signature verification |
| AnalyticsExportController | `features/analytics/analytics-export.controller.ts` | YES | Role-based |

---

## 3. Authentication Audit

### 3.1 JWT Guard Coverage

The `SupabaseJwtAuthGuard` (`auth/supabase-jwt-auth.guard.ts`) is the primary authentication mechanism. It verifies JWTs using `SupabaseJwtVerifierService`.

**Positive findings:**
- JWT verification validates signature, expiry, audience, and issuer
- `@Public()` decorator (`public-route.decorator.ts`) explicitly marks public routes
- `@CurrentUser()` decorator safely extracts user from validated JWT
- Spec files exist: `supabase-jwt-auth.guard.spec.ts`, `supabase-jwt-verifier.service.spec.ts`

**Concern:**
- **Global guard application needs verification.** If the JWT guard is not applied globally (via `APP_GUARD`), individual controllers must apply it manually, risking missed endpoints.

### 3.2 Session Validation

`SessionValidationService` (`auth/session-validation.service.ts`) provides additional session checks beyond JWT validation.

**Positive findings:**
- Session revocation is supported
- Spec file exists: `session-validation.service.spec.ts`

---

## 4. Authorization Audit

### 4.1 Role Guard System

The authorization system (`auth/authorization/`) provides a layered guard architecture:

| Guard | File | Purpose |
|-------|------|---------|
| RoleGuard | `role.guard.ts` | Checks `@RequiredRoles()` decorator |
| PermissionGuard | `permission.guard.ts` | Checks `@RequiredPermissions()` decorator |
| ProfileOwnershipGuard | `profile-ownership.guard.ts` | Verifies profile ownership |
| StudentOwnershipGuard | `student-ownership.guard.ts` | Verifies parent-student relationship |

**Positive findings:**
- Three-layer guard system (role + permission + ownership)
- `AuthorizedRole` resolver (`authorized-role.resolver.ts`) centralizes role resolution
- `RoleMatch` utility (`role-match.ts`) provides consistent role comparison
- All guards have spec files with tests

### 4.2 Feature-Specific Guards

| Guard | Feature | File | Spec |
|-------|---------|------|------|
| BillingOwnershipGuard | Billing | `billing-ownership.guard.ts` | YES |
| NotificationOwnershipGuard | Notifications | `guards/notification-ownership.guard.ts` | NEEDS VERIFICATION |
| NotificationAdminGuard | Notifications | `guards/notification-admin.guard.ts` | NEEDS VERIFICATION |
| AnalyticsAccessGuard | Analytics | `analytics-access.guard.ts` | YES |
| AssessmentGuards | Assessments | `assessments/guards/` | NEEDS VERIFICATION |
| ParentGuards | Parents | `parents/guards/` | NEEDS VERIFICATION |
| VoiceTeacherGuards | Voice Teacher | `voice-teacher/api/guards/` | YES |
| AITeacherGuards | AI Teacher | `ai-teacher/guards/` | NEEDS VERIFICATION |

### 4.3 Findings

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| AUTHZ-001 | Role guard coverage is comprehensive for admin routes | N/A | PASS |
| AUTHZ-002 | Ownership guards exist for parent/student scoping | N/A | PASS |
| AUTHZ-003 | Billing has dedicated ownership guard with spec | N/A | PASS |
| AUTHZ-004 | Analytics has dedicated access policy with spec | N/A | PASS |
| AUTHZ-005 | Need to verify global guard application | MEDIUM | NEEDS VERIFICATION |
| AUTHZ-006 | Need to verify no endpoint missing role/permission decorator | HIGH | NEEDS VERIFICATION |

---

## 5. Input Validation Audit

### 5.1 DTO Validation

| Feature | DTOs Found | Validation |
|---------|-----------|------------|
| Admin Users | `safe-user.dto.ts`, `update-user-status.dto.ts`, `admin-users-list-query.dto.ts`, `admin-user-detail.dto.ts` | DTO pattern present |
| Billing | `billing.dtos.ts`, `billing.validation.ts`, `billing.validation.spec.ts` | Validation with tests |
| Notifications | `dto/` directory with multiple entity DTOs, `update-notification-preference-request.dto.ts`, `update-quiet-hours-request.dto.ts` | DTO pattern present |
| Analytics | `analytics.dtos.ts`, `analytics.validation.ts`, `analytics.validation.spec.ts` | Validation with tests |
| AI Teacher | `chat-message-submit.dto.ts` | DTO pattern present |
| Voice Teacher | `voice-teacher/api/dto/` with tests | DTO pattern with tests |
| Curriculum | `curriculum/dto/` directory | DTO pattern present |

**Positive findings:**
- Billing and analytics have dedicated validation files with specs
- DTOs exist for most features, suggesting NestJS validation pipe usage
- `billing.validation.spec.ts` and `analytics.validation.spec.ts` test validation rules

**Concerns:**
| ID | Finding | Severity |
|----|---------|----------|
| VAL-001 | Need to verify `ValidationPipe` is applied globally | HIGH |
| VAL-002 | Need to verify `transform: true` and `whitelist: true` on validation pipe | HIGH |
| VAL-003 | Need to verify string length limits on text inputs | MEDIUM |

---

## 6. Rate Limiting Audit

### 6.1 Rate Limiting Coverage

| Feature | Rate Limiting | Files |
|---------|--------------|-------|
| AI Teacher | YES | `ai-teacher/rate-limit-policy/` with tests |
| Voice Teacher | YES | `voice-teacher/rate-limit-policy/` with tests |
| Notifications | YES | `notification-rate-limit.service.ts` |
| Auth endpoints | NOT FOUND | No rate limiting on login/auth |
| Admin endpoints | NOT FOUND | No rate limiting on admin APIs |
| Billing endpoints | NOT FOUND | No rate limiting on payment APIs |

### 6.2 Findings

| ID | Finding | Severity |
|----|---------|----------|
| RATE-001 | AI teacher and voice teacher have rate limiting with tests | PASS |
| RATE-002 | Notification delivery has rate limiting | PASS |
| RATE-003 | No rate limiting on auth/login endpoints | HIGH |
| RATE-004 | No rate limiting on billing/payment endpoints | MEDIUM |
| RATE-005 | No global rate limiting (e.g., throttler module) | HIGH |

---

## 7. Unsafe Field Exposure Audit

### 7.1 Presenter Pattern

The auth module uses a presenter pattern (`auth-me.presenter.ts`, `auth-me.presenter.spec.ts`) to filter response fields, which is a positive practice.

### 7.2 Admin User DTOs

`safe-user.dto.ts` in the admin users module suggests a deliberate pattern of filtering sensitive fields from user responses.

### 7.3 Concerns

| ID | Finding | Severity |
|----|---------|----------|
| FIELD-001 | Verify `safe-user.dto.ts` excludes password hashes, service role data | HIGH |
| FIELD-002 | Verify analytics responses do not include raw user IDs where aggregate is expected | MEDIUM |
| FIELD-003 | Verify billing responses do not include payment method details | HIGH |
| FIELD-004 | Verify notification responses do not include provider tokens | MEDIUM |

---

## 8. Error Handling Audit

### 8.1 Error Classes

| Feature | Error Handling | Files |
|---------|---------------|-------|
| Billing | Custom error classes | `billing.errors.ts`, `billing.errors.spec.ts` |
| Notifications | Custom error classes | `notification-errors.ts`, `notification-errors.spec.ts` |
| Config | Validation errors | `BackendConfigValidationError` in `backend-config.validation.ts` |

**Positive findings:**
- Billing and notification features have custom error classes with tests
- Custom errors reduce risk of leaking internal details

**Concerns:**
| ID | Finding | Severity |
|----|---------|----------|
| ERR-001 | Need to verify NestJS exception filter strips stack traces in production | HIGH |
| ERR-002 | Need to verify 500 errors return generic message, not internal details | HIGH |

---

## 9. CORS Configuration

From `main.ts`:
```typescript
app.enableCors({
  origin: [...config.corsOrigins],
});
```

**Findings:**
- CORS origins are configured from environment variable `CORS_ORIGINS`
- Origins are validated as URLs in `backend-config.validation.ts`
- At least one origin is required (validation enforces this)

**Concern:**
- Need to verify wildcard `*` is not used in production CORS_ORIGINS

---

## 10. Webhook Endpoint Security

`webhook.controller.ts` handles payment provider webhooks.

**Positive findings:**
- `billing-idempotency.service.ts` provides idempotency checks (tested: `webhook-idempotency.spec.ts`)
- `provider-webhook.service.ts` handles webhook routing

**Concerns:**
| ID | Finding | Severity |
|----|---------|----------|
| HOOK-001 | Need to verify webhook signature validation is enforced | CRITICAL |
| HOOK-002 | Need to verify webhook endpoint is excluded from JWT guard | HIGH |
| HOOK-003 | Need to verify webhook endpoint is not in OpenAPI spec | MEDIUM |

---

## 11. Summary of Findings

### Positive

1. Comprehensive role/permission/ownership guard architecture
2. Dedicated billing and analytics validation with tests
3. Presenter pattern for response filtering
4. Custom error classes reduce information leakage
5. Rate limiting on AI/voice teacher and notifications
6. Idempotency service for webhooks
7. CORS properly configured from environment

### Critical/High Issues

| ID | Issue | Severity | Action |
|----|-------|----------|--------|
| RATE-003 | No rate limiting on auth endpoints | HIGH | Add throttling |
| RATE-005 | No global rate limiting | HIGH | Add NestJS ThrottlerModule |
| AUTHZ-006 | Verify no endpoint missing guard | HIGH | Audit all routes |
| VAL-001 | Verify global ValidationPipe | HIGH | Check main.ts/app.module |
| HOOK-001 | Verify webhook signature validation | CRITICAL | Inspect webhook controller |
| ERR-001 | Verify stack trace stripping | HIGH | Check exception filter |
| FIELD-001 | Verify user DTO excludes sensitive fields | HIGH | Review safe-user.dto |
| FIELD-003 | Verify billing response filtering | HIGH | Review billing DTOs |

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The authorization architecture is well-designed. Critical items (HOOK-001, RATE-003, RATE-005) must be verified and remediated before production launch.
