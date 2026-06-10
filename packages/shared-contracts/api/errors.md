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
