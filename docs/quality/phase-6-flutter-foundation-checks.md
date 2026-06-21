# Phase 6 — Flutter Foundation Checks

**Task:** P6-030  
**Branch:** `phase6/P6-030-flutter-foundation-checks`  
**Date:** 2026-06-18  
**Scope:** Static inspection of Flutter foundation layers built in P6-021..P6-029.  
**Environment note:** Flutter SDK and Dart CLI are not available in the CI sandbox.  
`flutter analyze` and `flutter test` must be run locally before merging to main.  
All checks below are static (source inspection + grep).

---

## 1. Routing Foundation (P6-021)

**Files inspected:**
- `lib/core/routing/app_router.dart`
- `lib/core/routing/app_route_paths.dart`
- `lib/core/routing/routing.dart`
- `test/core/routing/app_router_test.dart`

**Checks:**

| Check | Result |
|-------|--------|
| `AppRouter.onGenerateRoute` handles all declared routes | ✅ PASS |
| `resolveRouteName` guards protected routes when signed-out → redirects to `/sign-in` | ✅ PASS |
| `resolveRouteName` redirects signed-in users away from splash/sign-in → `/main-shell` | ✅ PASS |
| Checking state always returns `/splash` | ✅ PASS |
| Route arguments validated before widget construction (type-guarded) | ✅ PASS |
| No hard-coded `TextDirection` in routing layer | ✅ PASS |
| Test file exists | ✅ PASS |

---

## 2. Theme & Design Tokens (P6-022, P6-027)

**Files inspected:**
- `lib/core/theme/app_theme.dart`
- `lib/core/theme/aim_light_theme.dart`
- `lib/core/theme/aim_dark_theme.dart`
- `lib/core/theme/aim_theme_extensions.dart`
- `lib/core/theme/theme_mode_provider.dart`
- `lib/core/design_tokens/` (all files)

**Checks:**

| Check | Result |
|-------|--------|
| `AppTheme.light` and `AppTheme.dark` both defined | ✅ PASS |
| `themeModeProvider` (`StateProvider<ThemeMode>`) defaults to `ThemeMode.system` | ✅ PASS |
| `MaterialApp` wires `theme`, `darkTheme`, `themeMode` from provider | ✅ PASS |
| Design token files cover colors, typography, spacing, radius, shadows, sizes, gradients, motion | ✅ PASS |
| Barrel export `design_tokens.dart` present | ✅ PASS |

---

## 3. Networking Layer (P6-023, P6-024)

**Files inspected:**
- `lib/core/networking/backend_api_client.dart`
- `lib/core/networking/backend_api_client_provider.dart`
- `lib/core/networking/auth_interceptor.dart`
- `lib/core/networking/auth_token_provider.dart`
- `lib/core/networking/api_response_envelope.dart`
- `lib/core/networking/api_error_envelope.dart`
- `lib/core/networking/api_client_exception.dart`
- `lib/core/networking/backend_api_paths.dart`
- `test/core/networking/` (3 test files)

**Checks:**

| Check | Result |
|-------|--------|
| `BackendApiClient` supports `get`, `post`, `patch` | ✅ PASS |
| `AuthInterceptor` attaches `Authorization: Bearer <token>` only when token present | ✅ PASS |
| `AuthInterceptor` skips if `Authorization` header already present | ✅ PASS |
| `backendApiClientProvider` (unauthenticated) wired from `appConfigProvider` | ✅ PASS |
| `authenticatedBackendApiClientProvider` wired (sourced from auth flow state) | ✅ PASS |
| No hardcoded secrets or credentials in networking layer | ✅ PASS |
| `ApiResponseEnvelope` handles `success: false` by throwing `ApiClientException` | ✅ PASS |
| Test files exist for client, interceptor, and response envelope | ✅ PASS |

---

## 4. State Architecture (P6-022)

**Files inspected:**
- `lib/core/state/app_async_state.dart`
- `lib/core/state/app_form_state.dart`
- `lib/core/state/app_state_notifier.dart`
- `lib/core/state/retry_state.dart`
- `test/core/state/app_state_notifier_test.dart`

**Checks:**

| Check | Result |
|-------|--------|
| `AppAsyncState<T>` is a sealed class with idle/loading/success/failure variants | ✅ PASS |
| Feature providers use `StateNotifierProvider.autoDispose` for ephemeral state | ✅ PASS |
| Persistent providers (auth flow, auth context) use non-autoDispose `StateNotifierProvider` | ✅ PASS |
| Pages use `ConsumerStatefulWidget` + `addPostFrameCallback` for data loading | ✅ PASS |
| Test file exists | ✅ PASS |

---

## 5. Design System Widgets (P6-024, P6-025, P6-026, P6-028)

**Files inspected:**
- `lib/core/widgets/` (all subdirectories)
- Feature files for design system adoption

**Checks:**

| Check | Result |
|-------|--------|
| Button widgets (`AimButton`, `AimFab`, `AimIconButton`) present | ✅ PASS |
| Feedback widgets (`AimAlertBanner`, `AimBadge`, `AimChip`, `AimSkeleton`) present | ✅ PASS |
| Form widgets (`AimInput`, `AimCheckbox`, `AimRadio`, `AimSelect`, `AimSwitch`, `AimTextarea`, `AimOtpInput`) present | ✅ PASS |
| Learning widgets (`AimCard`, `AimAnswerOption`, `AimProgressBar`, `AimCircularProgress`, `AimAiFeedbackBubble`, `AimRecordButton`) present | ✅ PASS |
| Navigation widgets (`AimBottomNav`, `AimTopAppBar`, `AimTabs`, `AimSegmentedControl`) present | ✅ PASS |
| State widgets (`AimFullScreenLoading`, `AimFullScreenError`, `AimEmptyState`) present | ✅ PASS |
| Barrel export `lib/core/widgets/widgets.dart` re-exports all widget groups | ✅ PASS |
| Feature widgets adopt design system (93 usage references detected) | ✅ PASS |
| Test files exist for buttons, forms, navigation, and feedback widgets | ✅ PASS |

---

## 6. RTL / Arabic Foundation (P6-029)

**Files inspected:**
- `lib/core/localization/app_locale.dart`
- `lib/core/localization/locale_provider.dart`
- `lib/core/localization/localization.dart`
- `lib/app/aim_mobile_app.dart`

**Checks:**

| Check | Result |
|-------|--------|
| `AppLocale.supportedLocales` includes `Locale('en')` and `Locale('ar')` | ✅ PASS |
| `AppLocale.delegates` includes `GlobalMaterialLocalizations`, `GlobalWidgetsLocalizations`, `GlobalCupertinoLocalizations` | ✅ PASS |
| `localeProvider` (`StateProvider<Locale>`) present and defaults to English | ✅ PASS |
| `MaterialApp` wires `locale`, `supportedLocales`, `localizationsDelegates` from provider | ✅ PASS |
| `AppLocale.isRtl` and `AppLocale.directionFor` helper methods present | ✅ PASS |
| No hard-coded `TextDirection.ltr` or `TextDirection.rtl` in feature widgets | ✅ PASS |
| `AimOtpInput` correctly forces `TextDirection.ltr` for digit fields (intentional, not a violation) | ✅ PASS |
| `AimTopAppBar` correctly mirrors back-button icon based on active `TextDirection` | ✅ PASS |
| DS preview feature uses `TextDirection` toggle for testing — contained, not production behavior | ✅ PASS |

---

## 7. Config & Secrets (P6-021)

**Files inspected:**
- `lib/core/config/app_config.dart`
- `lib/core/config/app_config_provider.dart`

**Checks:**

| Check | Result |
|-------|--------|
| All config values read from `--dart-define` environment variables at compile time | ✅ PASS |
| `supabaseAnonKey` documented as client-safe (not a secret) | ✅ PASS |
| `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_JWT_SECRET` absent from Flutter entirely | ✅ PASS |
| No `.env` files or hardcoded secrets found in `lib/` | ✅ PASS |

---

## 8. Backend Authority Invariants

**Checks:**

| Check | Result |
|-------|--------|
| Flutter never calculates placement score, CEFR level, mastery, or weakness maps | ✅ PASS |
| `is_correct` / `correct_answer` not exposed or used in Flutter UI | ✅ PASS |
| `overallScore` not computed client-side | ✅ PASS |
| No direct calls to AIM Engine from Flutter | ✅ PASS |
| No direct calls to any AI provider (Anthropic, OpenAI, etc.) from Flutter | ✅ PASS |
| No direct Supabase client usage bypassing the backend API | ✅ PASS |
| `student_id` never passed from Flutter as client input (always derived from JWT on backend) | ✅ PASS |

---

## 9. Lint Rules (analysis_options.yaml)

**File inspected:** `analysis_options.yaml`

**Active rules:**
- `include: package:flutter_lints/flutter.yaml`
- `prefer_const_constructors: true`
- `prefer_const_literals_to_create_immutables: true`
- `avoid_print: true`

**Checks:**

| Check | Result |
|-------|--------|
| `analysis_options.yaml` present | ✅ PASS |
| `flutter_lints` baseline active | ✅ PASS |
| No `print()` calls found in `lib/` | ✅ PASS |
| `build/**` and `.dart_tool/**` excluded from analysis | ✅ PASS |

---

## 10. Minor Findings (Non-Blocking)

The following items are documented for awareness. They do not block Phase 6 feature tasks but should be addressed before a production build.

| Location | Finding | Severity |
|----------|---------|----------|
| `placement_section_page.dart:280-283` | 4 hard-coded `Color(0xFF...)` values for skill icon colours | Low |
| `placement_submit_page.dart:120,199` | `Color(0xFF27AE60)` and `Colors.red` used for status icons | Low |
| `register_page.dart:190` | `Colors.white` used for spinner stroke | Low |

All three files predate P6-028 design system adoption and are scoped to Phase 4 placement UI. They should be migrated to `AimColors` tokens during the Phase 6 placement-screen rebuild tasks.

---

## 11. Runtime Verification Required

The following checks **cannot** be performed statically and must be run locally before merging feature branches to main:

```bash
# From apps/mobile/
flutter analyze
flutter test
flutter build apk --dart-define=BACKEND_API_BASE_URL=http://localhost:3000 --debug
```

Expected outcomes:
- `flutter analyze` → zero errors, zero warnings
- `flutter test` → all 18 test files pass
- `flutter build apk` → build succeeds with no unresolved imports

---

## Summary

| Category | Status |
|----------|--------|
| Routing Foundation | ✅ PASS |
| Theme & Design Tokens | ✅ PASS |
| Networking Layer | ✅ PASS |
| State Architecture | ✅ PASS |
| Design System Widgets | ✅ PASS |
| RTL / Arabic Foundation | ✅ PASS |
| Config & Secrets | ✅ PASS |
| Backend Authority Invariants | ✅ PASS |
| Lint Rules | ✅ PASS |
| Runtime checks (`flutter analyze` / `flutter test`) | ⚠️ MANUAL — SDK not available in sandbox |

**Overall: Foundation approved for Phase 6 feature screen development.**  
Minor hard-coded colour findings are non-blocking and tracked above.
