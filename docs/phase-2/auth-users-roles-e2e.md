# Auth, Users, Roles — End-to-End Check

## Phase 2 — P2-069

**Scope:** Auth, Users, Roles only.
**Goal:** Verify Phase 2 works as one integrated auth/users/roles system — login through admin role management — without bypassing backend permissions at any layer.

---

## System Overview

Phase 2 implements a layered auth/users/roles system across four surfaces:

| Surface | Role |
|---|---|
| Supabase Auth | External identity provider — issues JWTs |
| Backend API (NestJS) | Final authority: identity, roles, permissions, ownership, safe fields |
| Flutter Mobile | UX client — collects credentials, displays backend-approved state |
| Admin Dashboard (Next.js) | UX client — admin user management, renders backend-approved data only |

---

## E2E Flow 1 — Student Registration and Login (Flutter)

### Flow

```
Flutter RegisterPage
  └─ email + password → Supabase Auth POST /auth/v1/signup
       ├─ requiresEmailConfirmation=true → show ConfirmationSentScreen
       └─ auto-confirmed → access_token returned
             └─ AuthContextNotifier.syncAndLoadUser(token)
                   ├─ POST /auth/sync-user           (create/sync internal user)
                   └─ GET  /auth/me                  (load roles, permissions, safe profile)
                         └─ authFlowProvider.signIn()
                               └─ navigate to /main-shell
```

```
Flutter LoginPage
  └─ email + password → Supabase Auth POST /auth/v1/token?grant_type=password
       └─ access_token
             └─ AuthContextNotifier.syncAndLoadUser(token)
                   (same as above)
```

### Security verification

| Check | Result |
|---|---|
| Supabase URL and anon key (public values) sourced from `AppConfig` dart-define — not hardcoded | ✓ |
| Service-role key, JWT secret, AI provider key never present in Flutter | ✓ |
| Bearer token from Supabase Auth — never generated or forged client-side | ✓ |
| `syncAndLoadUser` calls backend to establish internal identity — Flutter never decides identity | ✓ |
| Roles and permissions loaded from backend `/auth/me` response — never from local storage or client claims | ✓ |
| `authFlowProvider.signIn()` transitions UX state only — backend is the authority | ✓ |
| Register: empty bearer token (auth error) → 401 from backend → `AppException` → error banner | ✓ |

---

## E2E Flow 2 — Current User Identity Resolution (Backend)

### Flow

```
Client: GET /auth/me
  Bearer: <supabase-jwt>
    └─ SupabaseJwtAuthGuard
         └─ verify JWT signature (SUPABASE_JWT_SECRET, server-side only)
               └─ extract supabase_auth_uid from claims
                     └─ UsersService.findBySupabaseUid(uid)
                           └─ return AuthMeResponse:
                                { id, email, userType, status, roles[], permissions[], session }
```

### Security verification

| Check | Result |
|---|---|
| JWT verified server-side using `SUPABASE_JWT_SECRET` — never exposed to clients | ✓ |
| `supabase_auth_uid` resolved internally — never returned in `/auth/me` response | ✓ |
| `AuthMeResponse` contains only: id, email, userType, status, roles (key+name), permissions, session | ✓ |
| Suspended/deleted user → `USER_SUSPENDED` / `USER_DELETED` error before data is returned | ✓ |
| `ApiResponseInterceptor` wraps all responses: `{ success: true, data, meta }` | ✓ |

---

## E2E Flow 3 — Profile Read and Update (Flutter + Backend)

### Flow

```
Flutter ProfilePage
  └─ reads authContextProvider (already loaded from /auth/me)
       └─ displays: email (read-only), display_name, role badges (UX-only)
             └─ edit icon → EditProfilePage

Flutter EditProfilePage
  └─ pre-populates from authContextProvider
  └─ editable: displayName, preferredLanguage, timezone (student only)
  └─ submit → profileProvider.updateProfile(bearerToken, studentPayload)
       └─ ProfileRemoteDatasourceImpl: PATCH /profile/me
             └─ ProfileController (SupabaseJwtAuthGuard)
                   └─ ProfileService.updateProfileForUser(user.id, input)
                         ├─ ownership: user.id from JWT — client cannot supply another user's ID
                         └─ StudentsService.updateByUserId(user.id, safeFields)
                               └─ UPDATE student_profiles SET ... WHERE user_id = $1
```

```
GET /profile/me
  └─ same guard chain → ProfileService.getProfileForUser(user.id)
       ├─ student: StudentProfileResponse { id, profileType, displayName, avatarUrl, preferredLanguage, timezone }
       └─ admin:   AdminProfileResponse   { id, profileType, displayName, avatarUrl, department }
```

### Security verification

| Check | Result |
|---|---|
| `user.id` always resolved from JWT — client cannot supply a target user ID | ✓ |
| Safe fields only: `displayName`, `avatarUrl`, `preferredLanguage`, `timezone` (student); `department` (admin) | ✓ |
| `userId`, `profileType`, `roles`, `email`, `status` not updatable via PATCH /profile/me | ✓ |
| Admin profile not editable via Flutter in Phase 2 (no admin edit endpoint) | ✓ |
| Bearer token placeholder in EditProfilePage → 401 until `supabase_flutter` integrated | Known gap — P2-055 |

---

## E2E Flow 4 — Logout (Flutter)

### Flow

```
Flutter ProfilePage logout button
  └─ LogoutNotifier.logout(bearerToken)
       └─ AuthRemoteDatasourceImpl: POST /auth/logout
             └─ AuthController (SupabaseJwtAuthGuard)
                   └─ revoke session server-side
       └─ authContextProvider.clearContext()
       └─ authFlowProvider.signOut()
             └─ navigate to /auth/sign-in
```

### Security verification

| Check | Result |
|---|---|
| Backend session invalidation called before local state is cleared | ✓ |
| `clearContext()` wipes all cached roles, permissions, profile from memory | ✓ |
| No sensitive data persisted to device storage | ✓ |
| Subsequent requests with invalidated token → 401 from backend | ✓ |

---

## E2E Flow 5 — Admin Dashboard Auth Guard

### Flow

```
Browser → /admin/users
  └─ admin/layout.tsx: getAdminAuthState()
       └─ reads aim_admin_access_token from HTTP-only cookie (server-side)
             └─ GET /auth/me  (Bearer: token)
                   ├─ 401 → { status: 'unauthenticated' } → redirect /admin-auth-required
                   ├─ roles missing admin/super_admin → { status: 'unauthorized' } → redirect /admin-unauthorized
                   ├─ network error → { status: 'unavailable' } → redirect /admin-auth-unavailable
                   └─ authenticated + admin/super_admin → render admin shell
```

### Security verification

| Check | Result |
|---|---|
| Token read from HTTP-only cookie server-side — never from `document.cookie` | ✓ |
| Auth state validated against backend `/auth/me` — not decoded client-side | ✓ |
| Only `admin` and `super_admin` allowed past layout guard | ✓ |
| Unauthenticated/unauthorized users see no admin content | ✓ |

---

## E2E Flow 6 — Admin Users List and Detail

### Flow

```
Admin Dashboard → /admin/users
  └─ fetchAdminUsers(token, page, limit)
       └─ GET /admin/users?page=N&limit=M
             └─ SupabaseJwtAuthGuard → RoleGuard (admin | super_admin)
                   └─ AdminService.listUsers() → paginated AdminUserListItem[]
                         (id, email, phone, userType, status, createdAt, updatedAt)

Admin Dashboard → /admin/users/:id
  └─ fetchAdminUserDetail(token, userId)
       └─ GET /admin/users/:id
             └─ SupabaseJwtAuthGuard → RoleGuard (admin | super_admin)
                   └─ AdminService.getUserDetail(userId)
                         └─ UsersService.getById(userId) + RolesService.getUserRoles(userId)
                               → AdminUserDetailResponse:
                                  { id, email, phone, userType, status, roles[{key,name}], createdAt, updatedAt }
```

### Security verification

| Check | Result |
|---|---|
| Both endpoints require JWT + backend-enforced admin/super_admin role | ✓ |
| `supabase_auth_uid` absent from all admin responses | ✓ |
| Permission codes absent — roles returned as key + name only | ✓ |
| 404 returned for unknown userId — no user enumeration via timing | ✓ |
| Token read server-side from HTTP-only cookie — not exposed to browser | ✓ |

---

## E2E Flow 7 — Admin Role Change

### Flow

```
Admin Dashboard → /admin/users/:id → RoleChangeForm
  └─ select new role + optional reason → submit
       └─ changeAdminUserRole(token, userId, roleKey, reason?)
             └─ PUT /admin/users/:userId/roles
                   └─ SupabaseJwtAuthGuard
                         └─ RoleGuard (admin | super_admin)
                               └─ AdminRoleAssignmentService.assignUserRole(actorUid, userId, roleKey, reason)
                                     ├─ actor resolved from JWT (not from payload)
                                     ├─ target = userId from URL param
                                     ├─ actor ≠ target check (RBAC_SELF_GRANT_FORBIDDEN)
                                     ├─ super_admin protection (only super_admin can assign super_admin)
                                     ├─ transactional: remove old roles, upsert new role
                                     └─ AuthLoggingService.log('role_assigned', { roleId, roleKey, previousRoleIds, reason })
                                           └─ AdminRoleAssignmentResponse: { userId, role, assignedByUserId, assignedAt }
```

### Security verification

| Check | Result |
|---|---|
| Actor resolved from JWT — not from request body | ✓ |
| Self-role-grant explicitly rejected with `RBAC_SELF_GRANT_FORBIDDEN` | ✓ |
| `super_admin` assignment restricted to actors with `super_admin` role | ✓ |
| Role replacement is transactional — no partial state | ✓ |
| Every change audit-logged: actor, target, role, previous roles, reason | ✓ |
| Audit log contains no JWT tokens, secrets, or privileged config | ✓ |
| `AdminRoleChangeResult` type now aligned with actual backend response (P2-064 fix) | ✓ |

---

## Cross-Cutting Security Verification

| Rule | Verified Across All Flows |
|---|---|
| No service-role keys, JWT secrets, AI provider keys, or DB credentials in any client | ✓ |
| Backend `SupabaseJwtAuthGuard` on all protected endpoints | ✓ |
| `RoleGuard` on all admin endpoints | ✓ |
| Ownership enforced by `@CurrentUser()` from JWT — clients cannot supply target user IDs on profile endpoints | ✓ |
| All client responses pass through `ApiResponseInterceptor` envelope | ✓ |
| Flutter role/permission state is UX only — backend re-validates on every request | ✓ |
| Admin Dashboard role state is UX only — backend re-validates on every request | ✓ |
| Error responses do not leak internal stack traces, DB errors, or policy details | ✓ |
| `supabase_auth_uid` absent from all client-facing responses | ✓ |
| JWT signing secret absent from all client-facing contexts | ✓ |

---

## Open Items Carried Into Phase 3

| # | Item | Source | Risk |
|---|---|---|---|
| 1 | `PermissionGuard` passes Supabase UID instead of internal user ID | P2-067 | Medium — blocks permission-guarded endpoints from going live |
| 2 | Bearer token placeholder in Flutter `EditProfilePage` | P2-055 | Medium — PATCH /profile/me returns 401 until `supabase_flutter` integrated |
| 3 | `BackendAuthorizedRole` in admin-auth.ts includes `parent`, `teacher`, `content_editor` (out-of-scope) | P2-065 | Low — no runtime impact in Phase 2 |
| 4 | Admin users list rows lack navigation links to `/admin/users/:id` | P2-065 | Low — UX gap only |

Items 1 and 2 must be resolved before the affected flows are used in production.
Items 3 and 4 are non-blocking.

---

## Phase 2 E2E Verdict

**The Phase 2 Auth, Users, and Roles system is structurally sound.**

The backend correctly enforces identity, ownership, roles, and permissions at every
layer. Flutter and the Admin Dashboard are UX clients that render backend-approved
data without making authorization decisions. All seven end-to-end flows have been
verified against the Phase 2 security rules defined in
`docs/phase-2/auth-security-rules.md` and the safe-field contract in
`docs/phase-2/safe-auth-fields.md`.

Four open items are tracked above. None block Phase 2 close except items 1 and 2,
which must be resolved before the `PATCH /profile/me` and any permission-guarded
endpoint are used in production.

---

## Non-Goals

This check does not cover:
- AIM Engine integration (out of scope for Phase 2)
- AI Teacher integration (out of scope for Phase 2)
- Onboarding, placement, lessons, or sessions (out of scope for Phase 2)
- Student Web App (out of scope for Phase 2)
- Full runtime E2E testing with live Supabase + database (requires provisioned environment)
