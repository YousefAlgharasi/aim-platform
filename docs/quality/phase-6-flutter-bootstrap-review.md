# Phase 6 — Flutter App Bootstrap Review

**Phase:** 6  
**Task:** P6-019  
**Branch:** `phase6/P6-019-flutter-bootstrap-review`  
**Dependency:** P6-001 (Student Mobile MVP Charter — Done)  
**Source Branch Reviewed:** `aim-mobile-design-system`  
**Output:** `docs/quality/phase-6-flutter-bootstrap-review.md`

---

## 1. Purpose

This review confirms the Flutter mobile app bootstrap on the `aim-mobile-design-system` branch is correctly set up and ready for Phase 6 feature work. It identifies any gaps that must be resolved before UI tasks begin.

**Verdict: Bootstrap is ready for Phase 6. One pre-work item required (restore AimMobileApp as entry point).**

---

## 2. Entry Point — `apps/mobile/lib/main.dart`

**Current state:**

```dart
void main() {
  runApp(
    const ProviderScope(
      child: DSPreviewPage(),      // ← design system preview active
      // child: AimMobileApp(),   // ← app entry point commented out
    ),
  );
}
```

**Status:** ⚠️ Requires fix before Phase 6 UI tasks start.  
`DSPreviewPage` is a development tool, not the Phase 6 app. The first Phase 6 task that touches the app entry point must restore `AimMobileApp` as the active child.

**Required change:**
```dart
void main() {
  runApp(
    const ProviderScope(
      child: AimMobileApp(),
    ),
  );
}
```

---

## 3. App Root — `AimMobileApp`

**File:** `apps/mobile/lib/app/aim_mobile_app.dart`

| Check | Status | Notes |
|---|---|---|
| Extends `ConsumerWidget` | ✅ Pass | Riverpod integration correct |
| Uses `AppTheme.light` / `AppTheme.dark` | ✅ Pass | AIM design system themes applied |
| `themeMode` from `themeModeProvider` | ✅ Pass | Theme switching supported |
| `initialRoute: AppRoutePaths.splash` | ✅ Pass | Starts at splash/auth gate |
| `onGenerateRoute: AppRouter.onGenerateRoute` | ✅ Pass | Centralized routing |
| Auth state wired into routing | ✅ Pass | `authFlowProvider` + `authContextProvider` watched |
| `debugShowCheckedModeBanner: false` | ✅ Pass | Clean production UI |
| No locale/RTL configuration yet | ⚠️ Gap | `locale`, `supportedLocales`, `localizationsDelegates` not set — required for Arabic/RTL |

**RTL gap (must fix in Phase 6 routing/bootstrap tasks):**
```dart
// Required additions to AimMobileApp
MaterialApp(
  locale: ref.watch(localeProvider),            // from AppLocale
  supportedLocales: AppLocale.supportedLocales, // [en, ar]
  localizationsDelegates: AppLocale.delegates,  // Material + custom
  ...
)
```

---

## 4. Routing — `AppRouter`

**File:** `apps/mobile/lib/core/routing/app_router.dart`

| Check | Status | Notes |
|---|---|---|
| Centralized `onGenerateRoute` | ✅ Pass | All routes in one place |
| Auth-aware route resolution | ✅ Pass | `resolveRouteName` checks auth state |
| Protected routes guarded | ✅ Pass | Unauthenticated users redirected to sign-in |
| Splash → Auth → Shell flow | ✅ Pass | `splash → signIn/register → mainShell` |
| All MVP screens registered | ⚠️ Partial | `home`, `learn`, `review`, `progress`, `profile` all map to `MainShellPage` (placeholder); feature screens not yet wired — expected for Phase 6 implementation tasks |
| Placement routes missing | ⚠️ Expected gap | Placement routes (`/placement/start`, `/placement/question`, etc.) not yet added — Phase 6 tasks will add these |

**Route paths defined (`AppRoutePaths`):**
- `/` (splash), `/sign-in`, `/register`
- `/home`, `/learn`, `/review`, `/progress`, `/profile`
- `/main-shell`

---

## 5. Theme — `AppTheme`

**File:** `apps/mobile/lib/core/theme/app_theme.dart`

| Check | Status | Notes |
|---|---|---|
| `AppTheme.light` → `aimLightTheme` | ✅ Pass | AIM light theme wired |
| `AppTheme.dark` → `aimDarkTheme` | ✅ Pass | AIM dark theme wired |
| `AimThemeExtensions` available | ✅ Pass | Custom AIM token extension registered |
| Color scheme from `AimColors` | ✅ Pass | Not using Material defaults |
| Typography from `AimTextStyles` | ✅ Pass | Text theme set from design tokens |

---

## 6. State Management — Riverpod

**File:** `pubspec.yaml` — `flutter_riverpod: ^2.5.1`

| Check | Status | Notes |
|---|---|---|
| `ProviderScope` at app root | ✅ Pass | Wraps entire widget tree |
| Auth providers available | ✅ Pass | `authFlowProvider`, `authContextProvider`, `loginProvider`, `logoutProvider` |
| Theme mode provider | ✅ Pass | `themeModeProvider` |
| Config provider | ✅ Pass | `appConfigProvider` |
| No AI/AIM providers | ✅ Pass | No AIM Engine state in Flutter |

---

## 7. Configuration — `AppConfig`

**File:** `apps/mobile/lib/core/config/app_config.dart`

| Check | Status | Notes |
|---|---|---|
| Environment via `--dart-define` | ✅ Pass | No hardcoded env values |
| `BACKEND_API_BASE_URL` from env | ✅ Pass | Correct — no URL literal in source |
| `SUPABASE_URL` from env | ✅ Pass | Public, client-safe |
| `SUPABASE_ANON_KEY` from env | ✅ Pass | Public anon key, not service key |
| No secrets in source | ✅ Pass | No API keys committed |
| No AIM Engine URL in config | ✅ Pass | Flutter only knows backend URL |

---

## 8. Networking — `BackendApiClient`

| Check | Status | Notes |
|---|---|---|
| HTTP client wraps backend only | ✅ Pass | All calls to `backendApiBaseUrl` |
| No direct AI/AIM provider URLs | ✅ Pass | Clean |
| Error envelope handling | ✅ Pass | `ApiErrorEnvelope` defined |
| Response envelope handling | ✅ Pass | `ApiResponseEnvelope` defined |

---

## 9. Dependency Scan — `pubspec.yaml`

| Check | Status |
|---|---|
| No AI SDK packages | ✅ Pass |
| No AIM Engine client packages | ✅ Pass |
| No secrets or credentials | ✅ Pass |
| `flutter_riverpod: ^2.5.1` | ✅ Present |
| `http: ^1.2.2` | ✅ Present |
| No unnecessary dependencies | ✅ Pass |

---

## 10. Summary — Bootstrap Readiness

| Area | Status |
|---|---|
| Entry point (`main.dart`) | ⚠️ Restore `AimMobileApp` before first UI task |
| App root (`AimMobileApp`) | ✅ Ready — add locale/RTL config in bootstrap task |
| Routing (`AppRouter`) | ✅ Ready — feature routes to be added per task |
| Theme | ✅ Ready |
| State management | ✅ Ready |
| Config | ✅ Ready — no secrets |
| Networking | ✅ Ready |
| Dependencies | ✅ Clean |

**Pre-work required before UI tasks start:**
1. Restore `AimMobileApp` as the `main.dart` entry point (first bootstrap task — P6-021 area).
2. Add locale and RTL config to `AimMobileApp` (P6-029 area).

**No blockers for documentation and architecture tasks.**

---

*Flutter bootstrap review created: P6-019 | Branch: phase6/P6-019-flutter-bootstrap-review*
