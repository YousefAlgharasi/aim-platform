# AIM-026 Production Hardening

This task defines the release-readiness checks for moving selected AIM web pilot surfaces toward a production-style deployment.

## Scope

- FastAPI backend connected to Supabase PostgreSQL.
- React web pilot frontend connected to the deployed backend.
- Supabase Auth required for student routes.
- Admin dashboard available for operator monitoring.

## Blocking Gates

- Authentication is required in cloud and production environments.
- Supabase PostgreSQL is configured through environment variables.
- Backend tests and content validation pass.
- React production build passes.
- Admin dashboard can observe logins, sessions, adaptive results, recommendations, outcomes, and audit events.
- Pilot exports avoid unnecessary personal details.
- Rollback owners are assigned.

## Verification Commands

```bash
PYTHONPATH=services/api/src pytest
npm run build
```

Run the React build from the `apps/web` directory.

## Safety Notes

Do not use speed as a mastery or difficulty-increase signal. Keep pilot reporting educational and avoid personal labels beyond what the operator needs to run the cohort.
