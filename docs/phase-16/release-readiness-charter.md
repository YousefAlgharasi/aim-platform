# Phase 16 Release Readiness Charter

**Task:** P16-001
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Define the scope, exclusions, QA rules, performance boundaries, deployment
ownership, and release gates for Phase 16 — the final phase before the AIM
Platform reaches production readiness.

## Phase 16 Scope

Phase 16 covers QA hardening, performance validation, deployment readiness,
and release gate verification across all AIM Platform subsystems built in
Phases 1 through 15.

### In Scope

| Area | Description |
|------|-------------|
| **Backend API** | NestJS service at `services/backend-api/` — auth, curriculum, placement, AIM engine integration, assessments, notifications, billing, analytics, parents, AI teacher, voice teacher, sessions, reports, roles, profile, students |
| **AIM Engine** | Python service at `services/aim-engine/` — adaptive learning algorithm, mastery computation, difficulty adjustment |
| **Mobile App** | Flutter app at `apps/mobile/` — student-facing features across 20+ feature modules |
| **Admin Dashboard** | Next.js app at `apps/admin-dashboard/` — admin management, curriculum, billing, notifications, analytics |
| **Web App (Parent)** | React app at `apps/web/` — parent dashboard, analytics, notifications |
| **Database** | 114 Prisma migrations in `services/backend-api/prisma/migrations/` covering users, roles, curriculum, placement, AIM integration, sessions, assessments, notifications, billing, analytics |
| **CI Pipelines** | 5 GitHub Actions workflows in `.github/workflows/` — backend-api, mobile, admin-dashboard, aim-engine, docs |
| **Design System** | AIM design system at `docs/design/source/aim-design-system/` — tokens, components, foundations |

### Exclusions

- Student Web App (deferred; no routes exist)
- Third-party payment provider live integration (Phase 16 validates adapter contracts only)
- Production infrastructure provisioning (handled by DevOps; Phase 16 validates readiness criteria)
- Content authoring (curriculum data is seeded; Phase 16 validates the pipeline, not content correctness)
- AI model training or fine-tuning (AIM Engine uses pre-defined algorithms)

## QA Rules

1. **Backend Authority Rule** — The client never computes mastery, grades, difficulty, report outputs, or metric aggregates. All computation is backend-owned. Tests must validate that no controller accepts client-supplied computed values.
2. **No Speed-as-Mastery** — Response time is never used as a direct mastery signal. Enforced by guard tests (established in Phase 1, `P1-030`).
3. **256 Unit Tests Minimum** — The backend API currently has 256 spec files. No release may reduce this count without documented justification.
4. **Regression Gate** — All existing tests must pass before any new feature merge.
5. **Security Boundary** — No `SUPABASE_SERVICE_ROLE_KEY`, `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, or `SUPABASE_JWT_SECRET` may appear in client-side code or committed files.
6. **Privacy Gate** — Minimum cohort size of 5 enforced in analytics. PII must not appear in aggregate entities. Parent access requires consent verification via `ParentChildAccessGuard`.
7. **RTL/Arabic Support** — All user-facing UI must support RTL layout and Arabic text.
8. **Design System Compliance** — UI components must use AIM design system tokens, not ad-hoc colors/spacing.

## Performance Boundaries

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p95) | < 500ms | Backend endpoints under 100 concurrent users |
| API response time (p99) | < 1000ms | Backend endpoints under 100 concurrent users |
| Mobile app cold start | < 3 seconds | Flutter app on mid-range Android device |
| Admin dashboard page load | < 2 seconds | Next.js pages with SSR |
| Database query time (p95) | < 200ms | Prisma queries with production-scale indexes |
| AIM Engine recommendation | < 1000ms | Single student recommendation call |
| Uptime target | 99.5% | Measured over 30-day rolling window |

## Deployment Ownership

| Component | Owner | Deploy Target |
|-----------|-------|---------------|
| Backend API | Backend team | Cloud container (e.g., Cloud Run / ECS) |
| AIM Engine | Algorithm team | Cloud container (isolated from client traffic) |
| Mobile App | Mobile team | App Store / Google Play |
| Admin Dashboard | Frontend team | Vercel / Cloud hosting |
| Web App (Parent) | Frontend team | Vercel / Cloud hosting |
| Database | Backend team + DBA | Supabase managed PostgreSQL |
| CI/CD | Platform team | GitHub Actions |

## Release Gates

All gates must pass before production deployment is approved:

1. **Gate 1: Test Suite Green** — All CI workflows pass on the release branch (backend-api, mobile, admin-dashboard, aim-engine, docs).
2. **Gate 2: Security Audit Clear** — No secrets in committed code. RLS policies reviewed. Auth guards on all endpoints.
3. **Gate 3: Migration Validated** — All 114 migrations apply cleanly in order on a fresh database. Rollback tested for the last 10 migrations.
4. **Gate 4: API Contract Verified** — All documented API contracts match implemented controller routes.
5. **Gate 5: Performance Baseline Met** — p95 response times within defined boundaries under simulated load.
6. **Gate 6: Privacy Compliance** — Consent checks, cohort minimums, PII stripping, and audit logging verified.
7. **Gate 7: Design System Adherence** — UI audit shows compliance with AIM design system tokens and components.
8. **Gate 8: Rollback Plan Documented** — Database rollback, service rollback, and feature flag procedures documented and tested.
9. **Gate 9: Monitoring Ready** — Health check endpoints respond, logging is structured, and alerting is configured.
10. **Gate 10: Stakeholder Sign-off** — Product owner and tech lead approve the release candidate.
