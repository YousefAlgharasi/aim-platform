# Phase 1 — Architecture Compliance Review

## Purpose

This document reviews the Phase 1 System Foundation implementation against the architecture rules defined in `docs/phase-1/system-foundation-charter.md`, `docs/product/non-negotiables.md`, and the Phase 0 QA gate findings.

---

## Review Date

2026-06-11

## Scope

Static analysis of the `main` branch. All compliance checks are verified against the current repository state.

---

## Overall Result

**PASS**

All architecture rules are met. No violations found.

---

## Compliance Checks

### C1 — No Student Web App

**Rule:** No separate post-MVP Student Web App may be created.

**Check:**
- `apps/web/` exists as the completed MVP pilot artifact only. It is correctly classified in all Phase 1 documentation as a completed MVP pilot learner interface.
- No new React or Next.js learner client was created outside `apps/web/`.
- No `apps/student-web/`, `apps/learner-web/`, or equivalent directory exists.
- `apps/admin-dashboard/app/page.tsx` explicitly states "No learner Student Web App is created."
- `.github/pull_request_template.md` includes explicit checklist item blocking `apps/web/` extension.
- `docs/phase-1/system-foundation-charter.md` forbids Student Web App creation.
- CI docs workflow checks for unqualified `Student Web App` references.

**Result: PASS**

---

### C2 — Active Stack Compliance

**Rule:** Phase 1 must use Flutter Mobile (learner client), NestJS + TypeScript (Backend API), Python (AIM Engine), Next.js (Admin Dashboard).

**Check:**

| Component | Expected | Present |
|---|---|---|
| Learner client | Flutter Mobile | `apps/mobile/lib/main.dart` ✓ |
| Backend API | NestJS + TypeScript | `services/backend-api/src/main.ts` ✓ |
| AIM Engine | Python FastAPI service | `services/aim-engine/app/main.py` ✓ |
| Admin Dashboard | Next.js (internal only) | `apps/admin-dashboard/app/page.tsx` ✓ |
| Completed MVP pilot API | FastAPI (historical, not extended) | `services/backend/` and `services/api/` — pilot artifacts, not extended ✓ |

FastAPI references in active Phase 1 docs correctly refer to the completed MVP pilot context only. Flutter Mobile is documented as the Phase 1 learner client. NestJS is the Phase 1 Backend API.

**Result: PASS**

---

### C3 — No Client-Side AIM Logic

**Rule:** Clients (Flutter Mobile, Admin Dashboard) must not calculate mastery, student level, weakness, difficulty, retention, or recommendations locally.

**Flutter Mobile check (40 files scanned):**

Two files contain AIM-related terms:
- `progress_placeholder_page.dart` — term appears in boundary text: *"Mastery and level are never calculated in Flutter."* No computation logic.
- `review_placeholder_page.dart` — term appears in boundary text: *"Retention scheduling is backend-owned."* No computation logic.

No mastery calculation, difficulty adaptation, retention scheduling, weakness detection, or recommendation engine logic found in any Flutter file. Flutter consumes backend-approved outputs only.

**Admin Dashboard check (25 files scanned):**

One file contains AIM-related terms:
- `app/admin/reports/page.tsx` — terms appear in enforcement checklist: *"No local calculation of mastery, weakness, or recommendations."* No computation logic.

No AIM computation logic found in any Admin Dashboard file.

**Result: PASS**

---

### C4 — No Exposed Secrets

**Rule:** AI provider keys, Supabase service-role keys, JWT secrets, and database credentials must never be committed or exposed in any client.

**Check:**
- No `.env` files (non-example) committed anywhere in the repository.
- `.env.example` contains placeholders only — no real credentials, tokens, or keys.
- Flutter `app_config.dart` contains no AI provider keys or Supabase service-role keys.
- Admin Dashboard `next.config.ts` contains no AI provider keys.
- `NEXT_PUBLIC_` prefix used only for Supabase anon key (publishable) — not for service-role key, JWT secret, or AI provider keys.
- `AI_PROVIDER_API_KEY` appears only in `services/backend-api/` and `services/aim-engine/` environment documentation.
- `.gitignore` excludes `.env`, `.env.local`, and service-specific `.env` files.

**Result: PASS**

---

### C5 — No Speed-as-Mastery

**Rule:** Speed, response time, average response time, and speed score must not directly affect mastery, student level, or direct difficulty increase.

**Check:**
- `services/aim-engine/tests/test_no_speed_mastery_guard.py` exists with 3 dedicated test functions.
- AIM Engine CI (`aim-engine.yml`) runs pytest — these tests execute on every `services/aim-engine/**` push.
- No speed-to-mastery mapping found in any AIM Engine contract model or pipeline interface.
- CI docs workflow checks for `speed.*mastery` pattern violations in all docs.

**Result: PASS**

---

### C6 — AIM Engine Backend-Only Boundary

**Rule:** AIM Engine logic must remain Python and backend-owned. Clients must not call the AIM Engine directly.

**Check:**
- No `aim-engine` URL, port, or endpoint reference found in `apps/mobile/`.
- No `aim-engine` URL, port, or endpoint reference found in `apps/admin-dashboard/`.
- `apps/mobile/lib/core/networking/backend_api_paths.dart` defines backend API paths — AIM Engine is not listed.
- `services/backend-api/src/features/aim/aim-engine-client.service.ts` — AIM Engine client exists in the Backend API service only.
- `apps/mobile/docs/no-aim-logic.md` explicitly documents the boundary.
- Flutter communicates with Backend API only. Backend API calls AIM Engine internally.

**Result: PASS**

---

### C7 — AI Teacher Gateway Backend-Only

**Rule:** AI Teacher Gateway must remain backend-only. AI provider keys must never be exposed to any client.

**Check:**
- `services/backend-api/src/features/ai-teacher/ai-teacher.service.ts` — AI Teacher exists in Backend API only.
- No AI Teacher endpoint or AI provider key reference in `apps/mobile/` or `apps/admin-dashboard/`.
- `AI_PROVIDER_API_KEY` environment variable is documented as backend-only in `docs/phase-1/environment-strategy.md`.

**Result: PASS**

---

### C8 — Backend Auth Boundary

**Rule:** All authenticated requests must be validated by the Backend API using Supabase JWT. No client bypasses authorization.

**Check:**
- `services/backend-api/src/auth/supabase-jwt-auth.guard.ts` — JWT auth guard present.
- `services/backend-api/src/auth/supabase-jwt-verifier.service.ts` — JWT verifier service present.
- `services/backend-api/src/auth/authorization/role.guard.ts` and `student-ownership.guard.ts` — role and ownership guards present.
- Flutter sends JWT Bearer token to Backend API — does not bypass to Supabase or AIM Engine directly.
- No direct Supabase RLS bypass pattern found in backend code.

**Result: PASS**

---

### C9 — Required Phase 1 Documents Present

**Rule:** All Phase 1 foundation documentation must exist at expected paths.

**Check:**

| Document | Status |
|---|---|
| `docs/phase-1/system-foundation-charter.md` | PRESENT |
| `docs/phase-1/repo-structure.md` | PRESENT |
| `docs/phase-1/workspace-tooling.md` | PRESENT |
| `docs/phase-1/task-execution-rules.md` | PRESENT |
| `docs/phase-1/local-development.md` | PRESENT |
| `docs/phase-1/environment-strategy.md` | PRESENT |
| `docs/phase-1/database-implementation-strategy.md` | PRESENT |
| `docs/phase-1/system-foundation-smoke-test.md` | PRESENT |
| `docs/phase-1/open-decisions.md` | PRESENT |
| `packages/shared-contracts/api/response-envelope.md` | PRESENT |
| `packages/shared-contracts/api/errors.md` | PRESENT |
| `packages/shared-contracts/enums/common-enums.md` | PRESENT |
| `docs/quality/phase-1-entry-review.md` | PRESENT |

**Result: PASS**

---

### C10 — CI Foundation Complete

**Rule:** All active Phase 1 services must have CI pipelines.

**Check:**

| Service/App | Workflow | Status |
|---|---|---|
| Backend API | `.github/workflows/backend-api.yml` | PRESENT |
| AIM Engine | `.github/workflows/aim-engine.yml` | PRESENT |
| Flutter Mobile | `.github/workflows/mobile.yml` | PRESENT |
| Admin Dashboard | `.github/workflows/admin-dashboard.yml` | PRESENT |
| Docs | `.github/workflows/docs.yml` | PRESENT |

No CI workflow exists for `apps/web/` (MVP pilot) — correct, it is not an active Phase 1 service.

**Result: PASS**

---

## Non-Negotiable Rules Verification

| Rule | Status |
|---|---|
| Phase 0 remains documentation/planning only | PASS — no runtime code added to Phase 0 docs |
| Completed MVP pilot (FastAPI/React Web) preserved as historical context | PASS — `apps/web/`, `services/backend/`, `services/api/` preserved unmodified |
| Flutter Mobile is the Phase 1 learner client | PASS |
| NestJS + TypeScript is the Phase 1 Backend API | PASS |
| Python AIM Engine is backend-owned | PASS |
| No separate Student Web App | PASS |
| No client-side AIM calculations | PASS |
| No speed-as-mastery | PASS |
| No secrets in clients or committed files | PASS |
| Backend owns authorization | PASS |

---

## Known Accepted Risks

| Risk | Status |
|---|---|
| Dockerfiles for backend-api and aim-engine not yet created — compose references them but they do not exist | Accepted — Dockerfiles are Phase 2 work. Docker Compose foundation documents intent for Phase 1. |
| Flutter CI not yet triggered against live code — first run on next push | Accepted — workflow is correctly structured; will execute on next `apps/mobile/**` push. |
| Admin Dashboard CI `next build` requires `NEXT_PUBLIC_*` placeholder values in CI env | Accepted — non-blocking for Phase 1 foundation. CI env vars are a Phase 2 operational concern. |
| Parent features, admin depth, notification scope, deployment topology remain conditional | Accepted — gated behind Phase 1 blocker resolutions per `docs/quality/phase-1-entry-review.md`. |

None of these risks affect Phase 1 foundation compliance.

---

## Conclusion

The Phase 1 System Foundation implementation is fully compliant with all architecture rules. No violations found across 10 compliance checks covering client boundaries, secret exposure, AIM logic placement, speed-as-mastery, stack compliance, auth boundaries, documentation completeness, and CI coverage.

**Phase 1 Architecture Compliance Review: PASS**

The implementation is ready for Phase 2 readiness checklist (P1-067) and final Phase 1 lock and handoff (P1-068).
