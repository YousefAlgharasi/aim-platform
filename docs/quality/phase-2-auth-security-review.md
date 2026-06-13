# Phase 2 — Auth Security Review

**Reviewer:** ahmedalalawi2022@gmail.com (Team Member)
**Task:** P2-066
**Date:** 2026-06-13
**Branch:** `phase2/P2-066-auth-security-review`

---

## Scope

This review covers the Phase 2 Auth, Users, and Roles implementation. It does not cover onboarding, placement, lessons, practice, sessions, AIM Engine, AI Teacher, Student Web App, or any Phase 3+ feature area.

**Files reviewed:**

| Layer | Key Files |
|---|---|
| JWT Guard | `src/auth/supabase-jwt-auth.guard.ts`, `src/auth/supabase-jwt-verifier.service.ts` |
| Role Guard | `src/auth/authorization/role.guard.ts` |
| Permission Guard | `src/auth/authorization/permission.guard.ts` |
| Session Validation | `src/auth/session-validation.service.ts` |
| Auth Controller | `src/auth/auth.controller.ts` |
| Profile Controller | `src/features/profile/profile.controller.ts` |
| Profile Service | `src/features/profile/profile.service.ts` |
| Users Service | `src/features/users/users.service.ts` |
| Roles Service | `src/features/roles/roles.service.ts` |
| Admin Role Assignment | `src/features/admin/admin-role-assignment.controller.ts`, `.service.ts` |
| Auth Logging | `src/auth/auth-logging.service.ts` |
| RLS Policies | `prisma/migrations/20260612140000_apply_auth_rls_policies/migration.sql` |
| Flutter Auth | `apps/mobile/lib/features/auth/**` |
| Admin Dashboard | `apps/admin-dashboard/lib/api/admin-users-api.ts` |

---

## Summary

| Area | Result |
|---|---|
| JWT validation | ✓ Pass |
| Role guard | ✓ Pass |
| **Permission guard** | **✗ Fail — ID mismatch** |
| Session validation | ✓ Pass |
| Profile ownership | ✓ Pass |
| Secret exposure — backend | ✓ Pass |
| Secret exposure — Flutter | ⚠ Warning — bearer token placeholder |
| Secret exposure — Admin Dashboard | ✓ Pass |
| Profile field safety | ✓ Pass |
| Admin role assignment | ⚠ Warning — no self-assignment check in controller |
| Audit logging | ✓ Pass |
| RLS policies | ✓ Pass |
| Auth/me role freshness | ⚠ Warning — stale role data possible |

---

## Findings

---

### [FAIL-001] PermissionGuard passes Supabase Auth UID to RolesService instead of internal user ID

**File:** `src/auth/authorization/permission.guard.ts`

**Code:**
```typescript
const permissionChecks = await Promise.all(
  uniquePermissions.map((permission) =>
    this.rolesService.hasPermission(user.id, permission),
  ),
);
```

**Problem:**

`user.id` here is the **Supabase Auth UID** extracted from the JWT by `SupabaseJwtAuthGuard`. `RolesService.hasPermission(internalUserId, permissionKey)` queries:

```sql
SELECT EXISTS (
  SELECT 1
  FROM permissions p
  INNER JOIN role_permissions rp ON rp.permission_id = p.id
  INNER JOIN user_roles ur ON ur.role_id = rp.role_id
  WHERE ur.user_id = $1
    AND p.key = $2
) AS exists
```

The `user_roles.user_id` column is a FK to `users.id` — the **internal AIM UUID**, not the Supabase Auth UID. Passing the Supabase UID to this query will never match any row, causing `exists` to return `false` for all users.

**Impact:**

All endpoints protected by `PermissionGuard` will deny access to every user regardless of their actual permissions. Permission-guarded endpoints are effectively inaccessible. This is a security enforcement gap — permissions are not evaluated correctly.

**Fix required:**

```typescript
// In PermissionGuard.canActivate():
const internalUser = await this.usersService.findBySupabaseUid(user.id);

if (!internalUser || internalUser.status !== 'active') {
  throw new AppError({
    code: ApiErrorCode.UNAUTHORIZED,
    message: 'Active internal user is required for permission authorization',
    statusCode: HttpStatus.UNAUTHORIZED,
  });
}

const permissionChecks = await Promise.all(
  uniquePermissions.map((permission) =>
    this.rolesService.hasPermission(internalUser.id, permission), // use internalUser.id
  ),
);
```

`PermissionGuard` must inject and use `UsersService` to resolve the internal ID from the Supabase UID before calling `RolesService`, following the same pattern as `RoleGuard`.

**Priority:** P0 — must be fixed before any permission-guarded endpoint is used in production.

---

### [WARN-001] auth/me response may return stale role data

**File:** `src/auth/auth.controller.ts` → `presentAuthMe(user)`

**Problem:**

`GET /auth/me` returns `presentAuthMe(user)` where `user` is the `AuthenticatedUser` populated from the Supabase JWT. If role data is embedded in the JWT's `app_metadata` (which Supabase typically caches), it may not reflect role changes made after the JWT was issued.

The backend database is the authoritative source for roles per the Phase 2 architecture. A JWT-only role read bypasses this authority.

**Impact:**

A user whose role was revoked may still see their old role in `/auth/me` until the JWT expires. A user granted a new role may not see it until the next token refresh.

**Recommended action:**

Either:
1. Resolve roles from the database in the `/auth/me` response (preferred — aligns with backend-authority principle), or
2. Document explicitly that `/auth/me` role data reflects JWT-cached metadata and that the authoritative role check is always database-side via `RoleGuard`.

**Priority:** P1 — document the behaviour and evaluate whether to fix in Phase 2 close or Phase 3.

---

### [WARN-002] AdminRoleAssignmentController has no self-assignment prevention at controller layer

**File:** `src/features/admin/admin-role-assignment.controller.ts`

**Problem:**

The controller resolves `actor.id` (Supabase UID of the requester) and `targetUserId` (URL param). No check prevents an admin from calling `PUT /admin/users/:actorOwnId/roles` with their own ID as `targetUserId`.

**Impact:**

If the service layer does not block this, an admin could escalate their own permissions to `super_admin` through their own account.

**Verify and fix:**

Confirm that `AdminRoleAssignmentService.assignUserRole()` explicitly prevents an actor from modifying their own roles. If not, add:

```typescript
if (actorInternalId === targetUserId) {
  throw new AppError({
    code: ApiErrorCode.FORBIDDEN,
    message: 'An admin may not change their own role',
    statusCode: HttpStatus.FORBIDDEN,
  });
}
```

**Priority:** P1 — verify service-layer protection exists; add controller-layer guard if absent.

---

### [WARN-003] Flutter EditProfilePage uses empty bearer token placeholder

**File:** `apps/mobile/lib/features/profile/ui/pages/edit_profile_page.dart`

**Code:**
```dart
const bearerToken = '';
```

**Problem:**

The edit profile form submission will always fail with an authentication error because the token is empty. This is a documented placeholder pending `supabase_flutter` integration.

**Impact:**

Profile updates from Flutter are non-functional until replaced with an active session token.

**Required action:**

Replace `const bearerToken = '';` with the `supabase_flutter` session access token when integrating the Supabase SDK. This is a known pending integration item, not a security risk, but must be tracked.

**Priority:** P1 — integration item; must be resolved before Flutter profile editing goes live.

---

## Passing Areas

### JWT Validation — ✓ Pass

`SupabaseJwtAuthGuard`:
- Rejects missing tokens with `UNAUTHORIZED`.
- Delegates to `SupabaseJwtVerifierService.verify()` which validates signature and expiry against the Supabase JWKS endpoint.
- Attaches verified `AuthenticatedUser` to `request.user` — never trusts client-supplied user identity.
- Respects `@PublicRoute()` decorator for unauthenticated endpoints.
- No JWT token, Supabase secret, or database credential is logged or returned to clients.

---

### Role Guard — ✓ Pass

`RoleGuard`:
- Skips check when no roles are required (non-guarded endpoints unaffected).
- Rejects unauthenticated requests (`request.user` absent).
- Resolves internal user from Supabase UID via `UsersService.findBySupabaseUid()`.
- Checks `internalUser.status === 'active'` — inactive/disabled/deleted users denied.
- Fetches actual roles from the database via `RolesService.getUserRoles()` — not from JWT.
- Returns `FORBIDDEN` when required roles are not present.

---

### Session Validation — ✓ Pass

`SessionValidationService.validate()`:
- Rejects empty Supabase UID input.
- Uses parameterised query to look up `users` by `supabase_auth_uid`.
- Returns `USER_NOT_FOUND` when no internal user record exists.
- Returns `USER_INACTIVE` when user status is not `active`.
- Returns `valid: true` with `internalUserId` only for active users.
- `supabase_auth_uid` is never returned in the response.

---

### Profile Ownership — ✓ Pass

`ProfileController`:
- Both `GET /profile/me` and `PATCH /profile/me` require `SupabaseJwtAuthGuard` and `ProfileOwnershipGuard`.
- `internalUserId` is sourced from `@CurrentUser()` — derived from the verified JWT, never from client input.
- `ProfileService.getProfileForUser()` and `updateProfileForUser()` accept only the JWT-sourced ID — no client-supplied override is possible.
- `UpdateProfileMeInput` accepts only safe fields: `displayName`, `avatarUrl`, `preferredLanguage`, `timezone`, `department`.
- `user_id`, `profile_type`, `roles`, and `permissions` are not writable through this endpoint.

---

### Secret Exposure — Backend — ✓ Pass

Review of all controllers and services:
- `supabase_auth_uid` is selected internally in services but not returned in any client-facing DTO.
- `supabase_auth_uid` is explicitly excluded from `AdminUserDetailDto`, `SafeUserDto`, `ProfileMeResponse`, and `AuthMeResponse`.
- No Supabase service-role key, database connection string, JWT secret, or privileged credential appears in any source file.
- `AuthLoggingService` does not log token values, passwords, or credentials in `metadata`.

---

### Secret Exposure — Admin Dashboard — ✓ Pass

- Token is read from an HTTP-only cookie server-side in all Next.js Server Components.
- Token is never returned in a JavaScript-accessible API response.
- `supabase_auth_uid` is absent from all admin API response types (`AdminUserDetail`, `AdminUserListItem`).

---

### Profile Field Safety — ✓ Pass

Fields confirmed safe for client exposure (per `docs/phase-2/safe-auth-fields.md`):
- `users.id` (internal AIM user ID)
- `users.email`, `users.phone`, `users.status`, `users.user_type`
- `student_profiles.display_name`, `avatar_url`, `preferred_language`, `timezone`
- `admin_profiles.display_name`, `avatar_url`, `department`
- Role names and permission names for UX rendering

Fields confirmed NOT exposed:
- `users.supabase_auth_uid`
- `auth_audit_logs.*`
- `role_permissions.*` (internal mapping)
- Database credentials and service-role keys

---

### Audit Logging — ✓ Pass

`AuthLoggingService`:
- Inserts into `auth_audit_logs` with parameterised query.
- Catches and logs DB failures without re-throwing — auth flow is not disrupted by logging failures.
- `metadata` JSONB must not contain secrets; confirmed by interface type — no secret fields in `AuthLogContext`.
- `auth_audit_logs` has full RLS deny for non-service roles — never accessible via direct PostgREST query.
- `auth_audit_logs` has explicit RESTRICTIVE UPDATE and DELETE deny policies enforcing append-only at DB level.

---

### RLS Policies — ✓ Pass

Review of `20260612140000_apply_auth_rls_policies/migration.sql`:
- All 8 Phase 2 tables have RLS enabled.
- `admin_profiles`: no permissive policies — full deny to non-service roles.
- `auth_audit_logs`: no SELECT policy — full deny; RESTRICTIVE UPDATE/DELETE policies.
- `users`, `student_profiles`, `user_roles`: own-data SELECT only via `auth.uid()` join.
- `roles`, `permissions`, `role_permissions`: SELECT for authenticated users only; no INSERT/UPDATE/DELETE.
- NestJS backend uses service-role connection — bypasses RLS by default.

---

## Required Actions

| ID | Priority | Action |
|---|---|---|
| FAIL-001 | P0 | Fix `PermissionGuard` to resolve internal user ID before calling `RolesService.hasPermission()`. Inject `UsersService` and call `findBySupabaseUid()` first. |
| WARN-001 | P1 | Either fix `/auth/me` to resolve roles from DB, or document JWT role caching limitation explicitly in `auth.controller.ts`. |
| WARN-002 | P1 | Verify `AdminRoleAssignmentService` blocks self-assignment. Add explicit check if absent. |
| WARN-003 | P1 | Replace empty bearer token placeholder in `EditProfilePage` during `supabase_flutter` integration. |

---

## Out of Scope

This review does not cover and explicitly excludes:

- Onboarding, placement, or lessons
- AIM Engine or AI Teacher
- Session persistence strategy (Phase 3+)
- Admin dashboard SSO or multi-admin setup
- Student Web App

---

## Done Criteria

This review satisfies P2-066 when:

- JWT validation, role guard, permission guard, session validation, and profile ownership are reviewed and findings documented;
- secret exposure is assessed for backend, Flutter, and admin dashboard;
- profile field safety is confirmed against `docs/phase-2/safe-auth-fields.md`;
- admin role assignment is assessed for privilege escalation risk;
- audit logging and RLS are reviewed;
- all findings are classified by severity (FAIL / WARN / PASS);
- required actions are listed with priority.
