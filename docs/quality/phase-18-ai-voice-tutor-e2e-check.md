# Phase 18 — AI Voice Tutor E2E Check

**Task:** P18-087
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Document (and trace through the actual code) the end-to-end voice
session flow: session start → STT → chat orchestration → TTS →
transcript. No JS/TS test toolchain is installed in this environment, so
this check is a code-level trace; each step cites the exact
file/function that implements it.

## Traced Flow

1. **Session start** — `session-start-api/` → `session-start/voice-session-start.service.ts`
   creates a `voice_sessions` row scoped to `studentId`.
2. **Audio submit** — `audio-upload/` accepts the raw audio payload and
   hands it to `audio-storage/` for persistence/lifecycle (`audio-cleanup/`
   handles later removal).
3. **STT** — `voice-orchestrator.service.ts:121-138` calls
   `SttGateway.transcribe()`, then passes the result through
   `SttSafeFailureService.toSafeOutcome()` (`stt-gateway/stt-safe-failure.service.ts`),
   which yields a fallback outcome on STT failure rather than throwing —
   the "silent/empty recording" path documented in
   `docs/phase-9/stt-output-contract.md`.
4. **Chat orchestration** — the transcribed text is forwarded into the
   same context-assembly/AI-generation contract used by text chat
   (`voice-orchestrator.service.ts:152`, `contextRef` passed through
   unchanged), reusing the AI Teacher pipeline rather than a separate
   voice-specific generation path.
5. **TTS** — `voice-orchestrator.service.ts:162` currently sets
   `const ttsIsFallback = true; // Group G not yet wired`.
6. **Transcript** — `transcript-pipeline/` persists the STT output text
   via `message-persistence/`, mirroring the text chat message model.

## Findings

| Step | Status |
|---|---|
| Session start creates a session scoped to the requesting student | PASS (traced in `session-start/voice-session-start.service.ts`) |
| STT failure degrades to a safe fallback outcome instead of throwing or returning an unsafe value | PASS (traced in `voice-orchestrator.service.ts:121-138`, `stt-safe-failure.service.ts`) |
| Chat orchestration for the transcribed text reuses the same `contextRef`-based context contract as text chat, rather than a parallel ungated path | PASS (traced in `voice-orchestrator.service.ts:152`) |
| Transcript is persisted via the shared message-persistence layer | PASS (traced in `transcript-pipeline/`, `message-persistence/`) |
| **TTS audio generation** | **GAP — confirmed not wired.** `voice-orchestrator.service.ts:162` hardcodes `ttsIsFallback = true` with the inline comment `// Group G not yet wired`. This is a pre-existing, already-known gap (consistent with the deferred-gap list carried over from earlier in this session: "P18-036 (TTS wiring)") rather than a new Phase 18 regression — it was deferred deliberately, not silently dropped. |
| **Input-side safety check / cost-quota gating for voice turns** | **GAP — not found**, for the same reason documented in the text chat E2E check (P18-086): no caller of `AiTeacherSafetyService.checkInput` or `AiCostQuotaService.checkQuota`/`recordUsage` was found in `voice-teacher/orchestrator/voice-orchestrator.service.ts` or any module it imports. `VoiceSafetyEventRepository` exists and is correctly read by the admin safety review surface (P18-077) and the parent AI safety summary (P18-071), but no write call site was found in the live voice turn path. |

## Risk Assessment

The voice session lifecycle (start → STT-with-fallback → reused chat
context → transcript persistence) is structurally sound and reuses the
text-chat pipeline rather than duplicating it, which is a deliberate and
correct architectural choice (see the Phase 18 architecture review,
P18-085). However, this trace confirms two real gaps in the live request
path: TTS generation is an acknowledged stub (`ttsIsFallback = true`),
and — same as the text chat path — input safety and cost/quota gating
were not found wired into the orchestrator for voice turns either.

## Recommendation

Both gaps should be tracked as follow-up implementation work, not
treated as resolved by this review:
1. Wire the real TTS provider into `voice-orchestrator.service.ts` (the
   already-identified "Group G" follow-up).
2. Wire `AiTeacherSafetyService.checkInput()` and
   `AiCostQuotaService.checkQuota()`/`recordUsage()` into the voice
   orchestrator, ideally from the same shared call site used to fix the
   text chat gap from P18-086, so both pipelines gain the missing safety/
   cost enforcement consistently in one change.

**Overall verdict: Conditional — session start, STT fallback handling,
context reuse, and transcript persistence pass; TTS wiring and
input-safety/cost-quota gating are confirmed gaps in the live voice turn
path and should be treated as open blocking items.**
