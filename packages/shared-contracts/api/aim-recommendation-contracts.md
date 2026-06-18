# Phase 5 — AIM Recommendation Contract

## Purpose

This document defines the shared contract for **AIM recommendations**: the AIM Engine's ranked suggestions for what the student should do next, expressed as references to existing curriculum content rather than generated content. It standardizes the `recommendations` category of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic. It does not generate new content; recommendations always reference existing Phase 3 curriculum entities (lessons, skills, objectives).

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
packages/shared-contracts/api/student-skill-state-contracts.md
packages/shared-contracts/api/weakness-record-contracts.md
packages/shared-contracts/api/lesson-contracts.md
packages/shared-contracts/api/skill-objective-contracts.md
```

## Scope

This contract defines:

- The `AimRecommendationOutput` wire shape returned inside the `recommendations` array of the AIM Engine response envelope.
- The backend-persisted `recommendations` record shape it maps to.
- Recommendation kinds, ranking, and expiry semantics.
- Update rules and backend-authority rules.
- Validation rules, including referential validation against curriculum entities.
- Explicit exclusions.

This contract does not define:

- The `recommendations` migration itself.
- The Phase 3 curriculum entities a recommendation references (`packages/shared-contracts/api/lesson-contracts.md`, `packages/shared-contracts/api/skill-objective-contracts.md`).
- Client-facing presentation of recommendations (ordering in a UI list, copy, icons); only the backend-persisted ranked data is in scope.
- Any AI Teacher framing or narration of a recommendation.

## Wire Shape — `AimRecommendationOutput`

```ts
type AimRecommendationOutput = {
  recommendationId: string;
  kind: AimRecommendationKind;
  targetSkillId: string;
  targetLessonId: string | null;
  rank: number;
  reason: AimRecommendationReason;
  basedOnWeaknessId: string | null;
  generatedAt: string;
  expiresAt: string | null;
};

type AimRecommendationKind =
  | 'lesson'
  | 'targeted_practice'
  | 'review_session';

type AimRecommendationReason =
  | 'addresses_weakness'
  | 'reinforces_recent_skill'
  | 'next_in_sequence'
  | 'review_due';
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `recommendationId` | `string` (UUID) | Yes | AIM-Engine-issued identifier for this recommendation instance. |
| `kind` | `AimRecommendationKind` | Yes | The category of action being recommended. |
| `targetSkillId` | `string` (skill key) | Yes | The skill the recommendation targets. |
| `targetLessonId` | `string \| null` (UUID) | No | A specific lesson reference, present when `kind = lesson` and the AIM Engine has identified a specific existing lesson; `null` for `kind` values that do not reference a single lesson (for example, `targeted_practice` may reference a skill without a single lesson). |
| `rank` | `integer` (>= 1) | Yes | Position of this recommendation within the ranked set returned in this response. Rank `1` is the top recommendation. Ranks are unique within a single response's `recommendations` array. |
| `reason` | `AimRecommendationReason` | Yes | A coarse, non-sensitive category describing why this recommendation was produced. Not a free-text explanation. |
| `basedOnWeaknessId` | `string \| null` (UUID) | No | References a `weakness_records` id (`packages/shared-contracts/api/weakness-record-contracts.md`) when `reason = addresses_weakness`. `null` otherwise. |
| `generatedAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine generated this recommendation. |
| `expiresAt` | `string \| null` (ISO-8601 UTC) | No | When this recommendation is no longer considered current. `null` means no explicit expiry; the recommendation remains current until superseded by a newer response for the same student. |

### Recommendation Kinds

| Value | Meaning |
| --- | --- |
| `lesson` | Recommends a specific existing lesson, referenced by `targetLessonId`. |
| `targeted_practice` | Recommends practice focused on `targetSkillId` without pointing to one specific lesson; the Backend's existing practice-session flow selects items. |
| `review_session` | Recommends starting a review session; typically paired with entries already present in `reviewSchedule` (`P5-016`), not a substitute for it. |

### Recommendation Reasons

| Value | Meaning |
| --- | --- |
| `addresses_weakness` | Tied to an active weakness record via `basedOnWeaknessId`. |
| `reinforces_recent_skill` | Reinforces a skill recently practiced, independent of an open weakness. |
| `next_in_sequence` | Follows the curriculum's natural next-step sequence for the student's current level. |
| `review_due` | Tied to items due for review; complements but does not replace `reviewSchedule` (`P5-016`). |

## Persisted Record — `recommendations`

```ts
type RecommendationRecord = {
  id: string;
  studentId: string;
  kind: AimRecommendationKind;
  targetSkillId: string;
  targetLessonId: string | null;
  rank: number;
  reason: AimRecommendationReason;
  basedOnWeaknessId: string | null;
  generatedAt: string;
  expiresAt: string | null;
  status: AimRecommendationStatus;
  createdAt: string;
  updatedAt: string;
};

type AimRecommendationStatus = 'active' | 'superseded' | 'expired' | 'dismissed';
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Set equal to the wire `recommendationId` on first persistence. |
| `studentId` | `string` (UUID) | Backend-resolved from session context, never taken from the wire response. |
| `kind`, `targetSkillId`, `targetLessonId`, `rank`, `reason`, `basedOnWeaknessId`, `generatedAt`, `expiresAt` | As defined above | Copied from the validated wire output. |
| `status` | `AimRecommendationStatus` | Backend-managed lifecycle status, not present on the wire (see Status Lifecycle below). |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

### Status Lifecycle

| Status | Meaning | Set by |
| --- | --- | --- |
| `active` | Currently valid and presentable to the client. | Backend, on insert. |
| `superseded` | A newer AIM response produced a replacement set of recommendations for the student; this entry is no longer the latest. | Backend, when persisting a new full recommendation set for the student (see Update Rules). |
| `expired` | `expiresAt` has passed. | Backend, on read or via a scheduled sweep; not an AIM Engine output. |
| `dismissed` | The student explicitly dismissed the recommendation through an existing client interaction. | Backend, in response to a client action; the dismissal itself is a raw client action recorded by the Backend, not an AIM-owned value. |

`status` is the only field in this record not sourced from the wire output. It is entirely backend-managed lifecycle state layered on top of AIM-Engine-sourced content fields.

## Update Rules

When the Backend persistence service receives the validated `recommendations` array from a response:

1. Treat the array as the complete current recommendation set for the student as of `generatedAt` (recommendations are replaced as a set, not merged item-by-item, because rank ordering is only meaningful within one generated set).
2. Mark all existing `active` rows for the student as `superseded`.
3. Insert a new row for each entry in the validated array with `status = active`.
4. The write is part of the same transaction as any other category persisted from the same response.
5. The Backend never invents a recommendation, reorders the AIM-provided `rank`, or merges recommendations from two different responses into one ranked set.

A response that omits `recommendations` entirely for a given call leaves the student's existing `active` recommendations unchanged; they remain presentable until naturally superseded by a future response, expired, or dismissed.

## Backend Authority Rules

- `kind`, `targetSkillId`, `targetLessonId`, `rank`, `reason`, `basedOnWeaknessId`, `generatedAt`, and `expiresAt` are exclusively AIM Engine outputs.
- `status` is exclusively backend-managed and never accepted from the wire output.
- `studentId` on the persisted record is always backend-resolved from session context.
- Clients never write recommendation content directly. A client may trigger a `dismissed` status transition through an explicit dismiss action, but this changes only `status`; it never changes `kind`, `targetSkillId`, `targetLessonId`, `rank`, or `reason`.
- `targetLessonId`, when present, must reference an existing, published lesson at validation time; the Backend does not persist a recommendation pointing to a non-existent or unpublished lesson.
- Reads of this table by any module other than the AIM persistence service happen only through backend AIM result APIs.

## Validation Rules

| Rule | Failure |
| --- | --- |
| `recommendationId` is a valid UUID | Category entry dropped; validation event recorded |
| `kind` is one of the defined enum values | Category entry dropped; validation event recorded |
| `targetSkillId` resolves to an existing skill key | Category entry dropped; validation event recorded |
| `targetLessonId`, when present, resolves to an existing published lesson | Category entry dropped; validation event recorded |
| `targetLessonId` is present when `kind = lesson` | Category entry dropped; validation event recorded |
| `rank` is a positive integer and unique within this response's `recommendations` array | Category entry dropped; validation event recorded |
| `reason` is one of the defined enum values | Category entry dropped; validation event recorded |
| `basedOnWeaknessId`, when present, resolves to an existing `weakness_records` id for the same student | Category entry dropped; validation event recorded |
| `basedOnWeaknessId` is present when `reason = addresses_weakness` | Category entry dropped; validation event recorded |
| `generatedAt` is a valid ISO-8601 UTC timestamp not materially in the future | Category entry dropped; validation event recorded |
| `expiresAt`, when present, is after `generatedAt` | Category entry dropped; validation event recorded |

A dropped entry is excluded from the persisted set for this response; the remaining valid entries in the array are still persisted as the new active set, with their original `rank` values preserved (ranks are not renumbered to fill a gap left by a dropped entry).

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable recommendation content field.
- Generated or AI-authored lesson content; recommendations only reference existing Phase 3 curriculum entities.
- Speed or response time as an input to ranking or reason.
- Any AI Teacher narration, persona, or dialogue wrapping a recommendation; that belongs to a future AI Teacher phase and must consume this data only through backend-approved channels.
- A free-text reason field; `reason` remains a fixed, coarse enum.
- Direct AIM Engine credentials or connection details.

## Out of Scope

- The `recommendations` migration.
- Phase 3 curriculum entity contracts referenced by `targetSkillId` and `targetLessonId`.
- Client-facing presentation of recommendations.
- Review schedule contract (`P5-016`), a related but separate output category.
- Any AI Teacher consumption rule.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract.
- `packages/shared-contracts/api/weakness-record-contracts.md` — Source of `basedOnWeaknessId` correlation.
- `packages/shared-contracts/api/lesson-contracts.md` — Source of `targetLessonId` referential validation.
- `packages/shared-contracts/api/skill-objective-contracts.md` — Skill key identifier rules.
- P5-016 — Review Schedule Contract.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-015 |
| Branch | phase5/P5-015-aim-recommendation-contract |
| Priority | P1 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/aim-recommendation-contracts.md |
