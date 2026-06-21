# Phase 18 Readiness Checklist — From Phase 17

**Task:** P17-081
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document what Phase 17 provides as foundation for Phase 18, identify missing items and known limitations, and confirm Phase 18 can build on the delivered infrastructure.

## What Phase 17 Provides

### Operations Backend Module
Phase 18 inherits a complete NestJS feature module at `services/backend-api/src/features/operations/` with:

| Component | Files | Ready |
|-----------|-------|-------|
| Module registration | `operations.module.ts` | Yes |
| 10 entity interfaces | `operations.entities.ts` | Yes |
| 12 validated DTOs | `operations.dtos.ts` | Yes |
| 15 validation functions | `operations.validation.ts` | Yes |
| Repository with 20+ methods | `operations.repository.ts` | Yes |
| 2 custom guards | `operations.guards.ts` | Yes |
| 9 service classes | 9 service files | Yes |
| 6 user-facing controllers | 6 controller files | Yes |
| 6 admin controllers | 6 controller files | Yes |
| 5 test suites | `__tests__/` directory | Yes |

### Support Flow
- User can create tickets, view own tickets, add comments
- Admin can list all tickets, update status, assign tickets
- Complete audit trail for all ticket operations
- Mobile support UI (student + parent) with data layer

### Feedback Pipeline
- User can submit feedback with category, rating, and source surface
- Admin can list all feedback and triage (update status)
- Feature request submission with community voting
- Admin triage with priority, status, and notes

### Incident Management
- Admin can create incidents with severity and start time
- Status progression: investigating -> identified -> monitoring -> resolved -> postmortem
- Postmortem URL attachment on resolution
- Full audit trail

### Maintenance Windows
- Admin can create planned or emergency maintenance windows
- Status progression: scheduled -> in_progress -> completed (or cancelled)
- Affected services tracking
- User-facing maintenance window listing

### Status Page
- Component-level operational status tracking
- Upsert pattern for status updates
- Public read endpoint for status display

### Feature Flags
- Admin can create, enable, and configure feature flags
- Rollout percentage with deterministic user bucketing
- Flag evaluation API for runtime checks
- Audience-based targeting support (schema ready)

### Release Notes
- Draft -> publish -> archive lifecycle
- Audience segmentation (all, students, parents, admins, internal)
- Public published notes endpoint with audience filtering

### Audit Trail
- `OperationsAuditService` logs all mutations
- 8 resource types tracked
- Actor, action, resource, and details captured
- Query by resource or by actor

### Database Schema
- 12 migrations creating 10 tables with indexes and constraints
- Seed fixtures for initial data
- All tables use UUID primary keys, timestamps, and JSONB metadata

## Missing Items and Known Limitations

### Items Not Yet Complete

| Item | Impact | Priority |
|------|--------|----------|
| Admin maintenance page UI (P17-069) | Admin cannot manage maintenance windows from dashboard | Medium |
| Admin release notes page UI (P17-070) | Admin cannot manage release notes from dashboard | Medium |
| Admin feature flags page UI (P17-071) | Admin cannot manage feature flags from dashboard | Medium |
| Admin operations UI tests (P17-072) | No frontend test coverage for admin operations | Low |

### Known Technical Debt

| Item | Description | Recommendation |
|------|------------|----------------|
| Partial repository wiring | `MaintenanceWindowService`, `ReleaseNotesService`, `OperationalStatusService`, `FeatureFlagService` use `OperationsAuditService` directly with TODO markers; repository methods exist but are not wired | Wire remaining 4 services to `OperationsRepository` in Phase 18 |
| No email/push notifications | Ticket status changes and incident alerts do not trigger notifications | Add notification integration in Phase 18 |
| No SLA tracking | Support tickets have no SLA timers or escalation rules | Consider SLA module in Phase 18 |
| No duplicate vote prevention | Feature request voting does not track per-user votes | Add user-vote junction table |
| Ticket search/filtering | Admin ticket listing returns all tickets without filtering | Add status/category/date filters |
| Rate limiting | Operations endpoints do not have rate limiting beyond global guards | Add per-endpoint rate limiting |

### Known Limitations

| Limitation | Context |
|-----------|---------|
| Admin list uses sentinel value `'__all__'` for `getMyTickets` | Works but is not a clean pattern; should have separate `findAll()` method |
| Internal comments visible to users who own the ticket | Comment visibility is stored but not filtered in user-facing queries |
| No file attachments on tickets | Schema supports metadata but no file upload flow exists |
| Feature flag audience targeting is schema-only | `audience` field is stored as JSONB but evaluation only uses rollout percentage |

## Phase 18 Build-On Points

Phase 18 can build on these Phase 17 foundations:

1. **Operations module** — Extend with new services, controllers, or entities by adding to `operations.module.ts`
2. **Support flow** — Add email notifications, SLA tracking, ticket search/filtering, file attachments
3. **Feedback pipeline** — Add analytics, sentiment analysis, feedback-to-feature-request conversion
4. **Incident management** — Add subscriber notifications, status page integration, incident templates
5. **Status page** — Build public-facing status page UI, add historical uptime tracking
6. **Feature flags** — Wire audience evaluation, add A/B testing, add flag dependencies
7. **Release notes** — Add in-app notification of new releases, changelog generation
8. **Audit trail** — Add audit log viewer in admin dashboard, export capabilities, retention policies
9. **Repository pattern** — Wire remaining 4 services to the existing `OperationsRepository` methods
10. **Admin dashboard** — Complete remaining 3 admin pages (maintenance, release notes, feature flags)

## Verdict

**READY** — Phase 17 provides a solid foundation for Phase 18 with a complete backend operations module, mobile UI, and partial admin dashboard. The 4 remaining admin UI pages and repository wiring for 4 services are the primary items to complete. No blockers for Phase 18 to begin.
