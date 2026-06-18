# Phase 4 — No-AIM Runtime Review

> **Task:** P4-077  
> **Branch:** `phase4/P4-077-no-aim-runtime-review`  
> **Reviewer:** AIM Agent  
> **Date:** 2026-06-17  
> **Scope:** Phase 4 Placement Test — all layers reviewed for AIM Engine runtime isolation.  
> **Rule reference:** `docs/phase-4/no-aim-runtime-rule.md` (P4-036), `docs/phase-4/no-client-side-placement-scoring.md` (P4-035)  
> **Method:** Static analysis — grep across all 65 placement source files (backend TS, Flutter Dart, admin TSX), migration SQL, and module wiring.

---

## 1. Review Summary

| Layer | Files scanned | AIM Engine refs found | Result |
|---|---|---|---|
| Backend — placement services (`.ts`) | 19 | 0 | ✅ PASS |
| Backend — placement module wiring | 1 | 0 | ✅ PASS |
| Backend — placement migrations (`.sql`) | 6 | 0 | ✅ PASS |
| Flutter — placement feature (`.dart`) | 28 | 0 | ✅ PASS |
| Admin dashboard — placement pages (`.tsx`) | 17 | 0 | ✅ PASS |
| Backend scoring — no external HTTP calls | 19 | 0 | ✅ PASS |
| AIM Engine module isolation | Global | Not imported by placement | ✅ PASS |

**Overall: 7/7 layer checks PASS — zero AIM Engine runtime violations found.**

---

## 2. What the AIM Engine Runtime Is (Rule Recap)

Per `docs/phase-4/no-aim-runtime-rule.md`, the AIM Engine runtime covers:

- Generating personalized lesson sequences after placement
- Adapting practice difficulty during learning sessions
- Running AI Teacher behavior during active sessions
- Producing dynamic recommendations and retention schedules
- Managing learner progress signals during lesson and practice flows

**None of these are needed for Phase 4.** A placement test requires only: questions, answers, deterministic scoring, and a CEFR-level assignment. All of these are implemented using database records and backend config constants.

---

## 3. Backend Placement Services — Static Check

### 3.1 Scope

All TypeScript files under `services/backend-api/src/features/placement/` (19 files):

```
placement-answer-submit.service.ts
placement-answer-validation.service.ts
placement-attempt-complete.service.ts
placement-attempt.service.ts
placement-audit.service.ts
placement-initial-learning-path.service.ts
placement-permission.guard.ts
placement-permission.guard.spec.ts
placement-question-delivery.service.ts
placement-result-read.service.ts
placement-result.service.ts
placement-retake-policy.service.ts
placement-retake-policy.service.spec.ts
placement-scoring.service.ts
placement-scoring.service.spec.ts
placement-scoring.types.ts
placement-sections.service.ts
placement.controller.ts
placement.module.ts
placement.permissions.ts
placement.types.ts
```

### 3.2 Grep Results

| Pattern | Matches in placement/ |
|---|---|
| `AimEngineClientService` | 0 |
| `AimService` | 0 |
| `AimModule` | 0 |
| `aim-engine-client` | 0 |
| `features/aim` import | 0 |
| `AIM_ENGINE_URL` | 0 |
| `checkHealth()` / `requireHealthy()` | 0 |
| `HttpService` / `HttpModule` | 0 |
| `fetch(` / `axios` | 0 |

**Result: ✅ PASS.** No AIM Engine client, module, or HTTP call exists anywhere in the placement services directory.

### 3.3 Module Wiring

`placement.module.ts` imports:
```typescript
imports: [DatabaseModule, AuthModule],
```

`AimModule` is **not** imported. The placement module has no dependency on `features/aim/`. The `AimEngineClientService` exists in the codebase (`services/backend-api/src/features/aim/`) for Phase 5 use but is completely isolated from the placement feature module.

**Result: ✅ PASS.**

---

## 4. Backend Scoring — Deterministic DB-Only Check

### 4.1 PlacementScoringService

`PlacementScoringService.scoreAttempt()` uses only:
- `DatabaseService` (two SQL queries: answers per section, skill answers)
- Arithmetic on query results
- Backend config constants (`SECTION_WEIGHTS`, `LEVEL_THRESHOLDS`, `SIGNAL_STRONG_THRESHOLD`, `SIGNAL_DEVELOPING_THRESHOLD`, `SECTION_WEAKNESS_THRESHOLDS`)

No external service calls. No message queue. No HTTP client.

### 4.2 PlacementResultService

`PlacementResultService.createResult()` calls:
- `PlacementAnswerValidationService` (DB reads/writes only)
- `PlacementScoringService` (DB reads + arithmetic only)
- `DatabaseService` (INSERT + UPDATE)
- `PlacementInitialLearningPathService` (DB reads/writes only)

No AIM Engine calls at any step.

### 4.3 PlacementInitialLearningPathService

Derives initial learning path from:
- `placement_results.weakness_map` (JSONB — already computed by backend)
- `placement_results.estimated_level` (string — already computed by backend)
- `skills` table (curriculum lookup)

No AIM Engine adaptive engine, no lesson scheduling, no personalization runtime.

**Result: ✅ PASS.** The entire scoring and result generation pipeline is self-contained within the database and deterministic arithmetic.

---

## 5. Database Migrations — AIM Table Check

### Placement migrations reviewed (6 files):
```
20260616000000_create_placement_tests_table/migration.sql
20260616010000_create_placement_sections_table/migration.sql
20260616020000_create_placement_questions_table/migration.sql
20260616030000_create_placement_question_skills_table/migration.sql
20260616040000_create_placement_results_table/migration.sql
20260616050000_create_initial_learning_path_table/migration.sql
```

### Grep Results

| Pattern | Matches |
|---|---|
| `aim_engine` | 0 |
| `aim_lesson` | 0 |
| `aim_session` | 0 |
| `aim_adaptation` | 0 |
| `REFERENCES aim_` | 0 |

No migration creates AIM Engine runtime tables or foreign keys into AIM Engine schemas. The `initial_learning_path` table is a placement-output table — it records where the backend has decided a student should start in the curriculum. It does not invoke or depend on any AIM Engine runtime service.

**Result: ✅ PASS.**

---

## 6. Flutter Placement Layer — AIM Isolation Check

### 6.1 Scope

All Dart files under `apps/mobile/lib/features/placement/` (28 files including datasource, models, repository, providers, notifiers, pages).

### 6.2 Grep Results

| Pattern | Matches |
|---|---|
| `aim_engine` | 0 |
| `AimEngine` | 0 |
| `aim-engine` | 0 |
| HTTP client direct calls | 0 (uses `BackendApiClient` exclusively) |
| Scoring threshold constants | 0 (confirmed by P4-070 static analysis) |
| `correct_answer` field | 0 |
| `is_correct` field | 0 |
| `overallScore` field | 0 |

### 6.3 API Call Scope

Flutter placement makes exactly 7 HTTP calls — all to placement endpoints:
1. `GET /placement/active`
2. `GET /placement/active/sections`
3. `GET /placement/questions?sectionId=`
4. `POST /placement/attempts`
5. `POST /placement/attempts/:id/answers`
6. `POST /placement/attempts/:id/complete`
7. `GET /placement/attempts/:id/result`

None of these are AIM Engine endpoints. All go to `BackendApiClient` which routes to the NestJS backend, not to any AIM Engine service.

**Result: ✅ PASS.**

---

## 7. Admin Dashboard — AIM Isolation Check

### 7.1 Scope

All TypeScript/TSX files under `apps/admin-dashboard/app/admin/placement/` (17 files — tests list, sections UI, questions UI, skill linking UI, status control, results view, permission check).

### 7.2 Grep Results

| Pattern | Matches |
|---|---|
| `aim.engine` | 0 |
| `AimEngine` | 0 |
| `aimEngine` | 0 |
| `aim-engine` | 0 |

Admin placement UI pages make REST calls to the backend admin placement endpoints only. They do not call any AIM Engine service directly.

**Result: ✅ PASS.**

---

## 8. AIM Engine Module Isolation Confirmation

The `AimEngineClientService` and `AimModule` **do exist** in the codebase at:
```
services/backend-api/src/features/aim/aim-engine-client.service.ts
services/backend-api/src/features/aim/aim.module.ts
```

This is correct — they are pre-staged for Phase 5 use. Their presence is intentional and does not constitute a violation. The review confirms they are:

- **Not imported** by `placement.module.ts`
- **Not imported** by any placement service
- **Not referenced** in any placement controller handler
- **Not reachable** from any Phase 4 HTTP endpoint

The `BackendConfigService.aimEngine.url` config property exists and reads `AIM_ENGINE_URL` from environment — but this value is only accessed by `AimEngineClientService`, which is not wired into the placement module.

**Result: ✅ PASS — AIM Engine module correctly isolated.**

---

## 9. Prohibited Patterns Check (per `no-aim-runtime-rule.md`)

| Prohibited Pattern | Checked | Violations |
|---|---|---|
| Import `AimEngineClientService` in any placement file | ✅ | 0 |
| Call `aimEngineClient.checkHealth()` or `requireHealthy()` from placement | ✅ | 0 |
| POST to any `/aim/*` endpoint from placement services | ✅ | 0 |
| Inject `AimModule` into `PlacementModule` | ✅ | 0 |
| Flutter calling any AIM Engine API | ✅ | 0 |
| Flutter computing CEFR level, skill signal, or weakness map locally | ✅ | 0 |
| Migrations creating `aim_engine_*` tables | ✅ | 0 |
| Admin dashboard triggering AIM Engine runtime operations | ✅ | 0 |

**All 8 prohibited patterns: 0 violations.**

---

## 10. Required Patterns Verification (per `no-aim-runtime-rule.md`)

| Required Pattern | Verified |
|---|---|
| Scoring uses only DB records + predefined constants | ✅ |
| `estimated_level` assigned by backend only | ✅ |
| Skill signals assigned by backend only | ✅ |
| Weakness map built by backend only | ✅ |
| Initial learning path derived by backend only | ✅ |
| Flutter displays backend outputs as-is | ✅ |
| Scoring constants are not stored in DB or exposed via API | ✅ |

**All 7 required patterns: verified.**

---

## 11. Limitations

| Item | Notes |
|---|---|
| Runtime execution not verified | No live environment available in agent context. All checks are static source analysis. |
| `AIM_ENGINE_URL` env var is read at startup | Config property exists and is validated even in Phase 4. This is fine — the value is only consumed by `AimEngineClientService` which is not in `PlacementModule`. If desired, the config validation could be made conditional on Phase 5 feature flags, but this is not a Phase 4 requirement. |
| Phase 5 stub methods not present | No stub/mock AIM Engine calls found. Phase 5 integration will be a clean addition, not a replacement of hidden stubs. |

---

## 12. Conclusion

Phase 4 is **fully isolated from the AIM Engine runtime**. Zero violations found across all 65 placement source files, 6 migrations, all module wiring, and all three application layers (backend, Flutter, admin dashboard). The `AimEngineClientService` exists in the codebase but is correctly scoped to its own module and has no connection to the placement feature. All scoring, level assignment, and result generation is deterministic, database-only, and backend-authoritative.

Phase 5 AIM Engine integration can proceed as a clean addition without modifying any Phase 4 placement code.
