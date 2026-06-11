# Phase 2 — Safe Auth Fields

## Purpose

This document defines which auth, user, profile, role, permission, and internal fields may be returned to Flutter Mobile and Admin Dashboard, and which fields must remain backend/internal only.

The goal is to prevent sensitive auth, role, permission, ownership, provider, audit, and internal metadata from leaking to clients.

This is a documentation-only task. It does not implement serializers, DTOs, database migrations, backend code, Flutter code, Admin Dashboard code, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- client-safe auth fields;
- client-safe user fields;
- client-safe profile fields;
- client-safe role fields;
- client-safe permission fields;
- admin-safe fields;
- backend/internal-only fields;
- forbidden client fields;
- safe response rules for Flutter Mobile and Admin Dashboard.

This document does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This document follows:

```text
docs/phase-1/safe-field-exposure-contract.md
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-data-model-map.md
docs/phase-2/auth-security-rules.md
packages/shared-contracts/enums/user-role-enums.md
packages/shared-contracts/api/auth-contracts.md
packages/shared-contracts/api/user-profile-contracts.md
packages/shared-contracts/api/role-permission-contracts.md
```

Core rule:

```text
Backend decides what is safe to expose.
```

Flutter Mobile and Admin Dashboard may only render backend-approved fields. They must not infer hidden/internal fields or become the security authority.

---

## General Exposure Rules

Every backend response must follow these rules:

- Return only fields required by the calling client and endpoint.
- Default to hiding fields unless explicitly marked safe.
- Never expose secrets or privileged credentials.
- Never expose raw tokens.
- Never expose service-role keys.
- Never expose database credentials.
- Never expose JWT secrets.
- Never expose raw provider metadata.
- Never expose internal audit metadata unless explicitly converted to a safe admin view.
- Never expose backend-only authorization internals that could help bypass access controls.
- Never trust Flutter/Admin field filtering as security.

---

## Field Categories

Fields are grouped into these categories:

| Category | Meaning |
|---|---|
| `client_safe` | Safe for Flutter Mobile and/or Admin Dashboard when backend-authorized |
| `admin_safe` | Safe only for Admin Dashboard after backend admin authorization |
| `internal_only` | Backend/internal only; never returned directly to clients |
| `forbidden_client` | Must never be accepted from clients as trusted input |
| `derived_ux_only` | May be returned for display/UX, but not security authority |

---

## Auth Session Fields

### Client-safe auth fields

These may be returned to clients when required:

```text
authenticated
expiresAt
sessionStatus
```

Example:

```json
{
  "authenticated": true,
  "expiresAt": "2026-06-11T00:00:00Z",
  "sessionStatus": "active"
}
```

### Internal-only auth fields

These must not be returned to Flutter Mobile or Admin Dashboard:

```text
accessToken
refreshToken
idToken
jwtSecret
tokenHash
rawJwtPayload
rawProviderSession
serviceRoleKey
```

Rules:

- Clients may hold Supabase client-managed session tokens as part of Supabase Auth SDK behavior.
- Backend API responses must not echo raw tokens.
- Backend logs must not store raw tokens.
- Auth session validation must happen server-side for protected backend routes.

---

## User Fields

### Flutter-safe user fields

Flutter Mobile may receive:

```text
user.id
user.email
user.phone
user.userType
user.status
user.createdAt
user.updatedAt
```

### Admin-safe user fields

Admin Dashboard may receive, after backend admin authorization:

```text
user.id
user.email
user.phone
user.userType
user.status
user.createdAt
user.updatedAt
user.lastLoginAt
```

### Internal-only user fields

These must not be returned directly to clients:

```text
user.supabaseAuthUid
user.rawProviderMetadata
user.passwordHash
user.refreshToken
user.internalNotes
user.deletedAt when unsafe
user.securityFlags
user.serviceRoleKey
```

### Forbidden client-submitted user fields

Clients must not be trusted to submit these as authority:

```text
user.id
user.supabaseAuthUid
user.userType
user.status
user.roles
user.permissions
user.securityFlags
```

Rules:

- `user.id` returned by backend is safe as an identifier, but client-submitted `user.id` is not proof of identity.
- `userType` is display/contract state only; backend roles/permissions remain final authority.
- Disabled/deleted users must be blocked by backend authorization logic.

---

## Student Profile Fields

### Flutter-safe student profile fields

Flutter Mobile may receive after ownership validation:

```text
studentProfile.id
studentProfile.userId
studentProfile.profileType
studentProfile.displayName
studentProfile.avatarUrl
studentProfile.preferredLanguage
studentProfile.timezone
studentProfile.createdAt
studentProfile.updatedAt
```

### Internal-only student profile fields

These must not be returned directly to normal Flutter users:

```text
studentProfile.internalNotes
studentProfile.adminFlags
studentProfile.reviewFlags
studentProfile.deletedAt when unsafe
studentProfile.auditMetadata
```

### Forbidden client-submitted student profile fields

Clients must not be trusted to submit:

```text
studentProfile.id
studentProfile.userId
studentProfile.profileType
studentProfile.createdAt
studentProfile.updatedAt
studentProfile.internalNotes
studentProfile.adminFlags
studentProfile.reviewFlags
```

Rules:

- Backend must verify profile ownership before returning or updating profile data.
- A client-submitted `studentProfile.id` does not prove ownership.
- Profile update payloads must be limited to safe editable fields.

---

## Admin Profile Fields

### Admin-safe admin profile fields

Admin Dashboard may receive after backend admin authorization:

```text
adminProfile.id
adminProfile.userId
adminProfile.profileType
adminProfile.displayName
adminProfile.avatarUrl
adminProfile.department
adminProfile.createdAt
adminProfile.updatedAt
```

### Internal-only admin profile fields

These must not be returned directly unless a later admin-only audit contract explicitly allows a safe subset:

```text
adminProfile.internalNotes
adminProfile.privilegedNotes
adminProfile.securityFlags
adminProfile.deletedAt when unsafe
adminProfile.auditMetadata
```

### Forbidden client-submitted admin profile fields

Admin clients must not be trusted to submit:

```text
adminProfile.id
adminProfile.userId
adminProfile.profileType
adminProfile.createdAt
adminProfile.updatedAt
adminProfile.securityFlags
adminProfile.privilegedNotes
```

Rules:

- Admin profile existence does not grant admin authority.
- Admin authority must be checked through backend roles/permissions.
- Admin Dashboard route guards are UX only, not the security boundary.

---

## Role Fields

### Client-safe role fields

Flutter Mobile and Admin Dashboard may receive backend-approved role display fields:

```text
role.id
role.key
role.name
role.description
role.isSystem
```

### Admin-safe role fields

Admin Dashboard may additionally receive after backend admin authorization:

```text
role.createdAt
role.updatedAt
```

### Internal-only role fields

These must not be returned directly:

```text
role.internalNotes
role.securityFlags
role.deletedAt when unsafe
role.auditMetadata
```

### Forbidden client-submitted role fields

Clients must not be trusted to submit these as authority:

```text
role.id
role.key as proof of authority
role.isSystem
role.securityFlags
```

Rules:

- Role values returned to clients are display/UX state.
- Backend must validate role changes.
- Clients must not assign or mutate roles directly without backend-protected endpoints.

---

## Permission Fields

### Client-safe permission fields

Flutter Mobile and Admin Dashboard may receive backend-approved permission display fields:

```text
permission.id
permission.key
permission.scope
permission.description
```

### Admin-safe permission fields

Admin Dashboard may additionally receive after backend admin authorization:

```text
permission.createdAt
permission.updatedAt
```

### Internal-only permission fields

These must not be returned directly:

```text
permission.internalNotes
permission.securityFlags
permission.deletedAt when unsafe
permission.auditMetadata
```

### Forbidden client-submitted permission fields

Clients must not be trusted to submit:

```text
permission.id
permission.key as proof of authority
permission.scope as proof of authority
permission.securityFlags
```

Rules:

- Permission keys may be displayed for UX.
- Backend must enforce actual permission checks.
- Client-side permission checks are UX only.

---

## User Role Assignment Fields

### Admin-safe assignment fields

Admin Dashboard may receive after backend authorization:

```text
userRoleAssignment.id
userRoleAssignment.userId
userRoleAssignment.roleId
userRoleAssignment.roleKey
userRoleAssignment.status
userRoleAssignment.assignedAt
userRoleAssignment.revokedAt
```

### Internal-only assignment fields

These must not be returned directly:

```text
userRoleAssignment.assignedByInternalId when unsafe
userRoleAssignment.revokedByInternalId when unsafe
userRoleAssignment.auditMetadata
userRoleAssignment.internalNotes
```

### Forbidden client-submitted assignment fields

Clients must not be trusted to submit:

```text
userRoleAssignment.id
userRoleAssignment.status
userRoleAssignment.assignedAt
userRoleAssignment.revokedAt
userRoleAssignment.assignedByInternalId
userRoleAssignment.revokedByInternalId
```

Rules:

- Backend must decide assignment status.
- Revoked assignments must not grant access.
- Role changes must be auditable with safe metadata.

---

## Audit and Logging Fields

### Admin-safe audit fields

Admin Dashboard may receive a safe audit summary only if backend-authorized:

```text
audit.id
audit.eventType
audit.actorUserId
audit.targetUserId
audit.createdAt
audit.safeMetadata
```

### Internal-only audit fields

These must not be returned directly:

```text
audit.rawRequestHeaders
audit.rawAuthorizationHeader
audit.rawAccessToken
audit.rawRefreshToken
audit.rawJwtPayload
audit.ipAddress when policy treats it as internal
audit.userAgent when policy treats it as internal
audit.internalMetadata
audit.securityInvestigationNotes
```

Rules:

- Audit logs must not contain raw tokens.
- Audit logs must not expose privileged credentials.
- Safe metadata must be minimized and reviewed before exposure.

---

## Provider and Supabase Fields

### Internal-only provider fields

These must not be returned to clients:

```text
supabaseAuthUid
providerUserId
rawProviderMetadata
rawAppMetadata
rawUserMetadata
serviceRoleKey
anonKey when not intended for that surface
databaseUrl
jwtSecret
supabaseProjectRef when unsafe
```

Rules:

- Supabase public/anon configuration may be handled separately by app configuration.
- Supabase service-role keys must remain backend/server-only.
- Backend must not return provider internals in user/profile responses.

---

## Flutter Mobile Exposure Rules

Flutter Mobile may receive:

```text
current user safe fields
own student profile safe fields
backend-approved roles for UX
backend-approved permissions for UX
safe auth error codes
```

Flutter Mobile must not receive:

```text
serviceRoleKey
databaseUrl
jwtSecret
rawProviderMetadata
raw tokens echoed from backend
internal audit metadata
admin-only profile data without backend approval
authorization bypass flags
```

Flutter Mobile must not submit trusted:

```text
userId as identity proof
roleKey as authority proof
permissionKey as authority proof
ownership fields
status fields
security flags
```

---

## Admin Dashboard Exposure Rules

Admin Dashboard may receive backend-authorized:

```text
safe user fields
safe admin profile fields
safe role fields
safe permission fields
safe assignment fields
safe audit summaries
```

Admin Dashboard must not receive:

```text
serviceRoleKey
databaseUrl
jwtSecret
raw refresh tokens
raw access tokens
raw provider metadata
security bypass flags
privileged backend config
```

Admin Dashboard must not submit trusted:

```text
role changes without backend authorization
permission changes without backend authorization
user status changes without backend authorization
ownership changes without backend authorization
security flags
```

---

## Backend Serialization Rules

Backend serializers/DTOs, when implemented later, must:

- explicitly select client-safe fields;
- never serialize whole database records by default;
- never return raw provider records;
- never return raw auth/session objects;
- never return internal audit metadata by default;
- use separate safe shapes for Flutter and Admin Dashboard where needed;
- enforce backend authorization before serialization.

---

## Safe Update Payload Rules

Profile update payloads may include only explicitly safe editable fields.

Safe student profile update fields:

```text
displayName
avatarUrl
preferredLanguage
timezone
```

Safe admin profile update fields:

```text
displayName
avatarUrl
department
```

Forbidden update payload fields:

```text
id
userId
supabaseAuthUid
userType
profileType
status
roles
permissions
securityFlags
serviceRoleKey
databaseUrl
jwtSecret
createdAt
updatedAt
deletedAt
```

Rules:

- Backend must reject or ignore forbidden fields.
- Backend must verify ownership or admin permission before applying updates.
- Backend must not rely on frontend filtering.

---

## Done Test Review

This document satisfies P2-011 when:

- `docs/phase-2/safe-auth-fields.md` exists;
- it defines which auth/user/profile/role/permission fields can be returned to Flutter Mobile;
- it defines which auth/user/profile/role/permission fields can be returned to Admin Dashboard;
- it defines which fields must remain backend/internal only;
- it defines forbidden client-submitted fields;
- it prevents sensitive auth, role, and internal metadata from leaking to clients;
- it keeps backend authorization as final authority;
- it treats Flutter/Admin UI role behavior as UX only;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
