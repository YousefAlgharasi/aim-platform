# Phase 19 Readiness Checklist (from Phase 18)

**Task:** P18-090
**Date:** 2026-06-21
**Author:** YousefAlgharasi

## Purpose

Document what Phase 18 (AI Teacher, Voice Tutor, Prompt Safety, AI Cost
Controls) leaves in place for Phase 19 (advanced growth experiments,
personalization expansion, future AI enhancements) to build on, and what
must be resolved first. This document does not implement any Phase 19
feature — it is a readiness assessment only.

## What Phase 18 Provides for Phase 19

| Capability | State | Notes |
|---|---|---|
| AI Teacher text chat pipeline (session, message, context, prompt, provider gateway) | Built | `services/backend-api/src/features/ai-teacher/` |
| Voice Tutor pipeline (session, STT, orchestration, transcript) | Built, partial | TTS stubbed (see Blockers) |
| Governance layer (prompt templates, model configs, safety service, cost/quota service, audit log) | Built | Centralized in `ai-teacher/governance/`, reused by both pipelines |
| Admin AI management surfaces (prompts, model-configs, usage-cost, safety-review, audit) | Built | Read/narrow-write only, role-gated |
| Parent-facing AI summary/safety surfaces | Built | `apps/web/src/features/parent-dashboard/pages/ParentAiSummary.js`, `ParentAiSafetySummary.js` |
| Mobile AI Teacher / Voice Tutor UI | Built | `apps/mobile/lib/features/ai_teacher/`, `voice_teacher/` |
| Cost/quota primitives (`AiCostQuotaService`, daily/monthly budgets, per-event-type tracking) | Built, not enforced live | See Blockers |
| Safety primitives (`AiTeacherSafetyService.checkInput`/`checkOutput`) | Built, partially enforced live | `checkOutput` wired into streaming; `checkInput` not wired anywhere |

This gives Phase 19 a working data model, governance layer, and admin
tooling to extend for richer personalization (e.g. new prompt templates,
new model tiers, new context sources) without redesigning the underlying
AI Teacher architecture, which the Phase 18 architecture review (P18-085)
found to be a clean, non-monolithic, single-responsibility module set.

## Blockers — Must Be Resolved Before Phase 19 AI Work

These are carried over verbatim from the Phase 18 E2E checks and output
completeness review (P18-086, P18-087, P18-089) and are **not** resolved
by this document:

1. **Input-side safety moderation is not wired into the live request
   path.** Neither `chat-message-submit.service.ts` →
   `ai-teacher-orchestrator.service.ts` (text) nor
   `voice-orchestrator.service.ts` (voice) calls
   `AiTeacherSafetyService.checkInput()` before generating a response.
   Any Phase 19 work that increases AI usage volume (more prompts, more
   personalization surfaces) will multiply exposure to this gap.
2. **Cost/quota enforcement is not wired into the live request path.**
   Neither pipeline calls `AiCostQuotaService.checkQuota()` before the
   provider call or `recordUsage()` after it. Phase 19 growth experiments
   that increase AI call volume have no live budget guardrail until this
   is fixed — the budgets exist only on paper (`DAILY_BUDGET_USD = 2.0`,
   `MONTHLY_BUDGET_USD = 30.0`) and in unit tests.
3. **TTS generation is stubbed.** `voice-orchestrator.service.ts:162` sets
   `ttsIsFallback = true` with the comment `// Group G not yet wired`. Any
   Phase 19 voice-personalization feature depends on this being completed
   first.

## Non-Blocking Follow-Ups

These do not block Phase 19 AI work but should be tracked:

- `apps/mobile/lib/features/voice_teacher/ui/widgets/recording_state_bar.dart`
  uses raw `Colors.red` instead of the `AimColors.error*` design tokens
  (P18-080).
- No formal data-retention/purge policy exists yet for AI conversation,
  transcript, or safety-event tables (P18-082).

## AI Authority Boundary for Phase 19

Per the standing AI Authority rules carried through all of Phase 18: AI
Teacher must never write mastery, weakness, difficulty, recommendations,
review schedules, progress, assessment results, or AIM outputs directly;
the backend/AIM Engine remains the final authority for learning
decisions. Any Phase 19 personalization feature must preserve this
boundary — AI Teacher/Voice Tutor may inform or summarize, but must not
become a second source of truth for learning-state data. The governance
layer's read/write separation (admin surfaces are read-only; all
mutations go through narrow state-transition endpoints) is the pattern
Phase 19 should continue.

## Recommendation

Phase 19 should not begin work that increases live AI Teacher/Voice Tutor
traffic (e.g. expanding personalization prompts, adding new context
sources, increasing usage tiers) until the input-safety and cost-quota
wiring gap is fixed. Architecture, governance, admin tooling, and data
model are otherwise ready to extend.

**Overall verdict: Conditionally ready — extend the existing
architecture for Phase 19, but treat the input-safety/cost-quota wiring
gap and TTS stub as prerequisites, not concurrent work.**
