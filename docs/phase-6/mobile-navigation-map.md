# Phase 6 — Mobile Navigation Map

**Phase:** 6  
**Task:** P6-008  
**Status:** Active  
**Branch:** `phase6/P6-008-mobile-navigation-map`  
**Dependency:** P6-006  
**Output:** `docs/phase-6/mobile-navigation-map.md`

---

## 1. Purpose

This document defines the complete navigation structure of the Student Mobile App MVP: every route, its path, the screen it renders, the guards that protect it, how transitions work, and the RTL/Arabic behaviour at each point. It is the authoritative reference for implementing and extending routing in `core/routing/`.

---

## 2. Navigation Architecture

The app uses Flutter's `Navigator 1.0` with `AppRouter.onGenerateRoute` and `MaterialPageRoute`. Routes are declared as path constants in `AppRoutePaths`. An `AuthFlowState`-aware `resolveRouteName` guard intercepts navigation and redirects unauthenticated users before any route is rendered.

```
AppRouter.onGenerateRoute(settings, authState, authContextState)
  └─► resolveRouteName()       ← auth guard lives here
        └─► switch(routeName)  ← maps path → Widget
```

**File locations:**

| File | Purpose |
|---|---|
| `apps/mobile/lib/core/routing/app_route_paths.dart` | All named path constants |
| `apps/mobile/lib/core/routing/app_router.dart` | Route generation + auth guard logic |
| `apps/mobile/lib/features/shell/ui/pages/main_shell_page.dart` | Bottom-nav shell with `IndexedStack` |

---

## 3. Route Inventory

### 3.1 Public Routes (no auth required)

| Path Constant | Path | Screen | Widget |
|---|---|---|---|
| `AppRoutePaths.splash` | `/` | Splash / Auth Check | `SplashPlaceholderPage` |
| `AppRoutePaths.signIn` | `/auth/sign-in` | Login | `LoginPage` |
| `AppRoutePaths.register` | `/auth/register` | Register | `RegisterPage` |

> **Register is out-of-scope for Phase 6 MVP.** The route constant exists but the screen must remain a placeholder until post-MVP.

---

### 3.2 Protected Routes (auth required)

All routes below redirect to `/auth/sign-in` if `AuthFlowState.isSignedOut`.

| Path Constant | Path | Screen | Widget | Bottom Nav Tab |
|---|---|---|---|---|
| `AppRoutePaths.mainShell` | `/main` | Shell | `MainShellPage` | — (shell) |
| `AppRoutePaths.home` | `/main/home` | Home | `HomePlaceholderPage` → `HomePage` | Tab 0 — Home |
| `AppRoutePaths.learn` | `/main/learn` | Learn / Courses | `LearnPlaceholderPage` → `LearnPage` | Tab 1 — Learn |
| `AppRoutePaths.review` | `/main/review` | Review | `ReviewPlaceholderPage` → `ReviewPage` | Tab 2 — Review |
| `AppRoutePaths.progress` | `/main/progress` | Progress / Learning Plan | `ProgressPlaceholderPage` → `ProgressPage` | Tab 3 — Progress |
| `AppRoutePaths.profile` | `/main/profile` | Profile | `ProfilePage` | Tab 4 — Profile |

---

### 3.3 Placement Test Flow Routes (protected, outside shell)

Placement routes sit outside `MainShellPage`. The bottom nav is hidden during the test.

| Path Constant | Path | Screen | Widget | Notes |
|---|---|---|---|---|
| `AppRoutePaths.placementStart` | `/placement/start` | Placement Start | `PlacementStartPage` | Entry; shows test info + Start button |
| `AppRoutePaths.placementSection` | `/placement/section` | Placement Section | `PlacementSectionPage` | Lists sections; navigates per section |
| `AppRoutePaths.placementQuestion` | `/placement/question` | Placement Question | `PlacementQuestionPage` | MC / T-F / fill-in question |
| `AppRoutePaths.placementSubmit` | `/placement/submit` | Placement Submit | `PlacementSubmitPage` | Submits final answer; triggers complete API |
| `AppRoutePaths.placementResult` | `/placement/result` | Placement Result | `PlacementResultPage` | Displays backend result; read-only |

---

### 3.4 Session Flow Routes (protected, to be added)

Session routes are declared as stubs in Phase 6. They will be wired in later tasks.

| Proposed Constant | Proposed Path | Screen | Notes |
|---|---|---|---|
| `AppRoutePaths.sessionQuestion` | `/session/question` | Session Question | Stub — not yet rendered |
| `AppRoutePaths.sessionSummary` | `/session/summary` | Session Summary | Stub — not yet rendered |

---

## 4. Auth Guard Logic

`AppRouter.resolveRouteName` implements the guard. The logic is:

```
isChecking          → /             (splash — wait for auth state)
isSignedOut
  + protected route → /auth/sign-in (redirect)
isSignedIn
  + on splash/login → /main         (redirect to home shell)
otherwise           → requested route (pass through)
```

**Protected route set** (from `AppRouter._protectedRoutes`):

```
/main, /main/home, /main/learn, /main/review, /main/progress, /main/profile
```

Placement routes (`/placement/*`) are **not** in `_protectedRoutes` yet. They must be added when implemented — an unauthenticated user must never reach placement screens.

---

## 5. Bottom Navigation Structure

`MainShellPage` uses `IndexedStack` with 5 tabs rendered by `NavigationBar`. The AIM design system provides `AIMBottomNav` — **this must replace the raw `NavigationBar` call** when the design system is adopted in a later task.

| Index | Tab Label | Route Path | Icon (outlined / filled) |
|---|---|---|---|
| 0 | Home | `/main/home` | `Icons.home_outlined` / `Icons.home` |
| 1 | Learn | `/main/learn` | `Icons.menu_book_outlined` / `Icons.menu_book` |
| 2 | Review | `/main/review` | `Icons.replay_outlined` / `Icons.replay` |
| 3 | Progress | `/main/progress` | `Icons.insights_outlined` / `Icons.insights` |
| 4 | Profile | `/main/profile` | `Icons.person_outline` / `Icons.person` |

Tab switching is handled by `IndexedStack` — screens are kept alive, not rebuilt on each tap.

---

## 6. Full Navigation Flow Diagram

```
App Launch
  └─► Splash (/)
        │── [isChecking] ──► stay on splash
        │
        ├─► [isSignedOut] ──► Login (/auth/sign-in)
        │       │── submit credentials ──► Supabase Auth
        │       │── [success] ──► /main (shell)
        │       └─► [failure] ──► stay on login; show error
        │
        └─► [isSignedIn] ──► Main Shell (/main)
                │
                ├─► Tab 0: Home (/main/home)
                │     └─► [no placement result] ──► /placement/start
                │
                ├─► Tab 1: Learn (/main/learn)
                │     └─► [tap course] ──► /session/question (stub)
                │
                ├─► Tab 2: Review (/main/review)
                │
                ├─► Tab 3: Progress (/main/progress)
                │
                └─► Tab 4: Profile (/main/profile)
                      └─► [logout] ──► clear session ──► Login

Placement Flow (entered from Home or explicit trigger):
  /placement/start
    └─► [tap Start] ──► POST /placement/attempts ──► /placement/section
          └─► [select section] ──► /placement/question
                └─► [last question submitted] ──► /placement/submit
                      └─► [POST complete] ──► poll result ──► /placement/result
                            └─► [tap Continue] ──► /main (home)

Session Flow (stub — wired in later tasks):
  /session/question
    └─► [last question submitted] ──► /session/summary
          └─► [tap Done] ──► /main/learn
```

---

## 7. Transition Behaviour

| Transition | Type | RTL behaviour |
|---|---|---|
| Tab switch (bottom nav) | `IndexedStack` — no animation | N/A |
| Push to placement flow | `MaterialPageRoute` (slide from right) | RTL: slides from **left** |
| Pop / back from placement | Reverse slide | RTL: slides to **left** |
| Login → Main shell | `MaterialPageRoute` (replace) | — |
| Splash → Login / Shell | `MaterialPageRoute` (replace) | — |

RTL slide direction is handled automatically by Flutter's `MaterialPageRoute` when `Directionality` is set to `TextDirection.rtl`. No manual transition code is required.

---

## 8. RTL / Arabic Navigation Rules

| Rule | Implementation |
|---|---|
| Back chevron icon | Must mirror in RTL — use `Icons.arrow_back_ios` which Flutter auto-mirrors, or `Directionality`-aware `BackButton` widget |
| Bottom nav layout | `AIMBottomNav` uses `Row` — tab order reads LTR visually but is logically RTL for Arabic users; confirm with UX |
| `AppBar` leading/actions | Use `leading` and `actions` (not `left`/`right`) — Flutter respects directionality automatically |
| Swipe-to-go-back (iOS) | Works in both LTR and RTL; no special handling needed |
| Deep link stubs | Path strings are language-agnostic; no Arabic in route paths |
| Screen enter/exit slides | Flutter `MaterialPageRoute` auto-mirrors for RTL — no override needed |

All navigation widgets must come from the AIM Mobile Design System (`AIMBottomNav`, `AIMTopAppBar`). Raw `NavigationBar` and `AppBar` are temporary scaffolding and must be replaced during design system adoption tasks.

---

## 9. Deep Link Stubs

The following deep link paths are declared as route constants but have no handler logic in Phase 6 MVP. They resolve to the splash screen until wired.

| Intent | Path | Status |
|---|---|---|
| Open specific course | `/courses/:id` | Stub |
| Open session | `/sessions/:id` | Stub |
| Open placement result | `/placement/result/:attemptId` | Stub |

---

## 10. Navigation Rules & Invariants

| Rule | Detail |
|---|---|
| No navigation logic in widgets | Routing decisions live in `AppRouter.resolveRouteName` only |
| No hard-coded path strings in feature code | Always use `AppRoutePaths.*` constants |
| Placement routes must be protected | Add `/placement/*` to `_protectedRoutes` before implementation |
| No Flutter-side placement eligibility check | Redirect to placement only if backend returns `retakeAllowed: true` |
| Profile editing route | `PATCH /profile/me` is out-of-scope; `EditProfilePage` must not be reachable in MVP |
| Session routes | Stubs only in Phase 6; no navigation wired until session tasks |
| Back from placement result | Must return to `/main` (home shell), not re-enter placement flow |

---

## 11. Files to Create / Modify in Implementation Tasks

| Task | File | Change |
|---|---|---|
| P6-021 (core routing) | `app_route_paths.dart` | Add session stubs, add placement to protected set |
| P6-021 (core routing) | `app_router.dart` | Wire session stubs, adopt GoRouter if decided |
| P6-028 (design system) | `main_shell_page.dart` | Replace `NavigationBar` with `AIMBottomNav` |
| P6-029 (RTL foundation) | `main_shell_page.dart` | Verify `Directionality` wraps shell correctly |

---

## 12. References

- Scope Boundaries: `docs/phase-6/mobile-mvp-scope-boundaries.md`
- Data Flow Document: `docs/phase-6/student-mobile-data-flow.md`
- API Consumption Map: `docs/phase-6/mobile-api-consumption-map.md`
- Route Paths: `apps/mobile/lib/core/routing/app_route_paths.dart`
- Router: `apps/mobile/lib/core/routing/app_router.dart`
- Shell Page: `apps/mobile/lib/features/shell/ui/pages/main_shell_page.dart`
- AIM Bottom Nav: `apps/mobile/lib/core/widgets/navigation/aim_bottom_nav.dart`

---

*Navigation map created: P6-008 | Branch: phase6/P6-008-mobile-navigation-map*
