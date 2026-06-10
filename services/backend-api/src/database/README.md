# Backend Database Client Foundation

P1-033 adds the Backend API database client foundation.

## Scope

This foundation provides:

- A NestJS `DatabaseModule`.
- A reusable `DatabaseService`.
- PostgreSQL connection pooling through `pg`.
- Connection configuration via the validated backend config boundary.
- A safe health-check helper.
- No schema or table implementation.

## Configuration Boundary

The database connection must come from the backend configuration validation work.

Expected environment variable:

```text
DATABASE_URL
```

The module reads the value through `BackendConfigService`.

No credentials are committed in this module.

## Usage

Future backend feature modules may import `DatabaseModule` and inject `DatabaseService`.

Example:

```ts
constructor(private readonly database: DatabaseService) {}
```

Then use parameterized queries only:

```ts
await this.database.query(
  'select * from example where id = $1',
  [id],
);
```

## Forbidden

Do not add the following in this foundation task:

- full production schema
- migrations
- seed data
- learner data queries
- direct Supabase service-role usage
- credentials
- client-side database access
- AIM Engine calculations
- Flutter database calls

## Security Notes

- Backend API remains the only approved boundary for database access.
- Flutter Mobile must not connect to the database directly.
- Admin Dashboard must not connect to the database directly.
- AIM Engine must not bypass Backend API ownership/security boundaries unless a later backend-only task explicitly scopes it.
- RLS policy implementation belongs to later database security tasks.

## Done Test

This foundation is complete when:

- `DatabaseModule` exists.
- `DatabaseService` exists.
- Database connection uses validated config.
- No schema is implemented.
- No credentials are committed.
