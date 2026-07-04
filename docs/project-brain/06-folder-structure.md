# 06 — Folder Structure

> Last verified: 2026-07-04, by directly listing the repo tree and cross-checking CI workflow coverage and import graphs. Matches `project-memory.json.architecture` where it overlaps; this document is the more detailed/current version — if the two ever disagree, this file (being freshly re-verified) should be treated as current and `project-memory.json` updated to match.

## `apps/`

- **`apps/mobile`** — Flutter/Dart. **Live**, wired into CI (`mobile.yml`
  analyze+test, `mobile-build.yml` APK/AAB on tag push + manual dispatch).
  Most complete student-facing surface.
- **`apps/admin-dashboard`** — Next.js. **Live**, wired into CI
  (`admin-dashboard.yml`). Primary admin surface, ~90 real backend-connected
  pages confirmed this session.
- **`apps/student-web`** — React/CRA. **Live**, wired into CI
  (`student-web.yml`). Thinner than mobile; several features are explicit
  "not available yet" stubs (progress, settings, practice).
- **`apps/web`** — React/CRA. **Live on `main`, zero CI coverage** (confirmed
  by grepping every workflow file for `apps/web` — no matches). Deleted
  (PR #1306) then restored (PR #1307, confirmed merged this session via
  `git log`). Hosts the only Parent Dashboard implementation in the repo,
  plus a second, overlapping set of admin AI/analytics/notifications
  screens that duplicate `admin-dashboard`'s.

## `services/`

- **`services/backend-api`** — NestJS/TypeScript. **Live**, CI-covered
  (`backend-api.yml`, build+test+Render-deploy job). Owns all persistence
  and orchestration; 298 suites/3,158 tests passing (verified this session).
- **`services/aim-engine`** — Python/FastAPI. **Live**, CI-covered
  (`aim-engine.yml`, ruff lint+format+pytest). Stateless analysis service;
  176 tests passing, 95.8% coverage (verified this session).
- **`services/api`** — Python. **Not reference-only** (correcting
  `PROJECT_STATE.md`'s stale self-flagged claim) — `services/aim-engine`
  live-imports 6 domain services from `services/api/src/aim/domain/services/`
  via a `sys.path` hack at runtime. No CI of its own.
- **`services/backend`** — Python. **Orphaned/legacy** — no CI, zero imports
  from any live code, confirmed by repo-wide grep this session.

## `packages/`

- **`packages/ai_core`** — **Dead**. 15 one-line compatibility shims whose
  `sys.path` insert points at a nonexistent `packages/src` directory. Zero
  real imports anywhere in the repo (confirmed by grep).
- **`packages/ml`** — **Dead**, same pattern as `ai_core`.
- **`packages/content`** — static curriculum seed JSON/schemas. Consumed
  only by one pytest fixture test; not imported by any running service.
- **`packages/shared-contracts`** — markdown-only API contract docs,
  explicitly scoped by its own README as "no runtime logic, Phase 1." Not
  imported by code, as designed.

## `docs/`

- `docs/phase-1` through `docs/phase-21` (and named docs like `AIM_023`
  through `AIM_027`) — **historical record of stated intent**, not proof of
  current state. This session found several such docs stale relative to
  actual code (e.g. `PROJECT_STATE.md`'s "services/api reference-only"
  claim, and the pre-fix RLS status).
- `docs/architect-onboarding/` — houses `project-memory.json`, the seed for
  this Project Brain.
- `docs/mobile-app-api-endpoints.md` — spot-checked against real controllers
  this session (voice-teacher section matched exactly); not exhaustively
  diffed.
- `docs/project-brain/` — **this document set**, newly created this session.

## `database/`

- **`database/supabase/migrations`** — documented as docs-only; confirmed
  still true this session (nothing live references it).
- Root **`backend/migrations`** belongs to the unrelated legacy
  `services/backend`/root `backend/` service — confirmed still true.

## Root-level files of note

- `render.yaml` — Render deploy config for `aim-backend-api` (Docker web
  service, `autoDeploy: false`).
- `.github/dependabotggggggg.yml` — malformed filename (typo), GitHub never
  reads it as a dependabot config; still references a stale `/apps/web` entry.
- `PROJECT_STATE.md` — root-level, updated-after-every-merge state summary
  (introduced this session's earlier work, per `decisions_log`).
