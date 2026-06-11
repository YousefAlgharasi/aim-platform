# API Error Contract and Error Codes

## Purpose

Defines the standard API error response contract for the AIM Platform Backend API. Error responses must fit the envelope defined in `packages/shared-contracts/api/response-envelope.md`.

This document is contract-only. It does not implement runtime behavior, business logic, runtime error handlers, database logic, Flutter logic, Admin Dashboard logic, or client-side AIM logic.

## Scope

This document defines:

- Standard error envelope shape.
- Common error codes.
- HTTP status mapping.
- Error code naming convention.
- Safe client message rules.
- Validation details rules.
- Client handling boundaries.

This document does not implement:

- NestJS filters.
- Runtime exception classes.
- Flutter API handling code.
- Admin Dashboard API handling code.
- Database migrations.
- AIM Engine runtime logic.
- AI Teacher Gateway runtime logic.

## Dependency Check

| Dependency | Required Output | Status |
|---|---|---|
| P1-012 | `packages/shared-contracts/api/response-envelope.md` | Checked and used as source of truth. |

## Error Envelope

All error responses with a response body must use this shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": null
  }
}
```

Validation errors may include safe field-level details:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address."
      }
    ]
  }
}
```

## Required Fields

| Field | Type | Required | Rule |
|---|---:|---:|---|
| `success` | `boolean` | Yes | Always `false` for error responses. |
| `error` | `object` | Yes | Contains the error descriptor. |
| `error.code` | `string` | Yes | Must use an approved error code. |
| `error.message` | `string` | Yes | Must be safe for client display. |
| `error.details` | `array \| null` | No | Safe structured details only. |

## Envelope Rules

- Error responses must not include `data`.
- Error responses must not expose implementation details.
- Error responses must not expose runtime traces.
- Error responses must not expose provider, database, file-system, or platform internals.
- `error.message` must be safe for learner, parent, and admin surfaces.
- `error.details` must be `null` unless the details are safe and useful.
- `204 No Content` responses must not include an error body or success envelope.

## Error Code Naming Convention

Error codes use:

```text
UPPER_SNAKE_CASE
```

Rules:

- Use stable platform-level names.
- Use uppercase letters, numbers, and underscores only.
- Do not include storage names, provider names, file names, class names, or internal module names.
- Use one general validation code with field-level details instead of one code per field.
- Keep codes stable across Backend API, Flutter Mobile, Admin Dashboard, and future OpenAPI docs.

## Standard Error Code Registry

| Code | HTTP Status | Category | Safe Default Message | When to Use |
|---|---:|---|---|---|
| `BAD_REQUEST` | 400 | Request | The request could not be processed. | Malformed request outside normal validation. |
| `UNAUTHORIZED` | 401 | Authentication | Authentication is required. | User is not authenticated. |
| `AUTH_INVALID` | 401 | Authentication | Authentication is invalid. | Authentication state cannot be accepted. |
| `FORBIDDEN` | 403 | Authorization | You do not have permission to perform this action. | User lacks permission. |
| `OWNERSHIP_VIOLATION` | 403 | Ownership | You do not have access to this resource. | User attempts cross-owner access. |
| `RESOURCE_NOT_FOUND` | 404 | Not Found | The requested resource was not found. | Resource is missing or intentionally hidden. |
| `CONFLICT` | 409 | Conflict | The request conflicts with the current resource state. | Duplicate action or invalid state transition. |
| `VALIDATION_ERROR` | 422 | Validation | One or more fields are invalid. | Request fields or values fail validation. |
| `RATE_LIMITED` | 429 | Rate Limit | Too many requests. Please try again later. | Request volume exceeds public limits. |
| `INTERNAL_SERVER_ERROR` | 500 | Server | An unexpected error occurred. Please try again. | Unexpected backend failure. |
| `SERVICE_UNAVAILABLE` | 503 | Dependency | The service is temporarily unavailable. Please try again later. | Required dependency is temporarily unavailable. |

## Category Rules

### Validation

Use `VALIDATION_ERROR` with HTTP `422` when public request fields are invalid.

Allowed detail shape:

```json
{
  "field": "email",
  "message": "Must be a valid email address."
}
```

Validation details must:

- Use public API field names only.
- Use safe field-level messages.
- Stay flat and predictable.
- Avoid internal framework output.
- Avoid storage or schema internals.
- Avoid hidden AIM internals.

### Authentication

Use `UNAUTHORIZED` when authentication is missing.

Use `AUTH_INVALID` when authentication is present but cannot be accepted.

Authentication errors must not:

- Confirm whether a specific account exists.
- Expose provider internals.
- Expose internal auth parsing behavior.
- Expose privileged backend configuration details.

### Authorization

Use `FORBIDDEN` when the user is authenticated but lacks permission.

Forbidden errors must:

- Stay generic.
- Avoid exposing hidden permission matrices.
- Avoid exposing role-resolution internals.
- Treat backend authorization as final.

### Ownership

Use `OWNERSHIP_VIOLATION` when a user attempts to access another owner scope.

Ownership applies to:

- learner-owned data
- parent-child scoped data
- admin-only data
- organization or classroom scoped data
- review or audit scoped data

Backend authorization is final. Client-side route guards are UI hints only.

For sensitive resources, the backend may return `RESOURCE_NOT_FOUND` instead of `OWNERSHIP_VIOLATION` to avoid confirming existence.

### Not Found

Use `RESOURCE_NOT_FOUND` when a resource is missing or intentionally hidden.

Not found errors must not reveal:

- Whether a hidden resource exists under another owner.
- Internal storage location.
- Internal lookup details.

### Conflict

Use `CONFLICT` when the request cannot be applied because of current state.

Examples:

- Duplicate creation attempt.
- Already-finalized action.
- Invalid state transition.
- Version conflict.

### Rate Limit

Use `RATE_LIMITED` when request volume exceeds public limits.

The response must remain generic and must not expose internal rate policy details unless a later public contract explicitly allows it.

### Server and Dependency

Use `INTERNAL_SERVER_ERROR` for unexpected backend failures.

Use `SERVICE_UNAVAILABLE` when a required backend dependency is temporarily unavailable.

Server and dependency responses must be generic and safe.

## Safe Message Rules

Safe messages are client-displayable.

Allowed:

- Short human-readable text.
- Generic recovery guidance.
- Public field-level validation text.
- Neutral language suitable for learner, parent, and admin clients.

Not allowed:

- Runtime traces.
- Storage or query internals.
- File paths.
- Provider internals.
- Internal module, class, or function names.
- Hidden AIM mastery internals.
- Hidden weakness internals.
- Hidden difficulty internals.
- Hidden retention internals.
- Hidden recommendation internals.
- Medical, diagnostic, or clinical language.

## Details Rules

`error.details` is allowed mainly for validation errors.

Allowed shape:

```json
{
  "field": "<public_field_name>",
  "message": "<safe field-level message>"
}
```

Rules:

- Use public API field names.
- Keep messages safe and short.
- Keep detail objects flat.
- Do not include raw framework output.
- Do not include raw storage output.
- Do not include submitted sensitive values.
- Do not include hidden AIM signals or internal calculations.

## HTTP Mapping Summary

| HTTP Status | Preferred Code | Envelope Body |
|---:|---|---|
| 400 | `BAD_REQUEST` | Yes |
| 401 | `UNAUTHORIZED` or `AUTH_INVALID` | Yes |
| 403 | `FORBIDDEN` or `OWNERSHIP_VIOLATION` | Yes |
| 404 | `RESOURCE_NOT_FOUND` | Yes |
| 409 | `CONFLICT` | Yes |
| 422 | `VALIDATION_ERROR` | Yes |
| 429 | `RATE_LIMITED` | Yes |
| 500 | `INTERNAL_SERVER_ERROR` | Yes |
| 503 | `SERVICE_UNAVAILABLE` | Yes |

`204 No Content` responses must not include an error body or success envelope.

## Client Handling Rules

### Flutter Mobile

Flutter Mobile must:

- Render backend-approved `error.message` only.
- Use `error.code` only for UI state mapping where needed.
- Treat backend authorization as final.
- Avoid showing unsafe technical details.

Flutter Mobile must not:

- Calculate mastery from errors.
- Calculate learner level from errors.
- Calculate weakness from errors.
- Calculate difficulty from errors.
- Calculate retention from errors.
- Calculate recommendations from errors.
- Override backend authorization.

### Admin Dashboard

Admin Dashboard must:

- Follow the same envelope and error code registry.
- Treat backend authorization as final.
- Avoid displaying internal backend details.
- Use backend-approved messages only unless a later contract defines admin-safe diagnostics.

Admin Dashboard must not:

- Display runtime traces.
- Display storage internals.
- Display provider internals.
- Override backend ownership checks.

### Backend API

Backend API owns:

- Final error mapping.
- Authorization checks.
- Ownership checks.
- Safe message selection.
- Internal server-side logging.

Backend API must return only safe errors to clients.

## Relationship to Response Envelope

This contract extends `packages/shared-contracts/api/response-envelope.md`:

- `success` is always `false`.
- `error.code` is required.
- `error.message` is required and safe.
- `error.details` is optional and safe-only.
- `data` is never present on error responses.
- `meta` is not used for error responses unless a later documented contract explicitly allows it.

## Non-Goals

This document does not:

- Implement NestJS exception filters.
- Implement runtime error classes.
- Implement Flutter API error handling.
- Implement Admin Dashboard API error handling.
- Implement OpenAPI decorators.
- Implement database migrations.
- Implement AIM Engine behavior.
- Move AIM Engine logic into a client.
- Define final localization strategy.
- Define final observability or logging strategy.

## Acceptance Notes

- P1-012 response envelope was checked and used.
- Error contract fits the shared response envelope.
- Validation, auth, forbidden, ownership, not found, conflict, rate limit, and server errors are defined.
- Error code naming convention is defined.
- Safe message rules are defined.
- Client-side AIM calculations remain forbidden.
- No runtime source code was added.
- No secrets or privileged credentials are documented.
- No Student Web App work was added.

## Related Documents

- `packages/shared-contracts/api/response-envelope.md`
- `packages/shared-contracts/README.md`
- `docs/phase-1/system-foundation-charter.md`

---

# Phase 2 — Auth, Users, Roles Error Codes

## Purpose

This section defines Phase 2 error codes for authentication, users, profiles, roles, permissions, ownership checks, and safe field exposure.

The goal is to keep error handling consistent across Backend API, Flutter Mobile, and Admin Dashboard while avoiding leakage of sensitive auth, role, permission, provider, or internal metadata.

This section is documentation-only. It does not implement backend exceptions, Flutter error models, Admin Dashboard handlers, database migrations, or runtime behavior.

---

## Scope

This section is limited to Phase 2 — Auth, Users, Roles.

It covers:

- auth/session error codes;
- current user and user-sync error codes;
- profile ownership error codes;
- role and permission error codes;
- admin authorization error codes;
- safe-field exposure error codes;
- safe client messages;
- backend logging boundaries.

This section does not cover onboarding, placement, lessons, practice, sessions, AIM integration, dashboard recommendations, progress reports, review/retention, AI Teacher, or Student Web App.

---

## Source of Truth

This section follows:

```text
packages/shared-contracts/api/errors.md
docs/phase-2/auth-source-of-truth.md
docs/phase-2/auth-security-rules.md
docs/phase-2/safe-auth-fields.md
packages/shared-contracts/api/auth-contracts.md
packages/shared-contracts/api/user-profile-contracts.md
packages/shared-contracts/api/role-permission-contracts.md
```

Core rule:

```text
Error responses must be safe for clients and must not expose secrets or privileged internals.
```

---

## Naming Convention

Phase 2 auth error codes must use uppercase snake case.

Recommended prefixes:

```text
AUTH_
USER_
PROFILE_
RBAC_
ADMIN_
SAFE_FIELDS_
```

Rules:

- Use stable error codes for client branching.
- Keep client messages safe and non-revealing.
- Log detailed internal reasons only in backend-safe logs.
- Do not expose raw tokens, service-role keys, database credentials, JWT secrets, or raw provider metadata.

---

## Auth and Session Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `AUTH_UNAUTHORIZED` | 401 | Unauthorized | Missing or invalid authentication |
| `AUTH_SESSION_INVALID` | 401 | Session is invalid | Session/token validation failed |
| `AUTH_SESSION_EXPIRED` | 401 | Session has expired | Session/token expired |
| `AUTH_TOKEN_MISSING` | 401 | Authentication token is required | Authorization token is missing |
| `AUTH_TOKEN_INVALID` | 401 | Authentication token is invalid | Token could not be verified |
| `AUTH_LOGOUT_FAILED` | 400 | Logout could not be completed | Logout/session cleanup failed safely |

Rules:

- Backend must validate token/session before protected access.
- Backend must not echo raw access tokens or refresh tokens.
- Flutter/Admin may use the code for UX but not for authorization decisions.

---

## Current User and User Sync Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `AUTH_USER_NOT_FOUND` | 404 | User not found | Valid auth identity has no internal AIM user |
| `AUTH_USER_DISABLED` | 403 | User is disabled | Internal AIM user is disabled |
| `AUTH_USER_DELETED` | 403 | User is unavailable | Internal AIM user is deleted/unavailable |
| `AUTH_USER_SYNC_FAILED` | 500 | User sync failed | Internal AIM user sync failed |
| `AUTH_USER_SYNC_CONFLICT` | 409 | User sync conflict | Supabase UID/internal user mapping conflict |
| `USER_STATUS_INVALID` | 400 | User status is invalid | Invalid user status value |
| `USER_TYPE_INVALID` | 400 | User type is invalid | Invalid user type value |

Rules:

- Supabase Auth UID to internal AIM user resolution must fail closed.
- Client-submitted user IDs must not be trusted as identity proof.
- User sync must not expose provider internals.

---

## Profile and Ownership Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PROFILE_NOT_FOUND` | 404 | Profile not found or not accessible | Profile does not exist or caller cannot access it |
| `PROFILE_OWNERSHIP_DENIED` | 403 | Profile is not accessible | Caller does not own the profile |
| `PROFILE_UPDATE_DENIED` | 403 | Profile update is not allowed | Caller cannot update requested profile |
| `PROFILE_UPDATE_INVALID` | 400 | Profile update payload is invalid | Payload contains invalid or unsafe fields |
| `PROFILE_TYPE_INVALID` | 400 | Profile type is invalid | Invalid profile type value |
| `PROFILE_FIELD_FORBIDDEN` | 400 | Profile field is not allowed | Payload includes forbidden profile field |

Rules:

- Backend must verify ownership before profile reads/updates.
- Client-submitted profile IDs do not prove ownership.
- Forbidden fields must be rejected or ignored safely.
- Responses must avoid leaking whether protected resources exist when unsafe.

---

## RBAC Role and Permission Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `RBAC_ROLE_NOT_FOUND` | 404 | Role not found | Requested role does not exist |
| `RBAC_PERMISSION_NOT_FOUND` | 404 | Permission not found | Requested permission does not exist |
| `RBAC_ROLE_DENIED` | 403 | Role access denied | Required role is missing |
| `RBAC_PERMISSION_DENIED` | 403 | Permission denied | Required permission is missing |
| `RBAC_ASSIGNMENT_NOT_FOUND` | 404 | Role assignment not found | Requested assignment does not exist |
| `RBAC_ASSIGNMENT_FORBIDDEN` | 403 | Role assignment is not allowed | Caller cannot assign/revoke role |
| `RBAC_SELF_GRANT_FORBIDDEN` | 403 | Self role assignment is not allowed | User attempted unsafe self-grant |
| `RBAC_SYSTEM_ROLE_PROTECTED` | 403 | System role is protected | Mutation/deletion of protected role blocked |
| `RBAC_PERMISSION_UPDATE_FORBIDDEN` | 403 | Permission update is not allowed | Caller cannot update permission mapping |
| `RBAC_VALIDATION_FAILED` | 400 | Role or permission payload is invalid | RBAC request validation failed |

Rules:

- Roles and permissions are backend-owned.
- Clients must not assign roles or permissions locally.
- Admin Dashboard RBAC actions must go through backend-protected endpoints.
- Missing role/permission must deny access.

---

## Admin Authorization Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `ADMIN_ACCESS_DENIED` | 403 | Admin access denied | Caller is not authorized for admin access |
| `ADMIN_USERS_READ_DENIED` | 403 | User management access denied | Caller cannot read admin users |
| `ADMIN_USERS_MANAGE_DENIED` | 403 | User management action denied | Caller cannot manage users |
| `ADMIN_ROLE_MANAGE_DENIED` | 403 | Role management action denied | Caller cannot manage roles |
| `ADMIN_PERMISSION_MANAGE_DENIED` | 403 | Permission management action denied | Caller cannot manage permissions |

Rules:

- Admin Dashboard UI checks are UX only.
- Backend role/permission checks are final.
- Admin errors must not expose privileged backend configuration or internal policy details.

---

## Safe Field Exposure Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `SAFE_FIELDS_FORBIDDEN_FIELD` | 400 | Field is not allowed | Client submitted a forbidden field |
| `SAFE_FIELDS_INTERNAL_FIELD_REQUESTED` | 403 | Field is not accessible | Client requested internal-only field |
| `SAFE_FIELDS_RESPONSE_BLOCKED` | 500 | Response could not be returned safely | Backend blocked unsafe response serialization |
| `SAFE_FIELDS_SCOPE_DENIED` | 403 | Requested field scope is not allowed | Caller cannot access requested safe field scope |

Rules:

- Backend must explicitly select safe fields.
- Backend must not serialize raw database records by default.
- Internal-only fields must not be returned directly to Flutter/Admin clients.

---

## Safe Client Error Shape

Phase 2 errors must fit the shared error response envelope.

Example:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RBAC_PERMISSION_DENIED",
    "message": "Permission denied"
  }
}
```

Optional safe validation details:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PROFILE_UPDATE_INVALID",
    "message": "Profile update payload is invalid",
    "details": [
      {
        "field": "displayName",
        "reason": "Must be a string"
      }
    ]
  }
}
```

Rules:

- `code` is stable and safe for client branching.
- `message` is safe and non-revealing.
- `details` must not include secrets or internal stack traces.
- Backend logs may include correlation IDs and safe metadata separately.

---

## Forbidden Error Response Data

Error responses must not include:

```text
raw access tokens
refresh tokens
JWT secrets
service-role keys
database credentials
raw provider metadata
raw authorization headers
password hashes
internal audit metadata
security bypass flags
stack traces in production
```

---

## Backend Logging Boundary

Backend may log safe internal diagnostics, but must not expose them to clients.

Safe logging examples:

```text
eventType
actorUserId
targetUserId
errorCode
requestId
createdAt
safe metadata
```

Unsafe logging examples:

```text
raw access token
refresh token
JWT secret
service-role key
database URL with credentials
raw provider session
password hash
```

---

## Flutter Mobile Handling Rules

Flutter Mobile may:

- use `AUTH_UNAUTHORIZED` to show login-required UX;
- use `AUTH_SESSION_EXPIRED` to request re-authentication;
- use `PROFILE_OWNERSHIP_DENIED` or `PROFILE_NOT_FOUND` to show safe access messages;
- use safe error codes for UI branching.

Flutter Mobile must not:

- infer authorization from local role/permission values;
- expose raw backend error internals;
- show sensitive debug details to users;
- retry privileged actions without backend approval.

---

## Admin Dashboard Handling Rules

Admin Dashboard may:

- use RBAC/admin error codes for safe admin UX;
- show safe messages for denied role/permission actions;
- show validation details for allowed fields only.

Admin Dashboard must not:

- reveal backend policy internals;
- reveal whether hidden resources exist when unsafe;
- expose raw stack traces or secrets;
- treat frontend route guards as final authorization.

---

## Done Test Review

This section satisfies P2-012 when:

- `packages/shared-contracts/api/errors.md` is updated;
- it documents auth error codes;
- it documents user/profile error codes;
- it documents role and permission error codes;
- it documents ownership error codes;
- it documents admin authorization error codes;
- it documents safe field exposure error codes;
- error handling remains consistent across Backend API, Flutter Mobile, and Admin Dashboard;
- backend authorization remains final authority;
- no out-of-scope Phase 2 feature is introduced;
- no secrets or privileged credentials are exposed.

