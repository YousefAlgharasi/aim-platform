# Release Environment Map

**Task:** P16-009
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document the local, CI, staging, and production environments for the AIM
Platform, including environment variables, service endpoints, and
deployment targets.

## Environment Overview

| Environment | Purpose | Infrastructure | Data |
|-------------|---------|----------------|------|
| **Local** | Developer workstation | Docker / native processes | Seed data from `prisma/seeds/` |
| **CI** | Automated testing on push/PR | GitHub Actions runners | Ephemeral; fresh DB per run |
| **Staging** | Pre-production validation | Cloud-hosted (mirrors production) | Production-like seed data |
| **Production** | Live user-facing | Cloud-hosted | Real user data |

## Service Architecture

```
                     +-----------------+
                     |   Mobile App    |
                     |  (Flutter)      |
                     +--------+--------+
                              |
                              | HTTPS (Bearer JWT)
                              |
+------------------+    +-----v------+    +------------------+
| Admin Dashboard  |    |  Backend   |    |   Web App        |
| (Next.js)        +--->|  API       |<---+   (React)        |
+------------------+    | (NestJS)   |    +------------------+
                        +-----+------+
                              |
                 +------------+------------+
                 |                         |
          +------v------+         +-------v--------+
          |  AIM Engine |         | Supabase       |
          |  (Python)   |         | (Auth + DB)    |
          +-------------+         +----------------+
```

## Local Environment

### Services and Ports

| Service | Default Port | Start Command | Working Directory |
|---------|-------------|---------------|-------------------|
| Backend API | 3000 | `npm run start:dev` | `services/backend-api/` |
| AIM Engine | 8000 | `pip install -e ".[dev]" && python -m app` | `services/aim-engine/` |
| Admin Dashboard | 3001 (Next.js dev) | `npm run dev` | `apps/admin-dashboard/` |
| Web App (Parent) | 3002 (React dev) | `npm start` | `apps/web/` |
| Mobile App | N/A (device/emulator) | `flutter run` | `apps/mobile/` |

### Environment Variables — Local

Defined in `.env.example` (root) with sections for each service.

**Backend API (`services/backend-api/.env`):**

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `NODE_ENV` | Runtime environment | `development` |
| `PORT` | HTTP listen port | `3000` |
| `SUPABASE_URL` | Supabase project URL | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (client-safe) | `<placeholder>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (SECRET) | `<placeholder>` |
| `SUPABASE_JWT_SECRET` | JWT verification secret (SECRET) | `<placeholder>` |
| `SUPABASE_JWT_ISSUER` | JWT issuer claim | `https://<project-ref>.supabase.co` |
| `SUPABASE_JWT_AUDIENCE` | JWT audience claim | `authenticated` |
| `DATABASE_URL` | PostgreSQL connection string (SECRET) | `postgresql://postgres...` |
| `AIM_ENGINE_URL` | Internal AIM Engine URL | `http://localhost:8000` |
| `AI_PROVIDER_API_KEY` | AI provider API key (SECRET) | `<placeholder>` |
| `AI_PROVIDER_MODEL` | AI model identifier | `<placeholder>` |
| `STT_PROVIDER_API_KEY` | Speech-to-text key (SECRET) | `<placeholder>` |
| `STT_PROVIDER_MODEL` | STT model identifier | `<placeholder>` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3001,http://localhost:3002` |

**AIM Engine (`services/aim-engine/.env`):**

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `APP_ENV` | Runtime environment | `development` |
| `AIM_ENGINE_PORT` | HTTP listen port | `8000` |

**Admin Dashboard (`apps/admin-dashboard/.env`):**

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `NEXT_PUBLIC_ADMIN_APP_NAME` | App display name | `AIM Admin Dashboard` |
| `NEXT_PUBLIC_BACKEND_API_BASE_URL` | Backend API URL | `http://localhost:3000` |

**Web App (`apps/web/.env`):**

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `https://aim-api.example.com` |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://example.supabase.co` |
| `REACT_APP_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | `<placeholder>` |

**Mobile App (Flutter `--dart-define`):**

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `AIM_ENV` | Runtime environment | `local` |
| `BACKEND_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `SUPABASE_URL` | Supabase project URL | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `<placeholder>` |

## CI Environment (GitHub Actions)

### Workflows

| Workflow | File | Runner | Trigger |
|----------|------|--------|---------|
| Backend API CI | `.github/workflows/backend-api.yml` | `ubuntu-latest` | Push/PR to `main` on `services/backend-api/**` |
| Flutter Mobile CI | `.github/workflows/mobile.yml` | `ubuntu-latest` | Push/PR to `main` on `apps/mobile/**` |
| Admin Dashboard CI | `.github/workflows/admin-dashboard.yml` | `ubuntu-latest` | Push/PR to `main` on `apps/admin-dashboard/**` |
| AIM Engine CI | `.github/workflows/aim-engine.yml` | `ubuntu-latest` | Push/PR to `main` on `services/aim-engine/**` |
| Docs Consistency CI | `.github/workflows/docs.yml` | `ubuntu-latest` | Push/PR to `main` on `docs/**` |

### CI Steps per Workflow

| Workflow | Steps |
|----------|-------|
| Backend API | Checkout, Node.js 24 setup, `npm ci`, `npm run build`, `npm run test` |
| Mobile | Checkout, Flutter setup (stable), `flutter pub get`, `flutter analyze`, `flutter test` |
| Admin Dashboard | Checkout, Node.js 24 setup, `npm ci`, `npm run typecheck`, `npm run build` |
| AIM Engine | Checkout, Python 3.11 setup, `pip install -e ".[dev]"`, `ruff check`, `ruff format --check`, `pytest` |
| Docs | Checkout, conflict marker check, FastAPI reference check, Student Web App check, speed-as-mastery check, required files existence check |

### CI Environment Variables

| Variable | Source | Used By |
|----------|--------|---------|
| `NODE_ENV=test` | Inline in workflow | Backend API CI |

No secrets are configured in CI workflows as tests use mocks. If
integration tests are added, GitHub Secrets must be configured for
Supabase credentials.

## Staging Environment

### Expected Configuration (Not Yet Provisioned)

| Service | Deploy Target | URL Pattern |
|---------|---------------|-------------|
| Backend API | Cloud Run / ECS / similar | `https://api.staging.aim-platform.example` |
| AIM Engine | Cloud Run / ECS (internal) | `http://aim-engine:8000` (service mesh) |
| Admin Dashboard | Vercel / Cloud hosting | `https://admin.staging.aim-platform.example` |
| Web App | Vercel / Cloud hosting | `https://app.staging.aim-platform.example` |
| Database | Supabase (staging project) | Supabase dashboard |

### Staging-Specific Configuration

| Variable | Staging Value |
|----------|---------------|
| `NODE_ENV` | `staging` |
| `CORS_ORIGINS` | Staging domain origins |
| `SUPABASE_URL` | Staging Supabase project URL |
| `AIM_ENGINE_URL` | Internal staging AIM Engine URL |

## Production Environment

### Expected Configuration (Not Yet Provisioned)

| Service | Deploy Target | URL Pattern |
|---------|---------------|-------------|
| Backend API | Cloud Run / ECS / similar | `https://api.aim-platform.example` |
| AIM Engine | Cloud Run / ECS (internal) | `http://aim-engine:8000` (service mesh) |
| Admin Dashboard | Vercel / Cloud hosting | `https://admin.aim-platform.example` |
| Web App | Vercel / Cloud hosting | `https://app.aim-platform.example` |
| Mobile App | App Store / Google Play | N/A |
| Database | Supabase (production project) | Supabase dashboard |

### Production-Specific Configuration

| Variable | Production Notes |
|----------|-----------------|
| `NODE_ENV` | `production` |
| `CORS_ORIGINS` | Production domain origins only |
| `SUPABASE_SERVICE_ROLE_KEY` | Rotated regularly; stored in secret manager |
| `AI_PROVIDER_API_KEY` | Production AI provider key; stored in secret manager |
| `STT_PROVIDER_API_KEY` | Production STT key; stored in secret manager |
| `DATABASE_URL` | Production PostgreSQL connection; stored in secret manager |

## Secret Classification

| Classification | Variables | Storage |
|----------------|-----------|---------|
| **Never in client** | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `DATABASE_URL` | Secret manager (Cloud Run secrets, AWS Secrets Manager, etc.) |
| **Client-safe public** | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (and `NEXT_PUBLIC_` / `REACT_APP_` variants) | Environment variables, bundled at build time |
| **Internal-only** | `AIM_ENGINE_URL` | Service mesh / internal networking |

## Deployment Targets

| Component | Build Artifact | Deploy Method |
|-----------|---------------|---------------|
| Backend API | Docker image (`nest build` output) | Container registry + Cloud Run / ECS |
| AIM Engine | Docker image (Python app) | Container registry + Cloud Run / ECS |
| Admin Dashboard | Static build (`next build`) | Vercel deploy / S3 + CloudFront |
| Web App | Static build (`npm run build`) | Vercel deploy / S3 + CloudFront |
| Mobile App | APK/AAB (Android), IPA (iOS) | App Store Connect, Google Play Console |
| Database | Prisma migrations | `prisma migrate deploy` against target DB |
