# Phase 16 Secret Management Audit

**Task:** P16-010
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Audit expected secrets across the AIM Platform, documenting ownership,
storage location, rotation policy, and forbidden secret locations. This
audit checks the actual codebase for `.env` patterns, secret references,
and potential leaks.

## Secret Inventory

### Backend-Only Secrets (Never in Client Code)

| Secret | Owner | Storage (Dev) | Storage (Prod) | Rotation Policy |
|--------|-------|---------------|----------------|-----------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Backend team | Local `.env` file | Secret manager | Rotate quarterly or on compromise |
| `SUPABASE_JWT_SECRET` | Backend team | Local `.env` file | Secret manager | Rotate quarterly or on compromise |
| `DATABASE_URL` | Backend team + DBA | Local `.env` file | Secret manager | Rotate on personnel change |
| `AI_PROVIDER_API_KEY` | Backend team | Local `.env` file | Secret manager | Rotate quarterly |
| `AI_PROVIDER_MODEL` | Backend team | Local `.env` file | Environment variable | N/A (not a secret, but backend-only) |
| `STT_PROVIDER_API_KEY` | Backend team | Local `.env` file | Secret manager | Rotate quarterly |
| `STT_PROVIDER_MODEL` | Backend team | Local `.env` file | Environment variable | N/A (not a secret, but backend-only) |

### Client-Safe Public Values

| Variable | Used By | Classification |
|----------|---------|----------------|
| `SUPABASE_URL` | All clients | Public — Supabase project URL |
| `SUPABASE_ANON_KEY` | All clients | Public — anonymous/publishable key |
| `NEXT_PUBLIC_BACKEND_API_BASE_URL` | Admin Dashboard | Public — API endpoint |
| `REACT_APP_API_BASE_URL` | Web App | Public — API endpoint |
| `REACT_APP_SUPABASE_URL` | Web App | Public — Supabase URL |
| `REACT_APP_SUPABASE_PUBLISHABLE_KEY` | Web App | Public — anon key |

### Internal Service URLs

| Variable | Used By | Classification |
|----------|---------|----------------|
| `AIM_ENGINE_URL` | Backend API | Internal — not exposed to clients |
| `CORS_ORIGINS` | Backend API | Configuration — not a secret |

## Codebase Audit Results

### 1. `.env` Files

**`.gitignore` rules verified:**
- `.env` — excluded
- `.env.local` — excluded

**Committed `.env` files:**
- `.env.example` (root) — Contains placeholders only (`<placeholder>`, `<project-ref>`). Safe.
- `apps/web/.env.example` — Contains example URLs only. Safe.
- `apps/admin-dashboard/.env.example` — Contains example names/URLs only. Safe.

**No real `.env` files are committed.** The `scripts/check-env-safety.sh`
script enforces this check programmatically.

### 2. Secret Reference Audit

Files referencing secret variables (excluding `node_modules/`, docs, and
phase-16 files created in this audit):

| File | Context | Safe? |
|------|---------|-------|
| `services/backend-api/src/config/backend-config.validation.ts` | Validates presence of env vars at startup | Yes — reads from `process.env`, no hardcoded values |
| `services/backend-api/src/config/backend-config.spec.ts` | Tests config validation with mock env | Yes — uses test fixtures |
| `services/backend-api/src/database/database.service.ts` | Reads `DATABASE_URL` from config | Yes — uses NestJS ConfigService |
| `services/backend-api/src/auth/README.md` | Documents JWT configuration | Yes — documentation only |
| `services/backend-api/src/features/ai-teacher/provider-gateway/provider-gateway.config.ts` | Reads `AI_PROVIDER_API_KEY` from config | Yes — backend-only service |
| `services/backend-api/src/features/ai-teacher/provider-gateway/provider-gateway-no-secret-check.service.ts` | Validates AI key is not exposed | Yes — this IS a safety check |
| `services/backend-api/src/features/voice-teacher/stt-gateway/stt-gateway.config.ts` | Reads `STT_PROVIDER_API_KEY` from config | Yes — backend-only service |
| `services/backend-api/test/setup-test-env.ts` | Sets test environment variables | Yes — test-only, no real values |
| `services/backend-api/prisma/schema.prisma` | `env("DATABASE_URL")` reference | Yes — standard Prisma pattern |
| `services/backend-api/db.js` | Database connection setup | Yes — reads from env at runtime |
| `apps/mobile/lib/core/config/app_config.dart` | Flutter app configuration | Requires review — must not contain secret keys |
| `infra/docker/docker-compose.yml` | Docker environment configuration | Yes — uses env var substitution |
| `infra/deployment/cloud/render.yaml` | Cloud deployment config | Yes — uses env groups, no hardcoded values |

### 3. Client-Side Secret Check

**Mobile App (`apps/mobile/`):**
- `lib/core/config/app_config.dart` — References `SUPABASE_URL` and `SUPABASE_ANON_KEY` (client-safe). Does NOT reference `SERVICE_ROLE_KEY`, `JWT_SECRET`, `AI_PROVIDER_API_KEY`, or `STT_PROVIDER_API_KEY`. Safe.
- `docs/no-aim-logic.md` — Documents the prohibition on client-side AIM logic. Safe.

**Admin Dashboard (`apps/admin-dashboard/`):**
- `lib/api/admin-api-config.ts` — Reads `NEXT_PUBLIC_BACKEND_API_BASE_URL` from `process.env`. Uses `NEXT_PUBLIC_` prefix (client-bundled, non-secret). Safe.
- `lib/api/README.md` — Documents API configuration. Safe.

**Web App (`apps/web/`):**
- `src/shared/api/supabaseClient.js` — Uses `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY`. Client-safe values. Safe.
- `src/shared/api/client.js` — Uses `REACT_APP_API_BASE_URL`. Client-safe. Safe.
- `src/features/parent-dashboard/api/*.js` — API clients using base URL config. Safe.
- `src/features/admin-analytics/api/*.js` — API clients using base URL config. Safe.

### 4. Safety Tooling

| Tool | Location | Purpose |
|------|----------|---------|
| `scripts/check-env-safety.sh` | Root | Blocks committed `.env` files, checks for real secret patterns in tracked files |
| `provider-gateway-no-secret-check.service.ts` | Backend API | Runtime check that AI provider key is not accidentally exposed |
| `.github/pull_request_template.md` | Root | PR checklist includes secret scanning |
| Docs CI workflow | `.github/workflows/docs.yml` | Checks for FastAPI references, Student Web App references |

### 5. Forbidden Secret Locations

Secrets must NEVER appear in:

| Location | Reason |
|----------|--------|
| Any file in `apps/mobile/` | Flutter bundles are decompilable |
| Any file in `apps/web/` | Browser JS is publicly readable |
| Any file in `apps/admin-dashboard/` (except server-only API routes) | Next.js client bundle is publicly readable |
| Any `NEXT_PUBLIC_*` or `REACT_APP_*` variable | These are bundled into client-side code |
| `--dart-define` for `SERVICE_ROLE_KEY`, `JWT_SECRET`, `AI_PROVIDER_API_KEY` | Flutter compile-time constants are embedded in the binary |
| GitHub Actions workflow files | Use GitHub Secrets instead of inline values |
| `docs/` directory | Documentation is publicly accessible |
| Prisma seed files | Seeds may be shared; use dummy data only |

## Rotation Procedures

### Supabase Keys
1. Generate new keys in Supabase dashboard
2. Update secret manager in production
3. Restart Backend API service
4. Verify health check passes
5. Revoke old keys after grace period

### AI/STT Provider Keys
1. Generate new key in provider dashboard
2. Update secret manager in production
3. Restart Backend API service
4. Verify AI Teacher / Voice Teacher health
5. Revoke old key

### Database URL
1. Create new database password in Supabase
2. Update secret manager with new connection string
3. Restart Backend API service
4. Verify database connectivity

## Audit Findings

### Passed
- [x] No real secrets committed to the repository
- [x] `.gitignore` correctly excludes `.env` and `.env.local`
- [x] `.env.example` uses placeholders only
- [x] Client apps use only client-safe public values
- [x] Safety check script exists (`scripts/check-env-safety.sh`)
- [x] AI provider key exposure check exists
- [x] PR template includes secret scanning reminder

### Recommendations
- [ ] Add `scripts/check-env-safety.sh` to CI pipeline (currently not in any workflow)
- [ ] Configure GitHub secret scanning alerts for the repository
- [ ] Add pre-commit hook for secret detection (e.g., `detect-secrets` or `trufflehog`)
- [ ] Document secret rotation runbook for operations team
- [ ] Set up secret expiration alerts in the secret manager
