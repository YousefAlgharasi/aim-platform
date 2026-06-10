# Backend API Prisma Migration Foundation

## Purpose

This folder defines the initial migration structure for the AIM Platform Backend API.

It follows the Phase 1 database implementation direction:

- ORM: Prisma
- Migration tool: Prisma Migrate
- Database: Supabase PostgreSQL
- Backend service: NestJS + TypeScript
- Schema execution: Backend-owned, not client-owned

This task creates folder structure and workflow documentation only. It does not define the production schema and does not apply migrations.

## Folder Structure

```text
services/backend-api/prisma/
├── README.md
├── migrations/
│   └── .gitkeep
├── schema/
│   └── .gitkeep
└── seeds/
    └── .gitkeep
```

## Folder Responsibilities

### `migrations/`

This folder is reserved for Prisma Migrate-generated migration folders.

Expected future layout:

```text
migrations/
└── 20260611000000_initial_foundation/
    └── migration.sql
```

Rules:

- Migration folders must be generated intentionally.
- Do not manually add production schema migrations in Phase 1 unless a task explicitly requires it.
- Do not include secrets, connection strings, Supabase keys, or local database URLs.
- Do not apply migrations from learner clients or admin clients.
- Backend/service tooling owns migrations.

### `schema/`

This folder is reserved for future schema planning notes or split schema documentation if needed.

Rules:

- Do not treat this folder as a runtime source of truth until an approved implementation task defines that.
- Do not introduce a full Prisma schema here unless a later task explicitly requires it.
- Keep any planning files aligned with `docs/phase-1/database-implementation-strategy.md`.

### `seeds/`

This folder is reserved for future safe seed data.

Rules:

- Seed data must be non-secret.
- Seed data must not contain real users, real learners, real parent records, provider keys, or production data.
- Seed scripts must be introduced by a later explicit task.

## Future Migration Workflow

Future implementation should follow this workflow:

1. Confirm the schema change is approved by a Phase 1 or later task.
2. Update the Prisma schema in the backend service when the schema task exists.
3. Generate a migration using Prisma Migrate.
4. Review generated SQL before commit.
5. Confirm the SQL does not include secrets or environment-specific values.
6. Commit the generated migration folder under `services/backend-api/prisma/migrations/`.
7. Apply migrations only from backend-controlled tooling or CI/CD.
8. Verify Supabase PostgreSQL compatibility.
9. Document any RLS policy dependency separately.

## Supabase Notes

Supabase integration must follow these rules:

- Supabase PostgreSQL is the default Phase 1 database direction.
- Supabase Auth UID must remain the identity anchor for user mapping.
- Supabase RLS policy decisions must be documented separately from Prisma schema changes.
- Service role credentials must never be committed.
- Local and production connection strings must be read from environment variables only.
- Pooler/direct connection choice must follow the environment strategy and database implementation strategy.

## Phase 1 Boundaries

This folder must not introduce:

- Full production schema.
- Runtime database client code.
- NestJS modules.
- Real credentials.
- Supabase service-role keys.
- Generated Prisma Client output.
- Client-side database access.
- Flutter database logic.
- AIM mastery, level, weakness, difficulty, retention, or recommendation calculations.
- Student Web App scope.

## Client Boundary

Clients must not run migrations.

This includes:

- Flutter Mobile
- Admin Dashboard
- future parent surfaces
- any future learner web surface

Only backend-controlled tooling may own schema migration execution.

## Relation to AIM Logic

Database migrations must not move AIM logic into clients.

Future schema may store backend/AIM outputs, but:

- AIM Engine remains backend/internal.
- Backend API mediates AIM output exposure.
- Clients must not calculate mastery, weakness, retention, difficulty, or recommendations locally.
- Speed must not directly raise mastery, level, difficulty, or recommendation state.

## Acceptance Notes

- Migration folder structure exists.
- Structure matches the selected Prisma Migrate strategy.
- README explains future migration workflow.
- No full schema was implemented.
- No migration SQL was created.
- No credentials were committed.
- No runtime code was added.
- No client AIM logic was added.
- No Student Web App work was added.

## Related Documents

- `docs/phase-1/database-implementation-strategy.md`
- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/open-decisions.md`
- `docs/tasks/phase_1_task_prompts.md`
