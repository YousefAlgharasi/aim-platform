# Admin Users and Roles Check

## Phase 2 — P2-065

**Scope:** Auth, Users, Roles only.
**Goal:** Verify admin user and role management works without bypassing backend permissions.

---

## Coverage

This document reviews the admin user/role management chain implemented across P2-058 through P2-064.

| Task | Component | Verdict |
|---|---|---|
| P2-058 | Admin UI auth guard (`admin/layout.tsx`, `getAdminAuthState`) | ✓ Pass |
| P2-059 | Admin users list API (`GET /admin/users`) | ✓ Pass |
| P2-060 | Admin users list UI (`app/admin/users/page.tsx`) | ✓ Pass |
| P2-061 | Admin user detail API (`GET /admin/users/:id`) | ✓ Pass |
| P2-062 | Admin user detail UI (`app/admin/users/[id]/page.tsx`) | ✓ Pass |
| P2-063 | Admin role change UI (`role-change-form.tsx`) | ✓ Pass (with note) |
| P2-064 | Admin role change flow (integration + type fix) | ✓ Pass |

---

## Check 1 — Admin UI Auth Guard (P2-058)

**Files reviewed:**
- `apps/admin-dashboard/lib/auth/admin-auth.ts`
- `apps/admin-dashboard/app/admin/layout.tsx`

**Behaviour:**

`getAdminAuthState()` reads `aim_admin_access_token` from an HTTP-only cookie
(server-side only — never exposed to the browser). It calls `GET /auth/me` with
the bearer token. The backend validates the JWT and returns the auth context.
The function returns one of four states: `authenticated`, `unauthenticated`,
`unauthorized`, or `unavailable`.

`admin/layout.tsx` redirects unauthenticated users to `/admin-auth-required`,
unauthorized users to `/admin-unauthorized`, and unavailable cases to
`/admin-auth-unavailable`. Only users with `admin` or `super_admin` roles
proceed into the admin shell.

**Security checks:**

| Check | Result |
|---|---|
| Token sourced from HTTP-only cookie server-side | ✓ |
| Token never exposed to browser JavaScript | ✓ |
| Auth state validated against backend `/auth/me` (not decoded client-side) | ✓ |
| Only `admin` and `super_admin` allowed into admin shell | ✓ |
| Unauthenticated users redirected before rendering any admin content | ✓ |

**Finding — out-of-scope roles in BackendAuthorizedRole:**

`BackendAuthorizedRole` in `admin-auth.ts` includes `parent`, `teacher`, and
`content_editor`, which are out-of-scope roles not defined in the Phase 2
permission matrix (P2-035). These roles will never be returned by the backend
in Phase 2, so they pose no runtime risk. However, their presence causes
drift from the permission matrix.

**Action required:** Remove `parent`, `teacher`, and `content_editor` from
`BackendAuthorizedRole` in a follow-up task, or accept as a known deviation
until Phase 3 scope is confirmed.

---

## Check 2 — Admin Users List API (P2-059)

**Files reviewed:**
- `services/backend-api/src/features/admin/admin.controller.ts`
- `services/backend-api/src/features/admin/admin.service.ts`
- `services/backend-api/src/features/admin/admin.types.ts`

**Behaviour:**

`GET /admin/users` requires a valid Supabase JWT (`SupabaseJwtAuthGuard`) and
backend-verified `admin` or `super_admin` role (`RoleGuard` + `@RequireRoles`).
Returns a paginated list of `AdminUserListItem` records.

**Security checks:**

| Check | Result |
|---|---|
| Endpoint requires valid JWT | ✓ |
| Endpoint requires `admin` or `super_admin` role (backend-enforced) | ✓ |
| `supabase_auth_uid` not included in response | ✓ |
| Password, password hash not included | ✓ |
| JWT claims or tokens not included | ✓ |
| Pagination capped at `MAX_LIMIT = 100` | ✓ |
| Response fields: id, email, phone, userType, status, createdAt, updatedAt only | ✓ |

---

## Check 3 — Admin Users List UI (P2-060)

**Files reviewed:**
- `apps/admin-dashboard/app/admin/users/page.tsx`
- `apps/admin-dashboard/lib/api/admin-users-api.ts` (fetchAdminUsers)

**Behaviour:**

Server component. Reads token from HTTP-only cookie. Calls `fetchAdminUsers`
which calls `GET /admin/users`. Auth guard is enforced by parent `admin/layout.tsx`.
Renders paginated table with id (truncated), email, userType badge, status badge,
createdAt. Each row is a link to the user detail page (not yet linked — noted
below).

**Security checks:**

| Check | Result |
|---|---|
| Token read server-side only | ✓ |
| No admin authorization decisions made in UI | ✓ |
| UI renders backend-approved data only | ✓ |
| `supabase_auth_uid` not rendered | ✓ |
| Security boundary note displayed on page | ✓ |
| Backend error status shown as error banner; no stack trace exposed | ✓ |

**Note:** User rows do not currently link to the detail page (`/admin/users/:id`).
This is a UX gap, not a security issue. Can be added as a follow-up.

---

## Check 4 — Admin User Detail API (P2-061)

**Files reviewed:**
- `services/backend-api/src/features/admin/admin.controller.ts` (GET /admin/users/:id)
- `services/backend-api/src/features/admin/admin.service.ts` (getUserDetail)
- `services/backend-api/src/features/admin/admin.types.ts` (AdminUserDetailResponse)

**Behaviour:**

`GET /admin/users/:id` requires JWT + `admin`/`super_admin` role. Returns
`AdminUserDetailResponse` containing id, email, phone, userType, status,
roles (key + name only), createdAt, updatedAt.

**Security checks:**

| Check | Result |
|---|---|
| Endpoint requires valid JWT | ✓ |
| Endpoint requires `admin` or `super_admin` role (backend-enforced) | ✓ |
| `supabase_auth_uid` not included in `AdminUserDetailResponse` | ✓ |
| Permission codes not included — roles only (key + name) | ✓ |
| Internal role metadata (is_system, created_at) not included in roles list | ✓ |
| 404 returned when user not found | ✓ |

---

## Check 5 — Admin User Detail UI (P2-062)

**Files reviewed:**
- `apps/admin-dashboard/app/admin/users/[id]/page.tsx`
- `apps/admin-dashboard/lib/api/admin-users-api.ts` (fetchAdminUserDetail)

**Behaviour:**

Server component. Token from HTTP-only cookie. Calls
`GET /admin/users/:id`. `notFound()` called on 404 from backend — renders
Next.js 404 page cleanly. Renders identity, roles, student profile, and
admin profile sections with null state handling. Renders `RoleChangeForm`
(client component) with token and userId passed as props.

**Security checks:**

| Check | Result |
|---|---|
| Token read server-side only | ✓ |
| Token passed to client component as prop (not via cookie in browser) | ✓ |
| `supabaseAuthUid` not rendered in UI | ✓ |
| 404 from backend → `notFound()` → Next.js 404 page | ✓ |
| Backend error shown as error banner; no stack trace | ✓ |
| Security boundary note displayed | ✓ |
| Defensive decoder — all response fields type-checked before render | ✓ |

---

## Check 6 — Admin Role Change UI (P2-063)

**Files reviewed:**
- `apps/admin-dashboard/app/admin/users/[id]/role-change-form.tsx`
- `apps/admin-dashboard/lib/api/admin-api-client.ts` (put method)
- `apps/admin-dashboard/lib/api/admin-users-api.ts` (changeAdminUserRole)

**Behaviour:**

Client component. Token passed from server component as a prop. Presents a
role dropdown (student, reviewer, support, admin, super_admin) and optional
reason field. On submit calls `PUT /admin/users/:userId/roles`. Shows
success message with confirmed role key from backend response, or error
banner on failure.

**Security checks:**

| Check | Result |
|---|---|
| Token sourced from server-side cookie — passed as prop, not from `document.cookie` | ✓ |
| No service-role keys, JWT secrets, or backend credentials in component | ✓ |
| Role change enforced by backend (RoleGuard + AdminRoleAssignmentService) | ✓ |
| UI does not decide authorization — it only initiates the request | ✓ |
| Boundary note displayed in form | ✓ |
| Error message comes from backend `AppException.message` — no stack traces | ✓ |

**Note (P2-063 integration fix applied in P2-064):**

The original `AdminRoleChangeResult` type expected fields (`assignedRoleKey`,
`success`, `message`) that do not exist in the backend
`AdminRoleAssignmentResponse`. This was corrected in P2-064 — the decoder now
maps `role: { id, key, name }` from the actual backend response.

---

## Check 7 — Admin Role Change Flow Integration (P2-064)

**Files reviewed:**
- `docs/phase-2/admin-role-change-integration-flow.md`
- `apps/admin-dashboard/lib/api/admin-users-api.ts` (corrected decoder)
- `services/backend-api/src/features/admin/admin-role-assignment.service.ts`
- `services/backend-api/src/auth/auth-logging.service.ts`

**Behaviour:**

`PUT /admin/users/:userId/roles` → `AdminRoleAssignmentController` →
`AdminRoleAssignmentService.assignUserRole`:
1. Actor resolved from Supabase UID via `UsersService`.
2. Target resolved from `:userId` param — never from JWT.
3. Self-role-grant forbidden (actor ≠ target check).
4. `super_admin` role requires actor to be `super_admin`.
5. Previous roles removed in transaction; new role upserted.
6. `AuthLoggingService.log('role_assigned', ...)` records audit event.

**Security checks:**

| Check | Result |
|---|---|
| Actor resolved from JWT (not from client-supplied field) | ✓ |
| Target user ID from URL param — not trusted to be the actor | ✓ |
| Self-role-grant explicitly forbidden with `RBAC_SELF_GRANT_FORBIDDEN` error | ✓ |
| `super_admin` assignment restricted to `super_admin` actors only | ✓ |
| Role replacement transactional — no partial state possible | ✓ |
| Every role change audit-logged with actor, target, role, previousRoles, reason | ✓ |
| Audit log does not include JWT tokens or secrets | ✓ |
| Response type aligned with backend contract after P2-064 fix | ✓ |

---

## Summary of Findings

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | `BackendAuthorizedRole` includes `parent`, `teacher`, `content_editor` (out-of-scope Phase 2 roles) | Low | Open — no runtime impact; follow-up cleanup recommended |
| 2 | Users list rows do not link to detail page `/admin/users/:id` | Low / UX | Open — not a security issue |
| 3 | `AdminRoleChangeResult` decoder was misaligned with backend response | Medium | Resolved in P2-064 |
| 4 | `PermissionGuard` passes Supabase UID instead of internal user ID (flagged in P2-067) | Medium | Open — requires fix before permission-guarded endpoints go live |

Findings 1 and 2 are non-blocking for Phase 2 close.
Finding 3 is resolved.
Finding 4 was identified in P2-067 and must be resolved before any endpoint
using `@UseGuards(PermissionGuard)` is used in production.

---

## Non-Goals

This check does not cover:
- AIM Engine integration (out of scope for Phase 2)
- AI Teacher integration (out of scope for Phase 2)
- Onboarding, placement, lessons, or sessions (out of scope for Phase 2)
- Student Web App (out of scope for Phase 2)
- Student-facing profile or role display
- Full end-to-end runtime testing (requires live Supabase + database)
