# P20-016 — Manual end-to-end verification runbook

## Why this exists

The automated proof for this task
(`services/backend-api/src/features/aim/tests/aim-e2e-chain.integration.spec.ts`)
wires every real persistence service together and proves the code path is
correctly connected, but it stubs the SQL driver — it cannot prove the
*actual* live Supabase project (`yrarpdkvdxszgxxondkt`) ends up with real
rows, because this sandbox has no `DATABASE_URL`/Supabase Postgres
connection string available to a running Jest process (confirmed: no
`DATABASE_URL`/`SUPABASE_*` env vars, no `.env` file — the same pre-existing
environment limitation documented for `prisma migrate deploy` across prior
P20 tasks), and this repo has no existing harness that runs the real
backend-api HTTP server together with a real aim-engine HTTP server.

Run this runbook from a machine (or CI job) that has both services running
and a real `DATABASE_URL` pointed at a project you're allowed to write test
data to (a dedicated dev/staging Supabase project, not a real user's
production data).

## Prerequisites

- `services/backend-api` running locally (`npm run start:dev` or
  equivalent) with `DATABASE_URL` pointed at a real Postgres/Supabase
  project and a valid Supabase JWT signing configuration.
- `services/aim-engine` running locally (`uvicorn app.main:app --port 8010`)
  and reachable from the backend (`AIM_ENGINE_BASE_URL` or equivalent env
  var pointed at it).
- A way to obtain a real Supabase JWT for a test student (e.g. the existing
  test-login flow used elsewhere in this repo's e2e specs — check
  `src/auth/test-login.service.ts` for a sandboxed sign-in path).

## Steps

1. **Create a test student.**
   Sign up (or use the test-login helper) to get a student account and a
   JWT. Note the resulting `student_id`.

2. **Run the student through placement.**
   - `POST /placement/attempts` to start an attempt.
   - Submit answers for every section (`POST /placement/attempts/:id/sections/:sectionId/answers` or
     equivalent — check `placement.controller.ts` for the exact routes).
   - `POST /placement/attempts/:id/complete` to trigger
     `PlacementResultService.createResult` →
     `PlacementInitialLearningPathService.createInitialPath` →
     `PlacementLevelStateService.upsertFromPlacement` (P20-006).

3. **Verify `student_level_state` is populated** (run against your test
   project, substituting the real project id and student id):

   ```sql
   SELECT * FROM student_level_state WHERE student_id = '<student_id>';
   ```

   Expect exactly one row per track, with `source = 'placement'` and
   `current_cefr_rank = max_unlocked_cefr_rank` (the P20-006/P20-011
   placement-time exception).

4. **Submit a lesson attempt that triggers an AIM analysis call.**
   - `POST /lessons/:id/progress` (or whatever endpoint records an attempt
     and triggers `AimPipelineOrchestratorService.analyze`, per
     `docs/phase-5/backend-aim-pipeline-map.md`).
   - This causes a real HTTP call from the backend to the running
     aim-engine (`POST /aim/v1/analysis`), which returns a real
     `AimAnalysisResponse`, which `AimPersistenceService.persist` writes to
     the six category tables plus (P20-013) `AimFocusDirectiveService`
     writes to `ai_focus_directives`.

5. **Verify every table now has a correlated row for the same student:**

   ```sql
   SELECT count(*) FROM student_skill_states WHERE student_id = '<student_id>';
   SELECT count(*) FROM weakness_records      WHERE student_id = '<student_id>';
   SELECT count(*) FROM recommendations       WHERE student_id = '<student_id>';
   SELECT count(*) FROM review_schedules      WHERE student_id = '<student_id>';
   SELECT count(*) FROM student_level_state   WHERE student_id = '<student_id>';
   SELECT count(*) FROM ai_focus_directives   WHERE student_id = '<student_id>';
   ```

   Each should return at least 1. `weakness_records`/`recommendations`/
   `review_schedules`/`ai_focus_directives` counts depend on the specific
   attempt data submitted (e.g. `recommendations` and `ai_focus_directives`
   are always populated if the AIM Engine returned a `recommendations`
   array; `weakness_records` only if the attempt pattern triggers a
   detected weakness) — if any of these come back 0, cross-check the raw
   AIM Engine response body (log it temporarily, or check
   `aim_audit_log`) against `services/aim-engine/app/schemas/aim_analysis_response.py`
   to see which category was empty/null in the actual response, versus
   silently dropped by a contract mismatch (the exact class of bug found
   and fixed in this same task — see `aim-response-mapper.service.ts`'s
   `mapSessionSummary` and the regression test in
   `aim-engine-contract.spec.ts`).

6. **Clean up** the test student and all rows created (`DELETE FROM ...
   WHERE student_id = '<student_id>'` across each table, or drop the whole
   test student row via `ON DELETE CASCADE` if the schema supports it) once
   verified, since this runbook is meant to be run against a project you
   control, not to leave permanent test data behind.

## What "passing" this runbook proves that the automated test cannot

The automated test (`aim-e2e-chain.integration.spec.ts`) proves the TypeScript
code correctly calls the right SQL with the right shape and correlated
`student_id` for a *simulated* AIM Engine response. This runbook additionally
proves:

- The real `aim-engine` process actually accepts the real request shape the
  backend sends (the request-side half of the contract test,
  `aim-engine-contract.spec.ts`, is exercised for real, not just asserted).
- The real Postgres schema (migrations actually applied, constraints
  actually satisfied) accepts the writes without a constraint violation.
- The full placement → level-state → attempt → AIM analysis →
  persistence → focus-directive chain works when driven exactly the way a
  real mobile client would drive it, through real HTTP boundaries.
