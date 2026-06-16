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


---

# Phase 3 — Curriculum & Content System Error Codes

## Purpose

This section defines Phase 3 error codes for curriculum content validation, hierarchy rules, status lifecycle transitions, lesson-skill linking, asset management, and question bank operations.

The goal is to make curriculum errors consistent across Backend API and Admin Dashboard while keeping messages safe for admin-facing clients.

This section is documentation-only. It does not implement backend exceptions, NestJS filters, Admin Dashboard handlers, database migrations, or runtime behavior.

---

## Scope

This section is limited to Phase 3 — Curriculum & Content System.

It covers:

- course, level, chapter, lesson, skill, objective error codes;
- lesson asset error codes;
- question bank error codes;
- content status lifecycle error codes;
- lesson-skill linking error codes;
- curriculum hierarchy validation error codes.

This section does not cover onboarding, placement, learner lesson delivery, practice attempts, sessions, AIM runtime, dashboard recommendations, progress reports, AI Teacher, or Student Web App.

---

## Source of Truth

This section follows:

```text
packages/shared-contracts/api/errors.md
packages/shared-contracts/api/course-level-chapter-contracts.md  (P3-009)
packages/shared-contracts/api/lesson-contracts.md                (P3-010)
packages/shared-contracts/api/skill-objective-contracts.md       (P3-011)
packages/shared-contracts/api/lesson-asset-contracts.md          (P3-013)
packages/shared-contracts/api/question-bank-contracts.md         (P3-014)
packages/shared-contracts/api/content-status-contracts.md        (P3-015)
docs/phase-3/lesson-skill-linking-rules.md                       (P3-006)
docs/phase-3/content-status-lifecycle.md                         (P3-007)
```

---

## Naming Convention

Phase 3 curriculum error codes use uppercase snake case with domain prefixes:

```text
COURSE_
LEVEL_
CHAPTER_
LESSON_
SKILL_
OBJECTIVE_
ASSET_
QUESTION_
CONTENT_
CURRICULUM_
```

Rules:

- Use stable codes for client branching and backend logging.
- Keep client messages safe and suitable for admin/teacher surfaces.
- Log detailed internal reasons only in backend-safe logs.
- Do not expose database internals, storage paths, or provider details.

---

## Course Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `COURSE_NOT_FOUND` | 404 | Course not found | Course does not exist or is inaccessible |
| `COURSE_TITLE_REQUIRED` | 422 | Course title is required | `title` is missing or empty |
| `COURSE_DESCRIPTION_REQUIRED` | 422 | Course description is required | `description` is missing or empty |
| `COURSE_SLUG_CONFLICT` | 409 | Course slug is already in use | `slug` conflicts with an existing course |
| `COURSE_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Course cannot be published | One or more publish requirements are not satisfied |
| `COURSE_HAS_NO_PUBLISHED_LEVEL` | 422 | Course has no published level | At least one published level is required to publish |
| `COURSE_ARCHIVED_NOT_EDITABLE` | 403 | Archived course cannot be edited | Course is archived and read-only |
| `COURSE_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Level Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `LEVEL_NOT_FOUND` | 404 | Level not found | Level does not exist or is inaccessible |
| `LEVEL_TITLE_REQUIRED` | 422 | Level title is required | `title` is missing or empty |
| `LEVEL_COURSE_NOT_FOUND` | 404 | Parent course not found | Referenced `course_id` does not exist |
| `LEVEL_COURSE_ARCHIVED` | 422 | Parent course is archived | Cannot add level to an archived course |
| `LEVEL_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Level cannot be published | One or more publish requirements are not satisfied |
| `LEVEL_HAS_NO_PUBLISHED_CHAPTER` | 422 | Level has no published chapter | At least one published chapter is required to publish |
| `LEVEL_COURSE_NOT_PUBLISHED` | 422 | Parent course is not published | Level cannot be published without a published parent course |
| `LEVEL_ARCHIVED_NOT_EDITABLE` | 403 | Archived level cannot be edited | Level is archived and read-only |
| `LEVEL_ORDER_CONFLICT` | 409 | Level order conflicts with existing level | `order` value already taken within the course |
| `LEVEL_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Chapter Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `CHAPTER_NOT_FOUND` | 404 | Chapter not found | Chapter does not exist or is inaccessible |
| `CHAPTER_TITLE_REQUIRED` | 422 | Chapter title is required | `title` is missing or empty |
| `CHAPTER_LEVEL_NOT_FOUND` | 404 | Parent level not found | Referenced `level_id` does not exist |
| `CHAPTER_LEVEL_ARCHIVED` | 422 | Parent level is archived | Cannot add chapter to an archived level |
| `CHAPTER_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Chapter cannot be published | One or more publish requirements are not satisfied |
| `CHAPTER_HAS_NO_PUBLISHED_LESSON` | 422 | Chapter has no published lesson | At least one published lesson is required to publish |
| `CHAPTER_LEVEL_NOT_PUBLISHED` | 422 | Parent level is not published | Chapter cannot be published without a published parent level |
| `CHAPTER_ARCHIVED_NOT_EDITABLE` | 403 | Archived chapter cannot be edited | Chapter is archived and read-only |
| `CHAPTER_ORDER_CONFLICT` | 409 | Chapter order conflicts with existing chapter | `order` value already taken within the level |
| `CHAPTER_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Lesson Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `LESSON_NOT_FOUND` | 404 | Lesson not found | Lesson does not exist or is inaccessible |
| `LESSON_TITLE_REQUIRED` | 422 | Lesson title is required | `title` is missing or empty |
| `LESSON_DESCRIPTION_REQUIRED` | 422 | Lesson description is required | `description` is missing or empty |
| `LESSON_CHAPTER_NOT_FOUND` | 404 | Parent chapter not found | Referenced `chapter_id` does not exist |
| `LESSON_CHAPTER_ARCHIVED` | 422 | Parent chapter is archived | Cannot add lesson to an archived chapter |
| `LESSON_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Lesson cannot be published | One or more publish requirements are not satisfied |
| `LESSON_MISSING_SKILL` | 422 | Lesson must be linked to at least one skill | No published skill is linked to this lesson |
| `LESSON_MISSING_ASSET` | 422 | Lesson must have at least one published asset | No published asset is linked to this lesson |
| `LESSON_SKILL_NOT_PUBLISHED` | 422 | Linked skill is not published | A required linked skill is in draft or archived state |
| `LESSON_ARCHIVED_NOT_EDITABLE` | 403 | Archived lesson cannot be edited | Lesson is archived and read-only |
| `LESSON_ORDER_CONFLICT` | 409 | Lesson order conflicts with existing lesson | `order` value already taken within the chapter |
| `LESSON_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |
| `LESSON_CHAPTER_ID_IMMUTABLE` | 422 | Lesson chapter cannot be changed | `chapter_id` cannot be modified after creation |

---

## Skill Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `SKILL_NOT_FOUND` | 404 | Skill not found | Skill does not exist or is inaccessible |
| `SKILL_KEY_REQUIRED` | 422 | Skill key is required | `key` is missing or empty |
| `SKILL_KEY_INVALID` | 422 | Skill key format is invalid | `key` does not match the stable dot-delimited format |
| `SKILL_KEY_CONFLICT` | 409 | Skill key is already in use | `key` conflicts with an existing skill |
| `SKILL_TITLE_REQUIRED` | 422 | Skill title is required | `title` is missing or empty |
| `SKILL_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Skill cannot be published | One or more publish requirements are not satisfied |
| `SKILL_HAS_NO_OBJECTIVE` | 422 | Skill has no linked objective | At least one objective is required to publish |
| `SKILL_ARCHIVED_NOT_EDITABLE` | 403 | Archived skill cannot be edited | Skill is archived and read-only |
| `SKILL_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |
| `SKILL_DOMAIN_INVALID` | 422 | Skill domain is invalid | `domain` is not one of the allowed enum values |

---

## Objective Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `OBJECTIVE_NOT_FOUND` | 404 | Objective not found | Objective does not exist or is inaccessible |
| `OBJECTIVE_TEXT_REQUIRED` | 422 | Objective text is required | `text` is missing or empty |
| `OBJECTIVE_SKILL_NOT_FOUND` | 404 | Parent skill not found | Referenced `skill_id` does not exist |
| `OBJECTIVE_SKILL_ARCHIVED` | 422 | Parent skill is archived | Cannot add objective to an archived skill |
| `OBJECTIVE_SKILL_NOT_PUBLISHED` | 422 | Parent skill is not published | Objective cannot be published without a published parent skill |
| `OBJECTIVE_ARCHIVED_NOT_EDITABLE` | 403 | Archived objective cannot be edited | Objective is archived and read-only |
| `OBJECTIVE_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Lesson Asset Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `ASSET_NOT_FOUND` | 404 | Asset not found | Asset does not exist or is inaccessible |
| `ASSET_LESSON_NOT_FOUND` | 404 | Parent lesson not found | Referenced `lesson_id` does not exist |
| `ASSET_INVALID_TYPE` | 422 | Asset type is invalid | `type` is not one of the allowed enum values |
| `ASSET_MISSING_URL` | 422 | Asset URL is required | `url` is absent or empty for a type that requires it |
| `ASSET_TITLE_REQUIRED` | 422 | Asset title is required | `title` is missing or empty |
| `ASSET_MISSING_ALT_TEXT` | 422 | Image asset requires alt text | Publishing an `image` asset without `alt_text` |
| `ASSET_ORDER_CONFLICT` | 409 | Asset order conflicts with existing asset | `order` value already taken within the lesson |
| `ASSET_LESSON_ARCHIVED` | 422 | Parent lesson is archived | Cannot add asset to an archived lesson |
| `ASSET_ARCHIVED_NOT_EDITABLE` | 403 | Archived asset cannot be edited | Asset is archived and read-only |
| `ASSET_LESSON_ID_IMMUTABLE` | 422 | Asset lesson cannot be changed | `lesson_id` cannot be modified after creation |
| `ASSET_TYPE_IMMUTABLE` | 422 | Asset type cannot be changed | `type` cannot be modified after creation |
| `ASSET_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Question Bank Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `QUESTION_NOT_FOUND` | 404 | Question not found | Question does not exist or is inaccessible |
| `QUESTION_MISSING_STEM` | 422 | Question stem is required | `stem` is missing or empty |
| `QUESTION_INVALID_TYPE` | 422 | Question type is invalid | `type` is not one of the allowed enum values |
| `QUESTION_INVALID_DIFFICULTY` | 422 | Difficulty label is invalid | `difficulty` is not one of the allowed enum values |
| `QUESTION_NO_PRIMARY_SKILL` | 422 | Question must have a primary skill | No primary skill mapping exists for this question |
| `QUESTION_SKILL_NOT_PUBLISHED` | 422 | Linked skill is not published | A required linked skill is in draft or archived state |
| `QUESTION_NO_CORRECT_ANSWER` | 422 | Question must have a correct answer | No valid correct answer or answer record is defined |
| `QUESTION_CHOICE_CONFLICT` | 422 | Multiple choices marked correct | Only one choice may be correct for this question type |
| `QUESTION_TRUE_FALSE_INVALID` | 422 | True/false question is invalid | Question must have exactly two choices |
| `QUESTION_CHOICE_ORDER_CONFLICT` | 409 | Choice order conflicts with existing choice | `order` value already taken within the question |
| `QUESTION_ANSWER_TYPE_MISMATCH` | 422 | Answer type does not match question type | `answer_type` is incompatible with the question `type` |
| `QUESTION_ARCHIVED_NOT_EDITABLE` | 403 | Archived question cannot be edited | Question is archived and read-only |
| `QUESTION_TYPE_IMMUTABLE` | 422 | Question type cannot be changed | `type` cannot be modified after creation |
| `QUESTION_INVALID_STATUS_TRANSITION` | 409 | Invalid status transition | Requested status transition is not allowed |

---

## Content Status Lifecycle Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `CONTENT_ALREADY_PUBLISHED` | 409 | Content is already published | Publish requested on an already-published item |
| `CONTENT_ALREADY_ARCHIVED` | 409 | Content is already archived | Archive requested on an already-archived item |
| `CONTENT_PUBLISH_REQUIREMENTS_NOT_MET` | 422 | Content cannot be published | One or more publish requirements are not satisfied |
| `CONTENT_ARCHIVED_NOT_EDITABLE` | 403 | Archived content cannot be edited | Mutation attempted on an archived item |
| `CONTENT_RESTORE_FORBIDDEN` | 403 | Restore is not allowed | Restore-to-draft attempted by non-SUPER_ADMIN |
| `CONTENT_INVALID_TRANSITION` | 409 | Invalid status transition | Forbidden transition attempted (e.g. published → draft) |

---

## Curriculum Hierarchy Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `CURRICULUM_PARENT_NOT_PUBLISHED` | 422 | Parent content is not published | Cannot publish child when parent is not published |
| `CURRICULUM_PARENT_ARCHIVED` | 422 | Parent content is archived | Cannot add or publish child under an archived parent |
| `CURRICULUM_CASCADE_BLOCKED` | 422 | Cascade operation blocked | Cascaded action blocked by child content state |
| `CURRICULUM_HIERARCHY_INVALID` | 422 | Curriculum hierarchy is invalid | Hierarchy integrity check failed |

---

## Lesson–Skill Linking Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `LESSON_SKILL_LINK_NOT_FOUND` | 404 | Lesson-skill link not found | The specified lesson-skill mapping does not exist |
| `LESSON_SKILL_LINK_ALREADY_EXISTS` | 409 | Lesson-skill link already exists | Duplicate lesson-skill mapping |
| `LESSON_SKILL_LINK_SKILL_ARCHIVED` | 422 | Cannot link to an archived skill | Skill is archived and cannot be linked |
| `LESSON_SKILL_LAST_LINK_PROTECTED` | 422 | Cannot remove the last skill link | Lesson must retain at least one skill link |

---

## Safe Client Error Shape

Phase 3 curriculum errors must fit the shared error response envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LESSON_MISSING_SKILL",
    "message": "Lesson must be linked to at least one skill"
  }
}
```

With optional validation details:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "CONTENT_PUBLISH_REQUIREMENTS_NOT_MET",
    "message": "Content cannot be published",
    "details": [
      { "field": "skills", "message": "At least one published skill must be linked" },
      { "field": "assets", "message": "At least one published asset must exist" }
    ]
  }
}
```

---

## Admin Dashboard Handling Rules

Admin Dashboard may:

- use curriculum error codes to show safe validation messages;
- display `details` items as field-level feedback where present;
- use `LESSON_MISSING_SKILL` to surface the skill-linking requirement in the lesson editor.

Admin Dashboard must not:

- reveal backend internal state beyond the safe message;
- bypass backend publish or archive authority;
- treat frontend validation as a substitute for backend enforcement.

---

## Done Test — P3-016

This section satisfies P3-016 when:

- `packages/shared-contracts/api/errors.md` is updated with Phase 3 curriculum error codes;
- course, level, chapter, lesson, skill, objective, asset, question, status lifecycle, hierarchy, and lesson-skill link error codes are defined;
- all codes use the approved naming convention;
- all messages are safe for admin-facing clients;
- no out-of-scope Phase 3 feature is introduced;
- no secrets or privileged credentials are exposed.

---

# Phase 4 — Placement Test Error Codes

## Purpose

This section defines Phase 4 error codes for placement test operations, including placement test
and section retrieval, attempt lifecycle, answer submission, result generation, and initial learning
path delivery.

The goal is to make placement errors consistent across Backend API, Flutter Mobile, and Admin
Dashboard while keeping messages safe and never exposing scoring logic, internal skill maps, level
thresholds, or weakness computation to clients.

This section is documentation-only. It does not implement backend exceptions, NestJS filters,
Flutter error models, Admin Dashboard handlers, database migrations, or runtime behavior.

---

## Scope

This section is limited to Phase 4 — Placement Test.

It covers:

- placement test retrieval error codes;
- placement section retrieval error codes;
- placement question delivery error codes;
- placement attempt lifecycle error codes;
- placement answer submission error codes;
- placement result retrieval error codes;
- initial learning path retrieval error codes;
- admin placement management error codes.

This section does not cover onboarding, learner lesson delivery, practice attempts, sessions,
AIM Engine runtime, AI Teacher, dashboard recommendations, progress reports, or Student Web App.

---

## Source of Truth

This section follows:

```text
packages/shared-contracts/api/errors.md
packages/shared-contracts/api/placement-test-contracts.md       (P4-009)
packages/shared-contracts/api/placement-section-contracts.md    (P4-010)
packages/shared-contracts/api/placement-question-contracts.md   (P4-011)
packages/shared-contracts/api/placement-answer-contracts.md     (P4-012)
packages/shared-contracts/api/placement-attempt-contracts.md    (P4-013)
packages/shared-contracts/api/placement-result-contracts.md     (P4-014)
packages/shared-contracts/api/initial-learning-path-contracts.md (P4-015)
docs/phase-4/placement-api-map.md                               (P4-006)
docs/phase-4/placement-test-charter.md
docs/phase-4/no-client-side-placement-scoring.md
docs/phase-4/no-aim-runtime-rule.md
```

---

## Naming Convention

Phase 4 placement error codes use uppercase snake case with domain prefixes:

```text
PLACEMENT_
PLACEMENT_SECTION_
PLACEMENT_QUESTION_
PLACEMENT_ATTEMPT_
PLACEMENT_ANSWER_
PLACEMENT_RESULT_
PLACEMENT_PATH_
PLACEMENT_ADMIN_
```

Rules:

- Use stable codes for client branching and backend logging.
- Keep client messages safe and non-revealing — never expose score, threshold, or mastery values.
- Log detailed internal reasons only in backend-safe logs.
- Do not expose scoring logic, level thresholds, weakness computation, or skill map internals.

---

## Placement Test Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_TEST_NOT_FOUND` | 404 | No active placement test is available | No published placement test exists |
| `PLACEMENT_TEST_UNAVAILABLE` | 503 | Placement test is temporarily unavailable | Published test exists but cannot be served |
| `PLACEMENT_TEST_INVALID_STATUS` | 422 | Placement test status is invalid | `status` is not one of the allowed enum values |
| `PLACEMENT_TEST_ALREADY_PUBLISHED` | 409 | A placement test is already published | Only one test may be active at a time |
| `PLACEMENT_TEST_TITLE_REQUIRED` | 422 | Placement test title is required | `title` is missing or empty |

---

## Placement Section Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_SECTION_NOT_FOUND` | 404 | Placement section not found | Section does not exist or is inaccessible |
| `PLACEMENT_SECTION_TEST_NOT_FOUND` | 404 | Parent placement test not found | Referenced `placement_test_id` does not exist |
| `PLACEMENT_SECTION_ORDER_CONFLICT` | 409 | Section order conflicts with an existing section | `order` value already taken within the test |
| `PLACEMENT_SECTION_TITLE_REQUIRED` | 422 | Section title is required | `title` is missing or empty |
| `PLACEMENT_SECTION_WEIGHT_INVALID` | 422 | Section weight is invalid | `weight` is not a positive number or exceeds allowed range |

---

## Placement Question Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_QUESTION_NOT_FOUND` | 404 | Placement question not found | Question does not exist or is inaccessible |
| `PLACEMENT_QUESTION_SECTION_NOT_FOUND` | 404 | Parent placement section not found | Referenced `section_id` does not exist |
| `PLACEMENT_QUESTION_INVALID_TYPE` | 422 | Question type is invalid | `type` is not one of the allowed enum values |
| `PLACEMENT_QUESTION_NO_OPTIONS` | 422 | Question must have answer options | No options provided for a multiple-choice question |
| `PLACEMENT_QUESTION_NO_CORRECT_OPTION` | 422 | Question must have a correct option | No option is marked as correct |
| `PLACEMENT_QUESTION_MULTIPLE_CORRECT` | 422 | Question has multiple correct options | Only one option may be correct |
| `PLACEMENT_QUESTION_ORDER_CONFLICT` | 409 | Question order conflicts with an existing question | `order` value already taken within the section |
| `PLACEMENT_QUESTION_PROMPT_REQUIRED` | 422 | Question prompt is required | `prompt` is missing or empty |

Fields never returned to Flutter on question delivery: `correctOptionId`, `skillId`, `weight`, `difficultyScore`.

---

## Placement Attempt Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_ATTEMPT_NOT_FOUND` | 404 | Placement attempt not found | Attempt does not exist or is inaccessible |
| `PLACEMENT_ATTEMPT_NOT_OWNED` | 403 | You do not have access to this attempt | Caller does not own the attempt |
| `PLACEMENT_ATTEMPT_ALREADY_COMPLETED` | 409 | Placement attempt is already completed | Attempt status is already `completed` |
| `PLACEMENT_ATTEMPT_ALREADY_ABANDONED` | 409 | Placement attempt has been abandoned | Attempt status is `abandoned` and cannot be continued |
| `PLACEMENT_RETAKE_NOT_ALLOWED` | 409 | You have already completed a placement test | Retake policy prevents a new attempt |
| `PLACEMENT_ATTEMPT_INVALID_STATUS` | 422 | Attempt status is invalid | Attempt is not in a valid state for this action |
| `PLACEMENT_ATTEMPT_NO_TEST` | 404 | No active placement test found | No published test exists to start an attempt |

---

## Placement Answer Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_ANSWER_ALREADY_SUBMITTED` | 409 | Answer has already been submitted for this question | Duplicate answer for the same question in this attempt |
| `PLACEMENT_ANSWER_INVALID_ATTEMPT` | 400 | Answer cannot be submitted for this attempt | Attempt is not in `in_progress` status |
| `PLACEMENT_ANSWER_QUESTION_NOT_IN_ATTEMPT` | 400 | Question does not belong to this attempt | `questionId` is not part of the current attempt's test |
| `PLACEMENT_ANSWER_OPTION_NOT_FOUND` | 404 | Selected option not found | `selectedOptionId` does not exist for this question |
| `PLACEMENT_ANSWER_OPTION_NOT_IN_QUESTION` | 400 | Selected option does not belong to this question | `selectedOptionId` is from a different question |

Fields never returned on answer submission: `isCorrect`, `score`.

---

## Placement Result Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_RESULT_NOT_FOUND` | 404 | Placement result not found | Result does not exist for this attempt |
| `PLACEMENT_RESULT_NOT_READY` | 400 | Placement result is not yet available | Attempt is complete but result generation is still processing |
| `PLACEMENT_ATTEMPT_NOT_COMPLETED` | 400 | Placement attempt has not been completed | Result cannot be retrieved until attempt is completed |
| `PLACEMENT_RESULT_INVALID_ATTEMPT` | 400 | Invalid attempt for result retrieval | Attempt ID is malformed or does not exist |

Fields never returned to Flutter in result: raw `placementScore`, `confidence`, section scores, or threshold values.

---

## Initial Learning Path Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_PATH_NOT_FOUND` | 404 | Initial learning path not found | Path has not been generated for this result |
| `PLACEMENT_PATH_NOT_READY` | 400 | Initial learning path is not yet available | Path generation is still processing |
| `PLACEMENT_PATH_RESULT_NOT_FOUND` | 404 | Placement result not found for path retrieval | Referenced `placement_result_id` does not exist |

Fields never returned to Flutter in path entries: `skill_id`, `skill_code`, `skill_key`, `source`, `placement_result_id`.

---

## Admin Placement Error Codes

| Code | HTTP Status | Safe Message | Meaning |
|---|---:|---|---|
| `PLACEMENT_ADMIN_ACCESS_DENIED` | 403 | Admin placement access denied | Caller does not have admin placement permissions |
| `PLACEMENT_ADMIN_TEST_LOCKED` | 409 | Placement test is locked and cannot be modified | Test has active or completed attempts |
| `PLACEMENT_ADMIN_SECTION_LOCKED` | 409 | Placement section is locked and cannot be modified | Section belongs to a test with active attempts |
| `PLACEMENT_ADMIN_QUESTION_LOCKED` | 409 | Placement question is locked and cannot be modified | Question belongs to a test with active attempts |
| `PLACEMENT_ADMIN_SKILL_LINK_NOT_FOUND` | 404 | Placement question skill link not found | The specified question-skill mapping does not exist |
| `PLACEMENT_ADMIN_SKILL_LINK_ALREADY_EXISTS` | 409 | Placement question skill link already exists | Duplicate question-skill mapping |
| `PLACEMENT_ADMIN_RESULTS_ACCESS_DENIED` | 403 | Placement results access denied | Caller cannot view placement results |

---

## Safe Client Error Shape

Phase 4 placement errors must fit the shared error response envelope:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PLACEMENT_RETAKE_NOT_ALLOWED",
    "message": "You have already completed a placement test"
  }
}
```

With optional safe validation details:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PLACEMENT_ANSWER_INVALID_ATTEMPT",
    "message": "Answer cannot be submitted for this attempt",
    "details": [
      { "field": "attemptId", "message": "Attempt is not in progress" }
    ]
  }
}
```

---

## Flutter Mobile Handling Rules

Flutter Mobile may:

- use `PLACEMENT_RETAKE_NOT_ALLOWED` to show a safe "already completed" message;
- use `PLACEMENT_ATTEMPT_NOT_COMPLETED` to gate result display;
- use `PLACEMENT_RESULT_NOT_READY` or `PLACEMENT_PATH_NOT_READY` to show a loading state and retry;
- use `PLACEMENT_ANSWER_ALREADY_SUBMITTED` to prevent duplicate submission UI.

Flutter Mobile must not:

- compute or estimate placement score, level, mastery, weakness map, or initial path from error data;
- expose `isCorrect` or any score signal to the learner under any condition;
- override backend attempt or result authority based on local state;
- expose internal error codes or backend diagnostics to the learner.

---

## Admin Dashboard Handling Rules

Admin Dashboard may:

- use admin placement error codes to show safe management messages;
- use `PLACEMENT_ADMIN_TEST_LOCKED` to surface a safe "test has active attempts" warning;
- display `details` items as field-level feedback where present.

Admin Dashboard must not:

- reveal backend scoring internals, threshold values, or skill map logic;
- bypass backend placement authority;
- treat frontend validation as a substitute for backend enforcement.

---

## Done Test — P4-016

This section satisfies P4-016 when:

- `packages/shared-contracts/api/errors.md` is updated with Phase 4 placement error codes;
- placement test, section, question, attempt, answer, result, initial path, and admin error codes are defined;
- all codes use the approved naming convention;
- all messages are safe and never expose score, threshold, mastery, or weakness computation;
- Flutter handling rules confirm no client-side placement scoring is permitted;
- no out-of-scope Phase 5+ feature is introduced;
- no secrets or privileged credentials are exposed.
