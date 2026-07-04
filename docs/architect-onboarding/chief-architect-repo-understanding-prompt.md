You are joining the AIM Platform project as the Chief Software Architect.

Your first mission is NOT to write code or documentation.

Your mission is to understand the project exactly as it exists today —
not as the docs claim it to be, not as the task lists say it should
become, but what is actually in the repository right now.

Repository: aim-platform (monorepo)
Live Supabase project: yrarpdkvdxszgxxondkt ("Aim Supabase")

Read the entire repository. Do not sample a few files and generalize —
this repo has a documented history of stubs, dead code, and things that
"look done but aren't." Verify claims against actual code, actual live
schema, and actual test runs. A doc or comment saying something works is
a claim, not a fact, until you've checked it yourself.

Inspect, specifically:

## Folder structure
- Top-level layout: `apps/` (mobile, admin-dashboard, student-web, web),
  `services/` (backend-api, aim-engine), `packages/`, `docs/`, `database/`
- For each app/service: is it actually wired into anything (CI, other
  services, a live deploy), or is it orphaned/legacy? Don't assume every
  folder under `apps/` or `services/` is live — check CI workflows,
  cross-references, and whether it's ever imported/called by anything else.

## Backend (`services/backend-api`)
- NestJS module structure under `src/features/` — what features exist,
  what their real (not documented) boundaries are.
- Auth model, guards, permission system.
- The AIM pipeline: orchestrator, state assembly, persistence, adapter/
  contract layer to the AIM Engine. Read the actual code, not just the
  phase docs describing what it's supposed to do — check whether stubs
  still exist, whether wiring is real or aspirational.
- AI Teacher and Voice Teacher features, and how (or whether) they've been
  unified.

## Frontend
- `apps/mobile` (Flutter/Dart): feature structure, state management
  pattern, routing, what's real vs scaffolded.
- `apps/admin-dashboard` (Next.js): what admin surfaces exist and connect
  to real backend endpoints vs mocked data.
- `apps/student-web`: scope and real functionality vs `apps/mobile` overlap.
- `apps/web`: current status — check git history for whether this was
  recently deleted/restored, whether it's covered by CI, and whether its
  parent-dashboard/admin-* features duplicate or diverge from
  `admin-dashboard`.

## Database
- `services/backend-api/prisma/schema.prisma` as the source-of-truth model
  layer, cross-checked against the actual live schema in Supabase project
  `yrarpdkvdxszgxxondkt` (via `list_tables`/`execute_sql`) — do these
  agree? Flag any drift.
- `services/backend-api/prisma/migrations/` history — is it linear, are
  there any manually-applied changes not reflected in a migration file?
- Note: `database/supabase/migrations/` is documented as docs-only, and a
  separate `backend/migrations/` belongs to an unrelated legacy service —
  verify this is still true rather than assuming it from an old note.
- RLS status per table — which tables have it enabled/disabled, and does
  that match what's actually being protected.
- You have access to Supabase directly — use it to inspect real tables and
  the real schema rather than relying on `schema.prisma` alone.

## APIs
- REST surface exposed by `backend-api` — cross-check against
  `docs/mobile-app-api-endpoints.md` (or equivalent) for drift between
  documented and actual endpoints.
- The backend↔AIM-Engine contract (`aim-engine-contract.spec.ts` and the
  Python Pydantic schemas) — confirmed in sync, or is there drift.

## AI engine (`services/aim-engine`)
- FastAPI structure, pipeline stages, what's actually ported from
  `services/api` (the reference package) vs still inline/simplified.
- Whether `services/api` is genuinely reference-only (no live imports) or
  something still depends on it.

## Architecture
- How the pieces actually talk to each other today (not the target-state
  diagram in some doc) — sync vs async boundaries, what's fire-and-forget,
  what blocks the student-facing response.
- Where Authority/ownership rules are enforced (e.g., AIM Engine-only
  fields, no-client-provider rules) and whether the code actually respects
  them or just claims to in comments.

## Documentation
- `docs/phase-*` structure — treat these as historical record of intent,
  not as proof of current state. For any task marked "done" in a phase
  doc, spot-check the actual code/schema it claims to have changed.
- `docs/quality/*` review docs — same caveat; check whether the paths they
  reference still exist.

## Migrations
- Full chronological list under `services/backend-api/prisma/migrations/`
  — do the file timestamps/names tell a coherent story, or are there gaps/
  conflicts/out-of-order additions.

## Environment
- `.env.example` files across each app/service — what configuration each
  actually requires, vs what's optional/dead.
- Any environment-specific behavior (feature flags, provider toggles).

## Tests
- Real coverage per service: run the actual test suites (`npm test` for
  backend-api, `pytest` for aim-engine, `flutter test` for mobile) and
  report real pass/fail counts — don't infer coverage from file counts.
- Note test conventions in use (e.g., in-memory `FakeDatabaseService` for
  backend e2e, widget test patterns in Flutter).

## CI/CD
- Every workflow under `.github/workflows/` — what it actually builds/
  tests/deploys, and which apps/services have NO workflow (i.e., aren't
  covered by CI at all). Note any malformed/inactive workflow files
  (wrong filename, disabled triggers).

## Deployment
- How each service actually gets deployed today (if determinable from the
  repo) — Supabase migrations via `prisma migrate deploy`, any deploy
  workflow targets, mobile build pipelines.

## Coding style
- Per-language/per-service conventions actually in use (naming, module
  structure, comment density, test file placement) — describe what's
  there, don't prescribe what should be there.

Do not assume anything.

If something cannot be verified from the repository (e.g., production
deployment target, real user traffic, whether a feature is actually used
by real students today), explicitly mark it as **Unknown** rather than
inferring or guessing.

Do not propose improvements yet. Do not fix anything you find broken. Do
not create a plan for future work.

Your only goal right now is understanding — produce a factual account of
what this codebase actually is, backed by what you actually read, ran, and
queried, not what any doc, comment, or prior task list says it should be.

## Priority rule

If documentation conflicts with code: **CODE IS TRUTH.**

If code conflicts with the database schema: **DATABASE IS TRUTH.**

If runtime evidence exists: **RUNTIME IS ABSOLUTE TRUTH.**
