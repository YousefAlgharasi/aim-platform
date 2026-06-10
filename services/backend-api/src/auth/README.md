# Backend Auth Foundation

This folder contains the Phase 1 Supabase JWT auth guard skeleton.

## Scope

- Extracts `Authorization: Bearer <token>` from HTTP requests.
- Verifies Supabase-compatible HS256 JWT signatures using `SUPABASE_JWT_SECRET`.
- Rejects missing, malformed, expired, or invalid tokens.
- Attaches a safe `AuthenticatedUser` object to `request.user`.
- Provides `@CurrentUser()` for future controllers.
- Provides `@PublicRoute()` for future public endpoints if the guard is later registered globally.

## Non-goals

- No sign-up, login, refresh, or password handling.
- No Supabase Admin API calls.
- No role/ownership authorization decisions; those belong to the next guard foundation task.
- No AIM mastery, level, weakness, recommendation, retention, or difficulty logic.
- No secrets are logged or exposed in responses.
