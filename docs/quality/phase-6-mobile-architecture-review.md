# Phase 6 — Mobile Architecture Review

**Task:** P6-126
**Branch:** `phase6/P6-126-mobile-architecture-review`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P6-119..P6-124 — all Done

---

## Scope

Architecture review of the Flutter Student Mobile App MVP confirming correct
feature-first layering, Riverpod state management patterns, routing,
network layer isolation, and design system adherence.

---

## 1. Feature-First Architecture

### 1.1 Directory Structure

All features follow the mandatory 4-layer structure:

```
features/<name>/
  data/
    datasources/    — remote datasource interface + impl
    models/         — JSON-serialisable API response models
    repository/
      repo_impl/    — repository implementation
  logic/
    entity/         — pure Dart domain objects
    provider/       — StateNotifier + provider declarations
    repository/     — repository interface (abstract)
  ui/
    pages/          — full-screen routed pages
    widgets/        — feature-scoped reusable widgets
  <name>.dart       — barrel export
```

**Verified features:** auth, placement, learning_path, lessons, question_answer,
aim_results, progress, home, profile, reviews, notifications, ai_teacher,
achievements, onboarding, shell, design_system_preview.

**Result:** ✅ All 16 features conform to the standard structure.

### 1.2 No Cross-Feature Imports

Grepped for imports that cross feature boundaries (e.g., a lessons widget
importing from `placement` internals).
- Each feature exposes only its barrel (`<feature>.dart`).
- Cross-feature state sharing goes through `core/` providers, not direct imports.

**Result:** ✅

---

## 2. State Management (Riverpod)

### 2.1 StateNotifier Pattern

- All notifiers are `StateNotifier<T>` subclasses.
- State classes are sealed (using Dart 3 `sealed class` or exhaustive switch).
- Loading / idle / success / error states are distinct sealed variants.
- `autoDispose` used on notifiers tied to specific pages.

**Result:** ✅

### 2.2 Provider Declarations

- All providers declared in `logic/provider/<feature>_provider.dart`.
- No provider created inline in widget `build()` methods.
- `ref.listen` used for side-effect navigation (sign-in redirect, placement flow
  advance) — not `ref.watch` with `if` blocks in `build()`.

**Result:** ✅

### 2.3 Backend Authority

- No provider merges local state with backend state to derive AIM outputs.
- Notifier state transitions driven entirely by backend API responses.

**Result:** ✅

---

## 3. Network Layer

### 3.1 `BackendApiClient`

- Single shared `BackendApiClient` in `core/networking/`.
- `AuthInterceptor` attached via `authenticatedBackendApiClientProvider`.
- No feature-level HTTP client instantiation.

**Result:** ✅

### 3.2 Repository / Datasource Separation

- Repository interfaces are abstract (`logic/repository/<feature>_repository.dart`).
- Implementations are in `data/repository/repo_impl/`.
- Datasource interfaces abstract the HTTP call; implementations inject `BackendApiClient`.
- This separation allows test doubles without touching real HTTP.

**Result:** ✅

### 3.3 No AIM Engine / Python Service Calls

- Grepped entire `apps/mobile/lib/` for `aim-engine`, `python`, `:8001`, `:8000`.
- **Result:** ✅ None found.

---

## 4. Routing

### 4.1 `AppRouter`

- Single `onGenerateRoute` function in `core/routing/app_router.dart`.
- `resolveRouteName` handles auth-state-based redirect centrally.
- `_protectedRoutes` set gates all authenticated pages.
- Defensive argument parsing for all route arguments — bad args fall back
  to `SplashPlaceholderPage`, never throw.

**Result:** ✅

### 4.2 Routing Gaps (Known)

The following features have providers/pages built but their named routes
are not yet registered in `AppRouter`:
- Learning path, lesson detail, question/answer session, AIM results,
  progress sub-pages, reviews.

These are tracked as follow-up routing tasks. The placement flow is fully
wired (P6-045). The shell routes (home, learn, review, progress, profile)
are wired.

**Result:** ⚠️ Routing is partially complete — acceptable for MVP phase;
Phase 7 must complete route registration before full end-to-end navigation.

---

## 5. Design System

### 5.1 Token Usage

- AIM Mobile Design System tokens used exclusively: `AimColors`, `AimSpacing`,
  `AimRadius`, `AimTextStyles`, `AimSizes`, `AimMotion`, `AimGradients`.
- No `Color(0x...)` literals in any feature widget or page.
- Design system review confirmed in `docs/quality/phase-6-design-system-branch-review.md`.

**Result:** ✅

### 5.2 RTL / Arabic Readiness

- `AimMobileApp` drives `TextDirection` from `localeProvider`.
- No `TextDirection.ltr` hard-coded in any feature.
- All layout widgets respect ambient direction.

**Result:** ✅

---

## 6. AI Teacher Shell

- `ai_teacher` feature: placeholder page only, no real implementation.
- `AiTeacherPlaceholderPage` renders a static "Coming in Phase 7" card.
- No AI provider SDK, no prompt calls, no streaming implementation.

**Result:** ✅ Correctly excluded per Phase 6 scope boundary.

---

## 7. Architecture Findings Summary

| Area | Status | Notes |
|---|---|---|
| Feature-first structure | ✅ PASS | 16 features, all conformant |
| No cross-feature direct imports | ✅ PASS | Barrel exports only |
| StateNotifier pattern | ✅ PASS | Consistent across all features |
| Single shared network layer | ✅ PASS | `BackendApiClient` + interceptor |
| Repository/datasource separation | ✅ PASS | Testable architecture |
| No AIM Engine calls | ✅ PASS | Confirmed by grep |
| Router: auth gating | ✅ PASS | `_protectedRoutes` correct |
| Router: placement flow | ✅ PASS | All 5 routes wired (P6-045) |
| Router: other features | ⚠️ PARTIAL | Shell + placement wired; others pending |
| Design system tokens | ✅ PASS | No raw literals |
| RTL readiness | ✅ PASS | Locale-driven direction |
| AI Teacher excluded | ✅ PASS | Placeholder only |

---

## Verdict

**PASS with known gaps.** The Flutter architecture is sound, consistent, and
correctly structured for the MVP phase. The only significant gap is partial
route registration — the shell and placement flows are fully wired; the
remaining feature routes are acceptable gaps for Phase 6 MVP and must be
closed in Phase 7.
