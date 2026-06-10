# Phase 1 — Environment Variable Strategy

## Purpose

This document defines the environment variable strategy, naming conventions, secret boundaries, and `.env.example` rules for Phase 1 — System Foundation. All Phase 1 tasks that involve environment configuration must follow this strategy.

---

## Core Rules

### No Real Secrets in the Repository

`.env.example` contains placeholders only. No real credentials, tokens, API keys, database passwords, or JWT secrets are committed to the repository — in any file, in any branch.

Any `.env` file with real values must be listed in `.gitignore` and never committed.

### Backend-Only AI Provider Keys

AI provider API keys (OpenAI, Anthropic, or any other provider) are read from the backend environment only.

- `services/backend-api/` reads AI provider keys from its own `.env`.
- `services/aim-engine/` reads AI provider keys from its own `.env` if it calls providers directly.
- `apps/mobile/`, `apps/admin-dashboard/`, and any client never receive, store, or forward AI provider keys.

### Supabase Key Boundaries

Supabase exposes two key types with different scopes:

| Key Type | Variable Name | Where Allowed |
|---|---|---|
| Publishable (anon) key | `SUPABASE_ANON_KEY` | Backend API, Admin Dashboard (public read scoped) |
| Service-role key | `SUPABASE_SERVICE_ROLE_KEY` | Backend API only — never in any client |
| JWT secret (legacy) | `SUPABASE_JWT_SECRET` | Backend API only — never in any client |

Flutter Mobile never receives any Supabase key directly. All data flows through the Backend API.

---

## Service-Specific Variable Naming

### `services/backend-api/` — NestJS + TypeScript

```
# Application
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<placeholder>
SUPABASE_SERVICE_ROLE_KEY=<placeholder>
SUPABASE_JWT_SECRET=<placeholder>

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres

# AIM Engine
AIM_ENGINE_URL=http://localhost:8000

# AI Teacher Gateway (backend-only)
AI_PROVIDER_API_KEY=<placeholder>
AI_PROVIDER_MODEL=<placeholder>

# CORS
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

### `services/aim-engine/` — Python

```
# Application
APP_ENV=development
PORT=8000

# Supabase (read-only access if needed)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<placeholder>

# AI Provider (if AIM Engine calls providers directly)
AI_PROVIDER_API_KEY=<placeholder>
```

### `apps/admin-dashboard/` — Internal Admin Dashboard

```
# Application
NEXT_PUBLIC_APP_ENV=development

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Supabase (publishable/anon key only — no service-role key)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<placeholder>
```

### `apps/mobile/` — Flutter Mobile

Flutter Mobile uses Dart environment variables or a `lib/config/` file with build-time constants. These values are set at build time and must never include service-role keys, JWT secrets, or AI provider keys.

```
# Build-time constants (dart-define or config file)
API_BASE_URL=http://localhost:3000
APP_ENV=development
```

No `.env` file is committed for Flutter. Values are passed via `--dart-define` flags or a local config file excluded from git.

---

## `.env.example` Rules

1. Every variable that any service reads must have a corresponding entry in `.env.example`.
2. Values in `.env.example` are placeholders only: `<placeholder>`, `https://<project-ref>.supabase.co`, etc.
3. Real values, real URLs with credentials, real API keys, and real JWT secrets must never appear.
4. Variables are grouped by service with clear section comments.
5. The file is updated whenever a new environment variable is introduced to any service.

---

## `.gitignore` Requirements

The following must be listed in `.gitignore`:

```
.env
.env.local
.env.production
.env.*.local
services/backend-api/.env
services/aim-engine/.env
apps/admin-dashboard/.env
apps/admin-dashboard/.env.local
```

---

## Variable Prefix Conventions

| Prefix | Scope | Examples |
|---|---|---|
| `NEXT_PUBLIC_` | Admin Dashboard browser-side (public) | `NEXT_PUBLIC_API_BASE_URL` |
| _(no prefix)_ | Backend API / AIM Engine server-side (private) | `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER_API_KEY` |
| Dart `--dart-define` | Flutter build-time (compiled in) | `API_BASE_URL` |

Never use `NEXT_PUBLIC_` for service-role keys, JWT secrets, or AI provider keys. `NEXT_PUBLIC_` variables are bundled into the browser client.

---

## Forbidden Variable Placements

| Variable | Forbidden Location |
|---|---|
| `AI_PROVIDER_API_KEY` | `apps/mobile/`, `apps/admin-dashboard/`, any client |
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/mobile/`, `apps/admin-dashboard/`, any client |
| `SUPABASE_JWT_SECRET` | `apps/mobile/`, `apps/admin-dashboard/`, any client |
| Any real credential | `.env.example`, any committed file |

---

## Related Documents

- `docs/phase-1/repo-structure.md` — Folder structure and service boundaries.
- `docs/phase-1/workspace-tooling.md` — Per-service tooling and install commands.
- `docs/phase-1/system-foundation-charter.md` — Phase 1 non-negotiables including secret exposure rules.
