# AIM Admin Dashboard

Internal Admin Dashboard shell for AIM Phase 1.

## Purpose

This package establishes the approved Admin Dashboard project boundary under:

```text
apps/admin-dashboard/
```

It is a shell only. It does not implement full production dashboard modules.

## Layout and Routing Foundation

Current admin shell routes:

- `/admin`
- `/admin/students`
- `/admin/content`
- `/admin/reviews`
- `/admin/reports`
- `/admin/settings`
- `/admin/roles`

All pages are placeholders.

## Role-Based Menu Placeholder

P1-050 adds placeholder menu groups for:

- Pilot Admin
- Content Manager
- Human Reviewer
- Project Owner

This is UI scaffolding only.

It does not implement:

- real RBAC
- authentication
- authorization
- permission checks
- route guards
- session handling
- backend role enforcement

Backend API authorization remains final.

## Admin API Client Foundation

The Admin Dashboard has a typed Backend API client foundation under:

```text
lib/api
```

It does not add feature-specific admin API workflows.

## Phase 1 Scope

Allowed in this shell:

- Next.js app foundation
- internal dashboard landing page
- internal admin layout shell
- placeholder navigation
- role-based menu placeholders
- safe placeholder copy
- Backend API client foundation
- Backend API base URL placeholder config

Not allowed in this shell:

- full institute management platform
- learner Student Web App
- production student management workflows
- production content management workflows
- production reporting workflows
- audit-log implementation
- review-queue implementation
- real role enforcement in the browser
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
- It includes a Backend API client foundation.
- It includes role-based menu placeholders.
- It does not create a learner Student Web App.
- It does not implement production admin modules.
- It does not implement real RBAC.
- It does not include secrets.
