# scripts — Local Development Scripts

Convenience scripts for installing, checking, testing, and running all Phase 1 services.

## Prerequisites

| Tool | Version | Required For |
|---|---|---|
| Node.js | 20+ | backend-api, admin-dashboard |
| Python | 3.11+ | aim-engine |
| Flutter | 3.22+ | mobile |
| Docker + Compose | v2+ | docker mode |

---

## Scripts

### `install.sh` — Install dependencies

```bash
./scripts/install.sh           # all services
./scripts/install.sh backend   # backend-api only
./scripts/install.sh aim-engine
./scripts/install.sh admin
./scripts/install.sh mobile
```

Creates a `venv` under `services/aim-engine/` if it does not already exist.

---

### `check.sh` — Lint and type-check

```bash
./scripts/check.sh             # all services
./scripts/check.sh backend     # tsc --noEmit
./scripts/check.sh aim-engine  # ruff check + ruff format --check
./scripts/check.sh admin       # tsc --noEmit
./scripts/check.sh mobile      # flutter analyze
```

Exits non-zero if any check fails. Run before pushing.

---

### `test.sh` — Run tests

```bash
./scripts/test.sh              # all services
./scripts/test.sh backend      # npm test (Jest)
./scripts/test.sh aim-engine   # pytest
./scripts/test.sh admin        # tsc --noEmit (no runtime tests in Phase 1)
./scripts/test.sh mobile       # flutter test
```

Exits non-zero if any test suite fails.

---

### `dev.sh` — Start a service in development mode

```bash
./scripts/dev.sh backend       # NestJS watch mode — port 3000
./scripts/dev.sh aim-engine    # uvicorn --reload — port 8010
./scripts/dev.sh admin         # next dev — port 3001
./scripts/dev.sh mobile        # flutter run
./scripts/dev.sh docker        # docker compose up (backend-api + aim-engine)
```

Each command runs in the foreground. Open separate terminals for multiple services, or use the `docker` mode to start backend services together.

---

## Environment Variables

Scripts do not source or inject environment variables. Set them in the relevant service `.env` file before running. See `docs/phase-1/environment-strategy.md`.

## Constraints

- No script commits, reads, or prints real credentials.
- No destructive commands (no `DROP`, `DELETE`, `rm -rf`).
- All scripts are documented and exit non-zero on failure.
- Scripts are not required for CI — GitHub Actions workflows manage CI independently.
