# Phase 18 — AI Teacher Architecture Review

**Task:** P18-085
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Review the AI Teacher/Voice Tutor backend/provider/UI architecture —
safety/cost services, streaming, voice pipeline, and maintainability —
for structural soundness ahead of Phase 18 closure.

## Architecture Overview

### AI Teacher (text) — `services/backend-api/src/features/ai-teacher/`

| Module | Responsibility |
|---|---|
| `chat-session`, `chat-message`, `chat-history`, `chat-session-list` | Session lifecycle and message persistence, each a narrow feature module with its own service/repository/types |
| `context-builder` | Assembles backend-approved context for prompts (no client-supplied context) |
| `prompt-builder` | Renders the active prompt template against context |
| `provider-gateway` | Abstraction over the underlying AI provider (`AiTeacherProviderGateway` interface + stub) |
| `governance/` | Prompt templates, model configs, safety checks, cost/quota, audit logging — the shared cross-cutting policy layer |
| `response-safety` | Output-side moderation hook |
| `rate-limit-policy` | Request-rate guarding, independent of cost/quota budget guarding |
| `streaming-api` | Streaming response delivery to the client |
| `safety-status` | Student-facing safety status surface |
| `admin-prompts`, `admin-model-configs`, `admin-usage-cost`, `admin-safety-review`, `admin-audit` | Read/write admin surfaces, each a thin controller over the shared `governance/` repositories |
| `guards`, `interfaces` | Cross-cutting auth/ownership guards and shared interfaces |

### Voice Tutor — `services/backend-api/src/features/voice-teacher/`

| Module | Responsibility |
|---|---|
| `session-start`, `session-start-api` | Voice session lifecycle |
| `audio-upload`, `audio-storage`, `audio-cleanup` | Raw audio ingestion and lifecycle management |
| `stt-gateway`, `tts-gateway` | Provider abstractions for speech-to-text / text-to-speech |
| `transcript-pipeline` | Converts STT output into a persisted transcript |
| `context-link` | Links voice sessions into the same context-builder contract used by text chat |
| `message-submit`, `message-persistence` | Voice turn persistence, mirroring the text chat message model |
| `response-generation` | Drives the AI response generation step for a voice turn |
| `orchestrator` | Coordinates the full voice turn: STT → safety → context → generation → safety → TTS |
| `fallback-policy`, `rate-limit-policy` | Degradation and rate-limiting policy, analogous to AI Teacher's `rate-limit-policy` |
| `repositories` | Shares the `AiSafetyEventRepository`/safety-check pattern with AI Teacher rather than duplicating it |

## Findings

### 1. Separation of Concerns

| Check | Status |
|---|---|
| Each chat/voice lifecycle stage (start, submit, history, list) is its own narrow module with its own service/repository — no monolithic "AiTeacherService god class" handling all stages | PASS |
| Cross-cutting governance concerns (prompts, model config, safety, cost, audit) are centralized in one `governance/` module and reused by both the chat pipeline and the five admin controllers, rather than each admin controller reimplementing its own copy | PASS |
| Voice Tutor reuses AI Teacher's safety/cost primitives (e.g. `VoiceSafetyEventRepository` mirrors `AiSafetyEventRepository`; `AiCostQuotaService` accepts an `eventType` of `'text_generation' | 'stt' | 'tts'` so voice and text share one quota system) instead of maintaining a parallel cost system | PASS |

### 2. Safety/Cost Service Placement

| Check | Status |
|---|---|
| `AiTeacherSafetyService` and `AiCostQuotaService` both sit in `governance/`, independent of any specific chat/voice transport module, so either pipeline can call them without a circular module dependency | PASS |
| Admin read surfaces (`admin-safety-review`, `admin-usage-cost`, `admin-audit`) import only the repository layer from `governance/`/`repositories/`, never the write-side services — read and write paths are structurally separated | PASS |

### 3. Streaming and Voice Pipeline

| Check | Status |
|---|---|
| `streaming-api` is a distinct module from `chat-message`, so a non-streaming submit path and a streaming path can evolve independently without one breaking the other | PASS |
| The voice `orchestrator` module composes STT, safety, context, generation, and TTS as discrete steps rather than one inline function, keeping each step independently testable | PASS |

### 4. Maintainability

| Check | Status |
|---|---|
| Repository pattern (raw SQL via `DatabaseService.query<RowType>`) is applied uniformly across both `ai-teacher/` and `voice-teacher/`, with no controller executing raw SQL directly | PASS |
| Module-level header comments consistently document the task ID and intent (e.g. `governance.module.ts`, `admin-safety-review.module.ts`), which keeps the provenance of each module traceable | PASS |
| Test directories (`tests/`) exist alongside each major module, matching the source tree shape rather than one disconnected test root | PASS |

## Summary

The AI Teacher and Voice Tutor backends are organized as narrow,
single-responsibility feature modules with one shared governance layer
for safety/cost/audit/prompt/model-config concerns, consumed identically
by the live chat/voice pipelines and by the five read-only admin
surfaces. Voice Tutor deliberately reuses AI Teacher's safety and cost
primitives rather than duplicating them, keeping the two pipelines
consistent. No god-class, no circular admin-to-pipeline write dependency,
and no controller bypassing the repository layer were found.

**Overall verdict: Pass.**
