# Phase 8 — No Authority Violation Review

**Task:** P8-099
**Branch:** `phase8/P8-099-ai-teacher-no-authority-review`
**Date:** 2026-06-19
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P8-096 — Done

---

## Scope

Code-level review confirming the AI Teacher feature
(`services/backend-api/src/features/ai-teacher/` and
`apps/mobile/lib/features/ai_teacher/`) never replaces AIM Engine's
authority over learning decisions. Prior reviews (P8-096 security, P8-097
privacy, P8-098 safety) already documented the prompt-level instructions
(`no-diagnosis.policy.ts`, `no-authority-change.policy.ts`) and the
output-side `LEARNING_AUTHORITY_VIOLATION` response filter; this review
verifies the underlying code-level guarantee — that no write path,
read path, or computation in the AI Teacher feature can actually produce
or persist a mastery/level/weakness/difficulty/recommendation/
review-schedule value, independent of what the AI's prompt says.

## Method

Manual review of every AI Teacher repository/service performing a database
write, every context adapter performing a read from AIM Engine, a grep for
mastery/weakness/difficulty/recommendation/review-schedule computation
functions, and a check of the Flutter chat state/notifier/repository for
local computation or persistence.

## Findings

### 1. Write access — pass

Every database write inside the AI Teacher feature targets its own tables
only:

- `ai-teacher-orchestrator.service.ts` — writes chat messages via `chatMessageRepository.create`.
- `chat-session-start.service.ts` — writes a new chat session via `chatSessionRepository.create`.
- `context-builder.service.ts` — writes an audit context snapshot via `contextSnapshotRepository.create`.
- `response-safety-filter.service.ts` — writes a safety event via `safetyEventRepository.create`.

No AI Teacher file imports or calls any AIM Engine write/update/calculate
service (e.g. a skill-state update service, weakness update service,
difficulty decision service, recommendation output service, or
review-schedule output service). The AI Teacher's own repository type
definitions contain no mastery/level/weakness/difficulty/recommendation/
review-schedule fields — there is no column for the AI Teacher to write
such a value into even if it tried.

### 2. Read-only context — pass

Every context adapter that pulls AIM Engine data does so exclusively
through AIM Engine's **read** services:

- `skill-state-context.adapter.ts` — reads via a skill-state read service.
- `recommendation-context.adapter.ts` — reads via a recommendation read service.
- `weakness-context.adapter.ts` — reads via a weakness-records read service.
- `review-schedule-context.adapter.ts` — reads via a review-schedule read service.
- `placement-result-context.adapter.ts` — reads via a placement-result read service.
- `recent-mistakes-context.adapter.ts` — reads via an error-patterns read service.

The AIM module's exports consumed by AI Teacher are limited to these
read-only services — no write/update/calculate service from AIM Engine is
exported into or used by the AI Teacher feature.

### 3. No recomputation — pass

A grep for mastery/weakness/difficulty/recommendation calculation function
names (`calculateMastery`, `computeMastery`, `scoreWeakness`,
`computeWeakness`, `calculateDifficulty`, `computeDifficulty`,
`computeRecommendation`, `calculateRecommendation`, and equivalents)
returns no matches anywhere in the AI Teacher feature. The only arithmetic
present is `context-budget-policy.service.ts`'s token-count estimation for
prompt-size budgeting — unrelated to any learning decision. All context
adapters perform data mapping/filtering only; there is no attempt-history
arithmetic and no spaced-repetition/date math anywhere in the feature.

### 4. Flutter — pass

- `ai_teacher_chat_repository_impl.dart` wraps the backend datasource only; it performs no local computation or write of any learning-authority value.
- `ai_teacher_chat_notifier.dart` stores backend-returned values into Riverpod state and performs no mastery/level/weakness/difficulty/recommendation/review-schedule calculation.
- `ai_teacher_chat_state.dart` holds only `activeSession`, `history`, `lastReply`, `lastFeedback` — no AIM-owned field exists on this state object to even contain such a value.
- A grep across the Flutter `ai_teacher` directory for mastery/difficulty/weakness/level/recommendation/review-schedule computation returns no code matches — only doc comments documenting the boundary (consistent with the P8-094 audit).

## Result

AIM Engine remains the sole authority over every learning decision. The AI
Teacher feature, at the code level — independent of its prompt-level
instructions — has no write path into any AIM Engine table, reads AIM
Engine data exclusively through read-only services, contains no
computation logic for any learning-authority value, and the Flutter client
mirrors this guarantee by never computing or persisting such values
locally. This provides defense-in-depth alongside the prompt-level
instructions (`no-diagnosis.policy.ts`, `no-authority-change.policy.ts`)
and the output-side `LEARNING_AUTHORITY_VIOLATION` response filter already
documented in `docs/quality/phase-8-safety-review.md`.

## Limitations

This is a manual source-code review (grep + file-by-file read), not a
static-analysis/type-level enforcement check (e.g. no compiler-enforced
type that would make an AIM-write call impossible to compile). No
Flutter/Dart or Node test runner was executed in this environment —
existing automated coverage for the reviewed services is inherited from
prior tasks and was not re-run here.
