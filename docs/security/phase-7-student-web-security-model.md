# Phase 7 — Student Web Security Model

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Document the security model for the Student Web App covering authentication, route guards, token handling, XSS/CSRF prevention, and enforcement of no direct DB/AIM access rules.

## Authentication

### Auth Flow

```
1. Student submits credentials → POST /api/auth/login
2. Backend validates → returns { accessToken, refreshToken }
3. Web app stores accessToken in memory (React state)
4. Web app stores refreshToken in httpOnly cookie (set by backend) or secure storage
5. API client attaches accessToken to Authorization header
6. On 401 → attempt refresh via POST /api/auth/refresh
7. On refresh failure → redirect to /login, clear all tokens
```

### Token Handling

| Token | Storage | Lifetime | Refresh |
|-------|---------|----------|---------|
| Access Token | In-memory (React state/context) | Short (15–30 min) | Via refresh token |
| Refresh Token | httpOnly cookie (backend-managed) | Longer (7–30 days) | Backend rotates on use |

**Rules:**
- Never store access tokens in `localStorage` or `sessionStorage`
- Never expose tokens in URL parameters
- Never log tokens to console in production builds
- Clear all token state on logout

### Session Expiry

When the access token expires and refresh fails:
1. Set auth state to unauthenticated
2. Redirect to `/session-expired`
3. Clear all in-memory token state
4. Show re-login prompt

## Route Guards

### AuthGuard

All protected routes are wrapped in an `AuthGuard` component that:

1. Checks if a valid access token exists in React auth context
2. If missing → redirect to `/login` with return URL
3. If expired → attempt token refresh
4. If refresh fails → redirect to `/session-expired`

**The guard checks token presence only. Authorization (role, entitlement) is enforced by the backend on each API call.**

### Route Protection Layers

```
<BrowserRouter>
  <Routes>
    {/* Public — no guard */}
    <Route element={<PublicLayout />}>
      <Route path="/login" />
      <Route path="/register" />
      <Route path="/forgot-password" />
    </Route>

    {/* Protected — AuthGuard */}
    <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
      <Route path="/" />
      <Route path="/dashboard" />
      <Route path="/progress/*" />
      <Route path="/placement/*" />
      {/* ... all protected routes */}
    </Route>
  </Routes>
</BrowserRouter>
```

## XSS Prevention

### Built-in Protection

React escapes all interpolated values by default:
```jsx
// Safe — React escapes userInput
<p>{userInput}</p>

// DANGEROUS — never use unless content is trusted
<div dangerouslySetInnerHTML={{ __html: content }} />
```

### Rules

1. **Never use `dangerouslySetInnerHTML`** unless rendering backend-sanitized content (e.g., lesson content that the backend has sanitized)
2. **Never construct HTML strings** from user input
3. **Never inject user input into `href`** without validating it starts with `https://` or `/`
4. **Sanitize** any rich content received from the backend before rendering (use DOMPurify if rendering HTML)
5. **Never use `eval()`** or `Function()` constructor with dynamic strings

## CSRF Prevention

- API uses Bearer token authentication (not cookies for auth), which is inherently CSRF-resistant
- If cookies carry session state, the backend must validate `Origin`/`Referer` headers
- The web app sets `Content-Type: application/json` on all requests (prevents simple CSRF form submissions)
- No state-changing operations use GET requests

## No Direct Database Access

### Prohibited Patterns

```typescript
// ❌ NEVER import or use Supabase client with service-role key
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ❌ NEVER query database tables directly
supabase.from('students').select('*');

// ❌ NEVER use RPC calls to database functions
supabase.rpc('calculate_mastery', { studentId });
```

### Allowed Pattern

```typescript
// ✅ All data access goes through the backend API
const response = await apiClient.get('/students/me/progress');
```

### Supabase Auth Exception

The only permitted direct Supabase usage is the **Auth client** with the **anon key** (public key) for authentication flows:

```typescript
// ✅ Allowed — Supabase Auth with public anon key only
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, ANON_KEY); // public key only
const { data } = await supabase.auth.signInWithPassword({ email, password });
```

## No Direct AIM Engine Access

```typescript
// ❌ NEVER call AIM Engine endpoints directly
fetch('http://aim-engine:3001/api/recommend', { ... });

// ❌ NEVER import AIM Engine modules
import { AimEngine } from '@aim/engine';

// ✅ All AIM results come through the backend API
const { recommendations } = await apiClient.get('/students/me/recommendations');
```

## Secret Management

### No Secrets in Client Code

The following must NEVER appear in client-side code, environment files committed to git, or build artifacts:

- `SUPABASE_SERVICE_ROLE_KEY`
- Database connection strings
- Provider API keys (OpenAI, etc.)
- Signing keys or JWT secrets
- Production tokens
- Admin credentials

### Allowed Public Config

Only these values may be in client-side environment:

```env
REACT_APP_API_BASE_URL=https://api.aim-platform.com
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...  # This is the PUBLIC anon key — safe for client
```

### .gitignore

```
.env
.env.local
.env.production
```

Only `.env.example` with placeholder values is committed.

## Content Security Policy

Recommended CSP headers (set by backend or hosting):

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.aim-platform.com https://*.supabase.co;
  frame-src 'none';
```

## Security Checklist for Phase 7 Tasks

- [ ] No secrets in committed code
- [ ] No direct database access
- [ ] No direct AIM Engine access
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No `eval()` or `Function()` with dynamic input
- [ ] Auth tokens stored in memory, not localStorage
- [ ] All API calls use typed client with error handling
- [ ] 401 responses trigger token refresh or logout
- [ ] No user input rendered as raw HTML
