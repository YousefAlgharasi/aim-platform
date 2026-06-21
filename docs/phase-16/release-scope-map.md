# Phase 16 Release Scope Map

**Task:** P16-002
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document all systems, services, and subsystems included in the AIM Platform
release readiness assessment. This map serves as the definitive inventory
of what must be validated before production deployment.

## System Inventory

### 1. Backend API (`services/backend-api/`)

**Runtime:** NestJS + TypeScript, Node.js 24
**Entry point:** `src/main.ts`
**Module root:** `src/app.module.ts`

| Feature Module | Path | Status |
|----------------|------|--------|
| Auth | `src/auth/` | Complete — JWT verification, role guard, permission guard, profile ownership guard, session validation, auth audit logging |
| Admin | `src/features/admin/` | Complete — user management, role assignment, admin profiles |
| AI Teacher | `src/features/ai-teacher/` | Complete — chat history, message submission, orchestrator, feedback, prompt builder with safety policies |
| AIM Integration | `src/features/aim/` | Complete — engine client, health check, adapter, pipeline, persistence, result processing |
| Analytics | `src/features/analytics/` | Complete — event ingestion, metric aggregation, report runner, dashboard, export, cohort, access policy/guard/audit |
| Assessments | `src/features/assessments/` | Complete — answer submission, attempt lifecycle, grading, scoring, feedback, deadline enforcement, question delivery |
| Billing | `src/features/billing/` | Complete — checkout, subscription, invoice, refund, coupon, entitlement, payment provider adapter, webhook processing |
| Curriculum | `src/features/curriculum/` | Complete — courses, levels, chapters, skills, objectives, lessons, question bank, lesson assets/objectives/skills, publish validation |
| Lessons | `src/features/lessons/` | Complete — lesson delivery and tracking |
| Notifications | `src/features/notifications/` | Complete — delivery worker, queue, rate limiting, retry, digest, scheduling, templates, device tokens, preferences, reminders |
| Parents | `src/features/parents/` | Complete — child linking, consent, access policy, activity/assessment/dashboard summaries, progress, reports, notification preferences |
| Placement | `src/features/placement/` | Complete — test delivery, answer submission, scoring, result computation, retake policy, initial learning path generation |
| Profile | `src/features/profile/` | Complete — user profile management |
| Reports | `src/features/reports/` | Complete — report generation |
| Roles | `src/features/roles/` | Complete — role definitions and permission mapping |
| Sessions | `src/features/sessions/` | Complete — learning session tracking |
| Students | `src/features/students/` | Complete — student profile and data |
| Users | `src/features/users/` | Complete — user CRUD operations |
| Voice Teacher | `src/features/voice-teacher/` | Complete — STT-backed voice interaction |
| Health | `src/health/` | Complete — health check endpoint |
| OpenAPI | `src/openapi/` | Complete — Swagger/OpenAPI documentation generation |

**Database:** Prisma ORM with 114 migrations in `prisma/migrations/`
**Test count:** 256 spec files

### 2. AIM Engine (`services/aim-engine/`)

**Runtime:** Python 3.11
**Build:** `pyproject.toml` with `[dev]` extras
**Linting:** ruff (check + format)
**Testing:** pytest

The AIM Engine is the backend-only adaptive learning algorithm service. It
computes mastery levels, difficulty adjustments, weakness detection, review
scheduling, and learning path recommendations. It is called exclusively by
the Backend API via internal HTTP (`AIM_ENGINE_URL`), never by any client.

### 3. Mobile App (`apps/mobile/`)

**Runtime:** Flutter (stable channel)
**Entry point:** `lib/main.dart`

| Feature Module | Path |
|----------------|------|
| Achievements | `lib/features/achievements/` |
| AI Teacher | `lib/features/ai_teacher/` |
| AIM Results | `lib/features/aim_results/` |
| Analytics Summary | `lib/features/analytics_summary/` |
| Assessments | `lib/features/assessments/` |
| Auth | `lib/features/auth/` |
| Billing | `lib/features/billing/` |
| Design System Preview | `lib/features/design_system_preview/` |
| Home | `lib/features/home/` |
| Learning Path | `lib/features/learning_path/` |
| Lessons | `lib/features/lessons/` |
| Notifications | `lib/features/notifications/` |
| Onboarding | `lib/features/onboarding/` |
| Placement | `lib/features/placement/` |
| Practice | `lib/features/practice/` |
| Profile | `lib/features/profile/` |
| Progress | `lib/features/progress/` |
| Question Answer | `lib/features/question_answer/` |
| Reviews | `lib/features/reviews/` |

**Tests:** `test/` directory with unit, widget, and regression tests

### 4. Admin Dashboard (`apps/admin-dashboard/`)

**Runtime:** Next.js + TypeScript
**Routes:** `app/admin/`, `app/admin-auth-required/`, `app/admin-auth-unavailable/`, `app/admin-unauthorized/`
**Components:** `components/` — admin shell layout, navigation, billing, content status workflow, error handling

### 5. Web App — Parent Dashboard (`apps/web/`)

**Runtime:** React (Create React App)
**Entry point:** `src/index.js`

| Feature Module | Path |
|----------------|------|
| Admin Analytics | `src/features/admin-analytics/` |
| Admin Notifications | `src/features/admin-notifications/` |
| Parent Dashboard | `src/features/parent-dashboard/` |
| Status | `src/features/status/` |

### 6. Design System (`docs/design/source/aim-design-system/`)

**Artifacts:** HTML preview, component definitions, foundation tokens, styles, manifest
**Adherence tooling:** `_adherence.oxlintrc.json`
**Files:** `components/`, `foundations/`, `tokens/`, `styles.css`, `_ds_manifest.json`

### 7. Database (`services/backend-api/prisma/`)

**ORM:** Prisma
**Schema:** `schema.prisma`
**Migrations:** 114 sequential SQL migrations (20260611 through 20260621)
**Seeds:** `prisma/seeds/`
**Seed SQL:** `database/supabase/seed/seed.sql`
**RLS Policies:** `database/supabase/policies/rls_overview.sql`

### 8. CI/CD Pipelines (`.github/workflows/`)

| Workflow | File | Triggers |
|----------|------|----------|
| Backend API CI | `backend-api.yml` | Push/PR to main on `services/backend-api/**` |
| Flutter Mobile CI | `mobile.yml` | Push/PR to main on `apps/mobile/**` |
| Admin Dashboard CI | `admin-dashboard.yml` | Push/PR to main on `apps/admin-dashboard/**` |
| AIM Engine CI | `aim-engine.yml` | Push/PR to main on `services/aim-engine/**` |
| Docs Consistency CI | `docs.yml` | Push/PR to main on `docs/**` |

## Cross-System Integration Points

| Source | Target | Mechanism |
|--------|--------|-----------|
| Mobile App | Backend API | REST API over HTTPS (bearer token) |
| Admin Dashboard | Backend API | REST API over HTTPS (bearer token) |
| Web App | Backend API | REST API over HTTPS (bearer token) |
| Backend API | AIM Engine | Internal HTTP (`AIM_ENGINE_URL`) |
| Backend API | Supabase | Prisma ORM + Supabase client |
| Backend API | AI Provider | `AI_PROVIDER_API_KEY` (backend-only) |
| Backend API | STT Provider | `STT_PROVIDER_API_KEY` (backend-only) |
| Backend API | Payment Provider | `payment-provider.adapter.ts` |
| All clients | Supabase Auth | Supabase JS client (anon key only) |

## Environment Variables Summary

See `.env.example` (root) and `apps/admin-dashboard/.env.example` for the
full list. Key categories:

- **Backend secrets** (never in clients): `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `AI_PROVIDER_API_KEY`, `STT_PROVIDER_API_KEY`, `DATABASE_URL`
- **Client-safe public keys**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_` / `REACT_APP_` prefixed variants)
- **Internal service URLs**: `AIM_ENGINE_URL`, `NEXT_PUBLIC_BACKEND_API_BASE_URL`, `REACT_APP_API_BASE_URL`
