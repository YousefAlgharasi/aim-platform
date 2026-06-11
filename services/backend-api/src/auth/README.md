# Backend Auth and Authorization Foundation

This folder contains the Phase 1 Supabase JWT auth guard skeleton plus role and ownership guard foundations.

## Authentication scope

- Extracts `Authorization: Bearer <token>` from HTTP requests.
- Verifies Supabase-compatible HS256 JWT signatures using `SUPABASE_JWT_SECRET`.
- Requires the token `iss` claim to match `SUPABASE_JWT_ISSUER`.
- Requires the token `aud` claim to include `SUPABASE_JWT_AUDIENCE`.
- Rejects missing, malformed, expired, or invalid tokens.
- Attaches a safe `AuthenticatedUser` object to `request.user`.
- Provides `@CurrentUser()` for future controllers.
- Provides `@PublicRoute()` for future public endpoints if the guard is later registered globally.

## Authorization scope

- `@RequireRoles(...)` declares route-level backend role requirements.
- `RoleGuard` enforces declared roles using backend-issued app metadata only.
- `@RequireStudentOwnership(...)` declares a route parameter that represents the target student id.
- `StudentOwnershipGuard` blocks cross-student access by default.
- Admin and super-admin roles can bypass direct self-ownership checks until database-backed relationship policies exist.

## Role trust rules

- Application roles are read from `appMetadata` only.
- `userMetadata` is intentionally ignored because users can control it in many auth systems.
- The Supabase top-level JWT `role` claim is not treated as an application authorization role.
- Future modules may replace this skeleton with database-backed policy checks, but the backend remains the final authorization authority.

## Non-goals

- No sign-up, login, refresh, or password handling.
- No Supabase Admin API calls.
- No full RBAC policy engine.
- No parent-child relationship lookup yet.
- No teacher-classroom relationship lookup yet.
- No AIM mastery, level, weakness, recommendation, retention, or difficulty logic.
- No secrets are logged or exposed in responses.
