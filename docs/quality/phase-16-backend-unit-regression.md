# Phase 16 Backend Unit Test Regression Report

**Task:** P16-017
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document the backend unit test status, coverage by module, and regression
readiness for the AIM Platform release.

## Test Execution Status

**Command:** `npm run test` (alias for `jest --config ./jest.config.js`)
**Result:** Could not execute — `node_modules/` is not installed in the CI
audit environment. Dependencies must be installed with `npm ci` before
tests can run.

**CI Status:** The `backend-api.yml` workflow runs `npm run test` on every
push/PR to `main` affecting `services/backend-api/**`. Tests are expected
to pass in CI.

## Test File Inventory

**Total spec files:** 256

### Breakdown by Module

| Module | Spec Count | Key Files |
|--------|-----------|-----------|
| **Auth** | 12 | `supabase-jwt-auth.guard.spec.ts`, `supabase-jwt-verifier.service.spec.ts`, `auth.controller.spec.ts`, `session-validation.service.spec.ts`, `auth-me.presenter.spec.ts`, `current-user.decorator.spec.ts`, `auth-logging.service.spec.ts`, `auth-profile-bootstrap.service.spec.ts`, `auth-backend-foundation.spec.ts`, `role.guard.spec.ts`, `permission.guard.spec.ts`, `profile-ownership.guard.spec.ts` |
| **Config** | 1 | `backend-config.spec.ts` |
| **Admin** | 7 | `admin.controller.spec.ts`, `admin.service.spec.ts`, `admin-role-assignment.service.spec.ts`, `admin-role-assignment.controller.spec.ts`, `admin-profile.service.spec.ts`, `admin-users.service.spec.ts`, `admin-user-detail.service.spec.ts` |
| **AI Teacher** | 43 | Chat history (2), chat message (2), chat session (2), chat session list (2), context builder (9), feedback (2), orchestrator (1), prompt builder (6), provider gateway (11), rate limit (1), repositories (6), response safety (1), fallback/safety/api/pipeline (4) |
| **AIM Integration** | 15 | Engine client (1), health check (1), adapter (5 — error handler, timeout, adapter, contract, request mapper), pipeline (4 — mastery, difficulty, weakness, session update), persistence (2), result (2) |
| **Analytics** | 11 | Access policy (1), access guard (1), event ingestion (1), export controller (1), export service (1), metric aggregation (1), report runner (1), report definition (1), cohort (1), validation (1), parent reports controller (1) |
| **Assessments** | 22 | Controller (1), service (1), repository (1), grading service (1), grading integration (1), answer submission (1), attempt service (1), audit service (1), deadline service (1), feedback service (1), score policy (1), submission flow (1), validation helpers (1), progress integration (2), errors (1), permissions (1), no-client-authority (1), question delivery (1), attempt lifecycle (1), deadline enforcement (1) |
| **Billing** | 9 | Ownership guard (1), validation (1), errors (1), permissions (1), checkout flow (1), entitlement (1), refund (1), sensitive data (1), webhook idempotency (1) |
| **Curriculum** | 28 | Module (1), DTOs (3), lesson assets (2), lesson objectives (2), lesson skills (4), lessons (2), levels (2), objectives (2), publish validation (1), question bank (2), question skills (2), skills (2), content status (1), courses controller (1), courses service (1) |
| **Notifications** | 6 | Delivery (1), errors (1), permissions (1), privacy (1), scheduling (1), validation helpers (1) |
| **Parents** | 16 | Controller (1), access policy (1), activity summary (1), assessment access (1), assessment summary (1), child progress (1), consent (1), dashboard summary (1), errors (1), invitation (1), notification preference (1), readonly progress (1), report (1), validation (1), child access guard (1), child link service (1) |
| **Placement** | 5 | Controller (1), permission guard (1), retake policy (1), scoring (1), result read (1) |
| **Profile** | 1 | `profile.service.spec.ts` |
| **Roles** | 1 | `roles.service.spec.ts` |
| **Sessions** | 4 | Controller (1), service (1), lesson attempt (1), session event (1) |
| **Students** | 1 | `student-profile.service.spec.ts` |
| **Users** | 1 | `users.service.spec.ts` |
| **Voice Teacher** | 42 | API controllers/guards/DTOs (8), audio cleanup (1), audio storage (1), audio upload (7), context link (1), fallback policy (1), message persistence (1), message submit (1), orchestrator (2), rate limit (1), response generation (1), session start (2), STT gateway (7), transcript pipeline (1), TTS gateway (6) |
| **Health (E2E)** | 1 | `test/health.e2e-spec.ts` |

### Module Coverage Assessment

| Module | Unit Tests | Integration Tests | Spec Quality |
|--------|-----------|-------------------|-------------|
| Auth | Strong (12 specs) | None automated | High — covers all guards, decorators, services |
| AI Teacher | Strong (43 specs) | Provider gateway integration spec | High — covers safety policies, prompt building, context, rate limiting |
| AIM Integration | Strong (15 specs) | Contract spec exists | High — covers adapter, pipeline, persistence |
| Analytics | Good (11 specs) | None automated | Medium — covers core services but runner is a stub |
| Assessments | Strong (22 specs) | Grading integration spec | High — covers grading, lifecycle, authority rules |
| Billing | Good (9 specs) | None automated | Medium — covers ownership, idempotency, permissions |
| Curriculum | Strong (28 specs) | None automated | High — covers all CRUD, validation, publishing |
| Notifications | Adequate (6 specs) | None automated | Medium — covers delivery, privacy, scheduling |
| Parents | Strong (16 specs) | None automated | High — covers consent, access policy, all summaries |
| Placement | Good (5 specs) | None automated | Medium — covers scoring, permissions, retake policy |
| Voice Teacher | Strong (42 specs) | Orchestration pipeline integration | High — covers all STT/TTS/safety steps |
| Sessions | Good (4 specs) | None automated | Medium — covers core session management |
| Profile/Roles/Users/Students | Minimal (1 each) | None | Low — basic service tests only |

## Regression Concerns

### High Coverage Modules (Low Regression Risk)

- Auth (12 specs covering all access control paths)
- AI Teacher (43 specs with safety policy tests)
- AIM Integration (15 specs with contract verification)
- Assessments (22 specs including no-client-authority check)
- Curriculum (28 specs covering CRUD and publish validation)
- Voice Teacher (42 specs covering full pipeline)
- Parents (16 specs covering consent and data isolation)

### Medium Coverage Modules (Moderate Regression Risk)

- Analytics (11 specs but report runner is a stub)
- Billing (9 specs but no live provider integration tests)
- Notifications (6 specs, delivery pipeline not fully E2E tested)
- Placement (5 specs, basic scoring verified)
- Sessions (4 specs)

### Low Coverage Modules (Higher Regression Risk)

- Profile (1 spec)
- Roles (1 spec)
- Users (1 spec)
- Students (1 spec)

These modules may have been tested indirectly through other module specs
(e.g., user creation tested via admin specs), but direct coverage is minimal.

## Recommendations

1. **Run full test suite in CI** — Verify all 256 specs pass on the release
   branch. The `npm run test` command in `backend-api.yml` already does
   this.

2. **Add coverage threshold** — Configure Jest to enforce a minimum
   coverage threshold (e.g., 60% line coverage initially, increasing over
   time). Add `coverageThreshold` to `jest.config.js`.

3. **Increase coverage for low-coverage modules** — Profile, Roles, Users,
   and Students modules have only 1 spec each. Add at least controller
   specs and validation specs.

4. **Document test patterns** — The codebase uses a consistent pattern
   of `*.spec.ts` co-located with source files. Ensure new modules follow
   this convention.

5. **Add integration test suite** — The 256 specs are primarily unit tests
   with mocked dependencies. A separate integration test suite running
   against a real database would significantly improve confidence.
