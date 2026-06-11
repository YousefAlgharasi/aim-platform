# Phase 2 — User and Profile Contracts

## Purpose

This document defines the shared contracts for `User`, `StudentProfile`, `AdminProfile`, and safe profile update payloads.

The goal is to separate account identity from student/admin profile data and keep Backend, Flutter Mobile, and Admin Dashboard aligned before implementation.

This is a shared contracts documentation file. It does not implement backend code, Flutter code, admin dashboard code, database migrations, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- internal AIM user contract;
- student profile contract;
- admin profile contract;
- safe own-profile update payload;
- safe admin profile update payload;
- profile ownership rules;
- safe client field exposure.

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
```

Core rule:

```text
Account identity is separate from student/admin profile data.
```

Backend identity, authorization, roles, permissions, and ownership checks remain the final authority.

Flutter Mobile and Admin Dashboard may render backend-approved data only.

---

## Design Principles

Phase 2 contracts must preserve these principles:

- `User` represents internal AIM account identity.
- `StudentProfile` represents student-facing profile data.
- `AdminProfile` represents admin-facing profile data.
- Profile existence does not grant authorization.
- User type and profile type do not replace backend role/permission checks.
- Safe update payloads must not allow ownership or privilege mutation.
- Clients must not submit trusted role, permission, or ownership data.

---

## User Contract

`User` represents the internal AIM user account.

It maps to a validated Supabase Auth identity through backend logic.

### Shape

```json
{
  "id": "usr_123",
  "email": "user@example.com",
  "phone": null,
  "userType": "student",
  "status": "active",
  "createdAt": "2026-06-11T00:00:00Z",
  "updatedAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | Internal AIM user ID |
| `email` | string/null | no | Safe normalized email |
| `phone` | string/null | no | Safe normalized phone |
| `userType` | string | yes | Shared `UserType` enum |
| `status` | string | yes | Shared `UserStatus` enum |
| `createdAt` | string | yes | ISO timestamp |
| `updatedAt` | string | yes | ISO timestamp |

### Rules

- `User.id` is the internal user ID used by AIM backend.
- `User` response must not expose Supabase service-role details.
- `User` response must not expose raw provider metadata.
- `User.status` must be enforced by backend authorization checks.
- Clients may render `User` fields but must not treat them as authorization authority.

---

## StudentProfile Contract

`StudentProfile` represents student-facing profile data linked to an internal AIM user.

### Shape

```json
{
  "id": "student_profile_123",
  "userId": "usr_123",
  "profileType": "student_profile",
  "displayName": "Yousef",
  "avatarUrl": null,
  "preferredLanguage": "en",
  "timezone": "Asia/Aden",
  "createdAt": "2026-06-11T00:00:00Z",
  "updatedAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | Student profile ID |
| `userId` | string | yes | Owner internal AIM user ID |
| `profileType` | string | yes | Must be `student_profile` |
| `displayName` | string/null | no | Client-safe display name |
| `avatarUrl` | string/null | no | Client-safe avatar URL |
| `preferredLanguage` | string/null | no | UI language preference |
| `timezone` | string/null | no | User timezone |
| `createdAt` | string | yes | ISO timestamp |
| `updatedAt` | string | yes | ISO timestamp |

### Rules

- Student profile ownership is defined by `userId`.
- A normal user may access only their own student profile.
- Backend must verify ownership before returning or updating profile data.
- Student profile must not include onboarding, placement, lessons, practice, sessions, progress, recommendations, retention, or AIM Engine state in Phase 2.

---

## AdminProfile Contract

`AdminProfile` represents admin-facing profile data linked to an internal AIM user.

### Shape

```json
{
  "id": "admin_profile_123",
  "userId": "usr_123",
  "profileType": "admin_profile",
  "displayName": "Admin User",
  "avatarUrl": null,
  "department": "operations",
  "createdAt": "2026-06-11T00:00:00Z",
  "updatedAt": "2026-06-11T00:00:00Z"
}
```

### Fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `id` | string | yes | Admin profile ID |
| `userId` | string | yes | Linked internal AIM user ID |
| `profileType` | string | yes | Must be `admin_profile` |
| `displayName` | string/null | no | Client-safe admin display name |
| `avatarUrl` | string/null | no | Client-safe avatar URL |
| `department` | string/null | no | Optional safe admin grouping |
| `createdAt` | string | yes | ISO timestamp |
| `updatedAt` | string | yes | ISO timestamp |

### Rules

- Admin profile existence does not grant admin authority.
- Admin authority must come from backend role/permission checks.
- Admin profile data must not expose privileged internal notes.
- Admin Dashboard may render admin profile data only after backend authorization.

---

## Current User Profile Response

A current-user profile response may combine user and profile data.

### Student Example

```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com",
    "phone": null,
    "userType": "student",
    "status": "active",
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  },
  "profile": {
    "id": "student_profile_123",
    "userId": "usr_123",
    "profileType": "student_profile",
    "displayName": "Yousef",
    "avatarUrl": null,
    "preferredLanguage": "en",
    "timezone": "Asia/Aden",
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  }
}
```

### Admin Example

```json
{
  "user": {
    "id": "usr_admin_123",
    "email": "admin@example.com",
    "phone": null,
    "userType": "admin",
    "status": "active",
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  },
  "profile": {
    "id": "admin_profile_123",
    "userId": "usr_admin_123",
    "profileType": "admin_profile",
    "displayName": "Admin User",
    "avatarUrl": null,
    "department": "operations",
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  }
}
```

Rules:

- Backend determines which profile shape is returned.
- Clients must not infer admin access only from profile type.
- Backend roles/permissions remain required for admin actions.

---

## Safe Student Profile Update Payload

A normal user may update only safe own-profile fields.

### Shape

```json
{
  "displayName": "Yousef",
  "avatarUrl": null,
  "preferredLanguage": "en",
  "timezone": "Asia/Aden"
}
```

### Allowed fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `displayName` | string/null | no | Safe display name |
| `avatarUrl` | string/null | no | Safe avatar URL |
| `preferredLanguage` | string/null | no | UI preference |
| `timezone` | string/null | no | Timezone preference |

### Forbidden fields

```text
id
userId
profileType
userType
status
roles
permissions
createdAt
updatedAt
supabaseAuthUid
```

Rules:

- Backend must ignore or reject forbidden fields.
- Backend must verify ownership before applying updates.
- Safe update payload must not change account identity.
- Safe update payload must not change roles or permissions.

---

## Safe Admin Profile Update Payload

Admin profile updates may use a separate safe payload.

### Shape

```json
{
  "displayName": "Admin User",
  "avatarUrl": null,
  "department": "operations"
}
```

### Allowed fields

| Field | Type | Required | Notes |
|---|---:|---:|---|
| `displayName` | string/null | no | Safe admin display name |
| `avatarUrl` | string/null | no | Safe avatar URL |
| `department` | string/null | no | Safe admin grouping |

### Forbidden fields

```text
id
userId
profileType
userType
status
roles
permissions
createdAt
updatedAt
supabaseAuthUid
serviceRoleKey
databaseUrl
jwtSecret
```

Rules:

- Backend admin authorization is required before updating admin profile data.
- Admin profile update does not grant admin permissions.
- Role and permission management must use separate backend-authorized RBAC flows.

---

## Profile Ownership Rules

Ownership is based on backend-resolved internal user identity.

```text
Validated Supabase Auth UID -> AIM User -> Profile.userId
```

Rules:

- Client-submitted `userId` is not proof of ownership.
- Client-submitted `profileId` is not proof of ownership.
- Backend must compare `profile.userId` to the resolved current AIM user ID.
- Admin override requires backend-approved role/permission.
- Ownership failure must deny access safely.

---

## Safe Field Exposure

Client-safe fields:

```text
User.id
User.email
User.phone
User.userType
User.status
User.createdAt
User.updatedAt
StudentProfile.id
StudentProfile.userId
StudentProfile.profileType
StudentProfile.displayName
StudentProfile.avatarUrl
StudentProfile.preferredLanguage
StudentProfile.timezone
StudentProfile.createdAt
StudentProfile.updatedAt
AdminProfile.id
AdminProfile.userId
AdminProfile.profileType
AdminProfile.displayName
AdminProfile.avatarUrl
AdminProfile.department
AdminProfile.createdAt
AdminProfile.updatedAt
```

Internal-only fields:

```text
supabaseAuthUid
rawProviderMetadata
passwordHash
refreshToken
serviceRoleKey
databaseUrl
jwtSecret
internalAuditMetadata
privilegedAdminNotes
```

Rules:

- Default to not exposing fields unless required by the contract.
- Never expose secrets or privileged credentials.
- Never expose raw provider metadata unless a later task explicitly defines a safe subset.

---

## Backend Contract Rules

Backend must:

- validate session/token before returning any user/profile data;
- resolve internal AIM user from verified Supabase UID;
- enforce user status checks;
- enforce ownership checks;
- enforce role/permission checks for admin profile access;
- reject unsafe profile update payloads.

Backend must not:

- trust client-submitted identity fields;
- trust client-submitted role/permission fields;
- expose secrets;
- expose internal-only profile fields.

---

## Flutter Mobile Contract Rules

Flutter Mobile may:

- render current student user/profile data;
- submit safe own-profile update payloads;
- show or hide profile UI based on backend-approved state.

Flutter Mobile must not:

- mutate `userId`, `userType`, roles, permissions, or status;
- become the authorization authority;
- bypass backend ownership checks;
- store privileged credentials.

---

## Admin Dashboard Contract Rules

Admin Dashboard may:

- render backend-approved admin user/profile data;
- submit safe admin profile update payloads;
- show role/permission UI based on backend-approved state.

Admin Dashboard must not:

- directly mutate privileged records without backend checks;
- treat profile existence as admin authority;
- store service-role keys;
- rely only on frontend route guards.

---

## Done Test Review

This document satisfies P2-009 when:

- `packages/shared-contracts/api/user-profile-contracts.md` exists;
- it defines `User`, `StudentProfile`, and `AdminProfile` contracts;
- it defines safe student profile update payloads;
- it defines safe admin profile update payloads;
- it separates account identity from student/admin profile data;
- it documents ownership and safe field exposure rules;
- it keeps backend authorization as final authority;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
