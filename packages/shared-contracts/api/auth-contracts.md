# Phase 2 — Auth Contracts

## Purpose

This document defines the request and response contracts for Phase 2 authentication-related backend communication.

The goal is to unify auth communication between Flutter Mobile, Admin Dashboard, and the Backend API.

This is a shared contracts documentation file. It does not implement backend endpoints, Flutter code, admin dashboard code, database migrations, or runtime behavior.

---

## Scope

This document is limited to Phase 2 — Auth, Users, Roles.

It covers:

- current user contract;
- session validation response contract;
- auth sync response contract;
- logout response contract;
- auth error response contract;
- client-safe user, profile, role, and permission shapes;
- Flutter/Admin usage boundaries.

This document does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This contract follows:

```text
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-api-map.md
docs/phase-2/auth-data-model-map.md
docs/phase-2/auth-security-rules.md
packages/shared-contracts/enums/user-role-enums.md
```

Core rule:

```text
Backend validates identity, roles, permissions, and ownership.
Clients render backend-approved state only.
```

---

## General API Response Envelope

Auth-related backend responses should use a consistent envelope.

### Success Envelope

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

### Error Envelope

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

Rules:

- `success` indicates whether the backend accepted and processed the request.
- `data` contains client-safe response data only.
- `error` contains safe error information only.
- No secrets, raw tokens, service-role keys, database credentials, or privileged backend configuration may be returned.

---

## Shared Auth Error Codes

Recommended auth error codes:

```text
AUTH_UNAUTHORIZED
AUTH_FORBIDDEN
AUTH_USER_NOT_FOUND
AUTH_USER_DISABLED
AUTH_SESSION_INVALID
AUTH_SESSION_EXPIRED
AUTH_OWNERSHIP_DENIED
AUTH_PERMISSION_DENIED
AUTH_ROLE_DENIED
AUTH_VALIDATION_FAILED
```

| Code | Meaning |
|---|---|
| `AUTH_UNAUTHORIZED` | Missing or invalid authentication |
| `AUTH_FORBIDDEN` | Authenticated but not allowed |
| `AUTH_USER_NOT_FOUND` | Valid auth identity has no internal AIM user |
| `AUTH_USER_DISABLED` | Internal AIM user is disabled |
| `AUTH_SESSION_INVALID` | Session/token validation failed |
| `AUTH_SESSION_EXPIRED` | Session/token expired |
| `AUTH_OWNERSHIP_DENIED` | User does not own the requested resource |
| `AUTH_PERMISSION_DENIED` | Required permission missing |
| `AUTH_ROLE_DENIED` | Required role missing |
| `AUTH_VALIDATION_FAILED` | Request shape or values are invalid |

Rules:

- Error messages must not leak sensitive internals.
- Backend may log detailed internal reason safely.
- Clients should use `code` for UX branching, not for authorization decisions.

---

## ClientSafeUser

`ClientSafeUser` is the safe user shape returned to Flutter/Admin clients.

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

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Internal AIM user ID |
| `email` | string/null | Safe normalized email |
| `phone` | string/null | Safe normalized phone |
| `userType` | string | Shared enum value |
| `status` | string | Shared enum value |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string | ISO timestamp |

Must not include:

```text
supabase_auth_uid
raw_provider_metadata
password_hash
refresh_token
service_role_key
database_url
jwt_secret
internal_admin_notes
```

---

## ClientSafeProfile

`ClientSafeProfile` is the safe profile shape returned to clients.

```json
{
  "id": "profile_123",
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

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Profile ID |
| `userId` | string | Owner AIM user ID |
| `profileType` | string | Shared enum value |
| `displayName` | string/null | Client-safe display name |
| `avatarUrl` | string/null | Client-safe avatar URL |
| `preferredLanguage` | string/null | UI language preference |
| `timezone` | string/null | User timezone |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string | ISO timestamp |

Rules:

- Backend ownership checks are required before returning profiles.
- Admin override requires backend-approved permission.
- Profile response must not expose internal-only fields.

---

## ClientSafeRole

`ClientSafeRole` is the safe role shape returned to clients.

```json
{
  "id": "role_123",
  "key": "student",
  "name": "Student",
  "description": "Standard learner role",
  "isSystem": true
}
```

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Role ID |
| `key` | string | Shared role key |
| `name` | string | Display-safe role name |
| `description` | string/null | Safe description |
| `isSystem` | boolean | Whether role is protected/system-owned |

Rules:

- Role data is display/UX state on the client.
- Backend remains final authority for authorization.
- Clients must not assign or mutate roles directly.

---

## ClientSafePermission

`ClientSafePermission` is the safe permission shape returned to clients.

```json
{
  "id": "perm_123",
  "key": "profiles.read.own",
  "scope": "profiles",
  "description": "Read own profile"
}
```

Fields:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Permission ID |
| `key` | string | Shared permission key |
| `scope` | string | Permission scope |
| `description` | string/null | Safe description |

Rules:

- Permission data is display/UX state on the client.
- Backend guards must enforce permission checks.
- Missing backend permission must deny access.

---

## AuthContext

`AuthContext` represents the current backend-approved auth state.

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
    "id": "profile_123",
    "userId": "usr_123",
    "profileType": "student_profile",
    "displayName": "Yousef",
    "avatarUrl": null,
    "preferredLanguage": "en",
    "timezone": "Asia/Aden",
    "createdAt": "2026-06-11T00:00:00Z",
    "updatedAt": "2026-06-11T00:00:00Z"
  },
  "roles": [
    {
      "id": "role_123",
      "key": "student",
      "name": "Student",
      "description": "Standard learner role",
      "isSystem": true
    }
  ],
  "permissions": [
    {
      "id": "perm_123",
      "key": "profiles.read.own",
      "scope": "profiles",
      "description": "Read own profile"
    }
  ]
}
```

Rules:

- `AuthContext` is backend-approved current-user state.
- Flutter/Admin may render UX based on this state.
- Flutter/Admin must not treat cached `AuthContext` as final authorization.
- Every protected backend request must still be authorized by backend logic.

---

## GET /auth/me

Returns the current authenticated user context.

### Request

```http
GET /auth/me
Authorization: Bearer <supabase-access-token>
```

### Success Response

```json
{
  "success": true,
  "data": {
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
      "id": "profile_123",
      "userId": "usr_123",
      "profileType": "student_profile",
      "displayName": "Yousef",
      "avatarUrl": null,
      "preferredLanguage": "en",
      "timezone": "Asia/Aden",
      "createdAt": "2026-06-11T00:00:00Z",
      "updatedAt": "2026-06-11T00:00:00Z"
    },
    "roles": [
      {
        "id": "role_123",
        "key": "student",
        "name": "Student",
        "description": "Standard learner role",
        "isSystem": true
      }
    ],
    "permissions": [
      {
        "id": "perm_123",
        "key": "profiles.read.own",
        "scope": "profiles",
        "description": "Read own profile"
      }
    ]
  },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "AUTH_UNAUTHORIZED",
    "message": "Unauthorized"
  }
}
```

Rules:

- Backend validates the Supabase token/session.
- Backend resolves internal AIM user.
- Backend returns client-safe fields only.
- Disabled users must not receive protected access.

---

## POST /auth/sync-user

Synchronizes a validated Supabase Auth identity with an internal AIM user.

### Request

```http
POST /auth/sync-user
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

```json
{
  "preferredLanguage": "en",
  "timezone": "Asia/Aden"
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "phone": null,
      "userType": "student",
      "status": "active",
      "createdAt": "2026-06-11T00:00:00Z",
      "updatedAt": "2026-06-11T00:00:00Z"
    },
    "created": false
  },
  "error": null
}
```

Fields:

| Field | Type | Notes |
|---|---|---|
| `user` | ClientSafeUser | Internal AIM user |
| `created` | boolean | Whether sync created a new AIM user |

Rules:

- Sync must be idempotent.
- Backend must use verified Supabase UID from token/session.
- Backend must not trust client-supplied UID.
- Request fields must remain Phase 2-safe and must not introduce onboarding or placement.

---

## POST /auth/logout

Acknowledges logout/session cleanup.

### Request

```http
POST /auth/logout
Authorization: Bearer <supabase-access-token>
```

### Success Response

```json
{
  "success": true,
  "data": {
    "loggedOut": true
  },
  "error": null
}
```

Rules:

- Logout response must not expose tokens.
- Backend may record a safe audit event.
- Client is responsible for local session cleanup.
- Backend must not persist raw access tokens or refresh tokens in audit logs.

---

## Session Validation Response

When backend validates a session internally, the public/client-safe result should be represented as:

```json
{
  "valid": true,
  "userId": "usr_123",
  "status": "active"
}
```

For invalid sessions:

```json
{
  "valid": false,
  "userId": null,
  "status": null
}
```

Rules:

- This contract is for safe response modeling only.
- Backend internals may carry more context but must not expose secrets.
- Clients must not use this as final authorization authority.

---

## Flutter Mobile Usage

Flutter Mobile may use these contracts to:

- call `/auth/me`;
- call `/auth/sync-user`;
- call `/auth/logout`;
- parse current-user state;
- render profile/auth UI;
- hide or show UI based on backend-approved roles/permissions.

Flutter Mobile must not:

- store service-role keys;
- send trusted role/permission claims;
- become the source of truth for authorization;
- bypass backend ownership checks;
- move AIM Engine logic into Flutter.

---

## Admin Dashboard Usage

Admin Dashboard may use these contracts to:

- parse backend-approved current admin state;
- render admin auth UI;
- show/hide admin navigation based on backend-approved roles/permissions;
- call protected admin endpoints using valid backend authorization flow.

Admin Dashboard must not:

- store service-role keys;
- directly mutate privileged records without backend checks;
- rely only on frontend route guards;
- become the final authorization authority.

---

## Internal-Only Fields

These fields must never appear in auth contract responses:

```text
password_hash
refresh_token
service_role_key
database_url
jwt_secret
raw_provider_metadata
internal_audit_metadata
privileged_admin_notes
```

---

## Done Test Review

This document satisfies P2-008 when:

- `packages/shared-contracts/api/auth-contracts.md` exists;
- it defines request and response contracts for current user;
- it defines session validation/auth-related response shapes;
- it defines safe auth error codes;
- it defines client-safe user, profile, role, and permission shapes;
- it aligns Flutter, Admin Dashboard, and Backend API communication;
- it keeps backend authorization as final authority;
- it introduces no out-of-scope Phase 2 feature;
- it exposes no secrets or privileged credentials.
