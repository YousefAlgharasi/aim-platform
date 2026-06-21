# Phase 18 — AI Text Chat E2E Check

**Task:** P18-086
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Document (and trace through the actual code) the end-to-end text AI
Tutor flow: start conversation → send message → safety/quota → response
→ feedback. No JS/TS test toolchain (`node_modules`) is installed in this
environment, so this check is a code-level trace rather than an executed
integration test run; each step below cites the exact file/function that
implements it.

## Traced Flow

1. **Start conversation** — `POST` to the chat-session-start route
   (`chat-session/chat-session-start.service.ts`) creates an
   `ai_chat_sessions` row scoped to `studentId` + `contextRef`.
2. **Send message** — `ChatMessageSubmitController` →
   `ChatMessageSubmitService.submitMessage()`
   (`chat-message/chat-message-submit.service.ts:18`) validates
   `studentId`/`sessionId`/`contextRef`/`studentMessage`, then delegates
   to `AiTeacherOrchestratorService.handleTurn()`.
3. **Orchestration** — `orchestrator/ai-teacher-orchestrator.service.ts`
   coordinates context building (`context-builder/`), prompt building
   (`prompt-builder/`), and the provider gateway call
   (`provider-gateway/`), then persists the turn.
4. **Streaming alternative** — `streaming-api/ai-teacher-stream-message.service.ts`
   provides a separate streamed-delivery path via
   `AiTeacherStreamingService.stream()`
   (`governance/ai-teacher-streaming.service.ts:36`), which calls
   `AiTeacherSafetyService.checkOutput()` on the full generated response
   before emitting any chunk, and yields a `{ type: 'blocked' }` outcome
   instead of content if the output is rejected.
5. **Feedback** — `feedback/ai-teacher-feedback.module.ts` exposes the
   student-facing rate-this-response endpoint, persisting to
   `ai_teacher_feedback` (`message_id`, `student_id`, `rating`).

## Findings

| Step | Status |
|---|---|
| Start conversation creates a session scoped to the requesting student | PASS (traced in `chat-session-start.service.ts`) |
| Send message validates required fields and delegates to the orchestrator rather than calling the provider directly | PASS (traced in `chat-message-submit.service.ts:18-46`) |
| Streamed responses pass output safety checking before any chunk is emitted, fail-closed on a blocked outcome | PASS (traced in `ai-teacher-streaming.service.ts:36-64`) |
| Feedback is recorded against `message_id`/`student_id`/`rating` only | PASS (traced in `feedback/`) |
| **Input-side safety check (`AiTeacherSafetyService.checkInput`) is invoked somewhere in the non-streaming `submitMessage` → `handleTurn` path** | **GAP — not found.** A repository-wide search (`grep -rn "checkInput" ai-teacher/`) found no caller of `checkInput` outside the safety service's own test file. The non-streaming orchestrator path (`chat-message-submit.service.ts` → `ai-teacher-orchestrator.service.ts`) does not call `AiTeacherSafetyService` at all. |
| **Cost/quota check (`AiCostQuotaService.checkQuota`) is invoked before the provider call in the live chat pipeline (streaming or non-streaming)** | **GAP — not found.** No caller of `checkQuota`/`recordUsage` was found in `chat-message-submit.service.ts`, `ai-teacher-orchestrator.service.ts`, or `streaming-api/`. The cost/quota service exists and is unit-tested in isolation (`governance/tests/ai-cost-quota.service.spec.ts`), and the admin usage/cost read surface (P18-050/P18-076) correctly assumes usage rows exist, but the write-side call that would populate those rows from a live chat turn was not found wired into either request path. |

## Risk Assessment

The safety/cost **services** themselves are implemented and individually
unit-tested (governance layer, P18-029/P18-030), and the **admin
read-only surfaces** built in this Phase 18 batch (P18-076 usage/cost,
P18-077 safety review) correctly display whatever rows those services
would produce. However, this E2E trace did not find the call site that
actually invokes `checkInput` or `checkQuota`/`recordUsage` from a live
student chat turn. If this wiring is genuinely missing (rather than
present in a part of the pipeline outside the scope of this review), it
means a student chat turn currently:
- is not blocked by input-side moderation before the provider is called, and
- does not consume/enforce the student's daily/monthly cost budget,

even though the output-side moderation (`checkOutput` in the streaming
path) is correctly wired and fail-closed.

## Recommendation

Flag this as a **blocking follow-up** for whoever owns the
`chat-message-submit`/`orchestrator` pipeline: wire
`AiTeacherSafetyService.checkInput()` and
`AiCostQuotaService.checkQuota()`/`recordUsage()` into
`ChatMessageSubmitService.submitMessage()` (or
`AiTeacherOrchestratorService.handleTurn()`) before this flow is
considered safe to expose to real student traffic, since this review's
mandate is to validate the flow — not to implement pipeline wiring
changes outside its P1 scope.

**Overall verdict: Conditional — output safety and feedback steps pass;
input-safety and cost/quota gating were not found wired into the live
chat-message submission path and should be treated as an open blocking
item, not a false "Pass."**
