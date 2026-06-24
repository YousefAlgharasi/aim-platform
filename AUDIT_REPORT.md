# AIM Platform Audit Report

**Date:** 2026-06-24
**Scope:** All apps, services, and packages in the monorepo

## Folders Checked — Status Summary

| Surface | Status |
|---|---|
| `apps/mobile` | Issues found — Assessment navigation entirely broken |
| `apps/web` | Issues found — No route protection, parent dashboard is a stub |
| `apps/student-web` | Issues found — API path mismatch with backend, no token persistence |
| `apps/admin-dashboard` | Issues found — Dead links to nonexistent pages |
| `services/backend-api` | Issues found — Unsafe `result.rows[0]` access across all repositories |
| `services/aim-engine` | Issues found — All 6 pipeline analysis methods are stubs returning `None` |
| `packages/ai_core` | Issues found — Broken import paths, never imported anywhere |

---

## TASK-1: Mobile Assessment Routes Are Not Defined

**Problem:**
The assessment feature in the mobile app navigates to 6 routes (`/student/assessments/attempt`, `/student/assessments/start`, `/student/assessments/detail`, `/student/assessments/result`, etc.) that are not defined in `AppRoutePaths` or handled in `AppRouter.onGenerateRoute`. The router's `default` case sends users to `SplashPage`, so the entire assessment flow silently fails.

**Location:**
- `apps/mobile/lib/core/routing/app_route_paths.dart` — no assessment paths defined
- `apps/mobile/lib/core/routing/app_router.dart:37-68` — no assessment cases in switch
- `apps/mobile/lib/features/assessments/ui/pages/assessment_list_page.dart:42`
- `apps/mobile/lib/features/assessments/ui/pages/assessment_detail_page.dart:46`
- `apps/mobile/lib/features/assessments/ui/pages/start_attempt_page.dart:44`
- `apps/mobile/lib/features/assessments/ui/pages/attempt_page.dart:62`
- `apps/mobile/lib/features/assessments/ui/pages/submit_attempt_page.dart:45`
- `apps/mobile/lib/features/assessments/ui/pages/result_history_page.dart:45`

**What needs to be done:**
1. Add all assessment route paths to `AppRoutePaths`
2. Add corresponding cases to `AppRouter.onGenerateRoute` switch statement
3. Add the new routes to `_protectedRoutes` set

**Depends on:** None

---

## TASK-2: Admin Dashboard Links to Nonexistent Pages

**Problem:**
The admin dashboard homepage links to `/admin/deadlines` and `/admin/assessment-results`, but neither route has a corresponding page directory under `app/admin/`. Clicking these links results in a 404.

**Location:**
- `apps/admin-dashboard/app/admin/page.tsx:47` — links to `/admin/deadlines`
- `apps/admin-dashboard/app/admin/page.tsx:55` — links to `/admin/assessment-results`

**What needs to be done:**
1. Create `apps/admin-dashboard/app/admin/deadlines/page.tsx`
2. Create `apps/admin-dashboard/app/admin/assessment-results/page.tsx`
3. Or remove these links until the pages are built

**Depends on:** None

---

## TASK-3: Student-Web API Path Mismatch With Backend

**Problem:**
The student-web app prefixes all API calls with `/api/` (e.g., `/api/auth/login`, `/api/profile`), but the NestJS backend has no global prefix and controllers are mounted without the `/api` prefix. Every API call from student-web will 404.

**Location:**
- `apps/student-web/src/features/auth/AuthContext.tsx:20` — calls `/api/profile`
- `apps/student-web/src/features/auth/AuthContext.tsx:27` — calls `/api/auth/login`
- `services/backend-api/src/main.ts` — no `app.setGlobalPrefix('api')`
- `services/backend-api/src/auth/auth.controller.ts:24` — `@Controller('auth')`

**What needs to be done:**
Either add `app.setGlobalPrefix('api')` in backend `main.ts`, or remove the `/api` prefix from all student-web endpoint paths.

**Depends on:** None

---

## TASK-4: Student-Web Auth Has No Token Persistence

**Problem:**
The `ApiClient` stores `accessToken` in memory only. On page refresh the token is lost and users are logged out. `setAccessToken()` exists but is never called after login.

**Location:**
- `apps/student-web/src/api/client.ts:6` — in-memory only
- `apps/student-web/src/api/client.ts:12-14` — `setAccessToken()` never called
- `apps/student-web/src/features/auth/AuthContext.tsx:26-29` — login never sets token

**What needs to be done:**
1. Call `apiClient.setAccessToken(token)` in login flow
2. Persist token to localStorage
3. Load token from localStorage on init
4. Clear on logout

**Depends on:** None

---

## TASK-5: AIM Engine Pipeline Methods Are All Stubs

**Problem:**
All 6 analysis methods in the AIM engine pipeline return `None` and discard their inputs. The `/aim/v1/analysis` endpoint is non-functional.

**Location:**
- `services/aim-engine/app/pipeline/aim_analysis_pipeline.py:193-289`

**What needs to be done:**
Wire each stub to the corresponding domain service in `services/api/src/aim/domain/services/`:
1. `_analyze_skill_state` → `mastery_calculator`
2. `_analyze_weakness_records` → `weakness_detector`
3. `_decide_difficulty` → `difficulty_adapter`
4. `_generate_recommendations` → `recommendation_engine`
5. `_compute_review_schedule` → `retention_tracker`
6. `_summarize_session` → `emotional_state_detector`

**Depends on:** TASK-6

---

## TASK-6: packages/ai_core Has Broken Import Paths and Is Never Used

**Problem:**
`packages/ai_core/__init__.py` adds a nonexistent path (`/home/user/aim-platform/src/`) to `sys.path`. The actual implementations are in `services/api/src/aim/domain/services/`. No file in the codebase imports from `ai_core`. Same for `packages/ml/`.

**Location:**
- `packages/ai_core/__init__.py:7-10`
- `packages/ml/__init__.py:7-10`

**What needs to be done:**
Fix the import path to point to the actual service directory, or delete these packages and import domain services directly in aim-engine.

**Depends on:** None

---

## TASK-7: Web App Admin/Parent Routes Have No Auth Protection

**Problem:**
Route selection in `apps/web` uses `window.location.pathname` with no auth check. Anyone can visit `/admin` or `/parent` without logging in.

**Location:**
- `apps/web/src/app/App.js:29-35` — admin routes, no auth
- `apps/web/src/app/App.js:37-39` — parent routes, no auth

**What needs to be done:**
1. Check auth state before rendering admin/parent components
2. Redirect unauthenticated users to login
3. Verify admin role for admin routes

**Depends on:** None

---

## TASK-8: Web App Parent Dashboard Is a Hardcoded Empty Stub

**Problem:**
`ParentDashboard` hardcodes `status` to `'empty'` and never fetches data.

**Location:**
- `apps/web/src/pages/ParentDashboard.jsx:6`

**What needs to be done:**
Fetch real data from the backend API and update status based on response.

**Depends on:** None

---

## TASK-9: Minor Code Quality Fixes

**Problem:** Non-breaking issues:

- **Unsafe `result.rows[0]` in backend repos:** ~60 repository methods access `result.rows[0]` after INSERT without checking if rows is empty. Add `?? null` or length check. Files across `services/backend-api/src/features/` (billing, notifications, parents, operations, analytics, ai-teacher, voice-teacher repositories).

- **Hardcoded algorithm parameters:** Mastery weights in `services/api/src/aim/domain/services/mastery_calculator.py:160-164`, difficulty thresholds in `difficulty_adapter.py:81-107`, weakness thresholds in `weakness_detector.py:217-239`, retention decay rates in `retention_tracker.py:20-23`. Extract to configuration.

- **Deprecated auth methods in mobile:** `apps/mobile/lib/features/auth/logic/provider/auth_flow_notifier.dart:21-25` — remove `@Deprecated` methods if unused.

- **Mock Supabase client on missing config:** `apps/web/src/shared/supabase/client.js:9-26` silently returns a mock. Should surface the error clearly.

- **Inconsistent API base URL defaults:** `apps/web` defaults to `http://127.0.0.1:8000`, `apps/admin-dashboard` defaults to `http://localhost:3000`, `apps/student-web` throws. Standardize the pattern.

**Location:** Various (see bullets)

**What needs to be done:**
Address each item individually as incremental improvements.

**Depends on:** None
