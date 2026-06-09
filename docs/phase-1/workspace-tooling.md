# Phase 1 — Workspace Tooling Decision

## Decision

The AIM Platform monorepo uses **per-service tooling** with no root-level polyglot workspace manager. Each service and application manages its own dependencies independently using its native toolchain.

There is no `package.json` at the repository root that attempts to manage Node.js, Python, and Flutter services in a single workspace. This avoids lock-file conflicts, mixed-language tooling complexity, and CI failures caused by unnecessary dependency coupling.

## Per-Service Tooling

| Service / App | Language | Package Manager | Install Command | Run Command |
|---|---|---|---|---|
| `services/backend-api/` | TypeScript / Node.js | npm | `npm install` | `npm run start:dev` |
| `services/aim-engine/` | Python | pip + `requirements.txt` | `pip install -r requirements.txt` | `python -m uvicorn app.main:app --reload` or `python main.py` |
| `apps/mobile/` | Dart / Flutter | Flutter CLI (`pub`) | `flutter pub get` | `flutter run` |
| `apps/admin-dashboard/` | TypeScript / Node.js | npm | `npm install` | `npm run dev` |

## Root-Level Conventions

- The repository root has no `package.json`, `pyproject.toml`, or `pubspec.yaml`.
- The `scripts/` folder provides convenience wrapper scripts for common workflows (install all, run all services, run tests). See `scripts/README.md`.
- Docker Compose (`infra/docker/`) is the recommended way to run all services locally together. See `infra/docker/README.md`.

## Node.js Services (Backend API, Admin Dashboard)

- **Package manager:** npm (default, avoids pnpm-specific hoisting edge cases with NestJS).
- **Node.js version:** Documented in a `.nvmrc` or `engines` field in each service's `package.json`.
- **Lock file:** `package-lock.json` committed to each service directory.
- **No root-level npm workspaces.** Services do not share `node_modules`.

## Python Service (AIM Engine)

- **Package manager:** pip.
- **Dependency file:** `requirements.txt` at `services/aim-engine/requirements.txt`.
- **Virtual environment:** `venv` recommended for local development. Not committed.
- **Python version:** Documented in `services/aim-engine/.python-version` or `README.md`.
- **No system-level pip installs in scripts.** Use `pip install -r requirements.txt` inside a virtual environment.

## Flutter Mobile

- **Package manager:** Flutter pub (`flutter pub get`).
- **Dependency file:** `apps/mobile/pubspec.yaml`.
- **Flutter version:** Documented in `apps/mobile/.fvmrc` or `README.md`. Use FVM (Flutter Version Manager) if multiple Flutter versions are needed in CI.
- **Generated files:** `apps/mobile/pubspec.lock` committed.

## CI Implications

Each CI pipeline job installs only the dependencies for its target service:

- Backend CI: runs `npm install` in `services/backend-api/`.
- AIM Engine CI: runs `pip install -r requirements.txt` in `services/aim-engine/`.
- Flutter CI: runs `flutter pub get` in `apps/mobile/`.
- Admin CI: runs `npm install` in `apps/admin-dashboard/`.

No CI job installs all services together.

## What This Decision Does Not Do

- Does not use pnpm workspaces or yarn workspaces across the repo.
- Does not use Turborepo or Nx (deferred — can be added in a future open decision if build caching becomes necessary).
- Does not create a root `package.json` or root `pyproject.toml`.
- Does not install any dependencies in this task. Dependency installation is done in each service's Phase 1 skeleton task.

## Related Documents

- `docs/phase-1/repo-structure.md`
- `docs/phase-1/system-foundation-charter.md`
- `scripts/README.md`
- `infra/docker/README.md`
