# Phase 5 — AIM Attempt Input Contract

## Purpose

This document defines the shared contract for the **attempt-level** portion of the Backend-to-AIM Engine request payload. It standardizes the question, answer, correctness, retry, difficulty, confidence, and skill-context fields the Backend sends to the AIM Engine for each attempt under analysis.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic.

This contract covers the **attempt input segment only**. It composes alongside the session input segment (`P5-009`) inside a single `POST /aim/v1/analysis` request. It does not cover the AIM Engine response shape (`P5-011`) or any persisted AIM-owned record (`P5-012` through `P5-017`).

## Source Documents

This contract follows:

```text
docs/phase-5/aim-engine-integration-charter.md
docs/phase-5/aim-integration-scope-boundaries.md
docs/phase-5/no-client-aim-rule.md
docs/phase-5/aim-data-flow.md
docs/phase-5/aim-engine-api-map.md
docs/phase-5/backend-aim-pipeline-map.md
docs/phase-5/aim-error-handling-policy.md
packages/shared-contracts/api/aim-session-input-contracts.md
```

The Backend remains the source of truth for attempt records. The AIM Engine receives the attempt input segment as part of a single analysis request and returns decisions without writing to any store.

## Scope

This contract defines:

- The attempt input segment of the AIM Engine request, supporting one or more attempts per request.
- Field names, types, and constraints for each attempt entry.
- Backend-authority rules for correctness, difficulty, and skill linkage.
- Behavioral signal fields permitted at the attempt level.
- Validation rules applied by the Backend before sending and by the AIM Engine on receipt.
- Explicit exclusions.

This contract does not define:

- The session input segment (`P5-009`).
- The AIM Engine response shape (`P5-011`, `P5-012`–`P5-017`).
- The `lesson_attempts` or equivalent database schema, which is owned by existing Phase 3/4 foundations and any Phase 5 migration that references it.
- Client-facing attempt submission APIs, owned by `features/lessons` and `features/placement` controllers.

## Stable Identifier Rule

All identifiers in this contract are backend-issued UUIDs or stable machine-readable keys, consistent with the identifier rules established in `packages/shared-contracts/api/skill-objective-contracts.md` and the Phase 4 placement contracts.

## Attempt Input Segment

A single AIM Engine request carries a session segment (`P5-009`) plus one or more attempt entries. The attempt list field lives in the combined request envelope assembled by the Backend's state assembly service (`docs/phase-5/backend-aim-pipeline-map.md`, Stage 3); this document defines the shape of each entry in that list.

```ts
type AimAttemptInput = {
  attemptId: string;
  sessionId: string;
  itemId: string;
  itemType: AimItemType;
  skillIds: string[];
  presentedDifficulty: AimDifficultyLevel;
  studentAnswer: AimStudentAnswer;
  isCorrect: boolean;
  attemptNumberForItem: number;
  startedAt: string;
  submittedAt: string;
  responseTimeMs: number;
  behavioralContext: AimAttemptBehavioralContext;
};
```

### Field Rules

| Field | Type | Required | Backend-owned | Description |
| --- | --- | --- | --- | --- |
| `attemptId` | `string` (UUID) | Yes | Yes | Backend-issued identifier of the attempt record. |
| `sessionId` | `string` (UUID) | Yes | Yes | References the session this attempt belongs to. Must match a `sessionId` present in the accompanying session input segment. |
| `itemId` | `string` (UUID) | Yes | Yes | Backend-issued identifier of the question, lesson item, or practice item attempted. |
| `itemType` | `AimItemType` | Yes | Yes | Backend-classified item type (see below). |
| `skillIds` | `string[]` (skill keys) | Yes (at least one entry) | Yes | Skill keys linked to the item, resolved by the Backend from curriculum skill-mapping data, not supplied verbatim by the client. |
| `presentedDifficulty` | `AimDifficultyLevel` | Yes | Yes | The backend-recorded difficulty level at which the item was presented to the student for this attempt. |
| `studentAnswer` | `AimStudentAnswer` | Yes | Mixed (see below) | The submitted answer, in backend-normalized form. |
| `isCorrect` | `boolean` | Yes | Yes | Evaluated by the Backend only. Never trusted from a client-submitted value. |
| `attemptNumberForItem` | `integer` (>= 1) | Yes | Yes | Backend-counted ordinal of this attempt for this item within the current session (1 for the first try). |
| `startedAt` | `string` (ISO-8601 UTC) | Yes | Yes | When the item was presented to the student. |
| `submittedAt` | `string` (ISO-8601 UTC) | Yes | Yes | When the Backend recorded the answer submission. |
| `responseTimeMs` | `integer` (>= 0) | Yes | Yes | `submittedAt` minus `startedAt` in milliseconds, computed by the Backend. Passed as behavioral context only. |
| `behavioralContext` | `AimAttemptBehavioralContext` | Yes | Mixed (see below) | Raw, attempt-level behavioral signals. |

### `AimItemType`

```ts
type AimItemType =
  | 'lesson_question'
  | 'practice_question'
  | 'review_question'
  | 'drill_question';
```

| Value | Meaning |
| --- | --- |
| `lesson_question` | Item presented as part of new lesson content delivery. |
| `practice_question` | Item presented as general practice within a `lesson_practice` session. |
| `review_question` | Item presented from a prior `review_schedule` AIM output, within a `review_practice` session. |
| `drill_question` | Item presented as a backend-triggered targeted drill addressing a known weakness record, within an `adaptive_drill` session. |

`itemType` is backend-classified and must be consistent with the `sessionType` carried in the accompanying session input segment (`lesson_question`/`practice_question` pair with `lesson_practice`, `review_question` pairs with `review_practice`, `drill_question` pairs with `adaptive_drill`).

### `AimDifficultyLevel`

```ts
type AimDifficultyLevel = 1 | 2 | 3 | 4;
```

Difficulty uses the Phase 0/1 locked 1–4 difficulty scale. `presentedDifficulty` reflects the difficulty the Backend selected for this presentation; it is informational context for the AIM Engine. The AIM Engine, not the Backend or the client, decides the difficulty for the *next* presentation, returned as a `difficulty_decision` in the response (`P5-011`, `P5-014`).

### `AimStudentAnswer`

```ts
type AimStudentAnswer = {
  format: AimAnswerFormat;
  value: string;
  optionsPresentedCount: number | null;
};

type AimAnswerFormat =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'listening_choice'
  | 'free_text';
```

| Field | Type | Description |
| --- | --- | --- |
| `format` | `AimAnswerFormat` | Backend-classified answer format, consistent with the formats already established in `packages/shared-contracts/api/placement-answer-contracts.md` plus `free_text` for open lesson responses. |
| `value` | `string` | The student's normalized answer value (for example, an option letter, `"true"`/`"false"`, or written text). Normalization rules match the existing per-format rules used in placement answers. |
| `optionsPresentedCount` | `integer \| null` | Number of answer options presented, when `format` is an option-based type. `null` for `fill_blank` and `free_text`. |

`value` is the student's literal answer content, included because the AIM Engine's analysis may depend on answer content (for example, error-pattern detection within `fill_blank` or `free_text` responses). It is not itself an AIM-owned decision field; it is raw input.

### `AimAttemptBehavioralContext`

```ts
type AimAttemptBehavioralContext = {
  answerChangeCount: number;
  hesitationBeforeSubmitMs: number | null;
  usedHint: boolean;
  abandonedFirstThenRetried: boolean;
};
```

| Field | Type | Description |
| --- | --- | --- |
| `answerChangeCount` | `integer` (>= 0) | Backend-counted number of times the student changed their selected or written answer before submission. |
| `hesitationBeforeSubmitMs` | `number \| null` | Raw time between the student's first interaction with the item and final submission, in milliseconds, when distinct from `responseTimeMs`. `null` when not separately tracked. |
| `usedHint` | `boolean` | Whether a backend-provided hint was shown before submission, if hints exist for the item. |
| `abandonedFirstThenRetried` | `boolean` | Whether the student navigated away from the item before returning to complete it. |

All fields in `AimAttemptBehavioralContext` and the top-level `responseTimeMs` are raw behavioral signals computed by the Backend from recorded client events. None of these fields are mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration values, and none of them may be used by any layer to compute mastery, level, or difficulty directly. They are inputs the AIM Engine may interpret as context only, consistent with `docs/phase-5/aim-engine-integration-charter.md`.

## Backend Authority Rules

- The Backend populates every field in `AimAttemptInput`. No field is copied verbatim from an unvalidated client payload.
- `isCorrect` is always evaluated by the Backend's existing scoring logic (consistent with the Phase 4 placement scoring approach, extended to lesson and practice attempts). The client never submits or implies this value.
- `skillIds` are resolved against backend curriculum skill-mapping data for the `itemId`; they are never accepted as a raw client-supplied list.
- `presentedDifficulty` reflects the difficulty the Backend actually presented, recorded at presentation time, not asserted after the fact.
- `attemptNumberForItem` is computed by the Backend from its own attempt history for the session and item; it is never trusted from a client counter.
- `responseTimeMs` and all `behavioralContext` fields are backend-computed from raw timestamps and raw events; the client never sends a pre-aggregated behavioral score that the Backend accepts without recomputation.
- The Backend strips and logs as a validation event any client-submitted field that attempts to set mastery, level, weakness, difficulty decision, recommendation, review schedule, retention, or frustration directly on the attempt.

## Validation Rules

The Backend validates each attempt entry before sending. The AIM Engine independently validates per `P5-024` on receipt.

| Rule | Applies to | Failure |
| --- | --- | --- |
| `attemptId`, `sessionId`, `itemId` are valid UUIDs | Backend pre-send, AIM Engine on receipt | Validation failure category in `docs/phase-5/aim-error-handling-policy.md` |
| `sessionId` matches the session segment's `sessionId` | Backend pre-send | Backend rejects state assembly (Pipeline Stage 3) |
| `itemType` is one of the defined enum values and is consistent with the session's `sessionType` | Backend pre-send, AIM Engine on receipt | Validation failure category |
| `skillIds` has at least one entry and each entry resolves to an existing skill key | Backend pre-send | Backend rejects state assembly |
| `presentedDifficulty` is one of `1, 2, 3, 4` | Backend pre-send, AIM Engine on receipt | Validation failure category |
| `studentAnswer.format` is one of the defined enum values | Backend pre-send, AIM Engine on receipt | Validation failure category |
| `studentAnswer.value` is non-empty | Backend pre-send | Backend rejects state assembly |
| `attemptNumberForItem` >= 1 | Backend pre-send, AIM Engine on receipt | Validation failure category |
| `startedAt` <= `submittedAt` | Backend pre-send | Backend rejects state assembly |
| `responseTimeMs` equals `submittedAt` minus `startedAt` within backend-configured tolerance | Backend pre-send | Backend rejects state assembly |
| All `behavioralContext` numeric fields are non-negative | Backend pre-send, AIM Engine on receipt | Validation failure category |

A failure at any Backend pre-send check aborts the pipeline before Stage 4 (no AIM Engine call is made), per `docs/phase-5/backend-aim-pipeline-map.md`.

## Multiple Attempts Per Request

A single analysis request may carry more than one `AimAttemptInput` entry (for example, when the Backend batches several recent attempts for one analysis call). When more than one entry is present:

- All entries must reference the same `sessionId`.
- Entries are ordered by `submittedAt` ascending.
- The AIM Engine processes entries in the order received; it does not reorder them.
- Batching policy (how many attempts per call, and when to trigger a call) is owned by the Backend pipeline orchestrator (`docs/phase-5/backend-aim-pipeline-map.md`, Stage 2) and is not redefined here.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- Mastery, level, weakness, difficulty decision (for the *next* item), recommendation, review schedule, retention, or frustration values supplied by the client.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher prompt, persona, or dialogue state.
- A client-asserted `isCorrect` value.
- A client-asserted `skillIds` list that bypasses backend skill-mapping resolution.
- Payment, parent dashboard, or voice AI data of any kind.

## Out of Scope

- The session input segment (`P5-009`).
- The AIM Engine response contract (`P5-011`).
- The `student_skill_states`, `weakness_records`, `difficulty_decisions`, `recommendations`, `review_schedules`, `frustration_signals`, and `session_summaries` persisted record contracts (`P5-012`–`P5-017`).
- Any database migration for attempt storage; attempt persistence already exists from Phase 3/4 foundations and is read-only input to this contract.
- Any AI Teacher consumption of attempt data.
- Client-facing attempt submission API surfaces beyond what already exists in `features/lessons` and `features/placement`.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/aim-integration-scope-boundaries.md` — In-scope/out-of-scope boundary.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/aim-data-flow.md` — End-to-end data flow this segment fits into.
- `docs/phase-5/aim-engine-api-map.md` — Transport and endpoint definitions for `POST /aim/v1/analysis`.
- `docs/phase-5/backend-aim-pipeline-map.md` — Backend orchestration stages that produce this segment (Stage 3).
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-session-input-contracts.md` — Companion session input segment.
- `packages/shared-contracts/api/placement-answer-contracts.md` — Source of established answer-format conventions.
- `packages/shared-contracts/api/skill-objective-contracts.md` — Skill key identifier rules.
- P5-011 — AIM Engine Response Contract.
- P5-014 — Difficulty Decision Contract.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-010 |
| Branch | phase5/P5-010-aim-attempt-input-contract |
| Priority | P0 |
| Dependency | P5-009 |
| Output | packages/shared-contracts/api/aim-attempt-input-contracts.md |
