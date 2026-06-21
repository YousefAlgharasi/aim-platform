# Phase 5 — AIM Session Input Contract

## Purpose

This document defines the shared contract for the **session-level** portion of the Backend-to-AIM Engine request payload. It standardizes the fields the Backend sends to the AIM Engine describing the learning session in which an attempt occurs, so the AIM Engine receives consistent, predictable session context on every call to `POST /aim/v1/analysis`.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic. Those are owned by downstream tasks referenced in this document.

This contract covers the **session input segment only**. It does not cover attempt-level fields (`P5-010`), the AIM Engine response shape (`P5-011`), or any persisted AIM-owned record (`P5-012` through `P5-017`).

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
```

The Backend remains the source of truth for session records. The AIM Engine never persists session data; it receives the session input segment as part of a single analysis request and returns decisions without writing to any store.

## Scope

This contract defines:

- The session input segment of the AIM Engine request.
- Field names, types, and constraints for that segment.
- Backend-authority rules for who may populate each field.
- Behavioral signal fields permitted in this segment.
- Validation rules the Backend applies before sending and the AIM Engine applies on receipt.
- Explicit exclusions.

This contract does not define:

- Attempt-level or answer-level fields (`P5-010`).
- The AIM Engine response shape (`P5-011`, `P5-012`–`P5-017`).
- The `learning_sessions` database schema (owned by the migration task `P5-030`, which depends on this contract).
- Client-facing session APIs (owned by `features/sessions` controllers, outside Phase 5 contract scope unless a later task extends this document).

## Stable Identifier Rule

All identifiers in this contract are backend-issued UUIDs or stable machine-readable keys, consistent with the identifier rules established in Phase 3 (`packages/shared-contracts/api/skill-objective-contracts.md`) and Phase 4 placement contracts. Display labels are never used as identifiers.

## Session Input Segment

```ts
type AimSessionInput = {
  sessionId: string;
  studentId: string;
  sessionType: AimSessionType;
  startedAt: string;
  lastActivityAt: string;
  skillFocusIds: string[];
  levelContext: AimLevelContext;
  placementContext: AimPlacementContext | null;
  behavioralContext: AimSessionBehavioralContext;
  contractVersion: string;
};
```

### Field Rules

| Field | Type | Required | Backend-owned | Description |
| --- | --- | --- | --- | --- |
| `sessionId` | `string` (UUID) | Yes | Yes | Backend-issued identifier of the learning session. |
| `studentId` | `string` (UUID) | Yes | Yes | Backend-issued identifier of the student. Resolved from the authenticated identity, never trusted from a raw client field. |
| `sessionType` | `AimSessionType` | Yes | Yes | Backend-classified session type (see below). |
| `startedAt` | `string` (ISO-8601 UTC) | Yes | Yes | When the session began, as recorded by the Backend. |
| `lastActivityAt` | `string` (ISO-8601 UTC) | Yes | Yes | Most recent backend-recorded activity in the session, used as session-level recency context. |
| `skillFocusIds` | `string[]` (skill keys) | Yes (may be empty array) | Yes | Skill keys the session is currently associated with, resolved by the Backend from curriculum data, not supplied verbatim by the client. |
| `levelContext` | `AimLevelContext` | Yes | Yes | The student's current backend-persisted level context entering this session. |
| `placementContext` | `AimPlacementContext \| null` | No | Yes | Present only for a student's first analyzed sessions following placement; references the Phase 4 placement result. `null` once the AIM Engine has stable skill-state history for the student. |
| `behavioralContext` | `AimSessionBehavioralContext` | Yes | Mixed (see below) | Raw, session-level behavioral signals. |
| `contractVersion` | `string` | Yes | Yes | The version of this contract the Backend is sending, used by the AIM Engine for compatibility handling per `P5-006`. |

### `AimSessionType`

```ts
type AimSessionType =
  | 'lesson_practice'
  | 'review_practice'
  | 'placement_followup'
  | 'adaptive_drill';
```

| Value | Meaning |
| --- | --- |
| `lesson_practice` | Session is delivering new lesson content with practice items. |
| `review_practice` | Session is delivering spaced-repetition review items from a prior `review_schedule`. |
| `placement_followup` | Session immediately follows placement and informs initial AIM state. |
| `adaptive_drill` | Session is a backend-triggered targeted drill addressing a known weakness record. |

The Backend, not the client, classifies `sessionType`. A client may indicate intent (for example, "I want to practice this skill"), but the Backend resolves that intent into one of the above values based on backend-owned state.

### `AimLevelContext`

```ts
type AimLevelContext = {
  currentLevel: string;
  levelSource: 'placement' | 'aim_engine';
  levelSetAt: string;
};
```

| Field | Type | Description |
| --- | --- | --- |
| `currentLevel` | `string` | Backend-persisted level identifier, consistent with the Phase 0/4 level scale. |
| `levelSource` | `'placement' \| 'aim_engine'` | Whether the current level came from the Phase 4 placement result or a prior AIM Engine decision. |
| `levelSetAt` | `string` (ISO-8601 UTC) | When the current level was last set by its source. |

`currentLevel` is read-only context for the AIM Engine. The AIM Engine may return an updated level in its response (`P5-011`), but it never receives client-submitted level values through this segment.

### `AimPlacementContext`

```ts
type AimPlacementContext = {
  placementResultId: string;
  placementCompletedAt: string;
  initialSkillSignals: AimInitialSkillSignal[];
};

type AimInitialSkillSignal = {
  skillId: string;
  signalStrength: number;
};
```

| Field | Type | Description |
| --- | --- | --- |
| `placementResultId` | `string` (UUID) | Reference to the Phase 4 placement result record. |
| `placementCompletedAt` | `string` (ISO-8601 UTC) | When placement completed. |
| `initialSkillSignals` | `AimInitialSkillSignal[]` | Backend-derived initial per-skill signal strengths from placement, carried forward only until the AIM Engine has its own skill-state history for the student. |
| `signalStrength` | `number` (0–1 inclusive) | Backend-computed placement-derived signal. This is not a mastery value; it is a bootstrap input the AIM Engine may use only for a student's earliest sessions. |

`initialSkillSignals` are sourced from the Phase 4 placement pipeline (`docs/phase-4/placement-skill-scoring-rules.md` and related), not invented in Phase 5. They are never treated as mastery; mastery is exclusively an AIM Engine output.

### `AimSessionBehavioralContext`

```ts
type AimSessionBehavioralContext = {
  itemsAttemptedInSession: number;
  consecutiveIncorrect: number;
  consecutiveCorrect: number;
  averageResponseTimeMs: number | null;
  hesitationEventCount: number;
  retryEventCount: number;
  idleGapCount: number;
};
```

| Field | Type | Description |
| --- | --- | --- |
| `itemsAttemptedInSession` | `integer` (>= 0) | Count of attempt records the Backend has recorded in this session so far. |
| `consecutiveIncorrect` | `integer` (>= 0) | Backend-counted current streak of incorrect attempts within the session. |
| `consecutiveCorrect` | `integer` (>= 0) | Backend-counted current streak of correct attempts within the session. |
| `averageResponseTimeMs` | `number \| null` | Raw average response time across the session's attempts so far, in milliseconds. Passed as behavioral context only. |
| `hesitationEventCount` | `integer` (>= 0) | Backend-counted count of raw hesitation signals (for example, answer changes before submission) reported by the client and recorded by the Backend. |
| `retryEventCount` | `integer` (>= 0) | Backend-counted count of raw retry signals within the session. |
| `idleGapCount` | `integer` (>= 0) | Backend-counted count of idle gaps exceeding the backend-configured idle threshold within the session. |

All fields in `AimSessionBehavioralContext` are raw counts or raw timing aggregates computed by the Backend from client-submitted raw events. None of these fields are mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration values. `averageResponseTimeMs` and all other timing-related fields are passed as behavioral context only and must never be used by any layer to compute mastery, level, or difficulty.

## Backend Authority Rules

- The Backend populates every field in `AimSessionInput`. No field in this segment is copied verbatim from an unvalidated client payload.
- `studentId` is resolved from the authenticated identity associated with the session, never from a client-supplied identifier.
- `skillFocusIds` are resolved against backend curriculum data; a client-suggested skill is validated and mapped to a real skill key before being included.
- `levelContext.currentLevel` reflects backend-persisted state only.
- `placementContext` is populated only from the Phase 4 placement result; it is never null-coalesced with client-asserted placement data.
- `behavioralContext` fields are backend-computed aggregates derived from raw client events; the client never sends pre-aggregated behavioral summaries that the Backend trusts without recomputation.
- The Backend strips and logs as a validation event any client-submitted field that attempts to set mastery, level, weakness, difficulty, recommendation, review schedule, retention, or frustration directly into the session record.

## Validation Rules

The Backend validates this segment before sending it to the AIM Engine. The AIM Engine independently validates the segment per `P5-024` on receipt.

| Rule | Applies to | Failure |
| --- | --- | --- |
| `sessionId`, `studentId` are valid UUIDs | Backend pre-send, AIM Engine on receipt | Validation failure category in `docs/phase-5/aim-error-handling-policy.md` |
| `sessionType` is one of the defined enum values | Backend pre-send, AIM Engine on receipt | Same as above |
| `startedAt` <= `lastActivityAt` | Backend pre-send | Backend rejects state assembly (Pipeline Stage 3) |
| `skillFocusIds` entries resolve to existing skill keys | Backend pre-send | Backend rejects state assembly |
| `levelContext.currentLevel` is a recognized level value | Backend pre-send | Backend rejects state assembly |
| `placementContext.initialSkillSignals[].signalStrength` is within `[0, 1]` | Backend pre-send, AIM Engine on receipt | Validation failure category |
| All `behavioralContext` numeric fields are non-negative | Backend pre-send, AIM Engine on receipt | Validation failure category |
| `contractVersion` matches a version the AIM Engine supports | AIM Engine on receipt | Contract-version mismatch, handled per `docs/phase-5/aim-error-handling-policy.md` |

A failure at any of the Backend pre-send checks aborts the pipeline before Stage 4 (no AIM Engine call is made), per `docs/phase-5/backend-aim-pipeline-map.md`.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- Mastery, level (as a writable field), weakness, difficulty, recommendation, review schedule, retention, or frustration values supplied by the client.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher prompt, persona, or dialogue state.
- Any field that allows a client to set `levelContext.currentLevel` directly; that field is informational context derived from backend state only.
- Payment, parent dashboard, or voice AI data of any kind.

## Out of Scope

- The attempt input segment (`P5-010`).
- The AIM Engine response contract (`P5-011`).
- The `student_skill_states`, `weakness_records`, `difficulty_decisions`, `recommendations`, `review_schedules`, `frustration_signals`, and `session_summaries` persisted record contracts (`P5-012`–`P5-017`).
- The `learning_sessions` database migration (`P5-030`).
- Any AI Teacher consumption of session data.
- Any client-facing session API surface beyond what already exists in `features/sessions`.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/aim-integration-scope-boundaries.md` — In-scope/out-of-scope boundary.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/aim-data-flow.md` — End-to-end data flow this segment fits into.
- `docs/phase-5/aim-engine-api-map.md` — Transport and endpoint definitions for `POST /aim/v1/analysis`.
- `docs/phase-5/backend-aim-pipeline-map.md` — Backend orchestration stages that produce this segment (Stage 3).
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `docs/phase-4/placement-skill-scoring-rules.md` — Source of `initialSkillSignals`.
- `packages/shared-contracts/api/skill-objective-contracts.md` — Skill key identifier rules.
- P5-010 — AIM Attempt Input Contract.
- P5-011 — AIM Engine Response Contract.
- P5-030 — Learning Sessions Migration.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-009 |
| Branch | phase5/P5-009-aim-session-input-contract |
| Priority | P0 |
| Dependency | P5-006 |
| Output | packages/shared-contracts/api/aim-session-input-contracts.md |
