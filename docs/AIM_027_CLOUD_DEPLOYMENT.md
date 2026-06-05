# AIM-027 Cloud Deployment

This task prepares a cloud deployment package for the AIM FastAPI backend and React web pilot using Supabase PostgreSQL and Supabase Auth.

## Added Assets

- `deployment/cloud/backend.Dockerfile`
- `deployment/cloud/frontend.Dockerfile`
- `deployment/cloud/nginx.conf`
- `deployment/cloud/render.yaml`
- `deployment/cloud/README.md`
- `frontend/.env.example`
- `content/pilot/aim_027_cloud_deployment.json`

## Backend Deployment

The backend image installs the Python package, runs Alembic migrations, and starts:

```bash
uvicorn aim.presentation.api.app:app --host 0.0.0.0
```

Required backend variables:

- `APP_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_DATABASE_URL`
- `SUPABASE_AUTH_REQUIRED=true`
- `SUPABASE_JWT_AUDIENCE=authenticated`
- `CORS_ORIGINS`

## Frontend Deployment

The frontend image builds the React app with Supabase public browser variables and serves the static build with nginx.

Required frontend variables:

- `REACT_APP_API_BASE_URL`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY`

## Smoke Test

After deployment:

1. Open the frontend URL.
2. Register or sign in with a pilot account.
3. Confirm a backend student profile exists.
4. Load lessons.
5. Start a session.
6. Submit attempts.
7. Confirm the adaptive result renders.
8. Confirm `/admin/pilot/overview` shows the session.

Do not put Supabase service-role keys or database passwords in frontend variables.
