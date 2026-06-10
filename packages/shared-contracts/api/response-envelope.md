# API Response Envelope Contract

## Purpose

Defines the standard response envelope used by the AIM Platform Backend API. All responses — success, error, and paginated — must conform to this shape. Flutter Mobile, Admin Dashboard, and any other consumer must expect this contract on every endpoint.

---

## Success Envelope

### Shape

```json
{
  "success": true,
  "data": <object | array | null>,
  "meta": <object | null>
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | Yes | Always `true` for success responses. |
| `data` | `object \| array \| null` | Yes | Response payload. `null` for operations with no return value (e.g. delete). |
| `meta` | `object \| null` | No | Pagination, counts, or supplementary metadata. `null` if not applicable. |

### Rules

- `success` is always `true` on a successful response. It is never absent.
- `data` is always present. It is `null` only for operations where no payload exists (e.g. logout, delete).
- `meta` is omitted or `null` on non-paginated single-resource responses.
- No additional top-level keys are added. All payload belongs inside `data` or `meta`.

---

## Error Envelope

### Shape

```json
{
  "success": false,
  "error": {
    "code": "<ERROR_CODE>",
    "message": "<safe human-readable message>",
    "details": <array | null>
  }
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `success` | `boolean` | Yes | Always `false` for error responses. |
| `error` | `object` | Yes | Error descriptor. |
| `error.code` | `string` | Yes | Machine-readable error code. See `errors.md`. |
| `error.message` | `string` | Yes | Safe, client-displayable message. Must not expose internals. |
| `error.details` | `array \| null` | No | Per-field validation errors or additional context. `null` if not applicable. |

### Rules

- `success` is always `false` on an error response.
- `error.code` is always a string from the defined error code registry (`errors.md`).
- `error.message` is safe for client display. It must never contain stack traces, SQL fragments, internal service names, or file paths.
- `error.details` is present only for validation errors. Each entry describes a specific field failure.
- `data` is absent on error responses. It is never `null` with an error present.

---

## Metadata Shape

### Shape

```json
{
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 84,
    "total_pages": 5
  }
}
```

### Fields

| Field | Type | Description |
|---|---|---|
| `page` | `integer` | Current page number (1-indexed). |
| `per_page` | `integer` | Items returned per page. |
| `total` | `integer` | Total item count across all pages. |
| `total_pages` | `integer` | Total number of pages. |

### Rules

- `meta` is only included on paginated list responses.
- `meta` is `null` or omitted on single-resource and non-paginated responses.
- Pagination fields are always integers. Never strings or floats.

---

## HTTP Status Code Mapping

| Scenario | HTTP Status | `success` |
|---|---|---|
| Resource returned | 200 | `true` |
| Resource created | 201 | `true` |
| No content (delete, logout) | 204 | _(no body)_ |
| Validation error | 422 | `false` |
| Auth required | 401 | `false` |
| Forbidden | 403 | `false` |
| Not found | 404 | `false` |
| Conflict | 409 | `false` |
| Rate limited | 429 | `false` |
| Server error | 500 | `false` |

204 responses carry no body. All other responses carry the envelope.

---

## Examples

### Single Resource — Success

```json
HTTP 200
{
  "success": true,
  "data": {
    "id": "usr_01j2abc",
    "display_name": "Learner",
    "role": "student"
  },
  "meta": null
}
```

### Created Resource — Success

```json
HTTP 201
{
  "success": true,
  "data": {
    "id": "ses_01j2xyz",
    "status": "active",
    "created_at": "2026-01-15T10:00:00Z"
  },
  "meta": null
}
```

### Paginated List — Success

```json
HTTP 200
{
  "success": true,
  "data": [
    { "id": "q_001", "type": "multiple_choice" },
    { "id": "q_002", "type": "fill_blank" }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 84,
    "total_pages": 5
  }
}
```

### Validation Error

```json
HTTP 422
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      { "field": "email", "message": "Must be a valid email address." },
      { "field": "password", "message": "Must be at least 8 characters." }
    ]
  }
}
```

### Auth Error

```json
HTTP 401
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required.",
    "details": null
  }
}
```

### Server Error

```json
HTTP 500
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred. Please try again.",
    "details": null
  }
}
```

---

## Forbidden Patterns

The following must never appear in any response:

- Stack traces in `error.message` or `error.details`.
- Internal service names, database table names, or column names in any field.
- SQL error messages or ORM error output.
- File system paths.
- Environment variable values.
- JWT secret, API keys, or any credential fragment.
- Raw Supabase or database error objects.

---

## Related Documents

- `packages/shared-contracts/errors.md` — Error code registry and error contract.
- `docs/phase-1/system-foundation-charter.md` — Phase 1 security and safety non-negotiables.
- `docs/phase-1/safe-field-exposure-contract.md` — Field-level exposure boundaries.
