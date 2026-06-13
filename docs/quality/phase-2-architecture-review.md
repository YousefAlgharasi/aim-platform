# Phase 2 Architecture Review

## P2-070 — Run Phase 2 Architecture Review

**Date:** 2026-06-13
**Scope gate:** Phase 2 is Auth, Users, Roles only.
**Goal:** Verify that no Phase 2 task introduced onboarding, placement, lessons, AIM Engine integration, AI Teacher integration, dashboard recommendations, progress tracking, review/retention, or Student Web App work.

---

## Verdict

**Phase 2 remained within scope.** No out-of-scope features were introduced by any Phase 2 task. All out-of-scope directories present in the codebase are Phase 1 skeleton stubs and contain no Phase 2 business logic.

---

## Scope Boundary

Phase 2 was authorised to implement only:

- Authentication (Supabase Auth integration, JWT verification, session management)
- Users (internal AIM user records, sync, identity resolution)
- Profiles (student profile, admin profile — read and safe update only)
- Roles (role model, role assignment, role guards)
- Permissions (permission model, permission guard skeleton)
- Ownership (profile ownership guard, student ownership guard)
- Backend guards (JWT guard, role guard, ownership guard, permission guard)
- Flutter auth flow (login, register, logout, session expired)
- Flutter profile flow (read profile, safe edit profile, role-aware placeholder)
- Admin users/roles foundation (list, detail, role change UI + backend)
- Security review documents (check files, E2E check, safe field review)

Phase 2 was explicitly prohibited from implementing:

- Onboarding feature
- Placement test feature
- Lessons or lesson content
- Practice or practice sessions
- Sessions (learning sessions)
- AIM Engine integration or AIM algorithm logic
- AI Teacher integration or AI Teacher responses
- Dashboard recommendations
- Review / retention / spaced repetition
- Progress reports
- Student Web App

---

## Surface-by-Surface Review

### Backend API (`services/backend-api/src/`)

**Phase 2 features implemented (in scope):**

| Feature | Files | Verdict |
|---|---|---|
| Auth (JWT guard, sync-user, auth/me, logout, profile bootstrap) | `src/auth/` | ✓ In scope |
| Users service (internal user CRUD, by-supabase-uid lookup) | `src/features/users/` | ✓ In scope |
| Roles service (role lookup, user role assignment, getUserRoles) | `src/features/roles/` | ✓ In scope |
| Profile controller/service (GET + PATCH /profile/me) | `src/features/profile/` | ✓ In scope |
| Students service (student_profiles read/update) | `src/features/students/students.service.ts` | ✓ In scope |
| Admin service/controller (users list, user detail, role change) | `src/features/admin/` | ✓ In scope |
| Authorization guards (JWT, role, permission, ownership, profile ownership) | `src/auth/authorization/` | ✓ In scope |
| Auth audit logging | `src/auth/auth-logging.service.ts` | ✓ In scope |
| Auth RLS plan | `docs/phase-2/auth-rls-plan.md` | ✓ In scope |

**Out-of-scope directories present — Phase 1 stubs only:**

| Directory | Contents | Phase 2 additions | Verdict |
|---|---|---|---|
| `src/features/lessons/` | Phase 1 empty `LessonsModule` + `LessonsService` stub | None | ✓ Clean — no Phase 2 work |
| `src/features/sessions/` | Phase 1 empty `SessionsModule` + `SessionsService` stub | None | ✓ Clean — no Phase 2 work |
| `src/features/ai-teacher/` | Phase 1 `AiTeacherModule` + safety validator stub (no AI calls) | None | ✓ Clean — no Phase 2 work |
| `src/features/aim/` | Phase 1 empty `AimModule` + `AimService` stub | None | ✓ Clean — no Phase 2 work |
| `src/features/reports/` | Phase 1 empty `ReportsModule` stub | None | ✓ Clean — no Phase 2 work |

**Scan result:** Grep for `onboarding`, `placement`, `LessonController`, `SessionService`, `AimEngine`, `AITeacher` in Phase 2 file content returned only comments in `profile.service.ts`, `profile.types.ts`, and `profile.controller.ts` of the form "No onboarding, placement, lessons... logic here" — these are security rule comments, not feature implementations.

---

### Flutter Mobile (`apps/mobile/lib/`)

**Phase 2 features implemented (in scope):**

| Feature | Files | Verdict |
|---|---|---|
| Login UI (`LoginPage`, `LoginNotifier`, `SupabaseAuthDatasource`) | `features/auth/` | ✓ In scope |
| Register UI (`RegisterPage`, `RegisterNotifier`) | `features/auth/` | ✓ In scope |
| Auth context (sync-user, auth/me, `AuthContextNotifier`) | `features/auth/` | ✓ In scope |
| Auth repository (`AuthRepository`, `AuthRepositoryImpl`) | `features/auth/` | ✓ In scope |
| Logout (`LogoutNotifier`, logout datasource) | `features/auth/` | ✓ In scope |
| Session expired handling | `features/auth/` | ✓ In scope |
| Profile models and entities | `features/profile/data/models/`, `logic/entity/` | ✓ In scope |
| Profile datasource (GET + PATCH /profile/me) | `features/profile/data/datasources/` | ✓ In scope |
| Profile repository + notifier | `features/profile/logic/` | ✓ In scope |
| Profile screen | `features/profile/ui/pages/profile_page.dart` | ✓ In scope |
| Edit profile screen | `features/profile/ui/pages/edit_profile_page.dart` | ✓ In scope |
| Role-aware UI placeholder (`ClientSafeRoleModel`, `RoleAwarePlaceholderSection`) | `features/auth/`, `features/shell/` | ✓ In scope |

**Out-of-scope directories present — Phase 1 stubs only:**

| Directory | Contents | Phase 2 additions | Verdict |
|---|---|---|---|
| `features/onboarding/` | Phase 1 `SplashPlaceholderPage` only | None | ✓ Clean |
| `features/lessons/` | Phase 1 `LearnPlaceholderPage` only | None | ✓ Clean |
| `features/practice/` | Phase 1 `PracticePlaceholderPage` only | None | ✓ Clean |
| `features/placement/` | Phase 1 `PlacementPlaceholderPage` only | None | ✓ Clean |
| `features/reviews/` | Phase 1 `ReviewPlaceholderPage` only | None | ✓ Clean |
| `features/progress/` | Phase 1 `ProgressPlaceholderPage` only | None | ✓ Clean |
| `features/home/` | Phase 1 `HomePlaceholderPage` only | None | ✓ Clean |
| `features/notifications/` | Phase 1 stub | None | ✓ Clean |
| `features/ai_teacher/` | Phase 1 stub | None | ✓ Clean |

**No AIM Engine logic, mastery calculation, level/weakness/difficulty/recommendation logic was introduced into Flutter during Phase 2.**

---

### Admin Dashboard (`apps/admin-dashboard/`)

**Phase 2 features implemented (in scope):**

| Feature | Files | Verdict |
|---|---|---|
| Admin auth guard + layout | `app/admin/layout.tsx`, `lib/auth/` | ✓ In scope |
| Admin users list UI | `app/admin/users/page.tsx` | ✓ In scope |
| Admin user detail UI | `app/admin/users/[id]/page.tsx` | ✓ In scope |
| Admin role change form | `app/admin/users/[id]/role-change-form.tsx` | ✓ In scope |
| Admin API client (`get`, `post`, `put`) | `lib/api/admin-api-client.ts` | ✓ In scope |
| Admin users API functions | `lib/api/admin-users-api.ts` | ✓ In scope |

**No onboarding, lesson, placement, AIM, AI Teacher, or Student Web App pages were added to the Admin Dashboard.**

---

### Documentation (`docs/phase-2/`, `docs/quality/`)

**Phase 2 documents created (all in scope):**

| Document | Content | Verdict |
|---|---|---|
| `auth-users-roles-charter.md` | Phase 2 scope definition | ✓ |
| `task-execution-rules.md` | Agent execution rules | ✓ |
| `auth-source-of-truth.md` | Supabase Auth as identity provider | ✓ |
| `safe-auth-fields.md` | Field exposure policy per surface | ✓ |
| `auth-security-rules.md` | Backend security enforcement rules | ✓ |
| `auth-api-map.md` | Auth endpoint map | ✓ |
| `auth-rls-plan.md` | RLS policy plan | ✓ |
| `admin-role-change-integration-flow.md` | Role change flow + type fix | ✓ |
| `admin-users-roles-check.md` | Admin users/roles component review | ✓ |
| `profile-flow-check.md` | Flutter profile flow review | ✓ |
| `auth-users-roles-e2e.md` | Full E2E flow verification | ✓ |

---

## Forbidden Pattern Check

| Forbidden Pattern | Scan Result |
|---|---|
| AIM Engine mastery/level/weakness calculation in Flutter | Not found |
| AIM Engine called from Flutter directly | Not found |
| AI Teacher provider keys exposed in any client | Not found |
| Supabase service-role key in Flutter or Admin Dashboard | Not found |
| Supabase JWT secret in Flutter or Admin Dashboard | Not found |
| Client-side role/permission enforcement as security authority | Not found |
| Student Web App code (`apps/web/` Phase 2 additions) | Not found |
| Onboarding flow implementation in Phase 2 | Not found |
| Placement test implementation in Phase 2 | Not found |
| Lesson or session business logic in Phase 2 | Not found |
| Cross-student data access (ownership bypass) | Not found — `ProfileOwnershipGuard` blocks this |

---

## Open Items Identified During Phase 2

These were identified and documented during Phase 2 reviews but are not scope drift:

| # | Item | Source | Classification |
|---|---|---|---|
| 1 | `PermissionGuard` passes Supabase UID instead of internal user ID | P2-067 | Auth/guards bug — in Phase 2 scope, fix deferred |
| 2 | Bearer token placeholder in Flutter `EditProfilePage` | P2-055 | Auth integration gap — pending `supabase_flutter` SDK |
| 3 | `BackendAuthorizedRole` includes `parent`, `teacher`, `content_editor` | P2-065 | Minor enum cleanup — no runtime impact |
| 4 | Admin users list rows lack `/admin/users/:id` navigation links | P2-065 | UX gap — not security |

Items 1 and 2 are in-scope Phase 2 bugs that need resolution before production. Items 3 and 4 are low-priority cleanup.

---

## Architecture Decisions Verified

| Decision | Verification |
|---|---|
| Supabase Auth is the single external identity provider | ✓ All JWTs issued by Supabase Auth; backend verifies via `SupabaseJwtAuthGuard` |
| Backend is the final authority for identity, roles, permissions, ownership | ✓ No client surface makes authorization decisions |
| Flutter and Admin Dashboard are UX-only clients | ✓ Both surfaces render backend-approved data only |
| No AIM logic in Flutter or Admin Dashboard | ✓ Confirmed by scan |
| `/profile/me` ownership enforced by JWT (no user ID params) | ✓ `ProfileOwnershipGuard` + `@CurrentUser()` pattern |
| Service-role keys and JWT secrets never reach clients | ✓ Confirmed by scan across all surfaces |
| `supabase_auth_uid` never returned to clients | ✓ Stripped in all response DTOs |

---

## Conclusion

Phase 2 stayed within its authorised scope of Auth, Users, and Roles. The implementation is architecturally sound with respect to scope boundary. The four open items above are tracked for resolution. No out-of-scope features were implemented in any Phase 2 task.
