# Phase 5 Readiness Checklist

> **Task:** P4-078  
> **Branch:** `phase4/P4-078-phase-5-readiness-checklist`  
> **Author:** AIM Agent  
> **Date:** 2026-06-17  
> **Purpose:** Confirm Phase 4 is complete and the codebase is ready for Phase 5 AIM Engine Integration.  
> **Scope:** Placement Test foundation handoff only. Phase 5 scope (AIM Engine runtime, AI Teacher, lesson delivery, adaptive practice, recommendations, progress dashboard) begins after all items below are verified ✅.

---

## How to Use This Checklist

Work through each section in order. Every item must be ✅ before Phase 5 work begins on that layer. Items marked ⚠️ are known gaps that must be resolved before Phase 5 integration testing — they do not block Phase 5 planning but block live testing.

---

## Section 1 — Phase 4 Review Gates

All six Phase 4 quality reviews must be complete before Phase 5 starts.

| Review | Task | Output | Status |
|---|---|---|---|
| Placement Question Coverage | P4-072 | `docs/quality/phase-4-placement-question-coverage-review.md` | ✅ Done |
| Placement Skill Linking | P4-073 | `docs/quality/phase-4-placement-skill-linking-review.md` | ✅ Done |
| Placement Scoring Rules | P4-074 | `docs/quality/phase-4-placement-scoring-review.md` | ✅ Done |
| Placement Security Review | P4-075 | `docs/quality/phase-4-placement-security-review.md` | ✅ Done |
| Placement E2E Check | P4-076 | `docs/phase-4/placement-e2e-check.md` | ✅ Done |
| No-AIM Runtime Review | P4-077 | `docs/quality/phase-4-no-aim-runtime-review.md` | ✅ Done |

**Gate 1: ✅ All review gates passed.**

---

## Section 2 — Phase 4 Output Completeness

All Phase 4 placement deliverables must be on `origin/main` before Phase 5 begins.

### 2.1 Backend — Placement API (P4-038–P4-043)

| Task | Output | On main |
|---|---|---|
| P4-038 | `GET /placement/active` — active test read API | ✅ |
| P4-039 | `GET /placement/active/sections` — sections API | ✅ |
| P4-040 | `GET /placement/questions` — question delivery API | ✅ |
| P4-041 | `POST /placement/attempts` — attempt start API | ✅ |
| P4-042 | `POST /placement/attempts/:id/answers` — answer submit API | ✅ |
| P4-043 | `POST /placement/attempts/:id/complete` — attempt complete API | ✅ |

### 2.2 Backend — Scoring & Result Pipeline (P4-044–P4-048)

| Task | Output | On main |
|---|---|---|
| P4-044 | `PlacementAnswerValidationService` — writes `is_correct` | ✅ |
| P4-045 | `PlacementScoringService` — section mastery, level mapping, skill signals | ✅ |
| P4-046 | `PlacementResultService` — orchestrates pipeline, writes `placement_results` | ✅ |
| P4-047 | `PlacementInitialLearningPathService` — derives entry points from weakness map | ✅ |
| P4-048 | `GET /placement/attempts/:id/result` — student-safe result read API | ✅ |

### 2.3 Backend — Policy, Audit & Security (P4-049–P4-052)

| Task | Output | On main |
|---|---|---|
| P4-049 | `PlacementRetakePolicyService` — 24h cooldown enforcement | ✅ |
| P4-050 | `PlacementAuditService` — 7 event types, append-only | ✅ |
| P4-051 | `PlacementPermissionGuard` + `placement.permissions.ts` | ✅ |
| P4-052 | Unit tests: guard, retake policy, scoring service | ✅ |

### 2.4 Admin Dashboard — Placement UI (P4-053–P4-059)

| Task | Output | On main |
|---|---|---|
| P4-053 | Admin placement navigation | ✅ |
| P4-054 | Admin placement tests list | ✅ |
| P4-055 | Admin placement sections UI | ✅ |
| P4-056 | Admin placement questions UI | ✅ |
| P4-057 | Admin skill linking UI | ✅ |
| P4-058 | Admin placement status UI (draft → published) | ✅ |
| P4-059 | Admin placement results view | ✅ |

### 2.5 Flutter Mobile — Placement Flow (P4-061–P4-070)

| Task | Output | On main |
|---|---|---|
| P4-061 | Flutter placement feature skeleton | ✅ |
| P4-062 | Flutter placement models (`PlacementTestModel`, etc.) | ✅ |
| P4-063 | Flutter placement datasource (all 7 endpoints) | ✅ |
| P4-064 | Flutter placement repository + Riverpod providers | ✅ |
| P4-065 | `PlacementStartPage` | ✅ |
| P4-066 | `PlacementSectionPage` | ✅ |
| P4-067 | `PlacementQuestionPage` | ✅ |
| P4-068 | `PlacementSubmitPage` | ✅ |
| P4-069 | `PlacementResultPage` | ✅ |
| P4-070 | Flutter no-scoring regression check (static analysis) | ✅ |
| P4-071 | Flutter placement flow tests (35 unit tests) | ✅ |

**Gate 2: ✅ All 30 placement deliverables present on `origin/main`.**

---

## Section 3 — Security Invariants

These invariants must hold throughout Phase 5. Confirm they are enforced before any Phase 5 work touches the placement pipeline.

| Invariant | Verified in | Status |
|---|---|---|
| `correct_answer` never returned to any client | P4-075 | ✅ |
| `is_correct` never returned during or after active attempt | P4-075 | ✅ |
| `overallScore` never persisted or returned to any client | P4-074, P4-075 | ✅ |
| `student_id` always resolved from JWT — never from client input | P4-075, P4-076 | ✅ |
| Flutter never computes CEFR level, skill signals, or weakness map | P4-070, P4-071 | ✅ |
| All placement endpoints guarded by `SupabaseJwtAuthGuard` + `PlacementPermissionGuard` | P4-075 | ✅ |
| No AIM Engine runtime calls in any Phase 4 placement code | P4-077 | ✅ |
| `skill_code` never settable by client | P4-075, P4-073 | ✅ |
| Scoring constants not stored in DB or exposed via any API | P4-074 | ✅ |

**Gate 3: ✅ All 9 security invariants verified.**

---

## Section 4 — Phase 5 Prerequisites (Must-Do Before AIM Integration)

These items were identified as gaps during Phase 4 reviews. Each must be resolved before the relevant Phase 5 work begins.

### 4.1 Critical — Must resolve before Phase 5 integration testing

| # | Item | Source | Owner |
|---|---|---|---|
| C1 | **Flutter route map registration** — Confirm `placementStart`, `placementSection`, `placementQuestion`, `placementSubmit`, `placementResult` are all wired in `app_router.dart` before any live E2E testing. | P4-076 | Flutter team |
| C2 | **`flutter analyze` clean pass** — Run `cd apps/mobile && flutter analyze lib/features/placement/` locally. Not executable in agent environment; must pass before Phase 5 merge. | P4-071, P4-076 | Flutter team |
| C3 | **`flutter test` all 35 tests pass** — Run `cd apps/mobile && flutter test test/features/placement/` in CI. | P4-071 | CI / Flutter team |
| C4 | **Result page polling strategy** — `PlacementResultPage` must handle `409 CONFLICT` (attempt still `submitted`, scoring in progress). Document and test retry/polling logic before Phase 5 load testing. | P4-076 | Flutter team |
| C5 | **Activation guard for zero-linked questions** — Verify `PlacementAttemptService` (P4-041) or the publish endpoint (P4-058) rejects activation of a placement test containing questions with no `placement_question_skills` entry. | P4-073 | Backend team |

### 4.2 Important — Should resolve before Phase 5 launch

| # | Item | Source | Owner |
|---|---|---|---|
| I1 | **Scoring pipeline DB transaction** — Wrap `validate → score → insert_result → update_attempt` in a single DB transaction to prevent partial-completion state on crash. Currently guarded by idempotency check but not transactional. | P4-074 | Backend team |
| I2 | **Async scoring job queue** — `PlacementResultService.createResult()` is called synchronously from `POST /placement/attempts/:id/complete`. At Phase 5 scale, this may cause the endpoint to timeout. Move scoring to an async worker/queue. | P4-076 | Backend team |
| I3 | **Rate limiting on `POST /placement/attempts`** — Abandoned attempts do not trigger the 24h cooldown. Add per-student rate limiting (e.g., max 3 attempt starts per hour) to prevent attempt exhaustion abuse. | P4-075 | Backend team |
| I4 | **Skill-level detail in `placement_results`** — Currently `skill_mastery_map` JSONB stores only section-level aggregates. Individual skill signals (`SkillScore[]`) are computed but not persisted. Phase 5 admin analytics may need this. Evaluate before Phase 5 admin API work. | P4-074 | Backend team |
| I5 | **Max 3 skill links per question** — P4-032 Rule 1 specifies a maximum of 3 skills per question. This is not enforced at the database or API layer. Add validation to the skill-link creation endpoint. | P4-073 | Backend team |

### 4.3 Low priority — Address post-Phase 5 launch

| # | Item | Source | Owner |
|---|---|---|---|
| L1 | Section names in Tier-1 weakness entries use `skillCode` as `skillName` placeholder. Add a section label lookup for improved admin readability. | P4-074 | Backend team |
| L2 | Auth failure logging in `PlacementPermissionGuard` — Add logger calls on `FORBIDDEN` throws for security observability. | P4-075 | Backend team |
| L3 | `abandoned` attempt status transition — Timeout-based abandonment is not yet implemented. Reserved for Phase 5+. | P4-076 | Backend team |
| L4 | `placement_results.skill_mastery_map` exposes `correct_answers` count to admin. Review exposure policy in Phase 5 admin result API. | P4-075 | Backend team |

---

## Section 5 — AIM Engine Integration Prerequisites

These items must be true before Phase 5 AIM Engine integration work begins.

| # | Prerequisite | Notes |
|---|---|---|
| A1 | `AimEngineClientService` and `AimModule` are ready for Phase 5 use | Pre-staged at `services/backend-api/src/features/aim/` — confirmed isolated from placement (P4-077) |
| A2 | `AIM_ENGINE_URL` environment variable is provisioned in all target environments | Config validation already wired; value must be set in staging/production env |
| A3 | Phase 5 tasks must import `AimModule` into the **new** Phase 5 feature modules only — never backport into `PlacementModule` | P4-077 confirmed `PlacementModule` has no AIM dependency |
| A4 | `placement_results.initial_path_id` is the handoff point to Phase 5 | `PlacementInitialLearningPathService` sets this; Phase 5 AIM Engine reads it to begin adaptive sequencing |
| A5 | `initial_learning_path` table is the contract surface between Phase 4 and Phase 5 | Schema defined in P4-024; populated by P4-047; Phase 5 reads it — must not be altered by Phase 5 without a migration |
| A6 | No Phase 5 task may allow Flutter to compute CEFR level, skill signals, or weakness map locally | `no-client-side-placement-scoring.md` (P4-035) applies to all future phases |

---

## Section 6 — Definition of "Phase 5 Ready"

Phase 5 work may begin when all of the following are true:

- [ ] Gates 1–3 (Sections 1–3) are all ✅ — **currently met**
- [ ] Critical items C1–C5 (Section 4.1) are resolved
- [ ] `flutter analyze` passes locally (C2)
- [ ] All 35 Flutter placement tests pass in CI (C3)
- [ ] At least one live E2E run has completed (Flutter → NestJS → Supabase) with a successful result including `estimatedLevel` and `initialPathReady: true`
- [ ] AIM Engine URL is provisioned in target environment (A2)

---

## Section 7 — Phase 5 Scope Reminder

Phase 5 begins where Phase 4 ends. The following are **Phase 5 concerns** — not Phase 4 and must not be started earlier:

| Phase 5 Concern | Rationale |
|---|---|
| AIM Engine runtime calls from the backend | `AimEngineClientService` is pre-staged but not yet wired |
| AI Teacher behavior during active learning sessions | Requires AIM Engine runtime |
| Adaptive lesson sequencing after placement | Reads `initial_learning_path` + AIM Engine |
| Dynamic practice difficulty adjustment | AIM Engine runtime |
| Personalized recommendations | AIM Engine runtime |
| Progress dashboard | Depends on lesson session data (Phase 5+) |
| Retention schedules | Depends on progress data (Phase 5+) |
| Placement retake UI and cooldown display | Deferred from Phase 4 (`abandoned` status transition) |

---

## References

| Document | Location |
|---|---|
| Placement Test Charter | `docs/phase-4/placement-test-charter.md` |
| No-AIM Runtime Rule | `docs/phase-4/no-aim-runtime-rule.md` |
| No Client-Side Scoring Rule | `docs/phase-4/no-client-side-placement-scoring.md` |
| Placement API Map | `docs/phase-4/placement-api-map.md` |
| Placement Data Flow | `docs/phase-4/placement-data-flow.md` |
| Placement Scoring Review | `docs/quality/phase-4-placement-scoring-review.md` |
| Placement Security Review | `docs/quality/phase-4-placement-security-review.md` |
| Placement E2E Check | `docs/phase-4/placement-e2e-check.md` |
| No-AIM Runtime Review | `docs/quality/phase-4-no-aim-runtime-review.md` |
| Placement Skill Linking Review | `docs/quality/phase-4-placement-skill-linking-review.md` |
| Placement Question Coverage Review | `docs/quality/phase-4-placement-question-coverage-review.md` |
