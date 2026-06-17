# Phase 5 No AI Teacher Scope Review

**Task:** P5-079  
**Branch:** `phase5/P5-079-no-ai-teacher-scope-review`  
**Date:** 2026-06-18  
**Reviewer:** Akram Mayed (t7emonster0@gmail.com)  
**Dependency reviewed:** P5-075 (Add AIM Result API Tests — Done)  
**Scope:** AIM Engine Integration — Backend-to-AIM Engine pipeline only

---

## 1. Purpose

This review verifies that no AI Teacher behavior has leaked into Phase 5. Phase 5 is scoped exclusively to AIM Engine Integration (backend ↔ Python AIM Engine). AI Teacher — adaptive content generation, prompt management, AI provider calls, voice AI, and AI cost control — is reserved for a later phase.

The review covers:
- All Phase 5 AIM backend feature files (`services/backend-api/src/features/aim/`)
- All Phase 5 database migrations (`services/backend-api/prisma/migrations/20260617*`)
- The AIM Engine Python service (`services/aim-engine/`)
- Flutter mobile app (`apps/mobile/`)
- The `ai-teacher` feature module — confirming it has no Phase 5 cross-contamination

---

## 2. AI Teacher Scope Definition

The following capabilities are **out of scope for Phase 5** and must not appear in any Phase 5 deliverable:

| Capability | Examples |
|---|---|
| AI content generation | LLM calls, prompt templates, explain-more, give-example, remediation text |
| Prompt management | Prompt versioning, A/B prompt testing, prompt cost tracking |
| AI provider integration | OpenAI, Anthropic, or any LLM API calls in Phase 5 code |
| AI cost control | Token budgets, usage metering, cost caps |
| Voice AI | Text-to-speech, speech-to-text, voice session handling |
| AI Teacher invocation records | Logging AI Teacher calls to DB in Phase 5 tables |
| Behavioral content personalization | Generating personalized lesson text based on AIM output |

---

## 3. Findings by Area

### 3.1 AIM Feature Module (`services/backend-api/src/features/aim/`)

**Finding: PASS — no AI Teacher references**

A full search of all non-spec TypeScript files in `services/backend-api/src/features/aim/` for AI Teacher keywords (`AiTeacher`, `ai-teacher`, `ai_teacher`, `openai`, `anthropic`, `llm`, `gpt`, `prompt.manag`, `voice.ai`, `AI_PROVIDER_API_KEY`) returned **zero matches**.

The AIM module imports only:
- `DatabaseService` — for DB queries
- `BackendConfigService` — for AIM Engine URL, service token, and timeout config only
- NestJS framework modules (`Injectable`, `Logger`, etc.)
- Internal AIM types and services

No import of `AiTeacherModule`, `AiTeacherService`, or any AI provider SDK was found.

---

### 3.2 AI Teacher Feature Module (`services/backend-api/src/features/ai-teacher/`)

**Finding: PASS — correctly scoped as a stub; not integrated with AIM**

The `ai-teacher/` module exists as a Phase 1 gateway boundary skeleton (pre-dating Phase 5). It contains:

- `AiTeacherService` — a stub with one method, `isAvailable()`, which reads `AI_PROVIDER_API_KEY` from `ConfigService` for a readiness check only. No LLM calls are made.
- `AiTeacherFallbackService` — returns static fallback messages when AI Teacher is unavailable. No AI provider calls.
- `AiTeacherSafetyValidator` — validates response text (word count, prohibited language, answer leakage). No AI provider calls.
- `AiTeacherModule` — registered in `FeaturesModule` but **not imported by `AimModule`**.

The README for this module explicitly states: *"Full provider integration is Phase 2 work."* No actual LLM API call is wired in any file.

**Cross-contamination check:** The AIM module (`AimModule`) does not import `AiTeacherModule` or any `AiTeacher*` class. Confirmed via:
```
grep -rn "AiTeacher" services/backend-api/src/features/aim/ → 0 results
```

---

### 3.3 AI Provider API Key

**Finding: PASS — key stays in config layer, never reaches AIM module**

`AI_PROVIDER_API_KEY` is read in `backend-config.validation.ts` (config layer) for startup validation. It is accessed by `AiTeacherService.isAvailable()` via `ConfigService` only.

A search for `aiProviderApiKey` and `AI_PROVIDER` outside `config/` and `ai-teacher/` returned **zero results** in non-spec TypeScript files. The key never appears in the AIM feature module, AIM migrations, AIM Engine Python code, or Flutter code.

---

### 3.4 Phase 5 Database Migrations

**Finding: PASS — no AI Teacher tables created in Phase 5**

All 15 Phase 5 migrations (P5-029 through P5-041, P5-042) were checked. None creates an AI Teacher table. Every Phase 5 migration explicitly includes a scope guard comment:

> "No AI Teacher tables."

The 13 Phase 5 AIM tables created are:
`student_skill_states`, `learning_sessions`, `session_events`, `lesson_attempts`, `weakness_records`, `difficulty_decisions`, `recommendations`, `review_schedules`, `session_summaries`, `aim_audit_log`, `answers`, `mistakes`, `error_patterns` — plus AIM integration indexes.

No table for AI Teacher invocation records, prompt logs, cost metering, or voice sessions was created.

---

### 3.5 AIM Engine Python Service (`services/aim-engine/`)

**Finding: PASS — no AI Teacher behavior, LLM calls, or provider integration**

The AIM Engine (`services/aim-engine/`) is a deterministic adaptive learning decisions engine. A search for AI Teacher keywords returned matches only in:

- `aim_analysis_pipeline.py` line 21: `"Expose any AI Teacher behaviour."` — this is a prohibition comment in the module docstring explicitly stating the pipeline must **not** do this.
- `aim_analysis_pipeline.py` line 248: `"never generate new content and never embed AI Teacher framing."` — another prohibition.
- `test_aim_fixtures.py` line 183 and `test_aim_engine_unit.py` line 415: `"OPENAI"` and `"openai"` — these appear in **test assertions** that verify these strings must NOT appear in safe failure responses.

All matches are prohibitions or negative assertions — none represent actual AI Teacher implementation.

The AIM Engine makes no LLM calls, no AI provider calls, and generates no adaptive content text.

---

### 3.6 Flutter Mobile App (`apps/mobile/`)

**Finding: PASS — no AI Teacher calls or AI provider references**

A search across all Dart source files in `apps/mobile/` for AI Teacher keywords returned zero hits in source files. The only relevant document is `apps/mobile/docs/no-aim-logic.md`, which is a prohibition document for AIM logic (already verified in P5-078 and P5-081).

No Flutter file calls an AI Teacher endpoint, an AI provider API, or contains any adaptive content generation logic.

---

### 3.7 AIM Result APIs — No AI-Generated Content in Responses

**Finding: PASS**

All five AIM result endpoints (`/skill-states`, `/weakness-records`, `/recommendations`, `/review-schedules`, `/sessions/:id/state`) return only backend-persisted, AIM-Engine-computed scalar values (mastery scores, severity enums, rank integers, schedule dates). They do not return AI-generated text, prompt outputs, or any content produced by an LLM.

`RecommendationEntry.reason` is a string field. Its value is populated from the `reason` column of the `recommendations` table, which is written exclusively by `RecommendationOutputService` (P5-060) from the AIM Engine's structured `reason` field — a deterministic classification string, not LLM-generated text.

---

## 4. Summary Table

| Area | AI Teacher leak? | Result |
|---|---|---|
| AIM feature module (`features/aim/`) | None | ✅ PASS |
| AI Teacher module (`features/ai-teacher/`) | Stub only, not wired to AIM | ✅ PASS |
| `AI_PROVIDER_API_KEY` scope | Config/AI Teacher only | ✅ PASS |
| Phase 5 migrations | No AI Teacher tables | ✅ PASS |
| AIM Engine Python | Prohibitions only, no LLM calls | ✅ PASS |
| Flutter mobile | No AI Teacher references | ✅ PASS |
| AIM result API responses | No LLM-generated content | ✅ PASS |

**Overall result: PASS.** No AI Teacher behavior has leaked into Phase 5. The `ai-teacher/` module exists as a pre-Phase-5 stub and is correctly isolated — it has no dependency on AIM and AIM has no dependency on it.

---

## 5. Open Items

None. No AI Teacher scope violations were found.

**Note for future phases:** When AI Teacher full provider integration is implemented, the `AiTeacherService` stub should be wired to accept AIM Engine outputs (mastery, weakness severity) as context inputs — but this must happen in the AI Teacher phase, not in AIM Engine Integration. The boundary is already correctly drawn.
