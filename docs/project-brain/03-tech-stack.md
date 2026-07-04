# 03 — Tech Stack

> Last verified: 2026-07-04 — versions confirmed by direct file reads (`package.json`, `pyproject.toml`, `.metadata`) and, for Flutter, by actually installing the pinned SDK and running `flutter --version` + the full test suite in this session.

| App/Service | Stack | Pinned version (where determinable) | Notes |
|---|---|---|---|
| `services/backend-api` | NestJS / TypeScript, Node.js | Node 20 (per `backend-api.yml` CI `setup-node@v4` config: `node-version: '20'`) | Raw `pg` for DB access, not an ORM at runtime (Prisma used only for migration files/schema, not query execution). |
| `services/aim-engine` | Python / FastAPI, pydantic v2 | Python 3.11 (per `aim-engine.yml` CI) | Stateless service; `ruff` for lint+format (enforced in CI, both lint and format-check steps present). |
| `services/api` | Python (reference package, now live-imported — see `06-folder-structure.md`) | — | Not a standalone deployed service; imported at runtime by aim-engine via a `sys.path` hack. |
| `apps/mobile` | Flutter / Dart | **Flutter 3.44.1, Dart 3.12.1** — confirmed exactly by installing the SDK matching the hash pinned in `apps/mobile/.metadata` (`924134a44c189315be2148659913dda1671cbe99`, stable channel) and running `flutter --version` in this session | State management: `flutter_riverpod` (`StateNotifier`/`StateNotifierProvider` + `AppAsyncState<T>` wrapper pattern, confirmed repo-wide — no Bloc/plain-Provider found). Routing: `go_router`. `pubspec.yaml` SDK constraint: `>=3.3.0 <4.0.0`. |
| `apps/admin-dashboard` | Next.js / TypeScript | Node 24 (per `admin-dashboard.yml` CI: `node-version: '24'`) | |
| `apps/student-web` | React (Create React App) / TypeScript, package `@aim/student-web` | — | Has its own CI (`student-web.yml`). |
| `apps/web` | React (Create React App) / JavaScript, package name `"frontend"` | — | **No CI workflow exists for this app** — confirmed by grepping every `.github/workflows/*.yml` file for `apps/web`, zero matches. |
| Database/Auth | Supabase (Postgres + Supabase Auth) | Live project `yrarpdkvdxszgxxondkt` | Backend never uses the Supabase JS/Python SDK for auth verification (hand-rolled JWT verification) or, as far as confirmed this session, for Storage (no Storage SDK usage found in `services/backend-api/src`). |

## Version mismatches found

- **`@prisma/client` vs. `prisma` CLI** — `@prisma/client@7.8.0` is installed
  alongside `prisma@6.19.3` CLI in this environment, which breaks
  `prisma generate`/`prisma validate` locally without an explicit
  `DATABASE_URL`. Already logged in `project-memory.json.open_questions`.
  Does not block the running app (raw `pg` via `DatabaseService`), only the
  local Prisma CLI workflow. Not independently re-verified as
  environment-specific vs. a real deploy-blocking issue in this session.
- **Flutter `pub outdated`**: `flutter pub get` (run this session) reported
  22 packages with newer versions incompatible with current constraints
  (e.g. `go_router` 14.8.1 vs. 17.3.0 available, `riverpod` 2.6.1 vs. 3.3.2
  available, `permission_handler` 11.4.0 vs. 12.0.3 available). These are
  pinned-but-outdated, not broken — the app builds and all 838 tests pass
  at the pinned versions.

## What is Unknown

- Exact Node.js version used for `services/backend-api` at deploy time
  beyond CI's pinned `20` (Render deploy config in `render.yaml` doesn't
  independently pin a Node version — inherits from the Dockerfile, not
  read in this pass).
- Exact Next.js/React major version numbers were not individually extracted
  from `package.json` in this pass (folder-level stack identification only).
- Production Python version for `services/aim-engine` deploy, beyond CI's
  pinned `3.11`.
