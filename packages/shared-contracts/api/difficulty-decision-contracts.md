# Phase 5 — Difficulty Decision Contract

## Purpose

This document defines the shared contract for the **difficulty decision**: the AIM Engine's decision about the difficulty level at which the student's *next* item for a given skill should be presented. It standardizes the `difficultyDecision` category of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic, or content-selection logic that picks a specific item.

The difficulty decision is distinct from `presentedDifficulty` in `packages/shared-contracts/api/aim-attempt-input-contracts.md`. `presentedDifficulty` is backend-recorded informational context describing the difficulty already shown for a past attempt. The difficulty decision defined here is the AIM Engine's authoritative output governing what difficulty to present next.

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
packages/shared-contracts/api/aim-attempt-input-contracts.md
packages/shared-contracts/api/student-skill-state-contracts.md
```

Difficulty values use the same `1`–`4` integer scale locked in Phase 0/1 and reused in `packages/shared-contracts/api/aim-attempt-input-contracts.md` (`AimDifficultyLevel`).

## Scope

This contract defines:

- The `AimDifficultyDecisionOutput` wire shape returned as the (singular, optional) `difficultyDecision` field of the AIM Engine response envelope.
- The backend-persisted `difficulty_decisions` record shape it maps to.
- The relationship between a difficulty decision and the skill, session, and next-item selection process.
- Update rules and backend-authority rules.
- Validation rules.
- Explicit exclusions, in particular the prohibition on speed/response-time as a difficulty input at any layer.

This contract does not define:

- The `difficulty_decisions` migration itself.
- Which specific item or question the Backend selects to satisfy the decision (a content-selection concern outside Phase 5 scope; Phase 5 only delivers the target difficulty level).
- `presentedDifficulty`, which is informational input context defined in `P5-010`.
- Any client-facing read API shape for difficulty decisions.

## Wire Shape — `AimDifficultyDecisionOutput`

```ts
type AimDifficultyDecisionOutput = {
  decisionId: string;
  skillId: string;
  nextDifficulty: AimDifficultyLevel;
  previousDifficulty: AimDifficultyLevel;
  rationale: AimDifficultyRationale;
  basedOnAttemptIds: string[];
  decidedAt: string;
};

type AimDifficultyLevel = 1 | 2 | 3 | 4;
type AimDifficultyRationale =
  | 'mastery_increase'
  | 'mastery_decrease'
  | 'consistent_performance'
  | 'insufficient_data_hold';
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `decisionId` | `string` (UUID) | Yes | AIM-Engine-issued identifier for this decision instance. |
| `skillId` | `string` (skill key) | Yes | The skill this difficulty decision applies to. |
| `nextDifficulty` | `AimDifficultyLevel` | Yes | The difficulty level the AIM Engine has decided should govern the student's next presented item for this skill. |
| `previousDifficulty` | `AimDifficultyLevel` | Yes | The difficulty level in effect immediately before this decision, for traceability. |
| `rationale` | `AimDifficultyRationale` | Yes | A coarse, non-sensitive category describing why the decision was made. Not a free-text explanation; a fixed enum to avoid leaking algorithm internals. |
| `basedOnAttemptIds` | `string[]` (UUIDs) | Yes (at least one entry) | The attempt ids that informed this decision. |
| `decidedAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine made this decision. |

### Rationale Values

| Value | Meaning |
| --- | --- |
| `mastery_increase` | Recent mastery signal for the skill rose enough to justify increasing difficulty. |
| `mastery_decrease` | Recent mastery signal for the skill fell enough to justify decreasing difficulty. |
| `consistent_performance` | Performance is stable; difficulty is held or adjusted only marginally within the allowed step size. |
| `insufficient_data_hold` | Not enough recent evidence to justify a change; difficulty is held at `previousDifficulty`. |

`rationale` never references response time, speed, or any timing measurement. It describes mastery-driven reasoning only, consistent with the platform-wide rule that speed must never enter difficulty logic.

## Difficulty Step Constraint

A single decision changes `nextDifficulty` by at most one step relative to `previousDifficulty` (`|nextDifficulty - previousDifficulty| <= 1`), and `nextDifficulty` stays within the locked `1`–`4` range. This constraint exists at the contract level so the Backend can validate decisions independently of trusting the AIM Engine's internal logic; a decision that violates the step constraint is rejected as invalid (see Validation Rules) and the Backend holds the previous difficulty instead.

## Persisted Record — `difficulty_decisions`

```ts
type DifficultyDecisionRecord = {
  id: string;
  studentId: string;
  skillId: string;
  currentDifficulty: AimDifficultyLevel;
  previousDifficulty: AimDifficultyLevel;
  rationale: AimDifficultyRationale;
  basedOnAttemptIds: string[];
  decidedAt: string;
  createdAt: string;
  updatedAt: string;
};
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Set equal to the wire `decisionId` on first persistence for this decision instance. |
| `studentId` | `string` (UUID) | Backend-resolved from session context, never taken from the wire response. |
| `skillId` | `string` | Copied from the validated wire output. |
| `currentDifficulty` | `AimDifficultyLevel` | Copied from the wire output's `nextDifficulty`. This is the value the Backend's content-selection logic reads to choose the next item. |
| `previousDifficulty` | `AimDifficultyLevel` | Copied from the validated wire output, retained for audit and trend display. |
| `rationale` | `AimDifficultyRationale` | Copied from the validated wire output. |
| `basedOnAttemptIds` | `string[]` | Copied from the validated wire output. |
| `decidedAt` | `string` (ISO-8601 UTC) | Copied from the validated wire output. |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence for `(studentId, skillId)`. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

One row exists per `(studentId, skillId)` pair, holding the current decision; this is a "current state" table, not a decision history table. The `decisionId`/`id` value changes on each new decision and a full audit trail of decisions, if needed, is available through the AIM audit log (metadata-only), not through retained rows in this table.

## Update Rules

When the Backend persistence service receives a validated `AimDifficultyDecisionOutput`:

1. Look up the existing `difficulty_decisions` row for `(studentId, skillId)`.
2. If no row exists, insert a new row with `id = decisionId`, `currentDifficulty = nextDifficulty`, `createdAt = updatedAt = now()`.
3. If a row exists, verify `previousDifficulty` in the incoming output matches the row's current `currentDifficulty`. If it matches, update `id`, `currentDifficulty`, `previousDifficulty`, `rationale`, `basedOnAttemptIds`, `decidedAt`, and `updatedAt = now()`. If it does not match (the AIM Engine's view of the prior state is stale relative to the Backend's persisted state), the Backend treats this as a contract violation for this category entry (see Validation Rules) and does not persist the update, instead recording a stale-decision audit event.
4. The write is part of the same transaction as any other category persisted from the same response.
5. The Backend never computes `nextDifficulty` itself. It is exclusively an AIM Engine output, subject to the step-constraint validation above.

A response that omits `difficultyDecision` for a given call leaves the existing `difficulty_decisions` row for the affected skill unchanged; the Backend's content-selection logic continues using the last persisted `currentDifficulty`.

## Backend Authority Rules

- `nextDifficulty` and `rationale` are exclusively AIM Engine outputs, subject to Backend validation including the step constraint.
- `studentId` on the persisted record is always backend-resolved from session context.
- Clients never write to `difficulty_decisions` directly. Any client-submitted field resembling a difficulty value or preference is stripped at the client API boundary and logged as a validation event, per `docs/phase-5/no-client-aim-rule.md`. A client may express a *preference signal* (for example, "this feels too easy") only as a raw behavioral input forwarded to the AIM Engine through existing behavioral-context fields; it is never accepted as a direct difficulty override.
- Reads of this table by any module other than the AIM persistence service and the Backend's content-selection logic happen only through backend AIM result APIs.
- Speed and response time never enter the difficulty decision at any layer, consistent with `docs/phase-5/aim-engine-integration-charter.md`. This applies to the AIM Engine's internal computation (outside contract scope but reinforced here) and absolutely to the Backend, which must not apply any timing-based override to `nextDifficulty`.

## Validation Rules

| Rule | Failure |
| --- | --- |
| `decisionId` is a valid UUID | Category entry dropped; validation event recorded |
| `skillId` resolves to an existing skill key | Category entry dropped; validation event recorded |
| `nextDifficulty` and `previousDifficulty` are each one of `1, 2, 3, 4` | Category entry dropped; validation event recorded |
| `\|nextDifficulty - previousDifficulty\| <= 1` | Category entry dropped; validation event recorded; Backend holds prior persisted difficulty |
| `rationale` is one of the defined enum values | Category entry dropped; validation event recorded |
| `basedOnAttemptIds` has at least one entry, each a valid UUID corresponding to an attempt referenced in the originating request batch | Category entry dropped; validation event recorded |
| `decidedAt` is a valid ISO-8601 UTC timestamp not materially in the future | Category entry dropped; validation event recorded |
| Incoming `previousDifficulty` matches the Backend's currently persisted `currentDifficulty` for `(studentId, skillId)`, when a prior row exists | Category entry dropped as a stale-decision contract violation; Backend holds prior persisted difficulty |

A dropped entry does not block persistence of other valid categories in the same response.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable difficulty value.
- Speed or response time as an input to `nextDifficulty` or `rationale`, at any layer.
- A free-text rationale field that could leak AIM Engine algorithm internals; `rationale` remains a fixed, coarse enum.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher override of a difficulty decision; the AI Teacher, when it exists, presents content at the Backend-persisted `currentDifficulty` and never substitutes its own value.
- Specific item or question selection logic; this contract governs difficulty level only.

## Out of Scope

- The `difficulty_decisions` migration.
- Content-selection logic that maps a difficulty level to a specific item.
- `presentedDifficulty` (defined in `P5-010`).
- Student skill state (`P5-012`) and weakness records (`P5-013`), used as AIM Engine inputs but not redefined here.
- Client-facing read API shape for difficulty decisions.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy; speed-never-enters-difficulty rule.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract.
- `packages/shared-contracts/api/aim-attempt-input-contracts.md` — Source of `presentedDifficulty` and the `AimDifficultyLevel` scale.
- `packages/shared-contracts/api/student-skill-state-contracts.md` — Related skill state, an AIM Engine input to difficulty decisions.
- P5-015 — AIM Recommendation Contract.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-014 |
| Branch | phase5/P5-014-difficulty-decision-contract |
| Priority | P1 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/difficulty-decision-contracts.md |
