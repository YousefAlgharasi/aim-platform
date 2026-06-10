# AIM Admin Dashboard

Internal Admin Dashboard shell for AIM Phase 1.

## Purpose

This package establishes the approved Admin Dashboard project boundary under:

```text
apps/admin-dashboard/
```

It is a shell only. It does not implement full production dashboard modules.

## Layout and Routing Foundation

P1-048 adds:

- `/admin`
- `/admin/students`
- `/admin/content`
- `/admin/reviews`
- `/admin/reports`
- `/admin/settings`
- shared admin navigation
- shared admin shell layout
- placeholder admin pages

All pages are placeholders.

## Phase 1 Scope

Allowed in this shell:

- Next.js app foundation.
- Internal dashboard landing page.
- Internal admin layout shell.
- Placeholder navigation.
- Safe placeholder copy.
- Local development scripts.
- Backend API base URL placeholder config.

Not allowed in this shell:

- full institute management platform
- learner Student Web App
- production student management workflows
- production content management workflows
- production reporting workflows
- audit-log implementation
- review-queue implementation
- direct database access
- Supabase service-role keys
- AI provider keys
- AIM Engine direct calls
- client-side authorization authority

## Architecture Boundary

Future Admin Dashboard work must call the Backend API.

```text
Admin Dashboard
  |
  | HTTPS request
  v
Backend API
  |
  | backend-owned auth / authorization / ownership checks
  v
Database / AIM Engine / AI Teacher boundaries
```

The Admin Dashboard UI may hide or show placeholders based on future roles, but backend authorization remains final.

## Local Development

```bash
cd apps/admin-dashboard
npm install
npm run dev
```

Default development port:

```text
http://localhost:3001
```

## Checks

```bash
cd apps/admin-dashboard
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` for local development.

Do not commit real secrets.

Only `NEXT_PUBLIC_*` values may be exposed to the browser, and they must not contain secrets.

## Acceptance

- The Admin Dashboard shell exists.
- It is located under `apps/admin-dashboard/`.
- It includes a routing/layout foundation.
- It does not create a learner Student Web App.
- It does not implement production admin modules.
- It does not include secrets.
