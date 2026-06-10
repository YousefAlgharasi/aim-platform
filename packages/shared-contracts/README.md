# packages/shared-contracts

Cross-service contract definitions for the AIM Platform. Used by Backend API (`services/backend-api/`), Flutter Mobile (`apps/mobile/`), and Admin Dashboard (`apps/admin-dashboard/`).

## Contents

### `api/`

API contract documentation.

- Response envelope definition (success shape, error shape reference, metadata shape).
- Error contract and error code registry.
- Request/response field conventions.

### `enums/`

Common cross-service enum definitions.

- User roles.
- Session statuses.
- Lesson types.
- Question types.
- Recommendation action types.

### `errors/`

Error contract documentation.

- Standard error codes.
- Safe client message rules.
- Error response shape.

### `safe-fields/`

Field exposure boundary documentation.

- Learner-safe fields.
- Admin/internal-only fields.
- Forbidden client fields (AIM internals, AI Teacher internals).

## Constraints

- Documentation and schema definitions only. No runtime business logic.
- No npm package, no compiled output, no build step in Phase 1.
- All services reference these contracts as documentation. Code-level type sharing is deferred to Phase 2+.

## Related Documents

- `docs/phase-1/repo-structure.md` — Authoritative folder structure.
- `docs/phase-1/system-foundation-charter.md` — Phase 1 scope and constraints.
