# Database Client Foundation

## Purpose

P1-033 establishes the Backend API database client foundation.

This is a foundation-only task. It does not create the production schema.

## Approved Boundary

Database access is backend-owned.

```text
Flutter Mobile / Admin Dashboard
  |
  | Backend API request
  v
Backend API
  |
  | DatabaseService
  v
Supabase PostgreSQL
```

Clients must not connect directly to Supabase PostgreSQL.

## Runtime Configuration

The Backend API database connection uses:

```text
DATABASE_URL
```

This value must be provided through the backend environment strategy and validated by the backend config layer.

No database credentials may be committed.

## Added Backend Structure

```text
services/backend-api/src/database/
  database.module.ts
  database.service.ts
  database.types.ts
  index.ts
  README.md
```

## DatabaseService Responsibilities

The initial service owns:

- PostgreSQL pool creation
- connection lifecycle cleanup
- safe query helper
- client callback helper
- safe health check result

## Non-Goals

This task does not implement:

- schema
- migrations
- seed data
- repositories
- feature queries
- RLS policies
- auth/ownership checks
- AIM Engine persistence
- analytics tables
- production data access workflows

## Future Tasks

Future database tasks should add:

- migration folder structure
- schema migrations
- identity mapping tables
- role and ownership schema
- repository patterns
- RLS policies
- integration tests

## Security Rules

- Backend API remains the database boundary.
- Flutter Mobile must not read/write database directly.
- Admin Dashboard must not read/write database directly.
- Supabase service-role key must not be exposed to clients.
- Query parameters must be parameterized.
- Health checks must not expose connection strings, hostnames, usernames, or credentials.
