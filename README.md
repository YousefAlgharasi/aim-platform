# AIM Algorithm

## Overview

This system contains:

- Backend API using FastAPI
- Frontend Web App using React
- AI Core services and algorithms

---

## Project Structure

```txt
/backend   -> API and server
/frontend  -> React frontend
/ai-core   -> AI algorithms and services
/supabase  -> database migrations, seed data, and RLS policies
```

---

## Tech Stack

- FastAPI
- React
- Python
- AI/ML Modules

---
## Architecture
See:
/docs/AIM_Complete_Architecture_EN.docx

## AIM Visual Demo

Open the development AIM visual dashboard at:

```txt
http://localhost:3000/aim-demo
```

See `docs/AIM_VISUAL_DEMO.md` for backend/frontend run commands and expected scenario results.

## Development Workflow

- Every task starts as a GitHub Issue
- Every issue gets its own branch
- All changes go through Pull Requests
- Main branch is protected

## Database Configuration

Local development uses SQLite by default:

```txt
APP_ENV=development
DATABASE_URL=sqlite:///./aim_dev.db
```

Cloud deployments can point the backend at Supabase PostgreSQL with
`SUPABASE_DATABASE_URL` or `DATABASE_URL`. `SUPABASE_DATABASE_URL` takes
precedence when both are set.

```txt
APP_ENV=cloud
SUPABASE_DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_AUTH_REQUIRED=true
SUPABASE_JWT_AUDIENCE=authenticated
CORS_ORIGINS=https://your-react-app.example.com,http://localhost:3000
```

For persistent FastAPI servers, use Supabase's direct connection when the host
supports IPv6, or the Session pooler on IPv4-only hosts. Transaction pooler
connections are better suited to serverless/short-lived runtimes.

Supabase JWT verification uses the project JWKS endpoint by default. If a
legacy/shared JWT secret is required, configure `SUPABASE_JWT_SECRET` only on
the backend runtime environment; never expose it through frontend public env
variables.
