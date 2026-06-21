# Phase 16 — Admin and Parent Dashboard Release Readiness

**Document ID:** P16-064
**Phase:** 16 — QA, Performance, Deployment, and Release Readiness
**Created:** 2026-06-21

---

## Purpose

This document assesses the deployment readiness of the AIM Platform web dashboards: the Admin Dashboard and the Parent Dashboard. Both are served from the `apps/web/` React application.

---

## 1. Application Overview

- **Package name:** frontend (from `apps/web/package.json`)
- **Version:** 0.1.0
- **Framework:** React 19.2.6
- **Build tool:** react-scripts 5.0.1 (Create React App)
- **Auth provider:** Supabase JS SDK ^2.107.0
- **Test framework:** Jest + React Testing Library

### Legacy Admin Dashboard

A legacy admin dashboard exists at `apps/admin-dashboard/`. Its relationship to `apps/web/` should be clarified. For this release readiness review, `apps/web/` is treated as the primary deployment target.

---

## 2. Feature Modules

### Admin Dashboard Features (`apps/web/src/features/`)

| Feature | Directory | Description |
|---------|-----------|-------------|
| Admin Analytics | `admin-analytics/` | Analytics dashboards for administrators |
| Admin Notifications | `admin-notifications/` | Notification management for administrators |
| Status | `status/` | System status display |

### Parent Dashboard Features

| Feature | Directory | Description |
|---------|-----------|-------------|
| Parent Dashboard | `parent-dashboard/` | Parent-facing views for student monitoring |

### Shared Components

| Directory | Description |
|-----------|-------------|
| `shared/` | Shared UI components and utilities |
| `pages/` | Top-level page components |
| `app/` | App-level configuration |

---

## 3. Domain and Hosting Configuration

### Production Domains

| Dashboard | Domain | Status |
|-----------|--------|--------|
| Admin Dashboard | TBD | Not configured |
| Parent Dashboard | TBD | Not configured |

**Current gap:** Production domains are not documented. Both dashboards may be served from the same domain with route-based separation, or from separate subdomains.

### CORS Configuration

The backend API accepts CORS origins configured via `CORS_ORIGINS` environment variable. The `.env.example` shows:
```
CORS_ORIGINS=http://localhost:3001,http://localhost:3002
```

**For production:** The CORS_ORIGINS value must be updated to include the production domain(s) for both dashboards.

---

## 4. Environment Variables

The following environment variables are required for the web application deployment. Values shown are placeholder names only — no real credentials are included.

| Variable | Purpose | Client-Safe |
|----------|---------|-------------|
| `NEXT_PUBLIC_APP_ENV` | Environment identifier | Yes |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API endpoint | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

**Note:** The `NEXT_PUBLIC_` prefix in `.env.example` suggests the admin dashboard may have been built with Next.js at one point, or these variables are used by the legacy `apps/admin-dashboard/`. For the React (`apps/web/`) build, Create React App requires `REACT_APP_` prefixed variables. This inconsistency should be resolved before production deployment.

**Security note:** Only public/client-safe values should use the browser-bundled prefix. Service role keys, JWT secrets, and API keys must never be included in web builds.

---

## 5. Build Process

### Build Command

```bash
cd apps/web
npm install
npm run build
```

**Output:** Static files in `apps/web/build/` directory.

### Build Verification

```bash
# Run tests
npm test

# Build for production
npm run build

# Verify build output exists
ls -la build/
```

### Build Size Considerations

- React 19 with react-scripts 5 produces optimized bundles.
- Supabase JS SDK adds to the bundle size.
- No code-splitting configuration was found (default CRA behavior applies).
- No bundle analyzer is configured.

---

## 6. Deployment Options

### Option A: Static Hosting (CDN)

Deploy the `build/` output to a CDN (e.g., Cloudflare Pages, Vercel, Netlify, AWS CloudFront + S3).

**Pros:** Simple, fast, globally distributed.
**Cons:** No server-side rendering, environment variables are baked into the build.

### Option B: Container-Based

Serve the static build from an Nginx or Node.js container.

**Pros:** Consistent with backend deployment, environment variables can be injected at runtime.
**Cons:** More complex, requires container orchestration.

### Current CI/CD

The `.github/workflows/admin-dashboard.yml` workflow exists but targets the legacy `apps/admin-dashboard/`. A workflow for `apps/web/` should be verified or created.

---

## 7. Smoke Tests

### Admin Dashboard Smoke Tests

After deployment, verify the following:

| Test | Endpoint/Action | Expected Result |
|------|-----------------|-----------------|
| Dashboard loads | `/admin` | Admin login page renders |
| Admin login | Supabase auth flow | Admin session established |
| Admin analytics | Navigate to analytics | Charts/data render |
| Admin notifications | Navigate to notifications | Notification list renders |
| User management | Navigate to users | User list loads |
| System status | Navigate to status | Status page renders |
| API connectivity | Any data-loading page | Data loads from backend API |

### Parent Dashboard Smoke Tests

| Test | Endpoint/Action | Expected Result |
|------|-----------------|-----------------|
| Dashboard loads | `/parent` | Parent login page renders |
| Parent login | Supabase auth flow | Parent session established |
| Student list | Parent dashboard home | Linked students displayed |
| Student progress | Click on student | Progress data loads |
| Notifications | Navigate to notifications | Parent notifications render |
| Analytics | Navigate to analytics | Parent analytics render |

---

## 8. Role-Based Access Verification

The AIM Platform uses role-based access control with the following roles:

| Role | Dashboard Access | Backend Enforcement |
|------|-----------------|---------------------|
| admin | Admin Dashboard | `services/backend-api/src/auth/authorization/role.guard.ts` |
| parent | Parent Dashboard | `services/backend-api/src/auth/authorization/role.guard.ts` |
| student | Mobile app only | N/A for web dashboards |

**Verification needed:**
- [ ] Admin cannot access parent-only routes
- [ ] Parent cannot access admin-only routes
- [ ] Unauthenticated users are redirected to login
- [ ] Session expiry is handled gracefully
- [ ] Role checks are enforced on both frontend routes and backend API endpoints

---

## 9. Browser Compatibility

**Target browsers** (from `apps/web/package.json` browserslist):

| Environment | Target |
|-------------|--------|
| Production | >0.2%, not dead, not op_mini all |
| Development | last 1 chrome, last 1 firefox, last 1 safari |

**RTL/Arabic support:**
- [ ] CSS `direction: rtl` works in all target browsers
- [ ] Arabic text rendering is correct
- [ ] Layout does not break in RTL mode

---

## 10. Pre-Release Checklist

- [ ] Production domains are configured
- [ ] CORS origins are updated in backend API config
- [ ] Environment variables are set correctly (with `REACT_APP_` prefix)
- [ ] Build succeeds without warnings
- [ ] All smoke tests pass
- [ ] Role-based access is enforced
- [ ] RTL/Arabic support is verified
- [ ] HTTPS is configured for all domains
- [ ] Error handling for API failures is in place
- [ ] Loading states display correctly
- [ ] 404 page is configured for SPA routing

---

## 11. Release Blockers

1. **No production domains configured** — Cannot deploy without a hosting target.
2. **Environment variable prefix inconsistency** — `NEXT_PUBLIC_` vs `REACT_APP_` needs resolution.
3. **Version 0.1.0** — Should be updated to 1.0.0 for release.
4. **No production CI/CD workflow** for `apps/web/` — Only `apps/admin-dashboard/` has a workflow.
5. **No error tracking** — No Sentry or similar error tracking SDK is configured.

---

## 12. Recommendations

1. Resolve the `apps/admin-dashboard/` vs `apps/web/` relationship and deprecate one.
2. Add `REACT_APP_` prefixed environment variables to the web app.
3. Configure production hosting with HTTPS.
4. Add an error tracking SDK (e.g., Sentry).
5. Implement code-splitting for improved load performance.
6. Add a CI/CD workflow for `apps/web/` builds and deployment.
