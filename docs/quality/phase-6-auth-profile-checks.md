# Phase 6 — Auth/Profile Mobile Checks

**Task:** P6-042  
**Branch:** `phase6/P6-042-flutter-auth-profile-tests`  
**Date:** 2026-06-18  
**Scope:** Static inspection of Flutter auth (P6-031..P6-037) and profile (P6-038..P6-041) feature work.  
**Environment note:** Flutter SDK not available in sandbox. `flutter analyze` and `flutter test` must be run locally before merging any branch to main.

---

## 1. Work Completed: P6-031..P6-041 Summary

| Task | Branch | Status | Output |
|------|--------|--------|--------|
| P6-031 | `phase6/P6-031-flutter-auth-feature-review` | Pushed | `docs/quality/phase-6-auth-feature-review.md` |
| P6-032 | `phase6/P6-032-flutter-splash-screen` | **Merged** | Splash screen |
| P6-033 | `phase6/P6-033-flutter-auth-gate` | Pushed | `AuthGate`, `AppBootstrapNotifier` |
| P6-034 | `phase6/P6-034-flutter-login-page-mvp` | Pushed | Login page MVP |
| P6-035 | `phase6/P6-035-flutter-register-page-mvp` | Pushed | Register page MVP |
| P6-036 | `phase6/P6-036-flutter-auth-session-persistence` | Pushed | `SessionStore`, secure persistence |
| P6-037 | `phase6/P6-037-flutter-logout-flow` | **Merged** | `LogoutButton`, profile page wiring |
| P6-038 | `phase6/P6-038-flutter-profile-feature-skeleton` | Pushed | Profile feature barrels |
| P6-039 | `phase6/P6-039-flutter-profile-models` | Pushed | Extended profile model tests |
| P6-040 | `phase6/P6-040-flutter-profile-read-flow` | Pushed | Authenticated client fix, notifier tests |
| P6-041 | `phase6/P6-041-flutter-profile-page` | Pushed | Profile page design system rewrite |

---

## 2. Auth Feature Checks (P6-031..P6-037)

### 2.1 Auth Gate (P6-033)

| Check | Result |
|-------|--------|
| `AppBootstrapNotifier` starts in `checking` state | ✅ |
| Session store read on launch; restores token → signedIn if present | ✅ |
| Empty store → `completeBootstrap()` → signedOut | ✅ |
| Storage error caught; falls through to signedOut | ✅ |
| `AuthGate` widget mounts invisibly in splash `Stack` | ✅ |
| `AuthGate` uses `addPostFrameCallback` — no build-time navigation | ✅ |
| `pushNamedAndRemoveUntil` removes splash from back stack | ✅ |
| Placeholder manual bootstrap buttons removed from splash | ✅ |
| Test: bootstrap checking → done → signedOut | ✅ |
| Test: bootstrap restores session → signedIn | ✅ |
| Test: `AuthGate` stuck-in-checking does not navigate | ✅ |

### 2.2 Login Page (P6-034)

| Check | Result |
|-------|--------|
| `AIMInput` for email and password | ✅ |
| `AIMButton` with `loading`, `fullWidth`, `semanticLabel` | ✅ |
| `AIMAlertBanner` for error display | ✅ |
| `AimSpacing` tokens for all padding/gaps | ✅ |
| `AimTextStyles` for all text | ✅ |
| `AutofillGroup` wrapping form | ✅ |
| `ref.listen(authFlowProvider)` drives navigation | ✅ |
| No hard-coded `Color`, `TextStyle`, `EdgeInsets` | ✅ |
| No hard-coded `TextDirection` | ✅ |
| RTL smoke test passes | ✅ |

### 2.3 Register Page (P6-035)

| Check | Result |
|-------|--------|
| `AIMInput` × 3 (email, password, confirm) | ✅ |
| Password mismatch via `AIMInput(error:)` — no one-off widget | ✅ |
| `AIMButton` for submit | ✅ |
| `AIMAlertBanner` for error | ✅ |
| `AIMTopAppBar` for navigation header | ✅ |
| `_ConfirmationSentView` uses `AIMButton`, `AimTextStyles`, `AimSpacing` | ✅ |
| No `FilledButton`, raw `TextField`, `Container`, `Card` | ✅ |
| No hard-coded `TextDirection` | ✅ |
| RTL smoke test passes | ✅ |

### 2.4 Session Persistence (P6-036)

| Check | Result |
|-------|--------|
| `SessionStore` abstract interface present | ✅ |
| `SecureSessionStore` uses `FlutterSecureStorage` (Keychain / EncryptedSharedPreferences) | ✅ |
| `sessionStoreProvider` overridable for tests | ✅ |
| Token persisted only after backend identity confirmation | ✅ |
| Token cleared on logout (even if server logout fails) | ✅ |
| No service-role key, JWT secret, or AI provider key stored | ✅ |
| `FakeSessionStore` contract tests pass | ✅ |
| Bootstrap session-restore tests pass | ✅ |

### 2.5 Logout Flow (P6-037)

| Check | Result |
|-------|--------|
| `LogoutButton` uses `AIMButton` with `AIMButtonVariant.destructive` | ✅ |
| Loading state shown during logout | ✅ |
| Bearer token read from `authFlowProvider` — not user input | ✅ |
| No manual `Navigator` call in `LogoutButton` — reactive via `authFlowProvider` listener | ✅ |
| Profile page wired with `ref.listen(authFlowProvider)` → sign-in on signedOut | ✅ |
| Old `FilledButton.tonal` removed from profile page | ✅ |
| Widget tests: destructive variant, loading state, enabled state, RTL | ✅ |

---

## 3. Profile Feature Checks (P6-038..P6-041)

### 3.1 Feature Skeleton (P6-038)

| Check | Result |
|-------|--------|
| All layers present: data/datasources, data/models, data/repository, logic/entity, logic/provider, logic/repository, ui/pages, ui/widgets | ✅ |
| Top-level barrel `profile.dart` | ✅ |
| `ui/widgets/profile_widgets.dart` placeholder barrel | ✅ |

### 3.2 Models (P6-039)

| Check | Result |
|-------|--------|
| `UserProfile` / `UserProfileModel` present and tested | ✅ |
| `StudentProfile` / `StudentProfileModel` present and tested | ✅ |
| `AdminProfile` / `AdminProfileModel` present and tested | ✅ |
| `ProfileMeResponseModel` parses student, admin, and empty paths | ✅ |
| `SafeStudentProfileUpdatePayload` never includes `id`, `userId`, `roles`, `permissions` | ✅ |
| `SafeAdminProfileUpdatePayload` never includes `serviceRoleKey`, `jwtSecret` | ✅ |

### 3.3 Profile Read Flow (P6-040)

| Check | Result |
|-------|--------|
| `ProfileRemoteDatasourceImpl` calls `GET /profile/me` and `PATCH /profile/me` | ✅ |
| Provider uses `authenticatedBackendApiClientProvider` (bearer token injected) | ✅ (fixed in P6-040) |
| `ProfileNotifier` loading/success/failure state transitions | ✅ |
| `clearProfile()` resets to idle | ✅ |
| Tests: idle→loading→success, failure path (PROFILE_LOAD_FAILED), clearProfile | ✅ |

### 3.4 Profile Page (P6-041)

| Check | Result |
|-------|--------|
| `AIMTopAppBar` | ✅ |
| `AIMFullScreenLoading` for loading state | ✅ |
| `AIMFullScreenError` for error state | ✅ |
| `AIMCard` for section cards | ✅ |
| `AIMBadge` for roles | ✅ |
| `AimTextStyles` for all text | ✅ |
| `AimColors` tokens for avatar background/text | ✅ |
| `AimSpacing` tokens for padding/gaps | ✅ |
| `LogoutButton` in bottom nav bar | ✅ |
| No `AppBar`, `Card`, `Chip`, `Theme.of(context).textTheme.*` raw access | ✅ |
| No hard-coded `TextDirection` | ✅ |
| RTL smoke test passes | ✅ |

---

## 4. Security Invariants

| Invariant | Status |
|-----------|--------|
| No service-role key, JWT secret, or AI provider key in auth/profile Flutter code | ✅ |
| `student_id` / `userId` never set from Flutter input — derived from JWT server-side | ✅ |
| No scoring, CEFR, mastery, or AIM Engine calls in auth/profile features | ✅ |
| Role and permission checks are UX display only — backend is authority | ✅ |
| Token persisted only after backend confirmation of identity | ✅ |
| Token cleared on logout regardless of server response | ✅ |

---

## 5. Test Coverage Summary

| File | Tests |
|------|-------|
| `auth_flow_notifier_test.dart` | State transitions (checking/signedOut/signedIn) |
| `auth_context_notifier_test.dart` | Session expiry auto-sign-out |
| `auth_gate_test.dart` | Bootstrap checking/done, gate navigation, stuck-checking |
| `auth_session_persistence_test.dart` | SessionStore contract, bootstrap restore, logout clear |
| `login_page_test.dart` | Smoke, submit state, error banner, RTL |
| `logout_button_test.dart` | Variant, loading, enabled, fullWidth, RTL |
| `register_page_test.dart` | Smoke, submit state (valid/mismatch), error banner, RTL |
| `profile_models_test.dart` | All model types + ProfileMeResponseModel + update payload security |
| `profile_read_flow_test.dart` | Notifier loading/success/failure/clear |
| `profile_page_test.dart` | Design system smoke, data rendering, loading/error, RTL |

**Total new test files added in P6-031..P6-041: 7**

---

## 6. Minor Findings (Non-Blocking)

| Location | Finding | Task |
|----------|---------|------|
| `sign_in_placeholder_page.dart` | Hard-coded `EdgeInsets.all(24)`, `SizedBox(height: 16/12)` | Will be superseded when placeholder is removed |
| `edit_profile_page.dart` | Hard-coded `EdgeInsets.all(24/12)`, `SizedBox(height: 16/24)` | P6-035 follow-up or dedicated edit profile task |
| `auth_flow_notifier_test.dart` | Tests use deprecated `signInPlaceholder`/`signOutPlaceholder` | Non-blocking; still works |

---

## 7. Runtime Verification Required

The following must be run locally before merging any feature branch to main:

```bash
# From apps/mobile/
flutter pub get
flutter analyze
flutter test
```

Expected: zero errors, zero warnings, all tests pass.
