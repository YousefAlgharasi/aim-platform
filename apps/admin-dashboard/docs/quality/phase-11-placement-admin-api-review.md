# Phase 11 — Placement Admin API Review

**Date:** 2026-06-20
**Reviewer:** GHOST3030
**Scope:** Admin placement API clients and backend placement endpoints

## Purpose

Verify admin API readiness for placement question, attempt, result inspection
and configuration. Ensure backend authority for scoring and level assignment
is preserved.

## Admin API Clients Available

| Client File | Functions | Endpoint Pattern |
|-------------|-----------|-----------------|
| `admin-placement-tests-api.ts` | `fetchAdminPlacementTests` | `GET /admin/placement/tests` |
| `admin-placement-questions-api.ts` | `fetchAdminPlacementQuestions` | `GET /admin/placement/questions` |
| `admin-placement-results-api.ts` | `fetchAdminPlacementResults`, `fetchAdminPlacementResultDetail` | `GET /admin/placement/results`, `GET /admin/placement/results/:id` |
| `admin-placement-test-status-api.ts` | `updatePlacementTestStatus` | `PATCH /admin/placement/tests/:id/status` |
| `admin-placement-question-skills-api.ts` | `fetchPlacementQuestionSkillLinks`, `addPlacementQuestionSkillLink`, `removePlacementQuestionSkillLink`, `setPrimaryPlacementQuestionSkillLink` | Various `/admin/placement/...` |

## Backend Placement Endpoints (Student-Facing)

From `placement.controller.ts`:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/placement/active` | Get active placement test metadata |
| `POST` | `/placement/attempts` | Start a placement attempt |
| `GET` | `/placement/sections` | List placement sections |
| `GET` | `/placement/questions` | Get questions for current section |
| `POST` | `/placement/attempts/:id/answers` | Submit answer |
| `POST` | `/placement/attempts/:id/complete` | Complete attempt |
| `GET` | `/placement/attempts/:id/result` | Get result (backend-computed) |

## Admin vs Student API Separation

- **Student endpoints** (`/placement/*`): Protected by `PlacementPermissionGuard`,
  scoped to the authenticated student's data
- **Admin endpoints** (`/admin/placement/*`): Protected by admin auth guards,
  read-only inspection of all placement data plus test status management

## Authority Checks

| Check | Result |
|-------|--------|
| Scoring computed client-side? | **No** — `PlacementScoringService` is backend-only |
| Level assignment computed client-side? | **No** — `PlacementResultService` determines level |
| Admin API clients compute results? | **No** — all clients are read-only decoders |
| Admin can modify scores? | **No** — no write endpoints for scores/results |
| Admin can modify student answers? | **No** — no admin answer modification endpoints |
| Placement test status management? | **Yes** — `updatePlacementTestStatus` (draft ↔ published) |
| Question-skill linking? | **Yes** — CRUD for question → skill associations |

## Backend Services (Authority)

| Service | Role | Admin Access |
|---------|------|-------------|
| `PlacementScoringService` | Computes section/overall scores | None (backend-only) |
| `PlacementResultService` | Determines level assignment | Read-only via admin results API |
| `PlacementAnswerSubmitService` | Validates and records answers | None (student-only) |
| `PlacementAnswerValidationService` | Validates answer format | None (backend-only) |
| `PlacementAttemptCompleteService` | Finalizes attempts | None (student-only) |
| `PlacementRetakePolicyService` | Enforces retake rules | None (backend-only) |
| `PlacementAuditService` | Audit logging | None (backend-only) |
| `PlacementInitialLearningPathService` | Generates learning path | None (backend-only) |

## Admin UI Readiness

The following admin placement API clients are ready for UI implementation:

1. **Placement test list** — `fetchAdminPlacementTests` ✅
2. **Placement questions** — `fetchAdminPlacementQuestions` ✅
3. **Placement results inspection** — `fetchAdminPlacementResults`, `fetchAdminPlacementResultDetail` ✅
4. **Test status management** — `updatePlacementTestStatus` ✅
5. **Question-skill linking** — Full CRUD ✅

## Gaps

- No admin endpoint to create/delete placement tests (configuration is
  seed-based or backend-managed)
- No admin endpoint to create/edit placement questions directly
  (managed through question bank integration)
- No admin endpoint to override or modify student results (by design —
  preserves backend authority)

## Result

**PASS** — Admin placement API clients provide read-only inspection of
placement data and limited configuration (test status, question-skill links).
Backend authority for scoring, level assignment, and answer validation is
fully preserved. No client-side computation of authoritative data found.
