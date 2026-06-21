# Phase 5 — Weakness Record Contract

## Purpose

This document defines the shared contract for **weakness records**: the AIM Engine's identification of skills a student is currently struggling with, based on ongoing skill-state evidence rather than a one-time placement snapshot. It standardizes the `weaknessRecords` category of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic.

Weakness records in Phase 5 are the **ongoing, AIM-Engine-maintained** counterpart to the one-time placement weakness map defined in `docs/phase-4/placement-weakness-rules.md`. Phase 4's weakness map remains the source of truth for placement-time weakness; Phase 5 weakness records are the source of truth for weakness state as it evolves through lesson and practice activity after placement.

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
docs/phase-4/placement-weakness-rules.md
```

This contract reuses the severity-tier vocabulary established in `docs/phase-4/placement-weakness-rules.md` (`emerging`, `developing`, `strong`) so weakness severity reads consistently whether it originated from placement or from ongoing AIM analysis.

## Scope

This contract defines:

- The `AimWeaknessRecordOutput` wire shape returned inside the `weaknessRecords` array of the AIM Engine response envelope.
- The backend-persisted `weakness_records` record shape it maps to.
- Severity tiers, status lifecycle, and resolution semantics.
- Update rules: how a new output merges with prior persisted weakness records.
- Backend-authority rules and validation rules.
- Explicit exclusions.

This contract does not define:

- The `weakness_records` migration itself (owned by a downstream migration task).
- The Phase 4 placement-time weakness map (`docs/phase-4/placement-weakness-rules.md`), which remains separate and unmodified.
- Skill state itself (`P5-012`), which is an input the AIM Engine uses to derive weakness, not redefined here.
- Recommendations derived from weakness (`P5-015`).
- Any client-facing read API shape for weakness records.

## Wire Shape — `AimWeaknessRecordOutput`

```ts
type AimWeaknessRecordOutput = {
  weaknessId: string;
  skillId: string;
  severity: AimWeaknessSeverity;
  status: AimWeaknessStatus;
  triggerAttemptIds: string[];
  detectedAt: string;
  resolvedAt: string | null;
};

type AimWeaknessSeverity = 'emerging' | 'developing' | 'critical';
type AimWeaknessStatus = 'open' | 'improving' | 'resolved';
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `weaknessId` | `string` (UUID) | Yes | Stable identifier for this weakness instance, issued by the AIM Engine. Persists across calls while the same underlying weakness remains open, enabling the Backend to update rather than duplicate. |
| `skillId` | `string` (skill key) | Yes | The skill this weakness applies to. |
| `severity` | `AimWeaknessSeverity` | Yes | Current severity. `critical` extends the Phase 4 `emerging`/`developing` vocabulary for weaknesses persisting long enough or affecting attempts severely enough to warrant the highest tier; Phase 4 placement weakness never reaches `critical` because placement is a single snapshot. |
| `status` | `AimWeaknessStatus` | Yes | Lifecycle status of the weakness instance. |
| `triggerAttemptIds` | `string[]` (UUIDs) | Yes (at least one entry on first detection) | Attempt ids that contributed evidence to this weakness being raised or updated in this call. |
| `detectedAt` | `string` (ISO-8601 UTC) | Yes | When this weakness instance was first detected. Stable across updates to the same `weaknessId`. |
| `resolvedAt` | `string \| null` (ISO-8601 UTC) | Yes | Set when `status` transitions to `resolved`. `null` while `open` or `improving`. |

### Severity Tiers

| Tier | Meaning |
| --- | --- |
| `emerging` | Early signal of struggle; consistent with the Phase 4 `emerging` tier definition. |
| `developing` | Sustained struggle across multiple attempts; consistent with the Phase 4 `developing` tier definition. |
| `critical` | Struggle has persisted or intensified to the point of materially blocking progress on dependent skills or content. Phase 5 only; not produced by the Phase 4 placement snapshot. |

### Status Lifecycle

```text
(none) --detected--> open --improving evidence--> improving --further improving evidence--> resolved
open --further negative evidence--> open (severity may increase)
improving --negative evidence--> open
```

| Status | Meaning |
| --- | --- |
| `open` | Weakness is active; no sustained improvement observed yet. |
| `improving` | Weakness is active but recent evidence shows improvement; not yet resolved. |
| `resolved` | Weakness no longer meets the AIM Engine's active-weakness criteria. `resolvedAt` is set. |

A `resolved` weakness that recurs later is issued a new `weaknessId` by the AIM Engine; the Backend does not reopen a resolved record under its old id. This keeps `resolvedAt` immutable history rather than a contested rolling value.

## Persisted Record — `weakness_records`

```ts
type WeaknessRecord = {
  id: string;
  studentId: string;
  skillId: string;
  severity: AimWeaknessSeverity;
  status: AimWeaknessStatus;
  triggerAttemptIds: string[];
  detectedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Set equal to the wire `weaknessId` on first persistence. Stable thereafter. |
| `studentId` | `string` (UUID) | Backend-resolved from session context, never taken from the wire response. |
| `skillId` | `string` | Copied from the validated wire output. |
| `severity` | `AimWeaknessSeverity` | Copied from the validated wire output on every update. |
| `status` | `AimWeaknessStatus` | Copied from the validated wire output on every update. |
| `triggerAttemptIds` | `string[]` | Backend appends new trigger attempt ids from this call to the existing stored list rather than replacing it, preserving full evidence history for the weakness instance. |
| `detectedAt` | `string` (ISO-8601 UTC) | Set on first persistence. Never updated after. |
| `resolvedAt` | `string \| null` | Copied from the validated wire output on every update. |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

One row exists per `weaknessId`. A student may have multiple open `weakness_records` rows simultaneously, one per active weakness instance (potentially several per skill over time, though typically one open instance per skill at a time, enforced by AIM Engine logic rather than a Backend uniqueness constraint).

## Update Rules

When the Backend persistence service receives a validated `AimWeaknessRecordOutput` entry:

1. Look up the existing `weakness_records` row by `id = weaknessId`.
2. If no row exists, insert a new row with `detectedAt` from the wire output, `triggerAttemptIds` set to the wire output's list, and `createdAt = updatedAt = now()`.
3. If a row exists, append any new entries from the wire output's `triggerAttemptIds` to the stored list (deduplicated), update `severity`, `status`, and `resolvedAt` from the wire output, and set `updatedAt = now()`. `detectedAt` is never changed.
4. The write is part of the same transaction as any other category persisted from the same response, per `docs/phase-5/backend-aim-pipeline-map.md` Stage 6.
5. The Backend never derives or infers `severity` or `status` itself. Both are exclusively AIM Engine outputs.

A response that omits `weaknessRecords` entirely for a given call leaves all existing `weakness_records` rows for that student unchanged.

## Backend Authority Rules

- `severity`, `status`, `detectedAt` (on first detection), and `resolvedAt` are exclusively AIM Engine outputs. No backend service may set or adjust them outside the update procedure above.
- `studentId` on the persisted record is always backend-resolved from session context.
- Clients never write to `weakness_records` directly. Any client-submitted field resembling severity or status is stripped at the client API boundary and logged as a validation event, per `docs/phase-5/no-client-aim-rule.md`.
- Reads of this table by any module other than the AIM persistence service happen only through backend AIM result APIs.
- The Backend does not invent a `critical` severity on its own initiative; only the AIM Engine assigns it.

## Validation Rules

| Rule | Failure |
| --- | --- |
| `weaknessId` is a valid UUID | Category entry dropped; validation event recorded |
| `skillId` resolves to an existing skill key | Category entry dropped; validation event recorded |
| `severity` is one of the defined enum values | Category entry dropped; validation event recorded |
| `status` is one of the defined enum values | Category entry dropped; validation event recorded |
| `triggerAttemptIds` has at least one entry when this is a first detection (no existing row for `weaknessId`) | Category entry dropped; validation event recorded |
| Every entry in `triggerAttemptIds` is a valid UUID corresponding to an attempt referenced in the originating request batch or a prior persisted trigger | Category entry dropped; validation event recorded |
| `detectedAt` is a valid ISO-8601 UTC timestamp not materially in the future | Category entry dropped; validation event recorded |
| `resolvedAt`, when present, is `null` unless `status = resolved` | Category entry dropped; validation event recorded |
| `resolvedAt` is null when `status` is `open` or `improving` | Category entry dropped; validation event recorded |

A dropped entry within the `weaknessRecords` array does not block persistence of other valid entries in the same array or of other categories in the same response.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable severity or status field.
- Speed or response time as an input to severity or status determination. Timing remains behavioral context only.
- A clinical or diagnostic label of any kind. Weakness records describe skill-acquisition struggle, not psychological or medical state.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher consumption rule.
- Any modification to the Phase 4 placement weakness map (`docs/phase-4/placement-weakness-rules.md`), which remains a separate, unmodified system.

## Out of Scope

- The `weakness_records` migration.
- The Phase 4 placement-time weakness map.
- Student skill state (`P5-012`), used as AIM Engine input but not redefined here.
- Recommendation derivation from weakness (`P5-015`).
- Client-facing read API shape for weakness records.

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract.
- `packages/shared-contracts/api/student-skill-state-contracts.md` — Related skill state contract, an AIM Engine input to weakness detection.
- `docs/phase-4/placement-weakness-rules.md` — Source of the severity-tier vocabulary and the separate placement-time weakness map.
- P5-014 — Difficulty Decision Contract.
- P5-015 — AIM Recommendation Contract.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-013 |
| Branch | phase5/P5-013-weakness-record-contract |
| Priority | P0 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/weakness-record-contracts.md |
