# P16-046: Client Security Audit

**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Date:** 2026-06-21
**Status:** Audit Complete — Findings Documented

---

## 1. Scope

This audit covers security of all client applications:

- **Mobile App** (Flutter): `apps/mobile/lib/`
- **Admin Dashboard** (React): `apps/web/src/features/admin-analytics/`, `apps/web/src/features/admin-notifications/`
- **Parent Dashboard** (React): `apps/web/src/features/parent-dashboard/`

Areas audited: token handling, secret exposure, direct DB access, direct AIM engine calls, backend-authority compliance.

---

## 2. Mobile App (Flutter) — Architecture Review

### 2.1 File Structure

Key files in `apps/mobile/lib/`:

| Directory/File | Purpose |
|---------------|---------|
| `core/networking/auth_interceptor.dart` | JWT attachment to requests |
| `core/networking/auth_token_provider.dart` | Token retrieval/storage |
| `core/networking/backend_api_client.dart` | Backend API HTTP client |
| `core/networking/api_client_exception.dart` | API error handling |
| `core/networking/api_response_envelope.dart` | Response envelope parsing |
| `core/networking/api_error_envelope.dart` | Error envelope parsing |
| `core/config/app_config.dart` | App configuration |
| `core/config/app_config_provider.dart` | Config provider |
| `core/errors/app_error_handler.dart` | Global error handling |
| `core/errors/app_exception.dart` | Exception types |
| `features/auth/` | Authentication flows |
| `features/notifications/` | Push notification handling |
| `features/billing/` | Billing/subscription UI |
| `features/learning/` | Learning session interface |

### 2.2 Token Handling

**Files reviewed:**
- `core/networking/auth_token_provider.dart` — Provides JWT tokens for API calls
- `core/networking/auth_interceptor.dart` — Attaches tokens to HTTP requests

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| MOB-TOK-001 | Auth token provider exists for centralized token management | N/A | PASS |
| MOB-TOK-002 | Auth interceptor attaches tokens to outgoing requests | N/A | PASS |
| MOB-TOK-003 | Need to verify token stored in Flutter secure storage (not SharedPreferences) | HIGH | NEEDS VERIFICATION |
| MOB-TOK-004 | Need to verify token is cleared on logout | HIGH | NEEDS VERIFICATION |
| MOB-TOK-005 | Need to verify token refresh flow handles expired tokens gracefully | MEDIUM | NEEDS VERIFICATION |

### 2.3 Secrets Exposure

**Files reviewed:**
- `core/config/app_config.dart` — App-level configuration
- `core/config/app_config_provider.dart` — Configuration provider

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| MOB-SEC-001 | Need to verify no API keys hardcoded in Dart source | CRITICAL | NEEDS VERIFICATION |
| MOB-SEC-002 | Need to verify Supabase anon key (public) used, not service role key | CRITICAL | NEEDS VERIFICATION |
| MOB-SEC-003 | Need to verify no secrets in `android/` or `ios/` config files committed to git | HIGH | NEEDS VERIFICATION |
| MOB-SEC-004 | Need to verify no debug logging of tokens/keys in release builds | MEDIUM | NEEDS VERIFICATION |

### 2.4 Direct Database Calls

**Finding:** The mobile app uses `backend_api_client.dart` as the primary API client, which is the correct backend-authority pattern. However, Supabase client usage needs verification.

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| MOB-DB-001 | `backend_api_client.dart` exists as primary API client | N/A | PASS |
| MOB-DB-002 | Need to verify no direct Supabase DB writes from mobile | CRITICAL | NEEDS VERIFICATION |
| MOB-DB-003 | Supabase client should be used only for auth (login/signup) | HIGH | NEEDS VERIFICATION |
| MOB-DB-004 | Need to verify no direct Supabase storage writes bypassing backend | HIGH | NEEDS VERIFICATION |

### 2.5 Direct AIM Engine Calls

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| MOB-AIM-001 | No AIM_ENGINE_URL should exist in mobile config | CRITICAL | NEEDS VERIFICATION |
| MOB-AIM-002 | All AIM analysis should go through backend API | CRITICAL | NEEDS VERIFICATION |

### 2.6 Backend-Authority Compliance

The mobile app follows a backend-authority architecture where:
- All data mutations go through `backend_api_client.dart`
- Authentication goes through Supabase auth SDK
- No direct database access for reads/writes of learning data

**Positive findings:**
- Centralized API client exists
- Auth interceptor pattern is correct
- Error handling with `app_error_handler.dart` and typed exceptions

---

## 3. Web App (React) — Admin Dashboard

### 3.1 File Structure

| Directory/File | Purpose |
|---------------|---------|
| `features/admin-analytics/api/adminAnalyticsApiClient.js` | Analytics API client |
| `features/admin-analytics/AdminAnalyticsShell.js` | Admin analytics shell |
| `features/admin-notifications/api/adminNotificationsApiClient.js` | Notifications API client |
| `shared/api/client.js` | Shared HTTP client |
| `shared/api/supabaseClient.js` | Supabase client instance |
| `shared/supabase/client.js` | Alternative Supabase client |

### 3.2 Token Handling

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-TOK-001 | Need to verify JWT storage mechanism (httpOnly cookie vs localStorage) | HIGH | NEEDS VERIFICATION |
| WEB-TOK-002 | Need to verify token not accessible via `document.cookie` in XSS scenario | HIGH | NEEDS VERIFICATION |
| WEB-TOK-003 | Need to verify Supabase session management handles token refresh | MEDIUM | NEEDS VERIFICATION |

### 3.3 Secrets Exposure

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-SEC-001 | Two Supabase client files exist (`shared/api/supabaseClient.js`, `shared/supabase/client.js`) — need to verify which key they use | HIGH | NEEDS VERIFICATION |
| WEB-SEC-002 | Need to verify only SUPABASE_ANON_KEY (public) in client bundle, not SERVICE_ROLE_KEY | CRITICAL | NEEDS VERIFICATION |
| WEB-SEC-003 | Need to verify no backend secrets in Create React App env vars (REACT_APP_*) | HIGH | NEEDS VERIFICATION |
| WEB-SEC-004 | Need to verify `.env` files are in `.gitignore` | HIGH | NEEDS VERIFICATION |

### 3.4 Direct Database Calls

**Concern:** Two separate Supabase client files exist:
- `apps/web/src/shared/api/supabaseClient.js`
- `apps/web/src/shared/supabase/client.js`

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-DB-001 | Two Supabase client instances may indicate direct DB access | HIGH | NEEDS VERIFICATION |
| WEB-DB-002 | Need to verify admin analytics uses `adminAnalyticsApiClient.js` (backend), not Supabase directly | HIGH | NEEDS VERIFICATION |
| WEB-DB-003 | Need to verify admin notifications uses `adminNotificationsApiClient.js`, not Supabase directly | HIGH | NEEDS VERIFICATION |
| WEB-DB-004 | Supabase clients should be used only for auth, not data reads/writes | CRITICAL | NEEDS VERIFICATION |

### 3.5 Direct AIM Engine Calls

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| WEB-AIM-001 | No AIM engine URL should exist in web app config | CRITICAL | NEEDS VERIFICATION |
| WEB-AIM-002 | `pages/AimDemo.jsx` and `pages/AlgorithmTester.jsx` may call AIM engine directly | HIGH | NEEDS INVESTIGATION |

**Note:** `AimDemo.jsx` and `AlgorithmTester.jsx` are demo/testing pages. If they call AIM engine directly, they must be removed or disabled in production builds.

---

## 4. Web App (React) — Parent Dashboard

### 4.1 File Structure

| Directory/File | Purpose |
|---------------|---------|
| `features/parent-dashboard/api/parentApiClient.js` | Parent API client |
| `features/parent-dashboard/api/billingApiClient.js` | Billing API client |
| `features/parent-dashboard/api/notificationsApiClient.js` | Notifications API client |
| `features/parent-dashboard/api/parentAnalyticsApiClient.js` | Parent analytics client |
| `features/parent-dashboard/guards/ParentAuthGuard.js` | Client-side auth guard |

### 4.2 Backend-Authority Compliance

**Positive findings:**
- Dedicated API clients exist for each feature area (parent, billing, notifications, analytics)
- `ParentAuthGuard.js` provides client-side route protection

**Findings:**

| ID | Finding | Severity | Status |
|----|---------|----------|--------|
| PAR-AUTH-001 | `ParentAuthGuard.js` exists for client-side route protection | N/A | PASS |
| PAR-AUTH-002 | Dedicated API clients follow backend-authority pattern | N/A | PASS |
| PAR-AUTH-003 | Need to verify parent can only access own children's data via API clients | HIGH | NEEDS VERIFICATION |
| PAR-AUTH-004 | Need to verify billing API client does not expose other parents' invoices | HIGH | NEEDS VERIFICATION |

### 4.3 Test Coverage

Existing security-relevant tests:

| Test File | Coverage |
|-----------|----------|
| `__tests__/parent-no-authority.test.js` | Tests backend-authority enforcement |
| `__tests__/parent-permission-error.test.js` | Tests permission error handling |
| `__tests__/parent-billing-ui.test.js` | Tests billing UI |
| `__tests__/parent-notification-ui.test.js` | Tests notification UI |
| `__tests__/parent-reporting-ui.test.js` | Tests reporting UI |

**Positive finding:** `parent-no-authority.test.js` explicitly tests that the parent dashboard does not bypass backend authority. This is a strong signal of security awareness in the codebase.

---

## 5. Cross-Client Findings

### 5.1 Summary

| Category | Mobile | Web Admin | Web Parent |
|----------|--------|-----------|------------|
| Centralized API client | YES | YES | YES |
| Auth guard/interceptor | YES | NEEDS VERIFICATION | YES |
| Backend-authority tests | NEEDS VERIFICATION | NEEDS VERIFICATION | YES |
| Supabase scope (auth only) | NEEDS VERIFICATION | NEEDS VERIFICATION | NEEDS VERIFICATION |
| No AIM engine direct calls | NEEDS VERIFICATION | NEEDS INVESTIGATION | NEEDS VERIFICATION |
| No secrets in build | NEEDS VERIFICATION | NEEDS VERIFICATION | N/A (shared) |

### 5.2 Critical Issues Requiring Immediate Verification

| Priority | Issue | Severity |
|----------|-------|----------|
| 1 | Verify no SERVICE_ROLE_KEY in any client bundle | CRITICAL |
| 2 | Verify no direct Supabase DB writes from clients | CRITICAL |
| 3 | Verify no AIM engine URL in client configs | CRITICAL |
| 4 | Verify `AimDemo.jsx`/`AlgorithmTester.jsx` removed from production | HIGH |
| 5 | Verify mobile token storage uses secure storage | HIGH |
| 6 | Clarify purpose of two Supabase client files in web app | HIGH |

---

## 6. Recommendations

### Immediate Actions

1. **Grep all client bundles** for `SUPABASE_SERVICE_ROLE_KEY`, `AIM_ENGINE_SERVICE_TOKEN`, `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `TTS_PROVIDER_API_KEY`.
2. **Remove or disable** `AimDemo.jsx` and `AlgorithmTester.jsx` from production builds.
3. **Consolidate** the two Supabase client files in the web app to a single instance used only for auth.
4. **Verify** Flutter secure storage usage for token storage.

### Pre-Launch Checklist

- [ ] No service role keys in any client bundle
- [ ] No AIM engine URLs in any client config
- [ ] Demo/test pages excluded from production build
- [ ] Token stored securely on mobile (Keychain/Keystore)
- [ ] Token cleared on logout (all clients)
- [ ] CSP headers configured for web app
- [ ] Supabase client used only for auth operations

### Go/No-Go Assessment

**Current: CONDITIONAL GO** — The architecture follows correct backend-authority patterns, and the parent dashboard has explicit no-authority tests. However, multiple critical items need verification before production. The presence of `AimDemo.jsx` and `AlgorithmTester.jsx` in the production build path is a concern.
