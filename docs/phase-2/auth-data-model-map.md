# Phase 2 — Auth Data Model Map

## Purpose

This document defines the Phase 2 data model for users, student profiles, admin profiles, roles, permissions, user roles, and auth audit logs.

The goal is to make the relationship between Supabase Auth UID, internal AIM users, profiles, roles, and permissions explicit before implementation.

This is a documentation-only task. It does not create migrations, database tables, backend code, Flutter code, admin dashboard code, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- Supabase Auth UID mapping;
- internal AIM users;
- student profiles;
- admin profiles;
- roles;
- permissions;
- user-role assignments;
- role-permission relationships;
- auth audit logs;
- ownership and authorization boundaries.

It does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This data model follows:

```text
docs/phase-2/auth-source-of-truth.md
```

Core rule:

```text
Supabase Auth UID -> internal AIM user -> profile/roles/permissions
```

Supabase Auth owns the external authenticated identity.

The backend/database owns internal AIM identity, profiles, roles, permissions, ownership, and authorization decisions.

Flutter Mobile and Admin Dashboard may render backend-approved data only. They are not the source of truth for identity, roles, permissions, ownership, or admin access.

---

## High-Level Relationship

```text
Supabase Auth User
  id / uid
      |
      v
AIM User
  id
  supabase_auth_uid
      |
      +--> Student Profile
      |
      +--> Admin Profile
      |
      +--> User Role
              |
              v
            Role
              |
              v
       Role Permission
              |
              v
          Permission

AIM User / Auth Events
      |
      v
 Auth Audit Log
```

---

## Entity: Supabase Auth User

The Supabase Auth user is the external authenticated identity.

It is not the full AIM application user model.

Representative external fields:

| Field | Meaning | Authority |
|---|---|---|
| `id` / `uid` | Supabase Auth user identifier | Supabase Auth |
| `email` | User email when enabled | Supabase Auth |
| `phone` | User phone when enabled | Supabase Auth |
| provider metadata | OAuth/auth metadata | Supabase Auth |

Rules:

- Backend must validate the authenticated Supabase token/session.
- Backend must use the validated Supabase UID, not a client-supplied UID.
- Raw provider metadata must not be exposed to clients unless explicitly whitelisted later.
- Supabase service-role keys must never be exposed to Flutter or Admin UI.

---

## Entity: AIM User

The AIM user is the internal backend/database user record.

It is the central application identity used by Phase 2 authorization.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Internal AIM user ID |
| `supabase_auth_uid` | string | Stable mapping to Supabase Auth user |
| `email` | string/null | Normalized email if available |
| `phone` | string/null | Normalized phone if available |
| `status` | enum/string | `active`, `disabled`, `pending`, or equivalent |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |
| `deleted_at` | timestamp/null | Optional soft delete marker |

Rules:

- `supabase_auth_uid` must be unique.
- An AIM user must map to one authenticated Supabase Auth identity.
- Backend resolves current user by validated Supabase UID.
- Disabled or deleted users must not receive protected access.
- Clients must not create trusted AIM user identity locally.

---

## Entity: Student Profile

The student profile stores student-facing profile data linked to an AIM user.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Student profile ID |
| `user_id` | UUID/string | Owner AIM user ID |
| `display_name` | string/null | Student display name |
| `avatar_url` | string/null | Profile image URL |
| `preferred_language` | string/null | UI/content language preference |
| `timezone` | string/null | User timezone |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

Rules:

- `user_id` links the profile to its owner.
- A normal authenticated user may access only their own student profile.
- Backend ownership checks are required before reading or updating profile data.
- Student profile data must not include placement, lessons, sessions, progress, AIM recommendations, or AI Teacher state in this Phase 2 task.

---

## Entity: Admin Profile

The admin profile stores admin-facing profile data linked to an AIM user with admin permissions.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Admin profile ID |
| `user_id` | UUID/string | Linked AIM user ID |
| `display_name` | string/null | Admin display name |
| `avatar_url` | string/null | Admin profile image |
| `department` | string/null | Optional admin grouping |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

Rules:

- Admin profile existence does not grant admin authority by itself.
- Admin access must come from backend-approved role/permission checks.
- Admin UI must not treat local profile state as proof of authorization.
- Backend guards remain required for admin actions.

---

## Entity: Role

A role groups permissions for backend authorization.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Role ID |
| `key` | string | Stable role key, such as `admin` |
| `name` | string | Human-readable role name |
| `description` | string/null | Role description |
| `is_system` | boolean | Protects built-in roles from unsafe changes |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

Example role keys:

```text
student
admin
super_admin
reviewer
support
```

Rules:

- Roles are backend-owned.
- Clients must not assign or trust roles locally.
- System roles should be protected from unsafe deletion or mutation.
- Role checks in Flutter/Admin UI are UX-only.

---

## Entity: Permission

A permission represents a specific backend-enforced capability.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Permission ID |
| `key` | string | Stable permission key |
| `description` | string/null | Permission description |
| `scope` | string/null | Resource or feature area |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

Example permission keys:

```text
profiles.read.own
profiles.update.own
profiles.read.any
profiles.update.any
users.read
users.manage
roles.read
roles.manage
permissions.read
permissions.manage
admin.users.read
admin.users.manage
```

Rules:

- Permissions are backend-owned.
- Backend guards must enforce permissions.
- Flutter/Admin may render permission labels only when backend-approved.
- Local client permission state must not grant access.

---

## Entity: User Role

User role records assign roles to AIM users.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Assignment ID |
| `user_id` | UUID/string | AIM user receiving the role |
| `role_id` | UUID/string | Assigned role |
| `assigned_by_user_id` | UUID/string/null | Admin user who assigned the role |
| `created_at` | timestamp | Assignment time |

Rules:

- Only backend-authorized admins may assign or remove roles.
- Users must not assign roles to themselves.
- Role assignment changes should be auditable.
- Backend must prevent unsafe privilege escalation.

---

## Entity: Role Permission

Role permission records connect roles to permissions.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Mapping ID |
| `role_id` | UUID/string | Role reference |
| `permission_id` | UUID/string | Permission reference |
| `created_at` | timestamp | Mapping creation time |

Rules:

- Role-permission mappings are backend-owned.
- Clients must not mutate mappings directly.
- Admin changes require backend role/permission checks.
- System permissions should be protected from unsafe mutation.

---

## Entity: Auth Audit Log

Auth audit logs record important authentication and authorization events.

Suggested fields:

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID/string | Audit log ID |
| `user_id` | UUID/string/null | AIM user related to the event |
| `supabase_auth_uid` | string/null | Auth UID involved in the event |
| `event_type` | string | Event key |
| `ip_address` | string/null | Optional request IP |
| `user_agent` | string/null | Optional request user agent |
| `metadata` | object/json/null | Safe internal event metadata |
| `created_at` | timestamp | Event time |

Example event types:

```text
auth.user_synced
auth.login_seen
auth.logout_seen
auth.me_requested
auth.access_denied
roles.assigned
roles.removed
permissions.changed
profile.read_denied
profile.update_denied
```

Rules:

- Audit logs are internal.
- Audit logs must not expose secrets.
- Audit logs should not store raw tokens.
- Sensitive metadata should be minimized.

---

## Ownership Rules

Ownership is represented through user-linked records.

Primary Phase 2 ownership examples:

| Resource | Owner field |
|---|---|
| Student profile | `student_profiles.user_id` |
| Admin profile | `admin_profiles.user_id` |
| User-owned auth context | `users.id` resolved from Supabase UID |

Rules:

- Client-provided IDs do not prove ownership.
- Backend must validate ownership before returning or mutating protected data.
- Admin override requires backend-approved role/permission checks.
- Flutter/Admin must not be the ownership authority.

---

## Safe Client Exposure

Client-safe data may include:

- current AIM user ID;
- safe email or phone when required;
- profile ID;
- display name;
- avatar URL;
- preferred language;
- backend-approved role labels;
- backend-approved permission labels.

Client-safe data must still be treated as display state, not authorization authority.

---

## Internal-Only Data

The following must remain internal:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- password hashes;
- refresh tokens;
- raw provider metadata unless explicitly whitelisted;
- privileged role assignment audit details;
- sensitive audit metadata;
- backend security implementation details.

---

## Implementation Notes for Later Tasks

Later implementation tasks may translate this map into:

- database migrations;
- ORM models;
- backend repositories/services;
- guards and decorators;
- current-user endpoint response models;
- Flutter auth/profile state models;
- Admin users/roles UI models.

Any implementation must preserve:

- Supabase UID to internal AIM user mapping;
- backend-owned authorization;
- backend ownership checks;
- no client-side authorization authority;
- no out-of-scope learning-product data.

---

## Done Test Review

This document satisfies P2-005 when:

- `docs/phase-2/auth-data-model-map.md` exists;
- it defines users, student profiles, admin profiles, roles, permissions, user roles, and auth audit logs;
- it makes the Supabase UID to internal user/profile/role relationship explicit;
- it keeps backend authorization and ownership checks as final authority;
- it treats Flutter/Admin role behavior as UX only;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
