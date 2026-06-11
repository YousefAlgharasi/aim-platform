# Phase 2 — Auth API Map

## Purpose

This document defines the required Phase 2 API endpoints for authentication, users, profiles, roles, permissions, and admin user management in the AIM Platform.

The goal is to prevent random, duplicated, or inconsistent endpoint design during implementation.

This is a documentation-only task. It does not implement endpoints, database migrations, backend guards, Flutter screens, or admin dashboard behavior.

---

## Scope

This API map is limited to Phase 2:

- authentication session/current-user endpoints;
- internal user identity endpoints;
- profile endpoints;
- role endpoints;
- permission endpoints;
- user-role assignment endpoints;
- admin user management endpoints;
- backend authorization and ownership expectations for each endpoint group.

This document does not define APIs for onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, review/retention, progress reports, AI Teacher, or Student Web App.

---

## Source of Truth

This API map follows:

```text
docs/phase-2/auth-source-of-truth.md
```

Core rules:

- Supabase Auth is the external authentication identity provider.
- The backend/database user record is the AIM application identity source.
- Backend authorization is final.
- Flutter Mobile and Admin Dashboard are UX clients only.
- Roles, permissions, ownership, and admin access must be enforced by backend checks.
- No endpoint may expose service-role keys, database credentials, JWT secrets, AI provider keys, or privileged backend credentials.

---

## API Design Principles

All Phase 2 protected endpoints must:

1. validate the authenticated Supabase Auth token/session;
2. resolve the internal AIM user from the authenticated provider UID;
3. verify user status when relevant;
4. enforce ownership, role, or permission checks in the backend;
5. return only client-safe data;
6. reject unauthorized access even if the client UI claims the user has access.

Frontend route guards and local role checks are UX-only.

---

## Endpoint Groups

The Phase 2 API surface is organized into these groups:

| Group | Purpose |
|---|---|
| Auth | Current session/current user and logout-adjacent backend support |
| Users | Internal AIM user identity records |
| Profiles | User-owned profile data |
| Roles | Backend-owned role definitions |
| Permissions | Backend-owned permission definitions |
| User Roles | Assigning/removing roles from users |
| Admin Users | Admin-facing user management foundation |

---

## Auth Endpoints

### `GET /auth/me`

Returns the backend-approved current user context.

Purpose:

- resolve the authenticated Supabase Auth user into the internal AIM user;
- return safe identity, profile, roles, and permissions needed by Flutter/Admin UX.

Auth:

```text
Authenticated user
```

Backend checks:

- validate Supabase Auth token/session;
- map authenticated provider UID to AIM user;
- verify user is active/allowed;
- load backend-approved profile/roles/permissions.

May return:

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

Must not return:

- service-role keys;
- database credentials;
- JWT signing secrets;
- refresh tokens;
- raw provider metadata;
- internal security implementation details.

---

### `POST /auth/sync-user`

Ensures an authenticated Supabase Auth identity has a corresponding internal AIM user record.

Purpose:

- create or reconcile the internal AIM user after successful authentication;
- keep Supabase Auth UID mapped to the AIM user record.

Auth:

```text
Authenticated user
```

Backend checks:

- validate Supabase Auth token/session;
- use authenticated UID from backend verification only;
- do not trust client-supplied UID;
- create/update only safe user fields.

Notes:

- This endpoint must not assign privileged roles by default.
- Role assignment must remain backend/admin controlled.
- Exact idempotency behavior can be defined in implementation tasks.

---

### `POST /auth/logout`

Optional backend-side logout/session cleanup endpoint if needed by implementation.

Purpose:

- support backend-side cleanup or audit logging for logout events when required.

Auth:

```text
Authenticated user
```

Backend checks:

- validate authenticated user when required;
- do not expose tokens or secrets.

Notes:

- Supabase client-side sign-out may still be used by Flutter.
- This endpoint exists only if backend-side logout tracking is needed.

---

## User Endpoints

### `GET /users/me`

Returns the current authenticated AIM user record.

Auth:

```text
Authenticated user
```

Backend checks:

- validate token/session;
- resolve AIM user from authenticated UID;
- return only the caller’s own user record unless an admin endpoint is used.

---

### `GET /users/:id`

Returns a user by internal AIM user ID.

Auth:

```text
Authenticated user with backend-approved permission
```

Required permission examples:

```text
users.read
users.manage
```

Backend checks:

- validate authenticated user;
- verify required role/permission;
- do not allow normal users to read arbitrary users.

---

### `PATCH /users/:id/status`

Updates user status, such as active/disabled.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.manage
```

Backend checks:

- validate authenticated admin;
- verify backend role/permission;
- prevent unsafe self-lockout behavior if required by implementation;
- audit who changed the status.

---

## Profile Endpoints

### `GET /profiles/me`

Returns the current user’s own profile.

Auth:

```text
Authenticated user
```

Backend checks:

- validate authenticated user;
- resolve AIM user;
- return only the profile owned by the current user.

---

### `PATCH /profiles/me`

Updates the current user’s own profile.

Auth:

```text
Authenticated user
```

Backend checks:

- validate authenticated user;
- resolve AIM user;
- update only allowed profile fields;
- prevent updates to ownership, roles, permissions, or privileged metadata.

Allowed fields may include:

```text
display_name
avatar_url
preferred_language
timezone
```

---

### `GET /profiles/:id`

Returns a profile by profile ID.

Auth:

```text
Owner or admin with backend-approved permission
```

Backend checks:

- validate authenticated user;
- allow if current user owns the profile;
- otherwise require admin permission such as `profiles.read.any`;
- deny access when ownership/permission is missing.

---

### `PATCH /profiles/:id`

Updates a profile by profile ID.

Auth:

```text
Owner or admin with backend-approved permission
```

Backend checks:

- validate authenticated user;
- allow owner updates only for safe fields;
- require admin permission such as `profiles.update.any` for broader access;
- deny client attempts to change ownership directly.

---

## Role Endpoints

### `GET /roles`

Lists backend-approved roles.

Auth:

```text
Admin user or backend-approved permission
```

Required permission examples:

```text
roles.read
roles.manage
```

Backend checks:

- validate authenticated user;
- verify role/permission;
- return only safe role fields.

---

### `POST /roles`

Creates a role.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- prevent duplicate role keys;
- protect system roles from unsafe mutation.

---

### `PATCH /roles/:id`

Updates a role.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- protect system roles;
- update only allowed role fields.

---

### `DELETE /roles/:id`

Deletes or disables a role if implementation allows deletion.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- prevent deletion of protected system roles;
- prevent breaking required admin access.

---

## Permission Endpoints

### `GET /permissions`

Lists backend-approved permissions.

Auth:

```text
Admin user or backend-approved permission
```

Required permission examples:

```text
permissions.read
permissions.manage
```

Backend checks:

- validate authenticated user;
- verify backend role/permission;
- return safe permission metadata only.

---

### `GET /roles/:roleId/permissions`

Lists permissions attached to a role.

Auth:

```text
Admin user or backend-approved permission
```

Required permission examples:

```text
roles.read
permissions.read
```

Backend checks:

- validate authenticated user;
- verify backend permission;
- return only safe permission fields.

---

### `PUT /roles/:roleId/permissions`

Replaces or updates permissions attached to a role.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
permissions.manage
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- protect system roles/permissions;
- reject unknown permission keys;
- audit the change.

---

## User Role Assignment Endpoints

### `GET /users/:id/roles`

Lists roles assigned to a user.

Auth:

```text
Admin user or backend-approved permission
```

Required permission examples:

```text
users.read
roles.read
```

Backend checks:

- validate authenticated user;
- verify backend permission;
- normal users must not inspect arbitrary users’ roles unless explicitly allowed.

---

### `PUT /users/:id/roles`

Replaces or updates roles assigned to a user.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.manage
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- prevent users assigning roles to themselves unless explicitly allowed by protected backend logic;
- prevent removal of the last required admin if implementation needs that safeguard;
- audit who changed the assignment.

---

### `POST /users/:id/roles/:roleId`

Assigns one role to a user.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.manage
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- reject invalid user/role IDs;
- audit the assignment.

---

### `DELETE /users/:id/roles/:roleId`

Removes one role from a user.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.manage
roles.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- protect required admin access;
- audit the removal.

---

## Admin User Management Endpoints

### `GET /admin/users`

Lists users for admin management.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.read
users.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- support safe filtering/pagination in later implementation;
- return safe admin-facing user fields only.

---

### `GET /admin/users/:id`

Returns admin-safe details for one user.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.read
users.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- do not expose secrets, tokens, password hashes, service credentials, or unsafe provider metadata.

---

### `PATCH /admin/users/:id`

Updates admin-manageable user fields.

Auth:

```text
Admin user with backend-approved permission
```

Required permission examples:

```text
users.manage
```

Backend checks:

- validate authenticated admin;
- verify backend permission;
- update only explicitly allowed fields;
- audit the change.

---

## Endpoint Authorization Matrix

| Endpoint | Caller | Backend check |
|---|---|---|
| `GET /auth/me` | Authenticated user | Token + AIM user mapping |
| `POST /auth/sync-user` | Authenticated user | Token + authenticated UID only |
| `POST /auth/logout` | Authenticated user | Token if backend cleanup is used |
| `GET /users/me` | Authenticated user | Token + own AIM user |
| `GET /users/:id` | Admin/permissioned user | `users.read` or `users.manage` |
| `PATCH /users/:id/status` | Admin | `users.manage` |
| `GET /profiles/me` | Authenticated user | Own profile |
| `PATCH /profiles/me` | Authenticated user | Own profile + safe fields |
| `GET /profiles/:id` | Owner/admin | Ownership or `profiles.read.any` |
| `PATCH /profiles/:id` | Owner/admin | Ownership or `profiles.update.any` |
| `GET /roles` | Admin/permissioned user | `roles.read` or `roles.manage` |
| `POST /roles` | Admin | `roles.manage` |
| `PATCH /roles/:id` | Admin | `roles.manage` |
| `DELETE /roles/:id` | Admin | `roles.manage` |
| `GET /permissions` | Admin/permissioned user | `permissions.read` or `permissions.manage` |
| `GET /roles/:roleId/permissions` | Admin/permissioned user | `roles.read` or `permissions.read` |
| `PUT /roles/:roleId/permissions` | Admin | `roles.manage` and/or `permissions.manage` |
| `GET /users/:id/roles` | Admin/permissioned user | `users.read` + `roles.read` |
| `PUT /users/:id/roles` | Admin | `users.manage` + `roles.manage` |
| `POST /users/:id/roles/:roleId` | Admin | `users.manage` + `roles.manage` |
| `DELETE /users/:id/roles/:roleId` | Admin | `users.manage` + `roles.manage` |
| `GET /admin/users` | Admin | `users.read` or `users.manage` |
| `GET /admin/users/:id` | Admin | `users.read` or `users.manage` |
| `PATCH /admin/users/:id` | Admin | `users.manage` |

---

## Data Exposure Rules

Endpoints must not expose:

- Supabase service-role keys;
- database credentials;
- JWT signing secrets;
- AI provider keys;
- password hashes;
- refresh tokens;
- privileged backend credentials;
- unsafe raw provider metadata;
- internal authorization implementation details.

Endpoints may expose only the minimum client-safe data required for Flutter/Admin UX.

---

## Flutter Mobile Use

Flutter Mobile may use:

- `GET /auth/me`;
- `POST /auth/sync-user`;
- `GET /profiles/me`;
- `PATCH /profiles/me`.

Flutter Mobile must not use admin role-management APIs directly unless the authenticated backend-approved user is explicitly allowed and the backend enforces it.

Flutter route guards and local permission checks are UX only.

---

## Admin Dashboard Use

Admin Dashboard may use admin and RBAC endpoints only through backend-protected API calls.

Admin Dashboard must not:

- directly write privileged database role data;
- store service-role keys;
- become the authorization authority;
- rely only on frontend route guards.

---

## Out-of-Scope APIs

This map does not define APIs for:

- onboarding;
- placement;
- lessons;
- practice;
- sessions;
- AIM integration;
- dashboard recommendations;
- review/retention;
- progress reports;
- AI Teacher;
- Student Web App.

Those APIs must not be introduced in this Phase 2 task.

---

## Done Test Review

This document satisfies P2-004 when:

- `docs/phase-2/auth-api-map.md` exists;
- it defines required auth/user/profile/role/permission/admin user endpoints;
- it keeps backend authorization as final authority;
- it treats Flutter/Admin UI checks as UX only;
- it avoids out-of-scope Phase 2 features;
- it exposes no secrets or privileged credentials;
- it documents review notes for this documentation-only task.
