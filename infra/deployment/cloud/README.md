# AIM Cloud Deployment

This folder contains deployment assets for AIM-027.

## Backend

Builds the FastAPI app from `services/api/src`, applies Alembic migrations, and starts Uvicorn.

Required cloud env vars:

- `APP_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_DATABASE_URL`
- `SUPABASE_AUTH_REQUIRED=true`
- `SUPABASE_JWT_AUDIENCE=authenticated`
- `CORS_ORIGINS`

## Frontend

Builds the React web pilot and serves it through nginx with SPA fallback.

Required build env vars:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY`

## Verification

Run before deployment:

```bash
PYTHONPATH=services/api/src pytest
npm run build
```

Run `npm run build` from `apps/web`.
