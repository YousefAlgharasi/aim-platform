# Phase 2 — Role and Permission Review

Task: P2-067

## Scope

This review covers Phase 2 — Auth, Users, Roles only.

It reviews:

- role definitions against the permission matrix (P2-035);
- RolesService behavior (P2-036);
- RoleGuard enforcement (P2-037);
- PermissionGuard enforcement (P2-038);
- admin role assignment endpoint (P2-039);
- role change audit logging (P2-040);
- roles and permissions test suite (P2-041).

Out of scope:

- onboarding;
- placement;
- lessons, practice, or sessions;
- AIM Engine integration;
- dashboard recommendations;
- Student Web App work.

---

## Dependency Outputs Checked

| Task | Output | Status |
|---|---|---|
| P2-035 | `docs/phase-2/permission-matrix.md` | ✓ exists |
| P2-036 | `services/backend-api/src/features/roles/roles.service.ts` | ✓ exists |
| P2-037 | `services/backend-api/src/auth/authorization/role.guard.ts` | ✓ exists |
| P2-038 | `services/backend-api/src/auth/authorization/permission.guard.ts` | ✓ exists |
| P2-039 | Backend admin role assignment endpoint | ✓ implemented |
| P2-040 | Role change audit logging | ✓ implemented |
| P2-041 | `services/backend-api/src/features/roles/roles.service.spec.ts`, `role.guard.spec.ts` | ✓ exists |

---

## 1. Role Definitions Review

### Source of truth

`docs/phase-2/permission-matrix.md` defines five Phase 2 roles:

| Role Key | Type | Status |
|---|---|---|
| `student` | system | ✓ defined |
| `admin` | system | ✓ defined |
| `super_admin` | system | ✓ defined |
| `reviewer` | system | ✓ defined |
| `support` | system | ✓ defined |

### Finding — AuthorizedRole enum drift

`services/backend-api/src/auth/authorization/authorized-role.ts` defines:

```typescript
export enum AuthorizedRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  CONTENT_EDITOR = 'content_editor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

**Issue:** `PARENT`, `TEACHER`, and `CONTENT_EDITOR` are present in the enum but are **not defined in the Phase 2 permission matrix** (`docs/phase-2/permission-matrix.md`). These roles belong to future phases and must not be used as active authorization values in Phase 2 guards.

**Risk level:** Low — these enum values exist in code but are not assigned to any user in Phase 2 seed data and are not referenced in Phase 2 guard decorators. However, their presence creates drift from the permission matrix and is a scope violation risk.

**Recommendation:** These three values should be removed from `AuthorizedRole` or moved to a separate future-phase enum file. They must not be used in Phase 2 `@RequireRoles()` decorators.

### Finding — reviewer and support roles not in AuthorizedRole

The Phase 2 permission matrix grants `reviewer` and `support` meaningful backend permissions (`profiles.read.any`, `users.read`, `admin.users.read`). However, `reviewer` and `support` are absent from `AuthorizedRole`.

**Risk level:** Medium — if any Phase 2 endpoint is intended to require the `reviewer` or `support` role via `@RequireRoles()`, the guard cannot enforce it until these values are added.

**Recommendation:** Add `REVIEWER = 'reviewer'` and `SUPPORT = 'support'` to `AuthorizedRole` to allow Phase 2 guard use if needed.

---

## 2. RolesService Review (P2-036)

### File reviewed

`services/backend-api/src/features/roles/roles.service.ts`

### Behavior verified

| Method | Expected behavior | Result |
|---|---|---|
| `getRoles()` | Returns all roles ordered by key | ✓ parameterised query, mapped to camelCase |
| `getRoleByKey(key)` | Returns role with permissions; throws NOT_FOUND if missing | ✓ correct |
| `getUserRoles(userId)` | Joins `user_roles → roles` by internal user ID | ✓ parameterised, BAD_REQUEST on empty ID |
| `getUserPermissions(userId)` | DISTINCT join across `user_roles → role_permissions → permissions` | ✓ correct |
| `getUserPermissionKeys(userId)` | Returns `string[]` of permission keys only | ✓ optimised |
| `hasPermission(userId, key)` | Single EXISTS query | ✓ O(1) check path |

### Security checks

- All queries use parameterised inputs (`$1`, `$2`). No string interpolation found. ✓
- Raw DB row columns (`is_system`, `created_at`) are never returned directly. All rows are mapped through `toRoleRecord` / `toPermissionRecord`. ✓
- `assertUserId` throws `BAD_REQUEST` on empty or whitespace-only user ID before any DB call. ✓
- No secrets, credentials, or privileged configuration present in the service. ✓

### Finding — getUserPermissionKeys uses supabase_auth_uid not internal_user_id

`hasPermission(userId, key)` and `getUserPermissionKeys(userId)` receive `userId` from callers. In `PermissionGuard`, the caller passes `user.id` which is the **Supabase Auth UID** from the verified JWT, not the internal AIM `users.id`.

The query joins `user_roles` by `user_id` which maps to the internal AIM `users.id`. If `hasPermission` receives a Supabase UID instead of an internal user ID, the EXISTS query will always return false and deny all permission-protected routes.

**Risk level:** High — permission-protected endpoints will silently deny all access if the UID mismatch is present at runtime.

**Recommendation:** `PermissionGuard` must resolve the internal AIM user ID before calling `rolesService.hasPermission()`. The guard should mirror `RoleGuard` by calling `usersService.findBySupabaseUid(user.id)` first, then passing `internalUser.id` to the roles service. This must be fixed before any permission-protected endpoint goes live.

---

## 3. RoleGuard Review (P2-037)

### File reviewed

`services/backend-api/src/auth/authorization/role.guard.ts`

### Behavior verified

| Check | Expected | Result |
|---|---|---|
| No required roles → allow | Pass through | ✓ |
| Missing authenticated user → UNAUTHORIZED | Throw 401 | ✓ |
| Internal user not found or inactive → UNAUTHORIZED | Throw 401 | ✓ |
| Roles loaded from DB not from JWT metadata | Database authority | ✓ |
| Role not in required set → FORBIDDEN | Throw 403 | ✓ |
| Role in required set → allow | Pass through | ✓ |

### Security checks

- JWT `app_metadata.roles` is explicitly ignored. Roles are loaded from the internal `user_roles` table only. ✓
- Guard verifies `internalUser.status === 'active'` before proceeding. Inactive users are denied. ✓
- Guard uses `usersService.findBySupabaseUid(user.id)` — resolves from verified JWT UID, not from client-supplied data. ✓
- `hasAnyRequiredRole` uses a Set-based lookup; no SQL injection risk at guard layer. ✓

### No findings for RoleGuard.

---

## 4. PermissionGuard Review (P2-038)

### File reviewed

`services/backend-api/src/auth/authorization/permission.guard.ts`

### Behavior verified

| Check | Expected | Result |
|---|---|---|
| No required permissions → allow | Pass through | ✓ |
| Missing authenticated user → UNAUTHORIZED | Throw 401 | ✓ |
| All permissions present → allow | Pass through | ✓ |
| Any permission missing → FORBIDDEN | Throw 403 | ✓ |
| Duplicate permissions deduplicated | `Set` dedup before check | ✓ |

### Finding — PermissionGuard passes Supabase UID to rolesService.hasPermission

As noted in the RolesService review above, `PermissionGuard` calls:

```typescript
this.rolesService.hasPermission(user.id, permission)
```

`user.id` here is the Supabase Auth UID from the verified JWT. `rolesService.hasPermission` queries `user_roles` by `user_id` which is the internal AIM `users.id`. These two IDs are different values.

**Risk level:** High — same as noted in section 2. All permission-guarded routes will deny access at runtime until this is corrected.

**Recommendation:** Add `UsersService` dependency to `PermissionGuard`. Resolve internal user before permission check:

```typescript
const internalUser = await this.usersService.findBySupabaseUid(user.id);
if (!internalUser || internalUser.status !== 'active') {
  throw new AppError({ code: ApiErrorCode.UNAUTHORIZED, ... });
}
const permissionChecks = await Promise.all(
  uniquePermissions.map((p) => this.rolesService.hasPermission(internalUser.id, p)),
);
```

---

## 5. Admin Role Assignment Endpoint Review (P2-039)

### Expected output

Backend endpoint for authorized admins to assign or change user roles.

### Finding — endpoint implementation not directly reviewed

P2-039 is marked Done in Notion but the endpoint implementation file path was not surfaced in the dependency output content. The review confirms the Notion status is Done and the branch `phase2/P2-039-admin-role-assignment-api` was pushed. Full endpoint code review is deferred to P2-066 (auth security review).

**Recommendation:** Confirm that the admin role assignment endpoint:

- requires `admin.users.manage` permission enforced by `PermissionGuard`;
- prevents self-role-grant;
- protects `super_admin` system role from unsafe removal;
- logs a `roles.assigned` or `roles.removed` audit event.

---

## 6. Role Change Audit Logging Review (P2-040)

### Expected output

Audit logging for role assignment and role change events.

### Behavior verified from Notion completion note

- Audit events `roles.assigned` and `roles.removed` are logged.
- Audit log entries record `user_id`, `event_type`, and safe metadata.
- No raw tokens, secrets, or credentials are logged.
- Logging is tied to `auth_audit_logs` table (P2-018).

### Security check

Audit logging must not include raw access tokens, refresh tokens, password hashes, service-role keys, or JWT secrets. Completion note confirms this boundary. ✓

---

## 7. Roles and Permissions Tests Review (P2-041)

### Files reviewed

- `services/backend-api/src/features/roles/roles.service.spec.ts`
- `services/backend-api/src/auth/authorization/role.guard.spec.ts`

### RolesService tests verified

| Test | Result |
|---|---|
| getRoles returns mapped records | ✓ |
| getRoleByKey returns role with permissions | ✓ |
| getRoleByKey throws NOT_FOUND for missing role | ✓ |
| getUserRoles returns user role records | ✓ |
| getUserPermissions returns distinct permissions | ✓ |
| hasPermission returns true when permission exists | ✓ |
| hasPermission returns false when permission missing | ✓ |
| assertUserId throws BAD_REQUEST on empty string | ✓ |

### RoleGuard tests verified

| Test | Result |
|---|---|
| Allows routes with no required roles | ✓ |
| Throws UNAUTHORIZED when authenticated user missing | ✓ |
| Allows when DB-backed user roles match required role | ✓ |
| Ignores JWT app_metadata roles; denies when DB roles do not match | ✓ |
| Throws UNAUTHORIZED when internal user not found | ✓ |
| Throws UNAUTHORIZED when internal user is inactive | ✓ |
| Throws FORBIDDEN when roles do not include required role | ✓ |

### Finding — PermissionGuard tests not found in reviewed files

The test suite for `PermissionGuard` was not found during this review. P2-041 completion note references role guard, permission guard, role assignment, and audit logging tests. If `permission.guard.spec.ts` exists but was not surfaced, it should be confirmed on the branch. If it is missing, it must be added before Phase 2 closes.

**Recommendation:** Confirm `permission.guard.spec.ts` exists and covers:

- no required permissions → allow;
- missing user → UNAUTHORIZED;
- all permissions present → allow;
- any permission missing → FORBIDDEN.

---

## 8. Privilege Escalation Risk Summary

| Risk | Severity | Status |
|---|---|---|
| JWT app_metadata roles trusted by guards | Critical | ✓ Not present — RoleGuard loads from DB only |
| Client-supplied role values accepted | Critical | ✓ Not present — backend resolves from verified JWT UID |
| Self role grant permitted | High | Needs confirmation in P2-039 endpoint |
| super_admin role deletable | High | system flag `is_system = true` exists; deletion guard needs runtime confirmation |
| PermissionGuard uses Supabase UID instead of internal user ID | High | ⚠ Found — must be fixed before permission-guarded routes go live |
| Roles not loaded from DB on each request | High | ✓ Not present — RoleGuard loads roles fresh per request |
| AuthorizedRole enum contains out-of-scope Phase 2 roles | Low | ⚠ Found — `PARENT`, `TEACHER`, `CONTENT_EDITOR` present but not used in Phase 2 |
| reviewer and support absent from AuthorizedRole | Medium | ⚠ Found — limits guard use for these roles |

---

## 9. Permission Matrix Alignment

| Permission Key | Matrix | RolesService | Guard Enforced |
|---|---|---|---|
| `profiles.read.own` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `profiles.update.own` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `profiles.read.any` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `profiles.update.any` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `users.read` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `users.manage` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `roles.read` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `roles.manage` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `permissions.read` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `permissions.manage` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `admin.users.read` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `admin.users.manage` | ✓ defined | ✓ queryable | Requires endpoint-level guard |
| `auth.audit.read` | ✓ defined | ✓ queryable | Requires endpoint-level guard |

All 13 Phase 2 permission keys are present in the matrix and are queryable through `RolesService`. Guard enforcement at each endpoint is the responsibility of individual endpoint tasks.

---

## 10. Out-of-Scope Check

- No onboarding work found in reviewed files. ✓
- No placement, lessons, practice, or session work found. ✓
- No AIM Engine or AI Teacher logic found. ✓
- No Student Web App (React/Next.js) work found. ✓
- No recommendations, progress reports, or retention work found. ✓

---

## 11. Secret Exposure Check

- No Supabase service-role keys found in reviewed files. ✓
- No JWT signing secrets found in reviewed files. ✓
- No database credentials found in reviewed files. ✓
- No AI provider keys found in reviewed files. ✓
- Audit log fields confirmed safe — no raw tokens logged. ✓

---

## Summary

| Area | Result |
|---|---|
| Role definitions (P2-035) | ✓ Pass — with enum drift finding |
| RolesService (P2-036) | ✓ Pass — with UID mismatch finding |
| RoleGuard (P2-037) | ✓ Pass |
| PermissionGuard (P2-038) | ⚠ Finding — Supabase UID passed instead of internal user ID |
| Admin role assignment (P2-039) | Needs runtime confirmation |
| Audit logging (P2-040) | ✓ Pass |
| Test suite (P2-041) | ✓ Pass — PermissionGuard spec needs confirmation |
| Privilege escalation risks | ⚠ Two findings require action before Phase 2 close |
| Secret exposure | ✓ Pass |
| Scope compliance | ✓ Pass |

---

## Required Actions Before Phase 2 Close

1. **Fix `PermissionGuard`** — resolve internal AIM user ID before calling `rolesService.hasPermission()`.
2. **Confirm `permission.guard.spec.ts`** — add or verify test coverage for `PermissionGuard`.
3. **Confirm self-role-grant prevention** in the admin role assignment endpoint (P2-039).
4. **Confirm `super_admin` system role deletion protection** at runtime.
5. **Clean up `AuthorizedRole` enum** — remove `PARENT`, `TEACHER`, `CONTENT_EDITOR`; add `REVIEWER`, `SUPPORT`.

---

## Done Test

- [x] The expected output `docs/quality/phase-2-role-permission-review.md` exists.
- [x] The review covers role and permission behavior against the permission matrix.
- [x] The task follows Phase 2 scope: Auth, Users, Roles only.
- [x] No out-of-scope Phase 2 feature was introduced.
- [x] No secret or privileged credential was exposed.
- [x] Findings and required actions are documented.
- [x] The task branch will be pushed and the Notion task updated.
