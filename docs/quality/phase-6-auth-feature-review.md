# Phase 6 — Flutter Auth Feature Review

**Task:** P6-031  
**Branch:** `phase6/P6-031-flutter-auth-feature-review`  
**Date:** 2026-06-18  
**Scope:** Static review of the Flutter auth feature against the Phase 2 (P2-050) backend contract.  
**Environment note:** Flutter SDK not available in the CI sandbox. `flutter analyze` and `flutter test` must be run locally before merging to main.

---

## 1. File Inventory

| Layer | File | Present |
|-------|------|---------|
| **Datasource (Supabase)** | `data/datasources/supabase_auth_datasource.dart` | ✅ |
| | `data/datasources/supabase_auth_datasource_impl.dart` | ✅ |
| **Datasource (Backend)** | `data/datasources/auth_remote_datasource.dart` | ✅ |
| | `data/datasources/auth_remote_datasource_impl.dart` | ✅ |
| | `data/datasources/auth_datasources.dart` (barrel) | ✅ |
| **Models** | `data/models/auth_context_model.dart` | ✅ |
| | `data/models/auth_sync_response_model.dart` | ✅ |
| | `data/models/current_user_model.dart` | ✅ |
| | `data/models/client_safe_role_model.dart` | ✅ |
| | `data/models/client_safe_permission_model.dart` | ✅ |
| | `data/models/client_safe_profile_model.dart` | ✅ |
| | `data/models/session_validation_model.dart` | ✅ |
| | `data/models/auth_models.dart` (barrel) | ✅ |
| **Repository** | `logic/repository/auth_repository.dart` (abstract) | ✅ |
| | `data/repository/repo_impl/auth_repository_impl.dart` | ✅ |
| **State / Providers** | `logic/entity/auth_flow_state.dart` | ✅ |
| | `logic/entity/auth_flow_status.dart` | ✅ |
| | `logic/provider/auth_flow_notifier.dart` | ✅ |
| | `logic/provider/auth_flow_provider.dart` | ✅ |
| | `logic/provider/auth_context_notifier.dart` | ✅ |
| | `logic/provider/auth_context_provider.dart` | ✅ |
| | `logic/provider/login_notifier.dart` | ✅ |
| | `logic/provider/login_provider.dart` | ✅ |
| | `logic/provider/register_notifier.dart` | ✅ |
| | `logic/provider/register_provider.dart` | ✅ |
| | `logic/provider/logout_notifier.dart` | ✅ |
| | `logic/provider/logout_provider.dart` | ✅ |
| | `logic/provider/auth_token_interceptor_provider.dart` | ✅ |
| **UI** | `ui/pages/login_page.dart` | ✅ |
| | `ui/pages/register_page.dart` | ✅ |
| | `ui/pages/sign_in_placeholder_page.dart` | ✅ |
| | `ui/widgets/auth_placeholder_banner.dart` | ✅ |
| **Tests** | `test/features/auth/auth_flow_notifier_test.dart` | ✅ |
| | `test/features/auth/auth_context_notifier_test.dart` | ✅ |
| | `test/features/auth/auth_placeholder_flow_test.dart` | ✅ |

---

## 2. Backend Contract Alignment (P2-050)

The Flutter auth feature calls three backend endpoints. All are defined in `BackendApiPaths`.

| Flutter path constant | Backend endpoint | Contract verified |
|----------------------|-----------------|-------------------|
| `BackendApiPaths.authMe` → `/auth/me` | `GET /auth/me` in `auth.controller.ts` | ✅ |
| `BackendApiPaths.authLogout` → `/auth/logout` | Backend logout path | ✅ |
| `BackendApiPaths.authSyncUser` → `/auth/sync-user` | ⚠️ Not found as a dedicated route in current backend source — see note below | ⚠️ |

**Note on `/auth/sync-user`:** The `auth.controller.ts` exposes `GET /auth/me` and `POST /auth/bootstrap`. No `POST /auth/sync-user` route was found in the backend source at time of review. The Flutter `AuthRemoteDatasourceImpl.syncUser()` POSTs to this path. If `sync-user` is not yet implemented on the backend, the login flow will fail at the `syncAndLoadUser` step. This must be verified or the Flutter client must be updated to use `POST /auth/bootstrap` (or equivalent) before Phase 6 auth screens go live.

**`AuthContextModel` field mapping against `/auth/me` response:**

| Flutter field | Backend JSON key | Notes |
|---------------|-----------------|-------|
| `user.id` | `user.id` | ✅ |
| `user.email` | `user.email` | ✅ nullable |
| `user.phone` | `user.phone` | ✅ nullable |
| `user.userType` | `user.userType` | ✅ |
| `user.status` | `user.status` | ✅ |
| `profile` | `profile` | ✅ nullable |
| `roles` | `roles` | ✅ handles both `String[]` and `{key, name}[]` formats |
| `permissions` | — | ⚠️ Always empty (`const []`); backend returns permissions but Flutter discards them |

---

## 3. Authentication Flow

**Sign-in path:**
1. `LoginNotifier.submit()` → `SupabaseAuthDatasource.signInWithEmailPassword()` → Supabase Auth REST API
2. On success → `AuthContextNotifier.syncAndLoadUser(token)` → `/auth/sync-user` + `/auth/me`
3. On context load success → `AuthFlowNotifier.signIn(email, accessToken: token)`
4. Router listener on `authFlowProvider` → navigates to `/main-shell`

**Sign-up path:**
1. `RegisterNotifier.submit()` → `SupabaseAuthDatasource.signUpWithEmailPassword()`
2. If auto-confirmed → same backend sync path as sign-in
3. If email confirmation required → `RegisterOutcome.awaitingEmailConfirmation` → `_ConfirmationSentScreen`

**Logout path:**
1. `LogoutNotifier.logout(token)` → `AuthRepository.logout(token)` → `POST /auth/logout`
2. Backend failure does not block local cleanup (correct: local state is always cleared)
3. `AuthContextNotifier.clearCurrentUser()` + `AuthFlowNotifier.signOut()`

**Session expiry handling:**
- `AuthContextNotifier._isSessionExpired()` maps `UNAUTHORIZED`, `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `SESSION_EXPIRED` codes → clears context + triggers `signOut()`

All state transitions are correct and match the declared flow.

---

## 4. Security Invariants

| Invariant | Status |
|-----------|--------|
| No service-role key, JWT secret, or backend credentials in Flutter source | ✅ PASS |
| `supabaseAnonKey` documented as client-safe (public anon key only) | ✅ PASS |
| `student_id` never passed as client input (derived from JWT on backend) | ✅ PASS |
| No role or permission decisions made in Flutter; backend is authority | ✅ PASS |
| No direct AI/AIM Engine calls | ✅ PASS |
| Bearer token sourced from `AuthFlowState.accessToken`; not from a local store | ✅ PASS |

---

## 5. State Architecture

| Check | Status |
|-------|--------|
| `authFlowProvider` uses `StateNotifierProvider` (persistent, not autoDispose) | ✅ |
| `authContextProvider` uses `StateNotifierProvider` (persistent) | ✅ |
| `loginProvider` uses `StateNotifierProvider.autoDispose` (ephemeral form) | ✅ |
| `registerProvider` uses `StateNotifierProvider.autoDispose` (ephemeral form) | ✅ |
| `logoutProvider` uses `StateNotifierProvider` (intentional — shared logout state) | ✅ |
| `LoginPage` and `RegisterPage` use `ConsumerStatefulWidget` | ✅ |
| Controllers and FocusNodes disposed in `dispose()` | ✅ |

---

## 6. Design System Adoption (login_page.dart)

`LoginPage` is well-adopted:

| Element | Widget / Token used |
|---------|-------------------|
| Screen padding | `AimSpacing.screenPaddingMobile` |
| Section gap | `AimSpacing.sectionGap`, `AimSpacing.formFieldGap`, `AimSpacing.innerGap` |
| Email field | `AIMInput` with `AIMInputType.email` |
| Password field | `AIMInput` with `AIMInputType.password` |
| Error display | `AIMAlertBanner` with `AIMAlertTone.error` |
| Submit button | `AIMButton` with `loading` and `fullWidth` |
| Text styles | `AimTextStyles.h3`, `AimTextStyles.h1`, `AimTextStyles.bodySm` |
| Surface colours | `aimSurfacesOf(context)` theme extension |

**Result: ✅ login_page.dart fully adopts the AIM design system.**

---

## 7. Design System Adoption (register_page.dart) — ISSUES FOUND

`RegisterPage` was implemented with raw Flutter widgets and is **not** adopted to the AIM design system. This is a blocking finding for Phase 6.

| Issue | Location | Severity |
|-------|----------|----------|
| Raw `TextField` used instead of `AIMInput` | Lines 100, 118, 143 | **High** |
| Hard-coded `EdgeInsets.symmetric(horizontal: 24, vertical: 32)` instead of `AimSpacing` tokens | Line 92 | Medium |
| Hard-coded `SizedBox(height: 32/24/16/8)` instead of `AimSpacing` tokens | Multiple lines | Medium |
| `FilledButton` used instead of `AIMButton` | `_ConfirmationSentScreen` | **High** |
| `_ErrorBanner` is a one-off Container widget — should use `AIMAlertBanner` | Lines 283–298 | **High** |
| `Colors.white` hard-coded for spinner stroke | Line 190 | Medium |
| `Theme.of(context).textTheme` raw access instead of `AimTextStyles` | Multiple `_` widgets | Medium |
| `EdgeInsets.all(32)` in `_ConfirmationSentScreen` | Line 315 | Medium |
| `_PasswordMismatchHint` uses raw `TextStyle(fontSize: 12)` | Line 273 | Low |

**Result: ❌ register_page.dart requires design system migration before Phase 6 is complete.**

This is expected — `register_page.dart` predates the P6-028 design system adoption task and was not updated in that pass. It must be migrated during a Phase 6 screen rebuild task.

---

## 8. RTL / Arabic

| Check | Status |
|-------|--------|
| No hard-coded `TextDirection` in auth feature files | ✅ PASS |
| `LoginPage` uses `ListView` which respects ambient RTL direction | ✅ PASS |
| `RegisterPage` uses `ListView` which respects ambient RTL direction | ✅ PASS |
| Email/password `TextField` blocks in `register_page.dart` do not set `textDirection` | ✅ PASS |
| No hard-coded `textAlign: TextAlign.start` or `.end` that would break RTL | ✅ PASS |
| `textAlign: TextAlign.center` is used for headings (RTL-neutral) | ✅ PASS |
| Icon mirroring: `Icons.email_outlined`, `Icons.lock_outline` are symmetric — no mirroring needed | ✅ PASS |
| `AIMInput` handles RTL internally via design system | ✅ PASS |

**Result: ✅ No RTL violations in auth feature logic or UI layer.**  
Note: once `register_page.dart` is migrated to `AIMInput`, RTL behaviour of form fields will be consistent with `login_page.dart`.

---

## 9. Test Coverage

| Test file | Covers |
|-----------|--------|
| `auth_flow_notifier_test.dart` | Placeholder sign-in, sign-out, bootstrap transitions |
| `auth_context_notifier_test.dart` | Session expiry auto-sign-out; `UNAUTHORIZED` code maps to `AUTH_SESSION_EXPIRED` |
| `auth_placeholder_flow_test.dart` | Placeholder flow integration |

**Gaps:**
- No test for `LoginNotifier.submit()` success/failure path
- No test for `RegisterNotifier.submit()` — email-confirmed and awaiting-confirmation paths
- No test for `LogoutNotifier.logout()` — backend failure still clears local state
- No test for `SupabaseAuthDatasourceImpl` (HTTP-level)

These gaps are non-blocking for Phase 6 feature screen tasks but should be addressed before production.

---

## 10. Summary

| Area | Status |
|------|--------|
| File inventory complete | ✅ |
| Backend contract alignment (P2-050) | ⚠️ `/auth/sync-user` path unverified on backend |
| Auth flow state transitions | ✅ |
| Security invariants | ✅ |
| State architecture | ✅ |
| Design system — `login_page.dart` | ✅ Fully adopted |
| Design system — `register_page.dart` | ❌ Requires migration |
| RTL / Arabic | ✅ |
| Test coverage | ⚠️ Notifier submit paths untested |
| Runtime verification (`flutter analyze` / `flutter test`) | ⚠️ MANUAL — SDK not available in sandbox |

### Action items before auth screens ship

1. **Verify `/auth/sync-user` backend route** — confirm it exists or update Flutter to use the correct path (e.g. `POST /auth/bootstrap`).
2. **Migrate `register_page.dart`** to `AIMInput`, `AIMButton`, `AIMAlertBanner`, and `AimSpacing` tokens — schedule as a Phase 6 screen task.
3. **Add notifier submit-path tests** for `LoginNotifier`, `RegisterNotifier`, and `LogoutNotifier`.
4. **Run `flutter analyze` and `flutter test` locally** before merging.
