# Phase 7 — Student Web Security Review

## Review Date
2026-06-21

## Scope
All student-web source files under `apps/student-web/src/`.

## Route Guards
- `AuthGuard` component wraps all protected routes
- Unauthenticated users redirected to `/login` with `returnTo` state
- Public routes (login, register, forgot-password) accessible without auth
- Error routes (403, 404) accessible without auth

## Token Handling
- Auth tokens stored via `AuthContext` in memory (not localStorage)
- `apiClient` attaches Bearer token via `Authorization` header on all requests
- `credentials: 'include'` set for cookie-based session support
- No tokens exposed in URL parameters or localStorage
- Session expiry redirects to `/session-expired`

## API Access
- All data fetched through `apiClient` wrapper (typed fetch)
- No direct `fetch()` calls outside `apiClient`
- All mutations (POST/PATCH/PUT/DELETE) go through `apiClient`
- API base URL configured via environment variable (`VITE_API_BASE_URL`)

## No Direct DB/AIM Access
- No imports of `@supabase/supabase-js` in any client file
- No `supabase.from()`, `supabase.rpc()`, or `createClient()` calls
- No `aim-engine` imports or references
- No direct AI provider SDK imports (openai, anthropic)
- Authority tests verify these patterns across all feature directories

## XSS Prevention
- React's built-in JSX escaping handles all user-rendered content
- No use of `dangerouslySetInnerHTML`
- Video/image sources come from backend API responses only
- Content block renderer does not execute arbitrary HTML

## CSRF Protection
- `credentials: 'include'` enables server-side CSRF token validation
- All state-changing operations use POST/PATCH/PUT methods

## Sensitive Data Exposure
- No secrets, API keys, or service-role keys in client code
- `.env.example` documents required variables without values
- `.gitignore` excludes `.env` files
- No database credentials or signing keys in source

## Issues Found
None.

## Verdict
PASS — Student Web App follows secure patterns with no direct DB/AIM access, proper token handling, and XSS/CSRF protections.
