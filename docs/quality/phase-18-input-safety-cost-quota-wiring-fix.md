# Phase 18 — Input-Safety / Cost-Quota Wiring Fix

**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Background

The Phase 18 E2E checks (`docs/quality/phase-18-ai-text-chat-e2e-check.md`,
`docs/quality/phase-18-ai-voice-tutor-e2e-check.md`) and the output
completeness review (`docs/quality/phase-18-output-completeness-review.md`)
found that `AiTeacherSafetyService.checkInput()` and
`AiCostQuotaService.checkQuota()`/`recordUsage()` were implemented and
unit-tested in isolation but had no caller anywhere in the live AI Teacher
or Voice Tutor request path. This document records the fix.

## Root Cause

Both the text-chat pipeline (`chat-message-submit.service.ts` →
`AiTeacherOrchestratorService.handleTurn()`) and the voice pipeline
(`voice-orchestrator.service.ts`, which itself calls
`AiTeacherOrchestratorService.handleTurn()` with the transcribed text)
converge on a single function: `AiTeacherOrchestratorService.handleTurn()`
in `services/backend-api/src/features/ai-teacher/orchestrator/ai-teacher-orchestrator.service.ts`.
The governance gates (safety, cost/quota) were built as standalone
services but were never injected into or called from that one
convergence point — one root cause, not two independent bugs.

## Fix

`AiTeacherOrchestratorService.handleTurn()` now:

1. Resolves the active economy-tier model config
   (`ModelConfigService.selectByTier('economy')`) — needed for the
   `providerKeyRef` used by the safety check and the `modelConfigId` used
   for cost recording.
2. Calls `AiCostQuotaService.checkQuota(studentId, 'daily', estimatedCost)`
   **before** building context or calling the provider. If the quota is
   exceeded, throws `AiQuotaExceededError` and the turn stops — no
   provider call, no context build.
3. Persists the student message, then calls
   `AiTeacherSafetyService.checkInput('message', studentMessageId, studentMessage, providerKeyRef)`
   **before** calling the provider. If the outcome is `'blocked'`, throws
   `AiInputBlockedError` and the turn stops — no provider call.
4. After a successful provider call, calls
   `AiCostQuotaService.recordUsage(...)` to write the
   `ai_usage_cost_events` row that the admin usage/cost dashboard
   (P18-076) already reads.

Both new errors (`AiInputBlockedError`, `AiQuotaExceededError`) follow the
exact pattern already established by `RateLimitExceededError`
(`rate-limit-policy/rate-limit-exceeded.error.ts`): a typed `Error`
subclass carrying only a safe, generic, student-facing message — never a
moderation category, spend amount, or budget figure.

Because both the streaming API (`streaming-api/ai-teacher-stream-message.service.ts`)
and the voice orchestrator (`voice-teacher/orchestrator/voice-orchestrator.service.ts`)
already call `AiTeacherOrchestratorService.handleTurn()` rather than
duplicating pipeline logic, this single fix closes the gap for the
text-chat path, the streaming path, and the voice path simultaneously.

## Files Changed

- `services/backend-api/src/features/ai-teacher/governance/ai-input-blocked.error.ts` (new)
- `services/backend-api/src/features/ai-teacher/governance/ai-quota-exceeded.error.ts` (new)
- `services/backend-api/src/features/ai-teacher/orchestrator/ai-teacher-orchestrator.service.ts`
  (wires `AiTeacherSafetyService`, `AiCostQuotaService`, `ModelConfigService` into `handleTurn()`)
- `services/backend-api/src/features/ai-teacher/orchestrator/ai-teacher-orchestrator.module.ts`
  (imports `AiTeacherGovernanceModule`)
- `services/backend-api/src/features/ai-teacher/orchestrator/tests/ai-teacher-orchestrator.service.spec.ts`
  (new tests: quota-exceeded blocks before context/provider, input-blocked
  blocks before provider, usage recorded after a successful call)

## What This Does Not Fix

- **TTS is still stubbed** (`voice-orchestrator.service.ts:162`,
  `ttsIsFallback = true`). Out of scope for this fix — tracked separately
  as a Phase 19 prerequisite in `docs/phase-19/readiness-from-phase-18.md`.
- The per-turn cost estimate used for the pre-call quota check and the
  post-call usage record is a fixed flat value
  (`ESTIMATED_COST_PER_TURN_USD = 0.01`), not a token-based calculation —
  no token-cost calculator exists yet. This is conservative enough to
  enforce the daily/monthly budget gate but should be replaced with a
  real per-token cost computation once the live AI provider (currently a
  fail-closed stub, `AiTeacherProviderUnavailableStub`) is wired in.

## Verification

No JS/TS toolchain (`node_modules`) is installed in this environment, so
this fix could not be run through Jest. It was verified by:

- Reading the existing `RateLimitExceededError` pattern and
  `AiCostQuotaService`/`AiTeacherSafetyService` test suites
  (`governance/tests/ai-cost-quota.service.spec.ts`,
  `governance/tests/ai-teacher-safety.service.spec.ts`) to confirm method
  signatures and return shapes used by the new wiring match exactly.
- Updating the orchestrator's own spec
  (`orchestrator/tests/ai-teacher-orchestrator.service.spec.ts`) with the
  two new dependency mocks and four new test cases covering both the
  allowed and blocked paths for each gate.
- Tracing every caller of `AiTeacherOrchestratorService.handleTurn()`
  (`chat-message-submit.service.ts`, `streaming-api/ai-teacher-stream-message.service.ts`,
  `voice-orchestrator.service.ts`) to confirm none of them duplicate
  pipeline logic that would bypass the new gates.

## Updated Verdict

The "Conditional" verdicts in `docs/quality/phase-18-ai-text-chat-e2e-check.md`
and `docs/quality/phase-18-ai-voice-tutor-e2e-check.md`, and the "BLOCKED
for production readiness" verdict in
`docs/quality/phase-18-output-completeness-review.md`, were issued before
this fix. With this fix applied, input-side safety moderation and
cost/quota enforcement are now wired into every live AI Teacher/Voice
Tutor request path. The TTS stub remains the one open item before Voice
Tutor audio output is production-ready.
