# Backend Task — Achievements Feature

This is a separate deliverable from `TASK_LIST.md` (mobile UI tasks). It targets
`services/backend-api/` (NestJS + Prisma/Postgres), not the Flutter app, and is not a GitHub
PR/branch instruction set — it's a standalone task description for whoever picks up the backend
work.

## Why this exists

A prior pass at this repo cross-checked `docs/mobile-app-api-endpoints.md`'s "Planned / Not Yet
Active" list against the real backend code and found it's **stale**: Billing
(`services/backend-api/src/features/billing/`) and Support/Feedback/Release-Notes/Operational-Status
(`services/backend-api/src/features/operations/`) are already fully implemented and registered in
`FeaturesModule` (confirmed via `services/backend-api/src/features/features.module.ts`). Those
docs just have outdated path names (e.g. mobile expects `/billing/plans`, the real endpoint is
`GET /billing/pricing/plans`; mobile expects `/status`, the real endpoint is `GET
/operational-status`) — that's a mobile-side data-source/path-alignment issue, not a backend gap,
and is out of scope for this task.

**The one genuine backend gap is Achievements.** A full search of
`services/backend-api/prisma/migrations/` and `services/backend-api/src/features/` turned up zero
references to achievements, badges, or milestones anywhere — no table, no module, no controller. The
Flutter screen (`apps/mobile/lib/features/achievements/ui/pages/achievements_page.dart`, screen #59
in `docs/design/ui-for-all-system-mobile/screenshots/INDEX.md`) currently only renders its empty
state because there is nothing to fetch.

════════════════════════════════════════════════════════
## TASK — Build the Achievements Feature (schema + API)
Branch: `feat/achievements-api` (suggested — not enforced, this isn't tied to the mobile-ui branch)
Service: `services/backend-api/`
Depends on: nothing — independent of the mobile UI task list
════════════════════════════════════════════════════════

### CLAUDE CODE PROMPT

You are working on the backend API in `services/backend-api/` (NestJS + Prisma/Postgres on
Supabase). Your job is to design and build a complete, production-ready Achievements feature:
schema, repository, service, controller, tests — following the exact conventions already used
elsewhere in this codebase. Do not touch the Flutter app (`apps/mobile/`) or any other backend
feature.

#### Step 0 — Read before writing anything

1. **Read the Supabase schema you have access to.** Use the Supabase MCP tools
   (`mcp__Supabase__list_projects` to find the project, then `mcp__Supabase__list_tables` with
   `verbose: true` against the `public` schema) to see the live table set, exact column types, and
   existing foreign keys — do not rely on migration files alone, since the live schema is the
   actual source of truth for what already exists and what naming/typing conventions are in use.
   Cross-reference what you find against `services/backend-api/prisma/migrations/` to confirm they
   agree before you design new tables. If the Supabase MCP tools aren't available or access is
   denied in your environment, fall back to reading the latest migration files in
   `services/backend-api/prisma/migrations/` (sorted by timestamp prefix) as the next-best source
   of truth, and say so explicitly in your final summary.
2. Read `services/backend-api/src/features/engagement/` in full
   (`engagement.module.ts`, `engagement.controller.ts`, `engagement.service.ts`,
   `engagement.repository.ts`, `engagement.types.ts`) — this is the closest existing feature in
   shape and domain (gamification, per-student derived state, backend-authoritative) and is your
   primary pattern reference.
3. Read one migration file in full, e.g.
   `services/backend-api/prisma/migrations/20260629210000_create_engagement_tables/migration.sql`,
   to learn the house style: descriptive header comment block stating scope and backend-authority
   rules, explicit `CREATE TABLE IF NOT EXISTS`, `UUID PRIMARY KEY`, `TIMESTAMPTZ NOT NULL DEFAULT
   now()` audit columns, named `CHECK` constraints, and an explicit "scope guard" comment listing
   what this migration deliberately does NOT touch.
4. Read `services/backend-api/src/features/operations/support-ticket.controller.ts` and
   `support-ticket.service.ts` for a second reference on REST conventions: `@ApiTags`,
   `@ApiBearerAuth()`, `SupabaseJwtAuthGuard` + `RoleGuard` + `@RequireRoles(...)`, resolving the
   user from `@CurrentUser()` rather than trusting client-supplied IDs, and DTO validation style.
5. Read `services/backend-api/src/features/features.module.ts` to see exactly how a feature module
   gets registered (you'll add `AchievementsModule` here, following the same import + array-entry
   pattern as `BillingModule`/`OperationsModule`).
6. Check `services/backend-api/jest.config.js` and the `test`/`test:watch`/`test:cov` scripts in
   `services/backend-api/package.json`, and look at
   `services/backend-api/src/features/operations/__tests__/feedback-workflow.spec.ts` as a test-style
   reference (one of the existing `__tests__/` specs in a feature most similar to this one).

#### Step 1 — Design the schema

Based on what `docs/mobile-ui-screens.md` (§19, screen 59) and
`docs/design/ui-for-all-system-mobile/SCREENS.md` (Achievements section) describe — a gallery of
unlockable achievement/badge tiles with locked/unlocked visual states — design the minimum schema
needed:

- An `achievement_definitions` table (backend-seeded content, not client-writable): id, key
  (unique slug), title, description, icon reference, category, and whatever unlock-criteria
  metadata is needed (mirror how `daily_challenge_templates` in the engagement migration is
  structured as seeded, read-only-to-clients content — same pattern applies here).
- A `student_achievements` table (per-student unlock state): student_id, achievement_id,
  unlocked_at (nullable — null means locked), and progress tracking columns if the design implies
  partial progress (e.g. "3 of 5 lessons completed" toward an achievement) — check the screenshots
  (`screenshots/light/59-screen.png`, `screenshots/dark/59-screen.png`) and `SCREENS.md` for whether
  partial-progress display is actually shown before adding progress columns; don't add fields the
  UI doesn't use.
- Follow the exact migration file conventions from Step 0.3: header comment block, scope guard,
  `student_id` typed to match how other per-student tables type it (check `student_learning_goals`
  for the exact type — likely `UUID` referencing `auth.users`/`users`), named constraints.
- Verify against the live Supabase schema (Step 0.1) whether a more generic "badges" or "milestones"
  concept already exists under a different name before creating new tables — if you find one, use
  it instead of creating a duplicate; if genuinely nothing exists, proceed with new tables.
- Add the migration under `services/backend-api/prisma/migrations/` with a correctly-ordered
  timestamp prefix (must sort after the latest existing migration).

#### Step 2 — Build the feature module

Create `services/backend-api/src/features/achievements/` mirroring the `engagement/` structure:
- `achievements.module.ts` — imports `DatabaseModule`, `AuthModule`, `RolesModule`, `UsersModule`
  (same as `engagement.module.ts`); registers controller + repository + service; exports the
  service.
- `achievements.repository.ts` — raw parameterized SQL via `DatabaseService.query<T>()` (same
  pattern as `EngagementRepository`), never string-interpolated SQL. Methods: list all achievement
  definitions, list a student's unlock state, and whatever write path is needed for the backend to
  mark an achievement unlocked (this should be backend-triggered — e.g. invoked from wherever lesson
  completion / streak / assessment-pass events are already processed — not a public
  client-writable endpoint; check how `engagement`'s streak logic gets triggered for the equivalent
  pattern, and if unlock-triggering logic belongs in another feature's existing event flow rather
  than here, say so in your summary rather than guessing at integration points you're not sure of).
- `achievements.service.ts` — business logic: merge achievement definitions with the student's
  unlock state into a single response shape (locked/unlocked/progress per achievement), matching
  exactly what `achievements_page.dart` will need.
- `achievements.types.ts` — response/DTO interfaces.
- `achievements.controller.ts`:
  ```
  @Controller('student/achievements')
  @UseGuards(SupabaseJwtAuthGuard, RoleGuard)
  @RequireRoles(AuthorizedRole.STUDENT)
  ```
  with `GET /student/achievements` returning the merged locked/unlocked list — `studentId` always
  resolved from `@CurrentUser()`, never from a query param or body, matching every other
  student-facing controller in this codebase. Only add a second endpoint (e.g. achievement detail)
  if the screenshots/SCREENS.md actually show a detail view; don't invent one.
- Register `AchievementsModule` in `services/backend-api/src/features/features.module.ts`, in both
  the `imports` array and the (apparent duplicate, check why it appears twice in the existing file
  before assuming it's a mistake — it may be intentional for a test/exports list) second array,
  following the exact insertion pattern used for `BillingModule`/`OperationsModule`.

#### Step 3 — Match existing endpoint conventions exactly

Before finishing, diff your new controller/module against `engagement.controller.ts` and
`support-ticket.controller.ts` line by line for:
- `@ApiTags`, `@ApiBearerAuth()`, `@ApiOperation`, `@ApiOkResponse` Swagger decorators present on
  every route (these are used elsewhere — confirm by checking if there's a generated OpenAPI spec
  under `services/backend-api/src/openapi/` that needs regenerating, and regenerate it if there's an
  existing script for that).
- Identical guard stack and role requirement pattern.
- Identical error handling — check how `engagement.service.ts` or `support-ticket.service.ts`
  surfaces not-found/validation errors (likely via a shared error class under
  `services/backend-api/src/common/errors/`) and reuse it instead of inventing new error types.
- Response shape style (camelCase JSON keys, consistent with other controllers' DTOs).

#### Step 4 — Test before considering this done

1. Write unit/integration tests under `services/backend-api/src/features/achievements/__tests__/`
   (or co-located `.spec.ts` files, matching whichever pattern the `engagement` or `operations`
   feature actually uses — check both before picking) covering: empty state (no achievements
   unlocked yet), partial unlock state, and the guard/auth rejection path (non-student role, no
   JWT).
2. Run `npm test` (or `yarn`/whatever the repo's package manager is — check
   `services/backend-api/package.json`'s `packageManager` field or lockfile) scoped to the new
   files, e.g. `npx jest --config ./jest.config.js achievements`, from inside `services/backend-api/`,
   and confirm it passes.
3. Run the full test suite once (`npm test`) to confirm you haven't broken anything in
   `features.module.ts` or shared modules from the registration change.
4. If the project has a migration-apply step for local/dev testing (check
   `services/backend-api/package.json` scripts and `database/supabase/README.md` for how migrations
   are normally applied — e.g. `prisma migrate dev` or a Supabase CLI command), run it locally and
   confirm the new tables actually get created without error before considering the migration done.
5. Do NOT deploy or push the migration against any shared/staging/production Supabase project — only
   verify it applies cleanly against your local/dev database. Flag in your summary if you were
   unable to test against a real database at all (e.g. no local DB available in your environment) so
   a human can do that verification step before this gets deployed.

#### Step 5 — Summarize

In your final message, report: the exact table names/columns you created, the exact endpoint
path(s) and response shape, confirmation that `npm test` passed, confirmation (or explicit
non-confirmation, with reason) that the migration applies cleanly to a real database, and any
integration point you flagged as uncertain (e.g. where achievement-unlock events should actually be
triggered from) rather than guessed at.

── END OF TASK PROMPT ──
