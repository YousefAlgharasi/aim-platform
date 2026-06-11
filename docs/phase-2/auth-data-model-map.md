# Phase 2 — Auth Data Model Map

## Purpose

This document maps the Phase 2 authentication, user, profile, role, permission, and ownership data model for the AIM Platform.

It defines how authenticated identity from Supabase Auth connects to AIM backend/database records and how those records support authorization decisions.

This is a documentation-only task. It does not create database tables, migrations, backend code, Flutter code, or admin dashboard code.

---

## Scope

This document covers only Phase 2 identity and authorization foundations:

- external auth identity;
- internal AIM user record;
- user profile;
- roles;
- permissions;
- user-role assignment;
- role-permission mapping;
- ownership rules;
- audit/security metadata.

It does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, AI Teacher, or Student Web App.

---

## Source of Truth Reference

This data model map follows:

```text
docs/phase-2/auth-source-of-truth.md
```

The core rule is:

```text
Supabase Auth user id -> AIM backend/database user record
```

Supabase Auth owns external authentication identity.

The backend/database owns internal AIM identity, roles, permissions, profiles, and ownership.

---

## Core Entities

### 1. Supabase Auth User

The Supabase Auth user represents the external authenticated identity.

This identity is managed by Supabase Auth and should not be duplicated as the sole application authority.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `auth_user_id` | Supabase Auth user ID | Safe when needed |
| `email` | Auth email, if enabled | Safe when needed |
| `phone` | Auth phone, if enabled | Safe when needed |
| `created_at` | Auth creation timestamp | Usually internal |
| `last_sign_in_at` | Last sign-in timestamp | Usually internal |
| provider metadata | OAuth/provider metadata | Internal unless explicitly whitelisted |

The backend must validate the authenticated identity before mapping it to an AIM user.

---

### 2. AIM User

The AIM user is the internal application user record.

It is the primary AIM-side identity used by backend authorization.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Internal AIM user ID | Safe |
| `auth_user_id` | Supabase Auth user ID mapping | Safe only when needed |
| `email` | Normalized email when needed | Safe when needed |
| `phone` | Normalized phone when needed | Safe when needed |
| `status` | User status such as active/disabled | Safe when needed |
| `created_at` | Record creation timestamp | Usually safe |
| `updated_at` | Record update timestamp | Usually safe |
| `deleted_at` | Soft-delete timestamp if used | Internal |
| `metadata` | Internal operational metadata | Internal |

Rules:

- `auth_user_id` must map to the authenticated provider UID.
- The client must not invent or override the internal user ID.
- Backend validation must resolve the current user from the authenticated UID.
- Disabled or deleted users must not receive privileged access.

---

### 3. User Profile

The user profile stores user-facing profile information.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Profile ID | Safe |
| `user_id` | Owner AIM user ID | Safe when needed |
| `display_name` | Display name | Safe |
| `avatar_url` | Avatar URL | Safe |
| `preferred_language` | UI/content language preference | Safe |
| `timezone` | User timezone | Safe when needed |
| `created_at` | Profile creation timestamp | Usually safe |
| `updated_at` | Profile update timestamp | Usually safe |
| internal notes | Admin/internal profile notes | Internal |

Rules:

- A normal user may access only their own profile.
- Profile access must be enforced by backend ownership checks.
- Admin access requires backend-approved role or permission checks.
- Flutter may render profile data returned by the backend only.

---

### 4. Role

A role groups permissions for authorization.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Role ID | Usually internal |
| `key` | Stable role key, such as `admin` | Safe when backend-approved |
| `name` | Display role name | Safe when backend-approved |
| `description` | Role description | Safe when backend-approved |
| `is_system` | Whether role is protected/system-defined | Internal |
| `created_at` | Creation timestamp | Internal |
| `updated_at` | Update timestamp | Internal |

Rules:

- Roles are backend-owned.
- The client must not assign roles.
- Role assignment requires backend admin authorization.
- Client role display is UX-only.

---

### 5. Permission

A permission represents a specific allowed action or capability.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Permission ID | Internal |
| `key` | Stable permission key | Safe when backend-approved |
| `description` | Permission description | Safe when backend-approved |
| `scope` | Area protected by the permission | Safe when backend-approved |
| `created_at` | Creation timestamp | Internal |
| `updated_at` | Update timestamp | Internal |

Example permission keys:

```text
users.read
users.manage
roles.read
roles.manage
profiles.read.any
profiles.update.any
profiles.read.own
profiles.update.own
```

Rules:

- Permissions are backend-owned.
- Permission checks must be enforced by backend guards or equivalent backend authorization.
- Flutter/Admin may only render permissions that the backend intentionally exposes for UX.

---

### 6. User Role Assignment

User-role assignment links AIM users to roles.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Assignment ID | Internal |
| `user_id` | AIM user receiving the role | Internal or admin-only |
| `role_id` | Assigned role | Internal or admin-only |
| `assigned_by` | AIM user/admin who assigned role | Internal |
| `created_at` | Assignment timestamp | Internal |

Rules:

- Only backend-authorized admin users may assign roles.
- Users may not assign roles to themselves.
- Flutter/Admin UI role changes are requests to backend only.
- Backend must validate the caller’s role/permission before changing assignments.

---

### 7. Role Permission Mapping

Role-permission mapping links roles to permissions.

Representative fields:

| Field | Description | Client-safe? |
|---|---|---|
| `id` | Mapping ID | Internal |
| `role_id` | Role reference | Internal |
| `permission_id` | Permission reference | Internal |
| `created_at` | Mapping timestamp | Internal |

Rules:

- Role-permission mappings are backend-owned.
- Clients must not mutate permission mappings directly.
- Any admin UI action must call a backend endpoint protected by admin permission checks.

---

### 8. Ownership Record

Ownership may be represented directly by `user_id` fields on owned resources or through dedicated ownership records where needed.

For Phase 2, the main ownership case is profile ownership.

Representative ownership fields:

| Field | Description |
|---|---|
| `resource_type` | Example: `profile` |
| `resource_id` | Owned resource ID |
| `owner_user_id` | AIM user who owns the resource |
| `created_at` | Ownership creation timestamp |

Rules:

- Ownership must be checked by backend.
- A client-provided resource ID does not prove ownership.
- Admin override requires backend role or permission checks.

---

## Relationship Map

```text
Supabase Auth User
  auth_user_id
        |
        v
AIM User
  id
  auth_user_id
        |
        +--> User Profile
        |      user_id
        |
        +--> User Role Assignment
               user_id
               role_id
                    |
                    v
                  Role
                    |
                    v
            Role Permission Mapping
                    |
                    v
                Permission
```

---

## Authorization Flow

For a protected request:

1. Client sends authenticated request.
2. Backend validates Supabase Auth token/session.
3. Backend extracts authenticated `auth_user_id`.
4. Backend resolves internal AIM user by `auth_user_id`.
5. Backend checks user status.
6. Backend checks required ownership, role, or permission.
7. Backend returns only safe response fields.
8. Backend denies access when any required check fails.

---

## Current User Data Shape

A safe current-user response may include:

```json
{
  "user": {
    "id": "aim_user_id",
    "email": "user@example.com",
    "status": "active"
  },
  "profile": {
    "id": "profile_id",
    "displayName": "User Name",
    "avatarUrl": null,
    "preferredLanguage": "en"
  },
  "roles": [
    "student"
  ],
  "permissions": [
    "profiles.read.own",
    "profiles.update.own"
  ]
}
```

This response is illustrative only.

Final API shapes must be defined by endpoint implementation tasks.

---

## Internal-Only Data

The following data must remain internal unless a later task explicitly permits a safe subset:

- service-role keys;
- database credentials;
- JWT signing secrets;
- auth provider raw metadata;
- refresh tokens;
- password hashes;
- internal role assignment audit data;
- privileged admin metadata;
- deleted/disabled internal flags where unsafe;
- backend security implementation details.

---

## Flutter Boundary

Flutter Mobile may store and render:

- client-safe session state;
- current user response from backend;
- profile summary from backend;
- backend-approved role or permission labels for UX.

Flutter Mobile must not:

- become the source of truth for roles;
- become the source of truth for permissions;
- assign roles directly;
- calculate authorization locally;
- access service-role keys;
- bypass backend ownership checks.

---

## Admin Dashboard Boundary

Admin Dashboard may render backend-approved users, roles, and permissions.

Admin Dashboard must not:

- directly mutate database role mappings without backend checks;
- store service-role keys;
- become the final authorization authority;
- expose internal-only metadata to unauthorized admins;
- implement broader dashboard recommendation, onboarding, placement, lesson, or AIM integration work.

---

## Phase 2 Out-of-Scope Data

This map does not define data models for:

- onboarding;
- placement;
- lessons;
- practice;
- sessions;
- AIM integration;
- recommendations;
- retention;
- progress reports;
- AI Teacher;
- Student Web App.

Those data models must not be introduced by Phase 2 auth tasks.

---

## Done Criteria

This data model map is complete when it clearly defines:

- Supabase Auth user as external identity;
- AIM user as internal application identity;
- profile ownership relationship;
- role and permission relationship;
- user-role assignment;
- role-permission mapping;
- backend authorization flow;
- client-safe versus internal-only field boundaries;
- Flutter/Admin boundaries;
- out-of-scope Phase 2 exclusions.
