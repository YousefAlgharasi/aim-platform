# Phase 12 — Readiness from Phase 11

**Date:** 2026-06-20
**Author:** GHOST3030
**Scope:** Parent dashboard readiness items and safe dependencies from admin outputs

## Purpose

Document what Phase 11 (Admin Dashboard) provides that Phase 12 (Parent
Dashboard) can safely depend on, and identify gaps that need to be
addressed before Phase 12 work begins.

## Phase 11 Outputs Available to Phase 12

### 1. Shared Infrastructure

| Asset | Location | Reusable? | Notes |
|-------|----------|-----------|-------|
| AIM design system tokens | `docs/design/source/aim-design-system` | YES | Same tokens for parent dashboard |
| Design system components | `components/common/` | PARTIAL | Admin-specific; parent needs own variants |
| API client pattern | `lib/api/admin-api-client.ts` | YES | Pattern reusable, endpoints differ |
| Paginated response decoder | `lib/api/admin-paginated-response.ts` | YES | Generic, reusable |
| Error handling pattern | `AdminApiClientError` | YES | Pattern reusable |

### 2. Backend APIs (Read-Only for Parents)

| API | Admin Endpoint | Parent Equivalent Needed? |
|-----|---------------|--------------------------|
| Student progress | `GET /admin/students/:id/progress` | YES — `GET /parent/children/:id/progress` |
| Skill states | `GET /admin/students/:id/skill-states` | YES — `GET /parent/children/:id/skills` |
| Assessment results | `GET /admin/assessment-results` | YES — `GET /parent/children/:id/assessments` |
| Session summaries | `GET /admin/session-summaries` | MAYBE — simplified view for parents |

### 3. Design Patterns Established

| Pattern | Description | Parent Dashboard Applicability |
|---------|-------------|-------------------------------|
| Server/client split | Server components fetch, client displays | YES — same architecture |
| Token-based auth | HTTP-only cookie with Bearer header | YES — parent auth flow |
| Read-only display | Backend authority, no client computation | YES — parents have less authority |
| Design system compliance | Consistent tokens and components | YES — same design system |

## Phase 12 Requirements

### Parent Dashboard Features Needed

| Feature | Priority | Dependencies |
|---------|----------|-------------|
| Parent registration/login | P0 | Backend auth for parent role |
| Child linking | P0 | Backend parent-child relationship API |
| Child progress view | P0 | Backend parent progress API |
| Assessment results view | P1 | Backend parent assessment API |
| Attendance/activity view | P1 | Backend parent activity API |
| Communication with admin | P2 | Backend messaging API |
| Payment/billing view | P2 | Phase 14 billing backend |

### Backend APIs Required (Not Yet Built)

| Endpoint | Purpose |
|----------|---------|
| `POST /auth/parent/register` | Parent registration |
| `POST /auth/parent/login` | Parent authentication |
| `GET /parent/children` | List linked children |
| `GET /parent/children/:id/progress` | Child progress (scoped) |
| `GET /parent/children/:id/assessments` | Child assessment results (scoped) |
| `GET /parent/children/:id/attendance` | Child attendance records |
| `GET /parent/notifications` | Parent notifications |

### Infrastructure to Build

| Item | Description |
|------|-------------|
| Parent dashboard Next.js app | Separate app in `apps/parent-dashboard/` |
| Parent auth middleware | Role-based route protection for parents |
| Parent API client | Similar to admin API client, parent-scoped |
| Parent design system variants | Simplified components for parent audience |

## Safety Constraints for Phase 12

### Must Do
1. **Separate app** — Parent dashboard must be a separate Next.js app, not part of admin
2. **Scoped data access** — Parents see only their linked children's data
3. **Backend authorization** — Backend must validate parent-child relationship on every request
4. **No admin features** — Parents cannot access admin endpoints or functionality
5. **Read-only by default** — Parents view data; mutations limited to profile/preferences

### Must Not Do
1. **No admin API reuse** — Parent API clients must call parent-scoped endpoints
2. **No cross-child access** — Parent cannot see other parents' children
3. **No AIM Engine data** — Parents see simplified progress, not raw mastery/weakness vectors
4. **No curriculum editing** — Parents cannot modify courses, lessons, or assessments
5. **No payment processing** — Deferred to Phase 14

## Readiness Checklist

| Item | Status | Blocker? |
|------|--------|----------|
| AIM design system available | READY | No |
| API client pattern documented | READY | No |
| Auth pattern established | READY | No |
| Backend parent APIs built | NOT READY | YES |
| Parent-child linking API | NOT READY | YES |
| Parent auth flow | NOT READY | YES |
| Parent dashboard scaffold | NOT READY | No — Phase 12 task |
| Payment integration | NOT READY | No — Phase 14 |

## Conclusion

Phase 11 provides reusable patterns (design system, API client architecture,
server/client split, auth flow) that Phase 12 can build on. However, Phase 12
is blocked on backend parent APIs and parent authentication — these must be
built as part of Phase 12 backend work before the parent dashboard UI can
be implemented.
