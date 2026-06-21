# Phase 16 — Database Backup and Restore Runbook

**Document ID:** P16-062
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This runbook documents backup, restore, verification, point-in-time recovery (PITR), and access control procedures for the AIM Platform database infrastructure.

---

## 1. Database Architecture Overview

The AIM Platform uses **Supabase** as its primary database provider, which runs **PostgreSQL** under the hood.

**Key locations in the codebase:**
- Database configuration: `database/supabase/config.toml`
- Migration scripts: `database/supabase/migrations/`
- RLS policies: `database/supabase/policies/`
- Seed data: `database/supabase/seed/`
- Local development DB: `database/aim_dev.db` (SQLite, for local testing only)
- Backend database module: `services/backend-api/src/database/`
  - `database.module.ts` — NestJS database module
  - `database.service.ts` — Database service with connection management
  - `database.types.ts` — Type definitions for database entities

**ORM/Query layer:** Prisma (`@prisma/client` in `services/backend-api/package.json`)

---

## 2. Backup Procedures

### 2.1 Supabase Managed Backups

Supabase Pro plans include automatic daily backups with 7-day retention. These are managed by Supabase infrastructure.

**To verify backup status:**
1. Log in to the Supabase Dashboard.
2. Navigate to Project Settings > Database > Backups.
3. Confirm the most recent backup completed successfully.

### 2.2 Manual Backup (pg_dump)

For on-demand backups before deployments or migrations:

```bash
# Set connection string (never commit real credentials)
export DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres"

# Full database dump (schema + data)
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="aim_backup_$(date +%Y%m%d_%H%M%S).dump"

# Schema-only dump (for migration verification)
pg_dump "$DATABASE_URL" \
  --schema-only \
  --format=plain \
  --file="aim_schema_$(date +%Y%m%d_%H%M%S).sql"
```

### 2.3 Table-Level Backup

For targeted backups of specific tables before risky migrations:

```bash
# Example: backup the profiles table
pg_dump "$DATABASE_URL" \
  --table=public.profiles \
  --format=custom \
  --file="profiles_backup_$(date +%Y%m%d_%H%M%S).dump"
```

**Tables requiring special backup attention:**
- `profiles` — User identity and role data
- `students` — Student records and parent linkage
- `curriculum_*` — Curriculum content and structure
- `assessments` / `assessment_results` — Student assessment data
- `placements` — Placement test results
- `billing_*` — Subscription and payment records
- `notifications` — Notification history
- `analytics_*` — Aggregated analytics data

### 2.4 Pre-Deployment Backup Checklist

- [ ] Identify tables affected by the migration
- [ ] Run a full database dump
- [ ] Run a targeted dump for affected tables
- [ ] Store the dump in a secure, access-controlled location
- [ ] Verify the dump file is not corrupted (see Section 4)
- [ ] Record the backup timestamp and the current migration version

---

## 3. Restore Procedures

### 3.1 Full Restore from pg_dump

```bash
# Restore from a custom-format dump
pg_restore \
  --dbname="$DATABASE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  "aim_backup_YYYYMMDD_HHMMSS.dump"
```

**WARNING:** `--clean` drops existing objects before recreating them. This is destructive and should only be used for full restores.

### 3.2 Table-Level Restore

```bash
# Restore a single table
pg_restore \
  --dbname="$DATABASE_URL" \
  --table=profiles \
  --clean \
  --if-exists \
  --no-owner \
  "profiles_backup_YYYYMMDD_HHMMSS.dump"
```

### 3.3 Schema-Only Restore

For cases where data is intact but the schema needs correction:

```bash
psql "$DATABASE_URL" < aim_schema_YYYYMMDD_HHMMSS.sql
```

### 3.4 Restore from Supabase Dashboard

1. Navigate to Project Settings > Database > Backups.
2. Select the desired backup point.
3. Click "Restore" and confirm.
4. Wait for the restore to complete (progress shown in dashboard).
5. Verify the application connects and functions correctly.

---

## 4. Backup Verification

### 4.1 Dump File Integrity Check

```bash
# Verify the dump file can be read
pg_restore --list "aim_backup_YYYYMMDD_HHMMSS.dump" > /dev/null
echo "Exit code: $?"  # 0 = success
```

### 4.2 Restore to a Test Database

```bash
# Create a temporary database for verification
createdb aim_verify_restore

# Restore to the test database
pg_restore \
  --dbname=aim_verify_restore \
  --no-owner \
  "aim_backup_YYYYMMDD_HHMMSS.dump"

# Run verification queries
psql aim_verify_restore -c "SELECT count(*) FROM profiles;"
psql aim_verify_restore -c "SELECT count(*) FROM students;"

# Clean up
dropdb aim_verify_restore
```

### 4.3 Row Count Comparison

After restore, compare row counts against pre-backup counts:

```sql
SELECT schemaname, relname, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 5. Point-in-Time Recovery (PITR)

### 5.1 Supabase PITR

Supabase Pro plans with PITR enabled allow recovery to any point within the retention window.

**Steps:**
1. Navigate to Supabase Dashboard > Database > Backups > Point in Time.
2. Select the target timestamp.
3. Confirm the recovery. This creates a new database instance.
4. Update `DATABASE_URL` in the backend API configuration to point to the recovered instance.
5. Verify application functionality.

### 5.2 PITR Limitations

- PITR is only available on Supabase Pro plans.
- Recovery creates a new database instance; connection strings change.
- Supabase Edge Functions and Auth data may not be included in PITR.
- RLS policies are part of the schema and are included in PITR.

### 5.3 Current PITR Status

**Status: Not verified.** The Supabase project plan and PITR configuration have not been confirmed as part of this Phase 16 review. This should be verified before production release.

---

## 6. Access Controls

### 6.1 Database Access Roles

| Role | Access Level | Purpose |
|------|-------------|---------|
| `postgres` (superuser) | Full | Schema management, migrations |
| `service_role` | Full data access, bypasses RLS | Backend API service operations |
| `anon` | Limited by RLS policies | Unauthenticated client access |
| `authenticated` | Limited by RLS policies | Authenticated user access |

### 6.2 Access Control Rules

1. **Production database credentials** must never be committed to the repository. The `.gitignore` excludes `.env` files, and `.env.example` contains only placeholders.
2. **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) must only be used server-side in the backend API. It is never exposed to clients.
3. **JWT secret** (`SUPABASE_JWT_SECRET`) is used by the backend API for JWT verification (`services/backend-api/src/auth/supabase-jwt-verifier.service.ts`).
4. **Backup files** must be stored in encrypted, access-controlled storage. Never store backup dumps in the repository.
5. **Developer access** to production databases should be restricted to senior engineers and require MFA.

### 6.3 RLS Policy Verification

After any restore, verify RLS policies are intact:

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Compare against the policy definitions in `database/supabase/policies/`.

---

## 7. Disaster Recovery Scenarios

### Scenario A: Corrupted Data from Bad Migration

1. Stop the backend API to prevent further writes.
2. Identify the last good backup before the migration.
3. Restore from backup (Section 3.1).
4. Reapply RLS policies if needed.
5. Restart the backend API with the previous code version.
6. Verify data integrity.

### Scenario B: Accidental Table Drop

1. Restore the specific table from the most recent backup (Section 3.2).
2. Verify foreign key relationships are intact.
3. Reapply RLS policies for the restored table.

### Scenario C: Full Database Loss

1. Use Supabase's managed backup restore (Section 3.4) or PITR (Section 5.1).
2. If Supabase backups are unavailable, restore from the most recent manual dump.
3. Verify all tables, RLS policies, and seed data.
4. Update connection strings if the database instance changed.

---

## 8. Current Gaps

1. **No automated backup verification** — Backup integrity is not automatically tested.
2. **No backup monitoring/alerting** — No alerts for failed backups.
3. **Migration files not in repository** — The `database/supabase/migrations/` directory contains only a README. Migration history may only exist in the Supabase dashboard.
4. **PITR not verified** — The Supabase plan level and PITR configuration are unconfirmed.
5. **No backup retention policy documented** — Retention periods depend on the Supabase plan.

These gaps should be addressed in Phase 17 operational hardening.
