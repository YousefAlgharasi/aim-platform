# Phase 5 — Student Skill State Contract

## Purpose

This document defines the shared contract for **student skill state**: the AIM Engine's persisted memory of a student's mastery and recency per skill. It standardizes the `skillState` category of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic. The migration that creates the `student_skill_states` table is owned by `P5-029`, which depends on this contract and on `P4-023`.

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
docs/phase-4/placement-skill-scoring-rules.md
```

Mastery in this contract uses the same `0.00`–`1.00` decimal scale established for skill scoring in `docs/phase-4/placement-skill-scoring-rules.md`, so AIM-derived mastery and placement-derived skill signals remain comparable across phases.

## Scope

This contract defines:

- The `AimSkillStateOutput` wire shape returned inside the `skillState` array of the AIM Engine response envelope.
- The backend-persisted `student_skill_states` record shape it maps to.
- Mastery scale, recency, and confidence semantics.
- Update rules: how a new output merges with prior persisted state.
- Backend-authority rules and validation rules.
- Explicit exclusions.

This contract does not define:

- The `student_skill_states` migration itself (`P5-029`).
- Weakness derivation from skill state (`P5-013`, a related but separate output category).
- Difficulty decisions derived from skill state (`P5-014`).
- Any client-facing read API shape for skill state (owned by a downstream backend API task).
- The AIM Engine's internal algorithm for computing mastery (an AIM Engine implementation detail, not a contract concern).

## Wire Shape — `AimSkillStateOutput`

```ts
type AimSkillStateOutput = {
  skillId: string;
  masteryScore: number;
  masteryConfidence: number;
  masteryTrend: AimMasteryTrend;
  attemptsConsideredCount: number;
  lastAttemptId: string;
  evaluatedAt: string;
};

type AimMasteryTrend = 'improving' | 'stable' | 'declining' | 'insufficient_data';
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `skillId` | `string` (skill key) | Yes | The skill this state applies to, matching a skill key from the curriculum skill taxonomy (`packages/shared-contracts/api/skill-objective-contracts.md`). |
| `masteryScore` | `number` (`0.00`–`1.00` inclusive) | Yes | The AIM Engine's current mastery estimate for this student and skill. The sole source of mastery; never computed elsewhere. |
| `masteryConfidence` | `number` (`0.00`–`1.00` inclusive) | Yes | The AIM Engine's confidence in `masteryScore`, reflecting sample size and consistency of recent attempts. Low confidence does not change `masteryScore`'s authority; it is descriptive context for downstream consumers (for example, the recommendation category may weigh low-confidence skills differently). |
| `masteryTrend` | `AimMasteryTrend` | Yes | Directional trend since the prior persisted state. `insufficient_data` when there is no prior state to compare against (first-ever evaluation for this student and skill). |
| `attemptsConsideredCount` | `integer` (>= 0) | Yes | Number of attempts the AIM Engine considered when producing this evaluation, for this call. Not a lifetime total; it describes this evaluation's evidence window. |
| `lastAttemptId` | `string` (UUID) | Yes | The most recent attempt id (from `packages/shared-contracts/api/aim-attempt-input-contracts.md`) that informed this evaluation. |
| `evaluatedAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine produced this evaluation. Matches or precedes the envelope's `generatedAt`. |

## Persisted Record — `student_skill_states`

```ts
type StudentSkillStateRecord = {
  id: string;
  studentId: string;
  skillId: string;
  masteryScore: number;
  masteryConfidence: number;
  masteryTrend: AimMasteryTrend;
  previousMasteryScore: number | null;
  lastAttemptId: string;
  lastEvaluatedAt: string;
  createdAt: string;
  updatedAt: string;
};
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Backend-generated primary key, set on first persistence for this student/skill pair. |
| `studentId` | `string` (UUID) | Backend-resolved from the authenticated session context, per `packages/shared-contracts/api/aim-session-input-contracts.md`. Never taken from the wire response. |
| `skillId` | `string` | Copied from the validated wire output. |
| `masteryScore` | `number` | Copied from the validated wire output. |
| `masteryConfidence` | `number` | Copied from the validated wire output. |
| `masteryTrend` | `AimMasteryTrend` | Copied from the validated wire output. |
| `previousMasteryScore` | `number \| null` | Backend-captured snapshot of `masteryScore` immediately before this update, for audit and trend display. `null` on first persistence. |
| `lastAttemptId` | `string` (UUID) | Copied from the validated wire output. |
| `lastEvaluatedAt` | `string` (ISO-8601 UTC) | Copied from the validated wire output's `evaluatedAt`. |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence. Never updated after. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

One row exists per `(studentId, skillId)` pair. There is no historical row-per-evaluation table in Phase 5 scope; `previousMasteryScore` is the only retained prior value. A full mastery history feature, if needed later, is a separate task outside this contract.

## Update Rules

When the Backend persistence service (Stage 6 of `docs/phase-5/backend-aim-pipeline-map.md`) receives a validated `AimSkillStateOutput` entry:

1. Look up the existing `student_skill_states` row for `(studentId, skillId)`.
2. If no row exists, insert a new row with `previousMasteryScore = null` and `createdAt = updatedAt = now()`.
3. If a row exists, set `previousMasteryScore` to the row's current `masteryScore` before overwriting, then overwrite `masteryScore`, `masteryConfidence`, `masteryTrend`, `lastAttemptId`, `lastEvaluatedAt`, and set `updatedAt = now()`.
4. The write is part of the same transaction as any other category persisted from the same response, per `docs/phase-5/backend-aim-pipeline-map.md` Stage 6 transactional rule.
5. The Backend never merges, averages, or otherwise recomputes `masteryScore` itself. The persisted value is exactly the AIM Engine's validated output. The Backend's only computation is capturing `previousMasteryScore` for audit purposes.

A response that omits `skillState` entirely for a given call leaves all existing `student_skill_states` rows for that student unchanged, consistent with the "missing category means unchanged, not reset" rule in `packages/shared-contracts/api/aim-engine-response-contracts.md`.

## Backend Authority Rules

- `masteryScore`, `masteryConfidence`, and `masteryTrend` are exclusively AIM Engine outputs. No backend service, controller, or migration default may set or adjust them outside the update procedure above.
- `studentId` on the persisted record is always backend-resolved from session context, never taken from the wire payload, consistent with `packages/shared-contracts/api/aim-session-input-contracts.md`.
- Clients never write to `student_skill_states` directly. Any client-submitted field resembling mastery, confidence, or trend is stripped at the client API boundary (Stage 1 of the pipeline) and logged as a validation event, per `docs/phase-5/no-client-aim-rule.md`.
- Reads of this table by any module other than the AIM persistence service happen only through backend AIM result APIs, never through direct repository access from another feature.

## Validation Rules

The Backend validates each `AimSkillStateOutput` entry before persistence, as part of Stage 5 response validation.

| Rule | Failure |
| --- | --- |
| `skillId` resolves to an existing skill key | Category entry dropped; validation event recorded per `docs/phase-5/aim-error-handling-policy.md` |
| `masteryScore` is within `[0.00, 1.00]` | Category entry dropped; validation event recorded |
| `masteryConfidence` is within `[0.00, 1.00]` | Category entry dropped; validation event recorded |
| `masteryTrend` is one of the defined enum values | Category entry dropped; validation event recorded |
| `attemptsConsideredCount` is non-negative | Category entry dropped; validation event recorded |
| `lastAttemptId` is a valid UUID and corresponds to an attempt referenced in the originating request | Category entry dropped; validation event recorded |
| `evaluatedAt` is a valid ISO-8601 UTC timestamp not materially in the future | Category entry dropped; validation event recorded |

A dropped entry within the `skillState` array does not block persistence of other valid entries in the same array or of other categories in the same response, consistent with the partial-category validation rule in `packages/shared-contracts/api/aim-engine-response-contracts.md`.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable mastery, confidence, or trend field.
- Speed or response time as an input to `masteryScore`, `masteryConfidence`, or `masteryTrend`. Timing remains behavioral context only, per `docs/phase-5/aim-engine-integration-charter.md`.
- A clinical or diagnostic label of any kind attached to skill state.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher consumption rule (the AI Teacher, when it exists in a later phase, reads skill state only through backend-approved channels and never overrides it).

## Out of Scope

- The `student_skill_states` migration (`P5-029`).
- Weakness record derivation (`P5-013`).
- Difficulty decision derivation (`P5-014`).
- Recommendation derivation (`P5-015`).
- Client-facing read API shape for skill state.
- Mastery history beyond the single retained `previousMasteryScore` value.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract.
- `packages/shared-contracts/api/aim-attempt-input-contracts.md` — Source of `lastAttemptId` correlation.
- `docs/phase-4/placement-skill-scoring-rules.md` — Source of the `0.00`–`1.00` mastery scale convention.
- P5-013 — Weakness Record Contract.
- P5-014 — Difficulty Decision Contract.
- P5-029 — Student Skill States Migration.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-012 |
| Branch | phase5/P5-012-student-skill-state-contract |
| Priority | P0 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/student-skill-state-contracts.md |
