# Phase 2 — Role and Permission Contracts

## Purpose

This document defines the shared contracts for roles, permissions, role assignment, and role change responses.

The goal is to prepare a consistent RBAC foundation for the Backend API and Admin Dashboard while keeping backend authorization as the final authority.

This is a shared contracts documentation file. It does not implement backend code, admin dashboard code, Flutter code, database migrations, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- role contract;
- permission contract;
- role-permission mapping contract;
- user-role assignment contract;
- role assignment request/response contracts;
- role change response contracts;
- safe RBAC field exposure;
- backend/admin dashboard RBAC boundaries.

This document does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This contract follows:

```text
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-data-model-map.md
docs/phase-2/auth-security-rules.md
packages/shared-contracts/enums/user-role-enums.md
packages/shared-contracts/api/auth-contracts.md
packages/shared-contracts/api/user-profile-contracts.md
```

Core rule:

```text
Roles and permissions are backend-owned authorization data.
```

Admin Dashboard may render and submit RBAC requests, but the backend must validate and enforce all role and permission changes.

---

## RBAC Principles

Phase 2 RBAC contracts must preserve these principles:

- roles are backend-owned;
- permissions are backend-owned;
- users do not grant themselves roles;
- clients do not become authorization authority;
- missing permission denies access;
- role and permission changes must be auditable;
- system roles must be protected from unsafe mutation;
- service-role keys and privileged credentials must never be exposed.

---

## Role Contract

`Role` represents a backend-owned role definition.

### Shape

```json
{
  "id": "role_123",
  "key": "admin",
  "name": "Admin",
  "description": "Administrative user role",
  "isSystem": true,
  "createdAt": "2026-06-11T00:00:00Z",
  "updatedAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | Role ID |
| `key` | string | yes | Shared role key |
| `name` | string | yes | Display-safe role name |
| `description` | string/null | no | Safe role description |
| `isSystem` | boolean | yes | Whether role is protected/system-owned |
| `createdAt` | string | yes | ISO timestamp |
| `updatedAt` | string | yes | ISO timestamp |

### Rules

- `key` must use the shared role enum values.
- `isSystem = true` roles must be protected from unsafe mutation/deletion.
- Role existence does not bypass backend permission checks.
- Admin Dashboard may display roles only after backend authorization.

---

## Permission Contract

`Permission` represents a backend-owned permission definition.

### Shape

```json
{
  "id": "perm_123",
  "key": "users.manage",
  "scope": "users",
  "description": "Manage user records",
  "createdAt": "2026-06-11T00:00:00Z",
  "updatedAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | Permission ID |
| `key` | string | yes | Shared permission key |
| `scope` | string | yes | Shared permission scope |
| `description` | string/null | no | Safe permission description |
| `createdAt` | string | yes | ISO timestamp |
| `updatedAt` | string | yes | ISO timestamp |

### Rules

- `key` must use stable shared permission keys.
- `scope` is for grouping and UX only.
- Backend must enforce full permission keys.
- Clients must not infer authorization from scope alone.

---

## RolePermission Contract

`RolePermission` represents a permission attached to a role.

### Shape

```json
{
  "roleId": "role_123",
  "permissionId": "perm_123",
  "roleKey": "admin",
  "permissionKey": "users.manage",
  "createdAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `roleId` | string | yes | Role ID |
| `permissionId` | string | yes | Permission ID |
| `roleKey` | string | yes | Safe denormalized role key |
| `permissionKey` | string | yes | Safe denormalized permission key |
| `createdAt` | string | yes | ISO timestamp |

### Rules

- Role-permission mapping changes require backend authorization.
- Admin Dashboard may submit requested changes only.
- Backend must validate all role and permission IDs/keys.
- Backend must record safe audit events for changes.

---

## UserRoleAssignment Contract

`UserRoleAssignment` represents a role assigned to a user.

### Shape

```json
{
  "id": "user_role_123",
  "userId": "usr_123",
  "roleId": "role_123",
  "roleKey": "admin",
  "status": "active",
  "assignedAt": "2026-06-11T00:00:00Z",
  "revokedAt": null
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | User-role assignment ID |
| `userId` | string | yes | Internal AIM user ID |
| `roleId` | string | yes | Role ID |
| `roleKey` | string | yes | Safe denormalized role key |
| `status` | string | yes | Assignment status enum |
| `assignedAt` | string | yes | ISO timestamp |
| `revokedAt` | string/null | no | ISO timestamp when revoked |

### Rules

- Active assignments may contribute to backend authorization.
- Revoked assignments must not grant access.
- Users must not assign roles to themselves.
- Role assignment changes require backend admin authorization.

---

## RoleWithPermissions Contract

`RoleWithPermissions` is used when role details need attached permissions.

### Shape

```json
{
  "role": {
    "id": "role_123",
    "key": "admin",
    "name": "Admin",
    "description": "Administrative user role",
    "isSystem": true,
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  },
  "permissions": [
    {
      "id": "perm_123",
      "key": "users.manage",
      "scope": "users",
      "description": "Manage user records",
      "createdAt": "2026-06-11T00:00:00Z",
      "updatedAt": "2026-06-11T00:00:00Z"
    }
  ]
}
```

Rules:

- Use this shape for backend-approved admin role detail views.
- Backend must authorize access before returning this data.
- Permission list is UX/display data on the client.

---

## AssignUserRoleRequest

Request shape for assigning a role to a user.

### Shape

```json
{
  "userId": "usr_123",
  "roleKey": "admin"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `userId` | string | yes | Target internal AIM user ID |
| `roleKey` | string | yes | Shared role key to assign |

### Rules

- Backend must validate `userId`.
- Backend must validate `roleKey`.
- Backend must verify caller has permission to assign roles.
- Backend must prevent unsafe self-grant flows.
- Backend must protect system roles from unsafe assignment rules if needed.

---

## RevokeUserRoleRequest

Request shape for revoking a user role.

### Shape

```json
{
  "userId": "usr_123",
  "roleKey": "admin"
}
```

Rules:

- Backend must validate the assignment exists.
- Backend must verify caller has permission to revoke roles.
- Backend must prevent users from removing protective/system constraints unsafely.
- Backend must record safe audit event metadata.

---

## UpdateRolePermissionsRequest

Request shape for replacing or updating role permissions.

### Shape

```json
{
  "roleKey": "admin",
  "permissionKeys": [
    "users.read",
    "users.manage",
    "roles.read",
    "roles.manage"
  ]
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `roleKey` | string | yes | Target role key |
| `permissionKeys` | string[] | yes | Permission keys to attach |

### Rules

- Backend must validate every permission key.
- Backend must verify caller has permission to manage role permissions.
- Backend must protect system roles from unsafe mutation.
- Backend must record safe audit events.
- Clients must not treat submitted permission keys as immediately effective until backend response confirms success.

---

## RoleChangeResponse

Response shape for role assignment or revocation changes.

### Shape

```json
{
  "changed": true,
  "assignment": {
    "id": "user_role_123",
    "userId": "usr_123",
    "roleId": "role_123",
    "roleKey": "admin",
    "status": "active",
    "assignedAt": "2026-06-11T00:00:00Z",
    "revokedAt": null
  }
}
```

Rules:

- `changed` indicates whether backend state changed.
- `assignment` must contain client-safe fields only.
- Backend remains final authority for whether the assignment is valid.

---

## RolePermissionChangeResponse

Response shape for role-permission changes.

### Shape

```json
{
  "changed": true,
  "role": {
    "id": "role_123",
    "key": "admin",
    "name": "Admin",
    "description": "Administrative user role",
    "isSystem": true,
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  },
  "permissions": [
    {
      "id": "perm_123",
      "key": "users.manage",
      "scope": "users",
      "description": "Manage user records",
      "createdAt": "2026-06-11T00:00:00Z",
      "updatedAt": "2026-06-11T00:00:00Z"
    }
  ]
}
```

Rules:

- Return backend-approved role state after mutation.
- Return safe fields only.
- Do not expose internal audit metadata or privileged backend config.

---

## RBAC Error Codes

Recommended role/permission error codes:

```text
RBAC_ROLE_NOT_FOUND
RBAC_PERMISSION_NOT_FOUND
RBAC_ASSIGNMENT_NOT_FOUND
RBAC_ASSIGNMENT_FORBIDDEN
RBAC_PERMISSION_FORBIDDEN
RBAC_SYSTEM_ROLE_PROTECTED
RBAC_VALIDATION_FAILED
```

| Code | Meaning |
|---|---|
| `RBAC_ROLE_NOT_FOUND` | Requested role does not exist |
| `RBAC_PERMISSION_NOT_FOUND` | Requested permission does not exist |
| `RBAC_ASSIGNMENT_NOT_FOUND` | Requested user-role assignment does not exist |
| `RBAC_ASSIGNMENT_FORBIDDEN` | Caller cannot assign/revoke requested role |
| `RBAC_PERMISSION_FORBIDDEN` | Caller cannot change requested permission mapping |
| `RBAC_SYSTEM_ROLE_PROTECTED` | System role mutation is blocked |
| `RBAC_VALIDATION_FAILED` | Request shape or enum values are invalid |

Rules:

- Error responses must be safe.
- Error responses must not expose privileged internals.
- Backend may log safe audit metadata separately.

---

## Safe Field Exposure

Client-safe RBAC fields:

```text
Role.id
Role.key
Role.name
Role.description
Role.isSystem
Role.createdAt
Role.updatedAt
Permission.id
Permission.key
Permission.scope
Permission.description
Permission.createdAt
Permission.updatedAt
UserRoleAssignment.id
UserRoleAssignment.userId
UserRoleAssignment.roleId
UserRoleAssignment.roleKey
UserRoleAssignment.status
UserRoleAssignment.assignedAt
UserRoleAssignment.revokedAt
```

Internal-only RBAC fields:

```text
serviceRoleKey
databaseUrl
jwtSecret
rawProviderMetadata
internalAuditMetadata
privilegedAdminNotes
securityBypassFlags
```

Rules:

- Never expose secrets or privileged credentials.
- Never expose backend-only bypass flags.
- Never expose internal audit metadata directly to unauthorized clients.

---

## Backend Contract Rules

Backend must:

- validate caller identity;
- verify caller has required role/permission;
- validate role keys and permission keys;
- protect system roles;
- enforce assignment status;
- deny missing permissions;
- record safe audit events for changes.

Backend must not:

- trust client-submitted roles as authority;
- trust client-submitted permissions as authority;
- allow self-grant of privileged roles;
- expose secrets or privileged credentials.

---

## Admin Dashboard Contract Rules

Admin Dashboard may:

- render backend-approved role and permission lists;
- submit role assignment requests;
- submit role revocation requests;
- submit role-permission update requests;
- display backend-approved role change responses.

Admin Dashboard must not:

- directly mutate privileged database records;
- store service-role keys;
- rely only on frontend route guards;
- become the final RBAC authority.

---

## Flutter Mobile Contract Rules

Flutter Mobile may:

- receive current-user roles and permissions from backend-approved auth context;
- render UX based on backend-approved roles/permissions.

Flutter Mobile must not:

- assign roles;
- mutate permissions;
- become the authorization authority;
- store privileged credentials.

---

## Done Test Review

This document satisfies P2-010 when:

- `packages/shared-contracts/api/role-permission-contracts.md` exists;
- it defines role contracts;
- it defines permission contracts;
- it defines role-permission mapping contracts;
- it defines user-role assignment contracts;
- it defines role assignment and revocation request/response contracts;
- it defines role-permission change response contracts;
- it prepares a consistent RBAC foundation for backend and admin dashboard;
- it keeps backend authorization as final authority;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
