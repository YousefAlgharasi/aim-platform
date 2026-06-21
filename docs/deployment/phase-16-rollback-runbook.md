# Phase 16 — Rollback Runbook

**Document ID:** P16-061
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This runbook provides step-by-step rollback procedures for every deployable component in the AIM Platform. It covers the backend API, database migrations, mobile releases, web dashboards, background workers, and configuration changes.

---

## 1. Backend API Rollback (NestJS)

### Service: `services/backend-api/`

**Deployment method:** Container-based deployment (Docker image tagged by commit SHA)

**Rollback steps:**

1. Identify the last known-good image tag from the deployment log.
2. Update the deployment manifest or environment to reference the previous image tag.
3. Redeploy:
   ```
   # Example for container orchestrator
   docker pull aim-platform/backend-api:<previous-tag>
   docker-compose up -d backend-api
   ```
4. Verify health endpoint returns 200:
   ```
   curl -f https://<api-host>/health
   ```
5. Confirm Swagger docs are accessible at `/api` (configured in `src/openapi/openapi.config.ts`).
6. Run a basic auth flow: hit `POST /auth/me` with a valid Supabase JWT.

**Rollback time estimate:** 5-10 minutes.

**Risks:**
- If the new release included database migrations, rolling back the API without rolling back the DB may cause schema mismatches. See Section 3.
- Feature flags or environment variables added in the new release must be removed from the config.

---

## 2. AIM Engine Rollback (Python)

### Service: `services/aim-engine/`

**Deployment method:** Container-based (Python/FastAPI)

**Rollback steps:**

1. Identify the last known-good image tag.
2. Redeploy the previous container image.
3. Verify the engine responds on the configured port (default 8000).
4. Run a placement test request to confirm scoring logic returns valid results.

**Rollback time estimate:** 5-10 minutes.

**Risks:**
- The backend API communicates with the AIM engine via `AIM_ENGINE_URL`. Ensure the rollback version's API contract is compatible with the current backend API version.

---

## 3. Database Migration Rollback (Supabase/PostgreSQL)

### Location: `database/supabase/migrations/`

**Current state:** The migrations directory contains a README but no versioned migration files in the repository. Supabase migrations may be managed via the Supabase CLI or dashboard.

**Rollback steps:**

1. **Before any deployment:** Take a database snapshot (see `phase-16-database-backup-restore-runbook.md`).
2. If using Supabase CLI migrations:
   ```
   supabase db reset --linked  # WARNING: destructive in production
   ```
3. For manual rollback of a specific migration:
   - Identify the migration that needs reversal.
   - Write and test a down migration SQL script.
   - Apply it in a transaction:
     ```sql
     BEGIN;
     -- Reversal DDL statements
     COMMIT;
     ```
4. Verify schema integrity by running the backend API's health check and a sample query.

**Risks:**
- Data-destructive migrations (column drops, table drops) cannot be fully reversed. Always back up before deploying.
- RLS policies (`database/supabase/policies/`) must be consistent with the schema version.

**Current gap:** No automated down-migration scripts exist in the repository. This is a known limitation. Rollback for schema changes requires manual SQL.

---

## 4. Mobile App Rollback (Flutter)

### App: `apps/mobile/`

**Platform:** Android (Google Play) and iOS (App Store)

**Rollback steps — Android:**

1. In Google Play Console, navigate to Release Management > App Releases.
2. Halt the current rollout if it is staged (e.g., 10% rollout).
3. Create a new release using the previous APK/AAB artifact.
4. Submit for review (immediate for staged rollbacks).

**Rollback steps — iOS:**

1. In App Store Connect, remove the current version from sale.
2. Submit the previous build as a new version (App Store requires a new version number).
3. Request expedited review if critical.

**Rollback time estimate:** Android: 1-4 hours (staged). iOS: 24-48 hours (review required).

**Risks:**
- Mobile rollbacks are slow due to store review processes.
- Users who already updated cannot be automatically downgraded.
- If the release included local database schema changes (SQLite/Hive), the rollback build must handle forward-compatible data.

**Mitigation:** Use feature flags and backend-authority patterns to disable features server-side without requiring a client update.

---

## 5. Admin Dashboard Rollback (React)

### App: `apps/admin-dashboard/` (legacy) and `apps/web/` (current)

**Deployment method:** Static build deployed to CDN/hosting.

**Rollback steps:**

1. Identify the previous build artifact or commit SHA.
2. Rebuild from the known-good commit:
   ```
   cd apps/web && npm run build
   ```
3. Deploy the `build/` output to the hosting provider.
4. Verify admin dashboard loads and auth flow works.
5. Spot-check: admin analytics (`src/features/admin-analytics/`), notifications (`src/features/admin-notifications/`).

**Rollback time estimate:** 5-15 minutes.

---

## 6. Parent Dashboard Rollback

### Location: `apps/web/src/features/parent-dashboard/`

The parent dashboard is part of the same `apps/web/` deployment. Rolling back the parent dashboard requires rolling back the entire web app build. Follow the same steps as Section 5.

**Post-rollback verification:**
- Parent can log in and see linked students.
- Parent analytics views load correctly.
- Notification preferences are accessible.

---

## 7. Background Workers and Schedulers

**Current state:** No dedicated worker service exists as a separate deployable in the repository. Background jobs (notification delivery, analytics aggregation, billing webhooks) are handled within the backend API process or via Supabase Edge Functions.

**Rollback steps:**

1. If workers are part of the backend API, rolling back the API (Section 1) also rolls back worker logic.
2. If using Supabase Edge Functions, redeploy the previous function version via the Supabase CLI.
3. Verify job queues are draining correctly after rollback.

**Known gap:** There is no separate worker deployment pipeline documented. This should be addressed in Phase 17.

---

## 8. Configuration Rollback

**Environment variables** are documented in `.env.example`. Configuration is not version-controlled (`.env` files are gitignored).

**Rollback steps:**

1. Revert environment variable changes in the deployment platform (e.g., Supabase dashboard, cloud provider console).
2. Restart affected services to pick up the old configuration.
3. Verify by checking the health endpoint and running a smoke test.

**Variables requiring special attention on rollback:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — changing these breaks all auth flows.
- `AIM_ENGINE_URL` — must match the deployed AIM engine version.
- `AI_PROVIDER_API_KEY`, `AI_PROVIDER_MODEL` — AI teacher functionality depends on these.
- `DATABASE_URL` — must match the database that contains the correct schema version.

---

## 9. Rollback Decision Matrix

| Severity | Response Time | Rollback Trigger |
|----------|---------------|------------------|
| P0 — Complete outage | Immediate | Auth broken, API unresponsive, data loss |
| P1 — Major feature broken | < 30 min | Core learning flow broken, billing errors |
| P2 — Minor feature broken | < 2 hours | UI glitch, non-critical notification failure |
| P3 — Cosmetic | Next business day | Styling issues, minor text errors |

---

## 10. Post-Rollback Checklist

- [ ] All services are healthy (backend API, AIM engine, web app)
- [ ] Auth flow works end-to-end (login, session, role-based access)
- [ ] Mobile app connects to the correct API version
- [ ] Database schema matches the deployed API version
- [ ] RLS policies are consistent with the schema
- [ ] Monitoring and alerting are active
- [ ] Incident postmortem is scheduled if rollback was triggered by an incident

---

## Appendix: Current Gaps

1. **No automated rollback pipeline** — Rollbacks are manual. CI/CD workflows exist in `.github/workflows/` for build/test but not for automated rollback.
2. **No down-migration scripts** — Database rollbacks require manual SQL.
3. **No feature flag system** — Feature disablement requires a code deployment or backend config change.
4. **No canary deployment** — All-or-nothing deployments increase rollback risk.

These gaps should be addressed as part of Phase 17 operational hardening.
