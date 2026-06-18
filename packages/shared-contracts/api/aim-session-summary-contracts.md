# Phase 5 — AIM Session Summary Contract

## Purpose

This document defines the shared contract for the **AIM session summary**: a backend-persisted, AIM-Engine-generated closing snapshot of a learning session, including educational behavioral signals such as frustration. It standardizes the `sessionSummary` field of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic.

Per `packages/shared-contracts/api/aim-engine-response-contracts.md`, frustration and other behavioral interpretations are carried inside this session summary rather than as a standalone top-level response category. This document is therefore the contract that also governs frustration signal representation for Phase 5.

## Source Documents

This contract follows:

```text
docs/phase-5/aim-engine-integration-charter.md
docs/phase-5/aim-integration-scope-boundaries.md
docs/phase-5/no-client-aim-rule.md
docs/phase-5/aim-data-flow.md
docs/phase-5/backend-aim-pipeline-map.md
docs/phase-5/aim-error-handling-policy.md
packages/shared-contracts/api/aim-engine-response-contracts.md
packages/shared-contracts/api/aim-session-input-contracts.md
packages/shared-contracts/api/aim-attempt-input-contracts.md
packages/shared-contracts/api/student-skill-state-contracts.md
```

## Scope

This contract defines:

- The `AimSessionSummaryOutput` wire shape returned as the (singular, optional) `sessionSummary` field of the AIM Engine response envelope.
- The backend-persisted `session_summaries` record shape it maps to.
- The frustration signal representation, including the rule that it remains an educational behavioral signal and never a clinical or diagnostic label.
- Update rules and backend-authority rules.
- Validation rules.
- Explicit exclusions.

This contract does not define:

- The `session_summaries` migration itself.
- The AIM Engine's internal logic for deciding when a session has reached a natural close-out point worth summarizing.
- Any client-facing presentation of a session summary (a results screen, for example) beyond the persisted data shape.
- Any AI Teacher narration built from a session summary.

## Wire Shape — `AimSessionSummaryOutput`

```ts
type AimSessionSummaryOutput = {
  sessionId: string;
  itemsAttempted: number;
  itemsCorrect: number;
  skillsTouched: string[];
  overallMasteryShift: AimMasteryShiftDirection;
  behavioralSignal: AimSessionBehavioralSignal;
  closedOutAt: string;
};

type AimMasteryShiftDirection = 'positive' | 'neutral' | 'negative' | 'mixed';

type AimSessionBehavioralSignal = {
  frustrationLevel: AimFrustrationLevel;
  engagementLevel: AimEngagementLevel;
  signalBasis: AimSignalBasis[];
};

type AimFrustrationLevel = 'none' | 'low' | 'moderate' | 'elevated';
type AimEngagementLevel = 'low' | 'typical' | 'high';
type AimSignalBasis =
  | 'repeated_incorrect_streak'
  | 'increased_hesitation'
  | 'increased_retry_rate'
  | 'session_abandonment_pattern'
  | 'sustained_correct_streak';
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `sessionId` | `string` (UUID) | Yes | Must match the `sessionId` in the originating session input segment. |
| `itemsAttempted` | `integer` (>= 0) | Yes | Total items attempted in the session as of this summary. |
| `itemsCorrect` | `integer` (>= 0, <= `itemsAttempted`) | Yes | Total items answered correctly in the session as of this summary. |
| `skillsTouched` | `string[]` (skill keys) | Yes (may be empty array) | Distinct skills involved in the session. |
| `overallMasteryShift` | `AimMasteryShiftDirection` | Yes | A coarse directional summary of how the session affected the student's mastery across `skillsTouched`, derived from the `skillState` category in the same or recent responses. Descriptive only; the authoritative per-skill values remain in `student_skill_states` (`P5-012`). |
| `behavioralSignal` | `AimSessionBehavioralSignal` | Yes | Educational behavioral interpretation for the session. See below. |
| `closedOutAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine determined the session reached a summarizable close-out point. |

### `AimSessionBehavioralSignal`

| Field | Type | Description |
| --- | --- | --- |
| `frustrationLevel` | `AimFrustrationLevel` | A coarse, educational-only signal describing apparent frustration during the session, derived from raw behavioral inputs (`packages/shared-contracts/api/aim-attempt-input-contracts.md` behavioral context fields). This is not a clinical or psychological assessment and must never be presented, logged, or treated as one. |
| `engagementLevel` | `AimEngagementLevel` | A coarse, educational-only signal describing apparent engagement during the session. |
| `signalBasis` | `AimSignalBasis[]` (may be empty array) | The coarse categories of raw evidence that contributed to the levels above, for transparency. Never a free-text explanation; a fixed enum list to avoid leaking algorithm internals or implying a diagnostic methodology. |

`frustrationLevel` and `engagementLevel` are descriptive labels at a fixed, coarse granularity (four and three values respectively). They exist to let the Backend and, eventually, a downstream AI Teacher respond supportively (for example, offering an easier item or a brief encouragement) without ever implying a mental-health assessment. This contract enforces that constraint structurally: there is no field for severity scoring beyond these fixed enums, no free-text clinical note field, and no historical psychological profile field.

## Persisted Record — `session_summaries`

```ts
type SessionSummaryRecord = {
  id: string;
  studentId: string;
  sessionId: string;
  itemsAttempted: number;
  itemsCorrect: number;
  skillsTouched: string[];
  overallMasteryShift: AimMasteryShiftDirection;
  frustrationLevel: AimFrustrationLevel;
  engagementLevel: AimEngagementLevel;
  signalBasis: AimSignalBasis[];
  closedOutAt: string;
  createdAt: string;
  updatedAt: string;
};
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Backend-generated primary key, set on first persistence for this `sessionId`. |
| `studentId` | `string` (UUID) | Backend-resolved from session context, never taken from the wire response. |
| `sessionId`, `itemsAttempted`, `itemsCorrect`, `skillsTouched`, `overallMasteryShift`, `closedOutAt` | As defined above | Copied from the validated wire output. |
| `frustrationLevel`, `engagementLevel`, `signalBasis` | As defined above | Flattened from the wire output's `behavioralSignal` object into top-level persisted fields. |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

At most one `session_summaries` row exists per `sessionId`. If a second summary arrives for the same `sessionId` (for example, the AIM Engine re-evaluates a close-out point), the Backend overwrites the existing row's fields and updates `updatedAt`, since a session has exactly one current summary.

## Update Rules

When the Backend persistence service receives a validated `AimSessionSummaryOutput`:

1. Look up the existing `session_summaries` row by `sessionId`.
2. If no row exists, insert a new row with `createdAt = updatedAt = now()`.
3. If a row exists, overwrite all fields from the validated wire output and set `updatedAt = now()`.
4. The write is part of the same transaction as any other category persisted from the same response.
5. The Backend never computes `overallMasteryShift`, `frustrationLevel`, `engagementLevel`, or `signalBasis` itself. They are exclusively AIM Engine outputs.

A response that omits `sessionSummary` for a given call leaves any existing `session_summaries` row for that session unchanged.

## Backend Authority Rules

- All AIM-derived fields (`overallMasteryShift`, `frustrationLevel`, `engagementLevel`, `signalBasis`, `closedOutAt`) are exclusively AIM Engine outputs.
- `studentId` on the persisted record is always backend-resolved from session context.
- Clients never write to `session_summaries` directly. Any client-submitted field resembling a frustration or engagement value is stripped at the client API boundary and logged as a validation event, per `docs/phase-5/no-client-aim-rule.md`.
- The Backend never relabels `frustrationLevel` as a mental-health term, never stores it alongside a diagnosis field, and never exposes it through any surface that implies clinical assessment. This is a structural rule, not a presentation choice: no schema field exists for such a label, and none may be added without revising this contract and re-running the Phase 5 security and privacy review.
- Reads of this table by any module other than the AIM persistence service happen only through backend AIM result APIs.

## Validation Rules

| Rule | Failure |
| --- | --- |
| `sessionId` is a valid UUID and matches the originating request's session segment | Contract violation per `docs/phase-5/aim-error-handling-policy.md`; the whole `sessionSummary` field is dropped (it is a single object, not an array, so there is no partial-entry case) |
| `itemsAttempted` is a non-negative integer | Field dropped per above |
| `itemsCorrect` is a non-negative integer and `<= itemsAttempted` | Field dropped per above |
| Every entry in `skillsTouched` resolves to an existing skill key | Field dropped per above |
| `overallMasteryShift` is one of the defined enum values | Field dropped per above |
| `frustrationLevel` is one of the defined enum values | Field dropped per above |
| `engagementLevel` is one of the defined enum values | Field dropped per above |
| Every entry in `signalBasis` is one of the defined enum values | Field dropped per above |
| `closedOutAt` is a valid ISO-8601 UTC timestamp not materially in the future | Field dropped per above |

Because `sessionSummary` is a single optional object rather than an array, any validation failure drops the entire summary for this response rather than a partial entry; other categories in the same response are unaffected.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable frustration, engagement, or mastery-shift field.
- A clinical, diagnostic, or psychological label of any kind. `frustrationLevel` and `engagementLevel` are coarse educational signals only.
- A free-text basis or explanation field; `signalBasis` remains a fixed enum list.
- Speed or response time as a directly persisted field on the summary; timing only contributes indirectly through the AIM Engine's interpretation into `signalBasis` categories such as `increased_hesitation`, never as a raw timing value stored here.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher persona, dialogue, or narration field; a future AI Teacher phase may read this summary through backend-approved channels but does not write to it or extend its schema here.

## Out of Scope

- The `session_summaries` migration.
- The AIM Engine's internal close-out detection logic.
- Client-facing presentation of a session summary screen.
- Mastery shift detail beyond the coarse `overallMasteryShift` direction (per-skill detail remains owned by `student_skill_states`, `P5-012`).
- Any AI Teacher consumption rule.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy; frustration-is-educational-not-clinical rule.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract; defines that frustration lives inside this category.
- `packages/shared-contracts/api/aim-attempt-input-contracts.md` — Source of raw behavioral signals the AIM Engine interprets into `signalBasis`.
- `packages/shared-contracts/api/student-skill-state-contracts.md` — Authoritative per-skill mastery; this contract's `overallMasteryShift` is descriptive only.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-017 |
| Branch | phase5/P5-017-aim-session-summary-contract |
| Priority | P1 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/aim-session-summary-contracts.md |
