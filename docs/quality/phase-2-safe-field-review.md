# Phase 2 Safe Field Exposure Review

## P2-068 — Run Safe Field Exposure Review

**Date:** 2026-06-13
**Reference policy:** `docs/phase-2/safe-auth-fields.md` (P2-011)
**Goal:** Verify that no Phase 2 response returns `supabase_auth_uid`, JWT tokens, service-role keys, database credentials, raw permission matrices, RLS traces, or other forbidden fields to Flutter Mobile or the Admin Dashboard.

---

## Verdict

**No critical forbidden fields found.** Three findings of medium severity (client-safe model fields exceeding P2-011 Flutter-safe definitions) and two low-severity findings (naming clarity, admin role metadata) are documented below. None constitute a secret or credential exposure.

---

## Review Scope

All response types and client-facing models produced in Phase 2 were reviewed against the safe field contract in `docs/phase-2/safe-auth-fields.md`.

| Surface | Review targets |
|---|---|
| Backend → Flutter | `AuthMeResponse`, `ProfileMeResponse`, `StudentProfileResponse`, `AdminProfileResponse` |
| Backend → Admin Dashboard | `AdminUserListItem`, `AdminUserDetailResponse`, `AdminRoleAssignmentResponse` |
| Flutter models | `CurrentUserModel`, `ClientSafeRoleModel`, `ClientSafePermissionModel`, `AuthContextModel` |
| Admin API decoders | `decodeAdminUserListItem`, `decodeAdminUserDetail`, `decodeRoleChangeResult` |

---

## Backend Response Review

### `/auth/me` — `AuthMeResponse`

```typescript
interface AuthMeResponse {
  user: { id: string; email?: string };
  session: { authenticated: true; sessionStatus: 'active'; expiresAt: number };
  roles: readonly AuthorizedRole[];    // string keys only
  permissions: readonly string[];      // permission keys only
}
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `user.id` (internal AIM user ID) | Flutter-safe | ✓ |
| `user.email` | Flutter-safe (own only) | ✓ |
| `supabase_auth_uid` | Forbidden-client | ✓ Absent |
| `session.authenticated` | Flutter-safe (implicit) | ✓ |
| `session.expiresAt` | Not Flutter-safe | ⚠ **Finding F1** — see below |
| `roles[]` (keys) | Flutter-safe (safe labels) | ✓ |
| `permissions[]` (keys) | Not Flutter-safe | ⚠ **Finding F2** — see below |
| JWT tokens / signing secrets | Forbidden-client | ✓ Absent |
| `auth.provider_subject` | Forbidden-client | ✓ Absent |

---

### `/profile/me` — `ProfileMeResponse`

```typescript
interface ProfileMeResponse {
  internalUserId: string;
  userType: string;
  studentProfile: StudentProfileResponse | null;
  adminProfile: AdminProfileResponse | null;
}

interface StudentProfileResponse {
  id: string; profileType: 'student_profile';
  displayName: string | null; avatarUrl: string | null;
  preferredLanguage: string | null; timezone: string | null;
}
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `internalUserId` | Flutter-safe (`user.id`) | ✓ — but see Finding F5 (field name clarity) |
| `userType` | Flutter-safe | ✓ |
| `studentProfile.id` | Flutter-safe (own only) | ✓ |
| `studentProfile.profileType` | Flutter-safe | ✓ |
| `studentProfile.displayName` | Flutter-safe | ✓ |
| `studentProfile.avatarUrl` | Flutter-safe | ✓ |
| `studentProfile.preferredLanguage` | Flutter-safe | ✓ |
| `studentProfile.timezone` | Flutter-safe | ✓ |
| `studentProfile.userId` | Not Flutter-safe | ✓ Absent |
| `studentProfile.createdAt` | Not Flutter-safe | ✓ Absent |
| `adminProfile.userId` | Not Flutter-safe | ✓ Absent |

---

### `/admin/users` — `AdminUserListItem`

```typescript
interface AdminUserListItem {
  id, email, phone, userType, status, createdAt, updatedAt
}
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `id` | Admin-safe | ✓ |
| `email` | Admin-safe | ✓ |
| `phone` | Admin-safe | ✓ |
| `userType` | Admin-safe | ✓ |
| `status` | Admin-safe | ✓ |
| `createdAt` | Admin-safe | ✓ |
| `updatedAt` | Admin-safe | ✓ |
| `supabase_auth_uid` | Forbidden-client | ✓ Absent |
| Password / password hash | Forbidden-client | ✓ Absent |

---

### `/admin/users/:id` — `AdminUserDetailResponse`

```typescript
interface AdminUserDetailResponse {
  id, email, phone, userType, status,
  roles: { key: string; name: string }[],
  createdAt, updatedAt
}
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `id` | Admin-safe | ✓ |
| `email` | Admin-safe | ✓ |
| `roles[].key` | Admin-safe (limited) | ✓ |
| `roles[].name` | Admin-safe | ✓ |
| `supabase_auth_uid` | Forbidden-client | ✓ Absent |
| Permission codes | Not Admin-safe (standard UI) | ✓ Absent from detail response |
| `roles[].id` | Not Flutter-safe | ✓ Absent (keys and names only) |

---

### `PUT /admin/users/:userId/roles` — `AdminRoleAssignmentResponse`

```typescript
interface AdminRoleAssignmentResponse {
  userId: string;
  role: RoleRecord;   // { id, key, name, description, isSystem, createdAt, updatedAt }
  assignedByUserId: string;
  assignedAt: string;
}
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `userId` | Admin-safe | ✓ |
| `role.key` | Admin-safe (limited) | ✓ |
| `role.name` | Admin-safe | ✓ |
| `role.description` | Admin-safe | ✓ |
| `role.id` | Not Flutter-safe | ⚠ **Finding F4** — returned to admin only, not Flutter. Admin-borderline, see below. |
| `role.isSystem` | Not defined in P2-011 | ⚠ **Finding F4** — same as above |
| `role.createdAt/updatedAt` | Not defined in P2-011 | ⚠ **Finding F4** — same as above |
| `assignedByUserId` | Admin-safe (read-only) | ✓ |
| `assignedAt` | Admin-safe | ✓ |
| JWT tokens | Forbidden-client | ✓ Absent |
| `actorSupabaseAuthUid` | Forbidden-client | ✓ Absent from response — internal service input only |

---

## Flutter Model Review

### `CurrentUserModel`

```dart
String id, String? email, String? phone, String userType,
String status, String createdAt, String updatedAt
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `id` | Flutter-safe | ✓ |
| `email` | Flutter-safe (own only) | ✓ |
| `phone` | Flutter-safe | ✓ |
| `userType` | Flutter-safe | ✓ |
| `status` | Flutter-safe | ✓ |
| `createdAt` | **Not Flutter-safe** (admin-operational) | ⚠ **Finding F1** |
| `updatedAt` | **Not Flutter-safe** (admin-operational) | ⚠ **Finding F1** |

### `ClientSafeRoleModel`

```dart
String id, String key, String name, String? description, bool isSystem
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `key` | Flutter-safe (safe name only) | ✓ |
| `name` | Flutter-safe | ✓ |
| `id` | **Not Flutter-safe** (role identifier for admin management) | ⚠ **Finding F2** |
| `description` | **Not Flutter-safe** (admin-operational) | ⚠ **Finding F2** |
| `isSystem` | Not defined in P2-011 | ⚠ **Finding F2** |

### `ClientSafePermissionModel`

```dart
String id, String key, String scope, String? description
```

| Field | P2-011 rule | Verdict |
|---|---|---|
| `key` (permission code) | **Not Flutter-safe** | ⚠ **Finding F3** |
| `scope` | **Not Flutter-safe** | ⚠ **Finding F3** |
| `id` | **Not Flutter-safe** | ⚠ **Finding F3** |
| `description` | **Not Flutter-safe** | ⚠ **Finding F3** |

---

## Forbidden Field Scan

| Forbidden field / category | Backend responses | Flutter models | Admin decoders |
|---|---|---|---|
| `supabase_auth_uid` | ✓ Absent | ✓ Absent | ✓ Absent |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ Absent | ✓ Absent | ✓ Absent |
| `JWT_SECRET` / signing keys | ✓ Absent | ✓ Absent | ✓ Absent |
| `DATABASE_URL` / connection strings | ✓ Absent | ✓ Absent | ✓ Absent |
| `session.access_token` (raw) | ✓ Absent | ✓ Absent | ✓ Absent |
| `session.refresh_token` | ✓ Absent | ✓ Absent | ✓ Absent |
| `auth.jwt_payload_raw` | ✓ Absent | ✓ Absent | ✓ Absent |
| `auth.provider_subject` | ✓ Absent | ✓ Absent | ✓ Absent |
| Stack traces / raw exceptions | ✓ Absent | ✓ Absent | ✓ Absent |
| `auth_audit.ip_address` | ✓ Absent | ✓ Absent | ✓ Absent |
| `rls_policy_trace` | ✓ Absent | ✓ Absent | ✓ Absent |
| `role_resolution_trace` | ✓ Absent | ✓ Absent | ✓ Absent |

**No forbidden fields are present in any Phase 2 client-facing response or model.**

---

## Findings

### F1 — `CurrentUserModel` exposes `createdAt` and `updatedAt` to Flutter

**Severity:** Medium
**Location:** `apps/mobile/lib/features/auth/data/models/current_user_model.dart`
**P2-011 rule:** `user.created_at` and `user.updated_at` are "Not Flutter-safe — admin-operational."
**Detail:** `CurrentUserModel` maps `createdAt` and `updatedAt` from the backend user record. These fields are currently returned by `/auth/me` (via `CurrentUserModel`) and rendered or stored in Flutter's `AuthContextModel`. Per P2-011, creation and update timestamps are admin-operational and should not be sent to Flutter.
**Risk:** Low — no security impact; timestamps don't enable privilege escalation. However, they violate the safe-field contract and expose internal account metadata unnecessarily.
**Required action:** Remove `createdAt` and `updatedAt` from `/auth/me` user response and `CurrentUserModel`, or mark them explicitly as accepted deviations from P2-011.

---

### F2 — `ClientSafeRoleModel` exposes `id`, `description`, and `isSystem` to Flutter

**Severity:** Medium
**Location:** `apps/mobile/lib/features/auth/data/models/client_safe_role_model.dart`
**P2-011 rule:** `role.id` is "Not Flutter-safe"; `role.description` is "Not Flutter-safe"; `isSystem` is not defined by P2-011.
**Detail:** `ClientSafeRoleModel` maps `id`, `key`, `name`, `description`, and `isSystem`. Per P2-011, only `role.name` (safe label) is Flutter-safe. Role IDs, descriptions, and system flags are admin-operational.
**Risk:** Low — role IDs are UUIDs and not directly exploitable. No privilege escalation risk. However, exposing `isSystem` to clients reveals internal role management metadata.
**Required action:** Strip `id`, `description`, and `isSystem` from `ClientSafeRoleModel`. Return only `key` and `name` to Flutter.

---

### F3 — `ClientSafePermissionModel` exposes permission codes, scope, and ID to Flutter

**Severity:** Medium
**Location:** `apps/mobile/lib/features/auth/data/models/client_safe_permission_model.dart`
**P2-011 rule:** `permission.code` is "Not Flutter-safe"; `permission.description` is "Not Flutter-safe."
**Detail:** `ClientSafePermissionModel` maps `id`, `key` (permission code), `scope`, and `description` to Flutter. Per P2-011, permission codes must not be sent to Flutter because Flutter is a UX layer and must not make authorization decisions based on permission codes.
**Risk:** Medium — while Flutter cannot enforce permissions, exposing permission codes to clients reveals the internal authorization policy structure, which violates the principle of minimal client disclosure. Clients should use role labels for UX branching only.
**Required action:** Remove permissions from `/auth/me` Flutter response, or limit to a simple boolean map (`{ [permissionKey]: boolean }`). Alternatively, remove permissions from the Flutter response entirely if Flutter has no current UX that branches on individual permission codes.

---

### F4 — `AdminRoleAssignmentResponse` returns full `RoleRecord` including `isSystem`, `createdAt`, `updatedAt`

**Severity:** Low
**Location:** `services/backend-api/src/features/admin/admin-role-assignment.types.ts`
**P2-011 rule:** `role.description` is Admin-safe; `isSystem`, `createdAt`, `updatedAt` on roles are not defined by P2-011.
**Detail:** `AdminRoleAssignmentResponse.role` is typed as `RoleRecord` which includes `id`, `key`, `name`, `description`, `isSystem`, `createdAt`, `updatedAt`. The admin dashboard receives all fields. `isSystem` is an internal flag indicating whether a role is system-managed. Exposing it to the admin UI is borderline but not a critical security issue — admins should not be able to delete or modify system roles, but knowing whether a role is system-managed via the UI is not a direct risk.
**Risk:** Low — no credential or secret exposure. `isSystem` reveals internal role management logic but has no direct security impact in Phase 2.
**Required action:** Consider defining a `SafeRoleAssignmentResult` DTO in Phase 3 that omits `isSystem`, `createdAt`, and `updatedAt` from the role assignment response. Accept as known deviation for Phase 2.

---

### F5 — `ProfileMeResponse.internalUserId` field name is misleading

**Severity:** Low (clarity)
**Location:** `services/backend-api/src/features/profile/profile.types.ts`
**Detail:** The field `internalUserId` in `ProfileMeResponse` correctly returns the AIM internal user ID (Flutter-safe per P2-011). However, the name `internalUserId` emphasises "internal" which may mislead future developers into thinking this is a sensitive or internal-only field. The value itself is safe.
**Risk:** None — no security impact. Clarity concern only.
**Required action:** Consider renaming to `userId` in a future API version. No immediate action required.

---

### F6 — `AssignAdminUserRoleInput.actorSupabaseAuthUid` naming mismatch

**Severity:** Low (clarity, internal only)
**Location:** `services/backend-api/src/features/admin/admin-role-assignment.types.ts` and `.controller.ts`
**Detail:** `AssignAdminUserRoleInput.actorSupabaseAuthUid` is populated by `actor.id` — the internal AIM user ID, not the Supabase Auth UID. The field is named `actorSupabaseAuthUid` but holds an internal ID. This is internal to the service layer and never returned to clients.
**Risk:** None — does not affect any client response. Internal naming confusion only.
**Required action:** Rename `actorSupabaseAuthUid` to `actorInternalUserId` in `AssignAdminUserRoleInput` to match the actual value. Low priority.

---

## Findings Summary

| # | Finding | Severity | Client affected | Required action |
|---|---|---|---|---|
| F1 | `CurrentUserModel` sends `createdAt`/`updatedAt` to Flutter | Medium | Flutter | Remove from `/auth/me` user response or accept as deviation |
| F2 | `ClientSafeRoleModel` sends `id`, `description`, `isSystem` to Flutter | Medium | Flutter | Strip to `key` + `name` only |
| F3 | `ClientSafePermissionModel` sends permission codes + scope to Flutter | Medium | Flutter | Remove or limit to boolean map |
| F4 | `AdminRoleAssignmentResponse` returns full `RoleRecord` with `isSystem` | Low | Admin Dashboard | Accept for Phase 2; define `SafeRoleAssignmentResult` in Phase 3 |
| F5 | `ProfileMeResponse.internalUserId` field name is misleading | Low | Flutter | Rename to `userId` in future API version |
| F6 | `AssignAdminUserRoleInput.actorSupabaseAuthUid` naming mismatch | Low | Internal only | Rename to `actorInternalUserId` |

**No forbidden fields (secrets, credentials, tokens, UIDs) are exposed to any client.**

Findings F1, F2, and F3 require action before production — they expose admin-operational or policy-sensitive fields to Flutter contrary to the P2-011 safe field contract. F4, F5, F6 are low-risk and can be deferred to Phase 3.

---

## Non-Goals

This review does not cover:
- AIM Engine output fields (out of Phase 2 scope)
- AI Teacher output fields (out of Phase 2 scope)
- Lesson, session, onboarding, or placement fields (out of Phase 2 scope)
- Student Web App (out of Phase 2 scope)
- RLS policy implementation (covered in `docs/phase-2/auth-rls-plan.md`)
