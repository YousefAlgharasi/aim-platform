# services/backend-api — NestJS Backend API

Phase 1 Backend API. NestJS + TypeScript.

**Phase 1 scope:** App skeleton, config validation, health and version endpoints, global response and error handling, request ID and logging, auth guard skeleton, role and ownership guards, feature module skeletons, OpenAPI setup, and testing foundation.

**Constraints:**
- NestJS + TypeScript is the Phase 1 Backend API. FastAPI is the completed MVP pilot only.
- Does not expose AI provider keys to any client.
- Does not allow cross-student data access.
- Validates Supabase JWT on every authenticated request.
- Calls AIM Engine through backend-internal integration only.

See `docs/phase-1/repo-structure.md` and `docs/phase-1/system-foundation-charter.md`.
