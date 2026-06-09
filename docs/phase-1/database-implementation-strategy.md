# Phase 1 — Database Implementation Strategy

## Decision

**ORM:** Prisma  
**Migration tool:** Prisma Migrate  
**Database:** Supabase PostgreSQL  
**Framework:** NestJS + TypeScript

## Rationale

Prisma is selected for the following reasons:

| Criterion | Prisma | TypeORM |
|---|---|---|
| TypeScript support | First-class — auto-generated types from schema | Good, but manual decorator-heavy |
| NestJS integration | Official `@nestjs/prisma` pattern, PrismaService | `@nestjs/typeorm` available |
| Supabase compatibility | Connects via DATABASE_URL, compatible with Supabase PostgreSQL | Compatible |
| Migration system | SQL-generating `prisma migrate dev` / `prisma migrate deploy` | Built-in but less predictable SQL output |
| Developer experience | Schema-first, single `schema.prisma` source of truth | Code-first with decorators scattered across models |
| Community/ecosystem | Dominant choice for NestJS + PostgreSQL in 2025 | Mature but declining adoption |

Prisma's schema-first approach fits Supabase PostgreSQL cleanly: Prisma owns query building and type generation, while Supabase owns the database host, connection pooling, Auth, and RLS policies.

## Stack Mapping

```
NestJS Service
  └── PrismaService (injected as NestJS provider)
        └── Prisma Client (auto-generated, type-safe)
              └── Supabase PostgreSQL (DATABASE_URL connection)

Migrations:
  prisma/schema.prisma  ──►  prisma migrate dev  ──►  prisma/migrations/*.sql
                                                        └── Applied to Supabase PostgreSQL
```

## Supabase Integration Notes

- Connection string: `DATABASE_URL` env var using Supabase's PostgreSQL connection string (direct or pooler).
- Row-Level Security (RLS) policies are managed separately via Supabase CLI (`database/supabase/policies/`). Prisma does not manage RLS.
- Supabase Auth UIDs are used as foreign keys in Prisma models for the `User` identity mapping.
- `prisma migrate deploy` is used for production migrations. `prisma migrate dev` is for local development only.
- The `supabase/migrations/` folder (`database/supabase/migrations/`) is reserved for Supabase-native RLS and policy migrations, not Prisma schema migrations.

## Migration Folder

Prisma migrations are stored in `services/backend-api/prisma/migrations/`.

The folder is created and seeded in P1-034.

## Constraints

- Do not commit real `DATABASE_URL` values. Use `.env.example` placeholders only.
- Do not create the full schema in this task. Schema tables are defined in Phase 2 and later.
- Do not bypass Prisma to write raw SQL for data operations where Prisma queries are available.
- RLS policies must still be enforced at the Supabase database level. Prisma authorization is not a substitute.

## Phase 1 Scope

Phase 1 creates:
- Prisma schema file skeleton (`schema.prisma`) with database connection block only.
- PrismaService and PrismaModule in NestJS.
- Empty `prisma/migrations/` folder.

Phase 1 does not create:
- Full data models or table definitions.
- Production migration files.
- Seed scripts beyond strategy documentation.

## Related Documents

- `docs/phase-1/system-foundation-charter.md`
- `docs/phase-1/repo-structure.md`
- `docs/phase-1/environment-strategy.md` (P1-009)
- `docs/phase-1/identity-mapping-plan.md` (P1-035)
- `docs/phase-1/database-security-plan.md` (P1-037)
