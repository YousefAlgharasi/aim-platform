# infra/docker — Docker Compose Foundation

Docker Compose foundation for local multi-service development.

## Services

| Service | Container | Host Port | Internal Port |
|---|---|---|---|
| Backend API | `backend-api` | 3000 | 3000 |
| AIM Engine | `aim-engine` | 8010 | 8010 |

Student Web App is not included. No future task may add it.

## Usage

```bash
cd infra/docker

# Start all services
docker compose up

# Start detached
docker compose up -d

# Stop
docker compose down

# Rebuild after code changes
docker compose up --build
```

## Environment Variables

Copy `.env.example` from the repo root and fill in real values:

```bash
cp ../../.env.example .env
```

Never commit `.env` with real values. The `.env` file is excluded from git.

Required variables for local compose:

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
DATABASE_URL=
AI_PROVIDER_API_KEY=
AI_PROVIDER_MODEL=
```

## Service Dependencies

- `backend-api` waits for `aim-engine` to pass its health check before starting.
- AIM Engine health endpoint: `GET http://localhost:8010/health`
- Backend API health endpoint: `GET http://localhost:3000/health`

## Phase 1 Constraints

- No Student Web App service.
- No production secrets committed.
- No real credentials in `docker-compose.yml`.
- Admin Dashboard and Flutter Mobile are not containerized in Phase 1.
