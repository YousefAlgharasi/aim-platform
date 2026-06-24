# AIM Platform — Full Audit Findings for Project Manager Review

**Audit Date:** 2026-06-24
**Audited By:** Claude Code (automated codebase audit)
**Scope:** Every app, service, and package in the aim-platform monorepo

---

## How to Read This Document

This document lists **every real problem found** in the codebase, organized by surface area. Each finding includes what's wrong, where it is, how severe it is, and what it means for users or the team. This is not a task list — it's the raw findings so you can see the full picture and prioritize accordingly.

**Severity levels:**
- 🔴 **CRITICAL** — Feature is broken for end users right now
- 🟠 **HIGH** — Feature will fail under normal use or has a security gap
- 🟡 **MEDIUM** — Something is incomplete or behaves incorrectly in edge cases
- ⚪ **LOW** — Code quality issue, no user-facing impact today

---

## 1. MOBILE APP (`apps/mobile`)

### Overall Status: Assessment feature entirely broken, rest is solid

The mobile app is well-structured with proper state management (Riverpod), good auth flow, secure token handling, and clean architecture. However, the assessment feature — which appears to be a major feature — cannot be used at all.

#### 🔴 FINDING M-1: Entire assessment flow is dead — routes not registered

**What's wrong:** The assessment feature has 7 fully-built pages (list, detail, start, attempt, submit, result, history) but none of the routes they navigate to (`/student/assessments/*`) are registered in the app router. When a user tries to open any assessment, the router hits the `default` case and silently redirects to the splash screen.

**Files involved:**
- `apps/mobile/lib/core/routing/app_route_paths.dart` — no assessment paths exist here
- `apps/mobile/lib/core/routing/app_router.dart:37-68` — switch statement has no assessment cases
- 7 page files under `apps/mobile/lib/features/assessments/ui/pages/` all navigate to undefined routes

**User impact:** Students cannot take assessments on mobile. The button/link exists but leads nowhere.

**How this likely happened:** The assessment feature was built (pages, data layer, models, API client all exist) but the final wiring step — registering routes — was missed. The placement test feature was wired correctly using the same pattern, so this looks like an oversight.

---

#### 🟡 FINDING M-2: Placeholder screens for AI Teacher, Notifications, Achievements

**What's wrong:** Three features show "Coming Soon" placeholder screens: AI Teacher, Notifications, and Achievements.

**Files:**
- `apps/mobile/lib/features/ai_teacher/ui/pages/ai_teacher_placeholder_page.dart`
- `apps/mobile/lib/features/notifications/ui/pages/notifications_placeholder_page.dart`
- `apps/mobile/lib/features/achievements/ui/pages/achievements_placeholder_page.dart`

**User impact:** Users see these in navigation but can't use them. This is intentional but worth tracking — are these on the roadmap or should they be hidden?

---

#### ⚪ FINDING M-3: Deprecated auth methods still in codebase

**What's wrong:** `auth_flow_notifier.dart:21-25` has two methods marked `@Deprecated` (`signInPlaceholder`, `signOutPlaceholder`). They appear to be leftover from early development.

**User impact:** None. Dead code that should be cleaned up.

---

### What's working well in mobile:
- Auth flow (login, register, OAuth callback) ✅
- Placement test flow (all routes wired, all pages functional) ✅
- Curriculum browser (courses → chapters → lessons) ✅
- Security: no hardcoded keys, tokens in secure storage, no sensitive logging ✅
- Protected route guarding ✅
- Backend-driven state management ✅

---

## 2. WEB APP (`apps/web`)

### Overall Status: Security gaps in routing, parent dashboard is a stub

This is a React app serving as the pilot/demo web experience. It uses Supabase for auth and has multiple internal tool pages (algorithm tester, AIM demo, admin dashboard, parent dashboard).

#### 🔴 FINDING W-1: Admin and parent routes have zero authentication

**What's wrong:** The app decides which page to render based purely on `window.location.pathname`. There is no auth check before rendering admin pages. Anyone who types `/admin` in their browser gets full access to the admin dashboard. Same for `/parent`, `/debug`, `/admin-dashboard`.

**File:** `apps/web/src/app/App.js:29-39`

**Code:**
```javascript
if (pathname === '/admin' || pathname === '/debug' || pathname === '/admin-dashboard') {
  return <AdminDashboard />;  // No auth check whatsoever
}
if (pathname === '/parent' || pathname === '/parent-dashboard') {
  return <ParentDashboard />;  // No auth check whatsoever
}
```

**User impact:** Anyone can access admin tools without logging in. This is a security issue.

---

#### 🟠 FINDING W-2: Parent dashboard never loads real data

**What's wrong:** The `ParentDashboard` component hardcodes its status to `'empty'` and never fetches any data. It always shows the empty state regardless of whether data exists.

**File:** `apps/web/src/pages/ParentDashboard.jsx:6`
```javascript
const [status] = useState('empty');  // Never changes
```

**User impact:** Parents see a blank dashboard with no child progress data. The feature is effectively non-functional.

---

#### 🟠 FINDING W-3: Supabase config failure is silent

**What's wrong:** If the Supabase environment variables (`REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_PUBLISHABLE_KEY`) are not set, the app creates a mock Supabase client that silently fails every auth operation. Login shows a generic Arabic error message ("تعذر الاتصال بخدمة تسجيل الدخول") without any indication that the real problem is missing config.

**File:** `apps/web/src/shared/supabase/client.js:9-26`

**Impact:** Developers deploying the app waste time debugging auth failures when the real issue is missing environment variables. The error should be surfaced clearly in the console.

---

#### 🟡 FINDING W-4: API base URL silently defaults to localhost

**What's wrong:** If `REACT_APP_API_BASE_URL` is not set, the API client silently defaults to `http://127.0.0.1:8000`. In production, this means all API calls fail with no useful error.

**File:** `apps/web/src/shared/api/client.js:1`

**Impact:** Production deployments with missing config get blank screens instead of a clear error.

---

#### 🟡 FINDING W-5: Hardcoded test data in AlgorithmTester

**What's wrong:** The `AlgorithmTester` page has a hardcoded question bank (lines 57-99) instead of fetching from the API.

**File:** `apps/web/src/pages/AlgorithmTester.jsx:57-99`

**Impact:** Internal tool only — not user-facing. But it can't test with real curriculum data.

---

#### 🟡 FINDING W-6: Fallback lessons hardcoded in WebPilot

**What's wrong:** `WebPilot` has a `fallbackLessons` array with hardcoded lesson IDs and metadata that may not match the actual curriculum.

**File:** `apps/web/src/pages/WebPilot.jsx:25-44`

**Impact:** If the API fails, students see stale/incorrect lesson data.

---

## 3. STUDENT WEB APP (`apps/student-web`)

### Overall Status: Cannot communicate with backend at all

This is a TypeScript React app with clean architecture. However, it has fundamental integration issues that prevent it from working with the backend.

#### 🔴 FINDING SW-1: Every API call will 404 — path mismatch with backend

**What's wrong:** The student-web app prefixes every API endpoint with `/api/` (e.g., `/api/auth/login`, `/api/profile`, `/api/students/me/dashboard`). The NestJS backend has no global prefix — controllers are mounted at `/auth/login`, `/profile`, etc. Every single API call from this app will return 404.

**Evidence:**
- `apps/student-web/src/features/auth/AuthContext.tsx:20` — calls `/api/profile`
- `apps/student-web/src/features/auth/AuthContext.tsx:27` — calls `/api/auth/login`
- `services/backend-api/src/main.ts` — no `app.setGlobalPrefix('api')` call
- `services/backend-api/src/auth/auth.controller.ts:24` — `@Controller('auth')` (not `api/auth`)

**User impact:** The entire student-web app is non-functional. Login, dashboard, lessons, chat — nothing works.

**How this likely happened:** The student-web was built expecting the backend to have an `/api` prefix, but the backend was built without one. Or one side changed and the other wasn't updated.

---

#### 🔴 FINDING SW-2: Auth token lost on every page refresh

**What's wrong:** The `ApiClient` class stores the access token in a plain class property (`private accessToken: string | null = null`). This is in-memory only — when the page refreshes, the token is gone. Additionally, the `setAccessToken()` method exists but is never called anywhere in the codebase after login.

**Files:**
- `apps/student-web/src/api/client.ts:6` — in-memory storage
- `apps/student-web/src/api/client.ts:12-14` — `setAccessToken()` defined but never used
- `apps/student-web/src/features/auth/AuthContext.tsx:26-29` — login succeeds but never stores token

**User impact:** Even if the API path issue (SW-1) were fixed, users would be logged out on every page refresh, browser tab switch, or navigation that causes a re-render.

---

#### 🟠 FINDING SW-3: No handling of expired tokens

**What's wrong:** The API client has no logic to detect 401 responses and redirect to login. There's a `SessionExpiredPage` component and route defined, but nothing triggers navigation to it. When a token expires, requests just fail and components show generic errors.

**Files:**
- `apps/student-web/src/api/client.ts:32-38` — generic error handling, no 401 special case
- `apps/student-web/src/features/auth/SessionExpiredPage.tsx` — exists but never navigated to

**User impact:** Students see confusing error messages instead of being asked to log in again.

---

#### 🟠 FINDING SW-4: App crashes if environment variable is missing

**What's wrong:** The config module throws an error at module load time if `REACT_APP_API_BASE_URL` is not set. This kills the entire app before React even mounts — no error boundary can catch it.

**File:** `apps/student-web/src/config/env.ts:5-9`

**Impact:** Unlike the other apps which silently default to localhost (also bad), this one crashes completely. Neither approach is ideal — the app should show a clear configuration error page.

---

## 4. ADMIN DASHBOARD (`apps/admin-dashboard`)

### Overall Status: Well-built but has dead navigation links

This is a Next.js app with proper server-side rendering, a clean auth state machine, and good error boundaries. It's the most polished of the web apps.

#### 🔴 FINDING AD-1: Two homepage links lead to 404 pages

**What's wrong:** The admin homepage has a grid of quick-link cards. Two of them link to pages that don't exist:
- "Manage assessment deadlines" → `/admin/deadlines` — **no page exists**
- "View all attempt results" → `/admin/assessment-results` — **no page exists**

**File:** `apps/admin-dashboard/app/admin/page.tsx:47,55`

**Confirmed:** `ls` shows no `deadlines/` or `assessment-results/` directories under `app/admin/`.

**User impact:** Admins click these links and get Next.js 404 pages. This looks broken and unprofessional.

**How this likely happened:** The links were added to the homepage in anticipation of building the pages, but the pages were never created.

---

#### 🟠 FINDING AD-2: Auth token expiration is stored but never checked

**What's wrong:** The auth module stores `expiresAt` for the admin token but never validates it before making requests. An admin could use an expired token for hours.

**File:** `apps/admin-dashboard/lib/auth/admin-auth.ts:51-88`

**User impact:** Admins may get unexpected 401 errors instead of being prompted to re-login when their session expires.

---

#### 🟡 FINDING AD-3: API base URL silently defaults to localhost:3000

**What's wrong:** If `NEXT_PUBLIC_BACKEND_API_BASE_URL` is not set, the config defaults to `http://localhost:3000`.

**File:** `apps/admin-dashboard/lib/api/admin-api-config.ts:5-12`

**Impact:** Same pattern as the web app — production misconfig is hidden.

---

## 5. BACKEND API (`services/backend-api`)

### Overall Status: Well-architected with one systemic defensive coding gap

The NestJS backend is well-structured: proper JWT validation (HS256/ES256), JWKS caching, role guards, profile ownership guards, parameterized SQL (no injection), comprehensive config validation, and correct module wiring. The OpenAPI setup is in place and DTOs use class-validator decorators.

#### 🟠 FINDING BA-1: ~60 repository methods don't guard against empty result sets

**What's wrong:** Across all feature repositories (billing, notifications, parents, operations, analytics, ai-teacher, voice-teacher), INSERT...RETURNING queries access `result.rows[0]` directly without checking if the array is empty. While INSERT with RETURNING almost always returns a row, edge cases (constraint violations caught at a different layer, transaction rollbacks) could cause an undefined access.

**Files (sample):**
- `services/backend-api/src/features/billing/billing.repository.ts` — 13 instances
- `services/backend-api/src/features/notifications/notification.repository.ts` — 8 instances
- `services/backend-api/src/features/parents/parent.repository.ts` — 5 instances
- `services/backend-api/src/features/operations/operations.repository.ts` — 10 instances
- `services/backend-api/src/features/analytics/analytics.repository.ts` — 6 instances
- Plus all ai-teacher and voice-teacher repositories

**User impact:** Low probability but high severity — if triggered, the error message would be "Cannot read property of undefined" with no useful context for debugging.

---

#### ⚪ FINDING BA-2: Missing return type declarations on some controller methods

**What's wrong:** `AdminRolesController` methods lack explicit return type declarations.

**File:** `services/backend-api/src/features/admin/admin-roles.controller.ts:25,33`

**Impact:** No user impact. Reduces type safety and OpenAPI documentation accuracy.

---

### What's working well in backend-api:
- JWT auth with signature verification (HS256, ES256) ✅
- JWKS caching and rotation ✅
- Role-based access control with guards ✅
- Profile ownership enforcement ✅
- All SQL queries parameterized (no injection risk) ✅
- Config validated on startup (fail-fast) ✅
- Webhook security (signature validation) ✅
- AIM engine client with timeout and graceful degradation ✅
- Proper DTO validation with class-validator ✅
- Clean module wiring, no circular dependencies ✅

---

## 6. AIM ENGINE (`services/aim-engine`)

### Overall Status: Scaffolded but non-functional — all analysis logic is stubbed

The AIM engine is a FastAPI service with proper request/response contracts, logging, and error handling infrastructure. However, none of the actual analysis logic is implemented.

#### 🔴 FINDING AE-1: All 6 pipeline analysis methods return None

**What's wrong:** The core of the AIM engine — the analysis pipeline — has 6 methods that are explicitly stubbed. Each one discards its inputs and returns `None`:

| Method | Line | Should Do |
|---|---|---|
| `_analyze_skill_state()` | 193-207 | Compute mastery scores |
| `_analyze_weakness_records()` | 209-222 | Detect student weaknesses |
| `_decide_difficulty()` | 224-240 | Adapt question difficulty |
| `_generate_recommendations()` | 242-256 | Suggest next content |
| `_compute_review_schedule()` | 258-272 | Schedule spaced repetition |
| `_summarize_session()` | 274-289 | Summarize learning session |

**File:** `services/aim-engine/app/pipeline/aim_analysis_pipeline.py:193-289`

Each method has a comment: "Returns None until a domain service is wired (downstream task)."

**User impact:** The backend can call the AIM engine, and it will respond with 200 OK — but the response contains no analysis data. Any feature depending on AIM intelligence (adaptive difficulty, recommendations, mastery tracking) silently produces empty results.

**How this likely happened:** The pipeline was scaffolded with clear contracts and documentation (the docstrings are thorough), but the integration with domain services was deferred and never completed.

---

#### 🟠 FINDING AE-2: Zero integration with ai_core package

**What's wrong:** The aim-engine has no imports from the `ai_core` package whatsoever. The domain services it should be calling exist in `services/api/src/aim/domain/services/` but are not wired in.

**Confirmed:** `grep -r "from ai_core\|import ai_core" services/aim-engine/` returns nothing.

**Impact:** This is the root cause of AE-1 — the engine can't do analysis because it doesn't import the analysis code.

---

## 7. AI CORE & ML PACKAGES (`packages/ai_core`, `packages/ml`)

### Overall Status: Dead code with broken imports — never used anywhere

#### 🔴 FINDING PKG-1: Import paths point to nonexistent directory

**What's wrong:** Both `packages/ai_core/__init__.py` and `packages/ml/__init__.py` add a path to `sys.path` that doesn't exist:
```python
_SRC = Path(__file__).resolve().parents[1] / "src"
# Resolves to: /home/user/aim-platform/src/  ← DOES NOT EXIST
```

The actual domain service implementations are in `services/api/src/aim/domain/services/`.

**Files:** `packages/ai_core/__init__.py:7-10`, `packages/ml/__init__.py:7-10`

---

#### 🔴 FINDING PKG-2: These packages are never imported anywhere

**What's wrong:** No file in the entire monorepo imports from `ai_core` or `packages.ml`. All 15 files in `packages/ai_core/` and 4 files in `packages/ml/` are dead code.

**Confirmed:** `grep -r "from ai_core\|import ai_core\|from packages.ai_core\|from packages.ml"` across the entire repo returns nothing.

**Impact:** These packages create the illusion that AI logic is modular and reusable, but they don't work and aren't used. The real implementations live in `services/api/src/aim/domain/services/`.

---

## 8. CROSS-CUTTING CONCERNS

These issues span multiple surfaces:

#### 🟠 FINDING CC-1: Inconsistent API base URL handling across all apps

Each app handles missing API config differently:
| App | Behavior when env var missing |
|---|---|
| `apps/web` | Silently defaults to `http://127.0.0.1:8000` |
| `apps/student-web` | Crashes before React mounts |
| `apps/admin-dashboard` | Silently defaults to `http://localhost:3000` |
| `apps/mobile` | Defaults to `http://localhost:3000` (dev only) |

**Impact:** No consistent developer experience. Some apps fail silently in production, one crashes entirely. Should pick one approach and standardize.

---

#### 🟡 FINDING CC-2: Hardcoded algorithm parameters across domain services

All AI/ML thresholds and weights are hardcoded in source files:
- Mastery weights (40/20/15/20/5%) — `mastery_calculator.py:160-164`
- Difficulty thresholds — `difficulty_adapter.py:81-107`
- Weakness detection thresholds — `weakness_detector.py:217-239`
- Retention decay rates — `retention_tracker.py:20-23`
- Recommendation thresholds — `recommendation_engine.py:227,239,265`

**Impact:** Tuning the algorithm requires code changes and redeployment. For an adaptive learning platform, these parameters should be configurable — ideally from the admin dashboard or at minimum from environment/config files.

---

## Summary — What Needs Attention First

### Broken right now (users affected):
1. **Mobile assessments don't work** — routes not registered (M-1)
2. **Student-web can't talk to backend** — API path mismatch (SW-1)
3. **Student-web loses auth on refresh** — token not persisted (SW-2)
4. **Admin dashboard has dead links** — 2 pages don't exist (AD-1)
5. **Web app admin pages have no auth** — anyone can access (W-1)

### Built but not functional:
6. **AIM engine returns empty analysis** — all 6 methods stubbed (AE-1)
7. **ai_core packages are dead code** — broken imports, never used (PKG-1, PKG-2)
8. **Parent dashboard is an empty shell** — no data fetched (W-2)

### Should be improved:
9. **60 unsafe array accesses in backend** — missing null guards (BA-1)
10. **Inconsistent config handling** — different failure modes per app (CC-1)
11. **Hardcoded algorithm parameters** — can't tune without code changes (CC-2)
