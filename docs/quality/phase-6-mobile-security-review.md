# Phase 6 — Mobile Security Review

**Task:** P6-125
**Branch:** `phase6/P6-125-mobile-security-review`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P6-119, P6-120, P6-121, P6-122, P6-123, P6-124 — all Done

---

## Scope

Comprehensive security review of the Flutter Student Mobile App MVP.
Covers credential handling, token management, network security,
data storage, client-side authority abuse, and privilege escalation vectors.

---

## 1. Credential & Secret Management

### 1.1 Service-Role Keys

- **Finding:** Grepped entire `apps/mobile/` for `service_role`, `supabase_secret`,
  `SUPABASE_SERVICE_ROLE`, `database_url`, `DATABASE_URL`.
- **Result:** ✅ None found. No service-role keys anywhere in Flutter source,
  assets, or configuration files.

### 1.2 Anon Key / API Keys

- **Finding:** Grepped for `anon_key`, `ANON_KEY`, `openai`, `OPENAI_API_KEY`,
  `anthropic`, `sk-`.
- **Result:** ✅ None found. Supabase anon key, if used, is loaded via
  environment configuration (not committed). No AI provider keys present.

### 1.3 Backend JWT Secret

- **Finding:** JWT validation is backend-only. Flutter receives a JWT as a
  bearer token from Supabase Auth — it does not sign, verify, or decode JWTs.
- **Result:** ✅ No JWT secret or verification code in Flutter.

### 1.4 Token Storage

- `SecureSessionStore` uses `flutter_secure_storage` for persisting the
  access token. Platform-native secure storage (Keychain on iOS, Android Keystore).
- Token is never written to `SharedPreferences`, `hive`, or plain files.
- **Result:** ✅ Secure storage only.

---

## 2. Network Security

### 2.1 Auth Token Interceptor

- `AuthInterceptor` (P6-023) attaches `Authorization: Bearer <token>` to
  all backend API requests automatically via the shared network layer.
- No token is hardcoded or passed as a query parameter.
- **Result:** ✅

### 2.2 No Sensitive Payload Logging

- Grepped for `print(`, `debugPrint(`, `log(` in all feature files.
- No log statement outputs access tokens, passwords, or user PII.
- Error messages log status codes and generic messages only.
- **Result:** ✅

### 2.3 Backend URL Pinning

- Backend base URL is sourced from configuration, not hardcoded.
- AIM Engine URLs (`/aim-engine`, Python service paths) are not referenced
  anywhere in Flutter code — confirmed by grep.
- **Result:** ✅

### 2.4 HTTPS

- All API clients in `BackendApiClient` use the backend base URL from
  configuration. No `http://` literals found in feature code.
- **Result:** ✅

---

## 3. Client-Side Authority Abuse

### 3.1 No Client-Side Placement Scoring

- Confirmed by `placement_no_scoring_test.dart` and P6-054/P6-120 audits.
- `is_correct`, `correct_answer`, threshold constants: not present anywhere.
- **Result:** ✅

### 3.2 No Client-Side Question Correctness

- Confirmed by P6-123 audit and `question_answer_flow_checks_test.dart`.
- `QuestionOptionsList` has no `correct`/`incorrect` visual states.
- **Result:** ✅

### 3.3 No Client-Side AIM Calculation

- Confirmed by P6-124 audit and `no_aim_calculation_regression_test.dart`.
- No mastery threshold, weakness scoring, or recommendation generation in Flutter.
- **Result:** ✅

### 3.4 No Direct Database Writes

- Grepped for `supabase.from(`, `supabase.rpc(`, direct DB connection strings.
- **Result:** ✅ None found. All writes go through backend API endpoints.

### 3.5 No Privilege Escalation

- `AuthContextModel` contains `roles` and `permissions` arrays.
- Flutter never mutates these arrays or assumes a role locally.
- Role-based UI gating (e.g., admin UI not shown to students) is enforced
  by backend API responses — not by Flutter role comparisons.
- **Result:** ✅

---

## 4. Protected Routes

- `AppRouter._protectedRoutes` correctly gates all authenticated surfaces.
- `resolveRouteName` redirects unauthenticated users to sign-in.
- Placement routes added in P6-045 are correctly gated.
- **Result:** ✅

---

## 5. AI Teacher Shell

- `ai_teacher` feature contains only a placeholder page and disabled shell.
- No AI provider credentials, no prompt calls, no streaming.
- `AiTeacherPlaceholderPage` displays a static "Coming Soon" message only.
- **Result:** ✅ AI Teacher implementation correctly excluded from Phase 6.

---

## 6. Data Exposure

### 6.1 Student Data Isolation

- `student_id` is never sent from Flutter as a request body field.
  JWT resolution is server-side throughout all features (confirmed by grep).
- **Result:** ✅

### 6.2 Raw Score Exposure

- `masteryScore` numeric value never displayed.
- Only backend-provided qualitative signal strings (`strong`/`developing`/`emerging`) shown.
- `correctCount` in session feedback is backend-computed and shown as-is.
- **Result:** ✅

---

## 7. Findings Summary

| Category | Status | Notes |
|---|---|---|
| Service-role / AI provider keys | ✅ PASS | None found |
| Token storage | ✅ PASS | `flutter_secure_storage` only |
| Auth token transport | ✅ PASS | Bearer via interceptor |
| Sensitive payload logging | ✅ PASS | No PII/token logging |
| No client-side placement scoring | ✅ PASS | Regression tested |
| No client-side correctness | ✅ PASS | Regression tested |
| No client-side AIM calculation | ✅ PASS | Regression tested |
| No direct DB writes | ✅ PASS | API-only writes |
| No privilege escalation | ✅ PASS | Backend-enforced roles |
| Protected route gating | ✅ PASS | `AppRouter._protectedRoutes` |
| AI Teacher excluded | ✅ PASS | Placeholder only |
| Student data isolation | ✅ PASS | JWT-resolved server-side |

---

## Gaps / Recommendations

| Gap | Severity | Recommendation |
|---|---|---|
| `completeBootstrap()` in `AuthFlowNotifier` is a stub — real session restore via `AppBootstrapNotifier` is the active path | Low | Document clearly; separate task exists |
| Email confirmation deep-link not yet handled | Medium | Phase 7 |
| HTTPS enforcement not validated at runtime (no certificate pinning) | Low | Phase 7 — out of MVP scope |

---

## Verdict

**PASS.** No security violations found in the Phase 6 Flutter MVP. All critical
security properties (no secrets, token security, no client-side authority,
backend delegation) are satisfied. Three low-to-medium gaps documented above
are explicitly deferred to Phase 7 or have separate ownership.
