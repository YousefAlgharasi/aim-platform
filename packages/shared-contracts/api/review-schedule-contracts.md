# Phase 5 — Review Schedule Contract

## Purpose

This document defines the shared contract for **review schedule entries**: the AIM Engine's spaced-repetition scheduling decisions for when a student should next review a given skill or item. It standardizes the `reviewSchedule` category of the AIM Engine response envelope (`P5-011`) and the backend-persisted record it maps to.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic. It does not define the spaced-repetition algorithm itself, which is an AIM Engine implementation detail.

Review schedule entries are the data source that drives the `review_practice` session type (`packages/shared-contracts/api/aim-session-input-contracts.md`) and the `review_question` item type (`packages/shared-contracts/api/aim-attempt-input-contracts.md`), and are referenced by the `review_due` recommendation reason (`packages/shared-contracts/api/aim-recommendation-contracts.md`).

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
packages/shared-contracts/api/aim-session-input-contracts.md
packages/shared-contracts/api/aim-attempt-input-contracts.md
packages/shared-contracts/api/aim-recommendation-contracts.md
```

## Scope

This contract defines:

- The `AimReviewScheduleOutput` wire shape returned inside the `reviewSchedule` array of the AIM Engine response envelope.
- The backend-persisted `review_schedules` record shape it maps to.
- Due-date semantics, completion handling, and rescheduling rules.
- Update rules and backend-authority rules.
- Validation rules.
- Explicit exclusions.

This contract does not define:

- The `review_schedules` migration itself.
- The spaced-repetition algorithm or interval calculation logic (an AIM Engine internal concern).
- Session and item type definitions that consume a due review (`packages/shared-contracts/api/aim-session-input-contracts.md`, `packages/shared-contracts/api/aim-attempt-input-contracts.md`).
- The `review_due` recommendation entries that may point at the same underlying schedule (`packages/shared-contracts/api/aim-recommendation-contracts.md`).
- Client-facing presentation of upcoming reviews.

## Wire Shape — `AimReviewScheduleOutput`

```ts
type AimReviewScheduleOutput = {
  scheduleId: string;
  skillId: string;
  dueAt: string;
  intervalDays: number;
  repetitionCount: number;
  basedOnAttemptId: string;
  scheduledAt: string;
};
```

### Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `scheduleId` | `string` (UUID) | Yes | Stable identifier for this review schedule instance, issued by the AIM Engine. Persists across reschedules of the same underlying spaced-repetition item. |
| `skillId` | `string` (skill key) | Yes | The skill this review schedule applies to. |
| `dueAt` | `string` (ISO-8601 UTC) | Yes | When this skill is next due for review, as decided by the AIM Engine's spaced-repetition logic. |
| `intervalDays` | `number` (> 0) | Yes | The interval, in days, between the previous review (or initial learning event) and `dueAt`, included for transparency and audit; not independently used by the Backend to recompute `dueAt`. |
| `repetitionCount` | `integer` (>= 0) | Yes | Number of successful spaced-repetition cycles completed for this schedule instance so far. `0` on the first-ever schedule for a skill. |
| `basedOnAttemptId` | `string` (UUID) | Yes | The most recent attempt id that triggered this scheduling decision (typically the attempt that completed a review or first introduced the skill). |
| `scheduledAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine made this scheduling decision. |

## Persisted Record — `review_schedules`

```ts
type ReviewScheduleRecord = {
  id: string;
  studentId: string;
  skillId: string;
  dueAt: string;
  intervalDays: number;
  repetitionCount: number;
  basedOnAttemptId: string;
  scheduledAt: string;
  status: AimReviewScheduleStatus;
  createdAt: string;
  updatedAt: string;
};

type AimReviewScheduleStatus = 'pending' | 'due' | 'completed' | 'rescheduled';
```

| Field | Type | Source |
| --- | --- | --- |
| `id` | `string` (UUID) | Set equal to the wire `scheduleId` on first persistence for this schedule instance. Stable across reschedules. |
| `studentId` | `string` (UUID) | Backend-resolved from session context, never taken from the wire response. |
| `skillId`, `dueAt`, `intervalDays`, `repetitionCount`, `basedOnAttemptId`, `scheduledAt` | As defined above | Copied from the validated wire output on every update. |
| `status` | `AimReviewScheduleStatus` | Backend-managed lifecycle status, derived mechanically from `dueAt` and client/session activity (see Status Lifecycle below); not present on the wire except indirectly through `dueAt`. |
| `createdAt` | `string` (ISO-8601 UTC) | Backend-set on first persistence. |
| `updatedAt` | `string` (ISO-8601 UTC) | Backend-set on every persistence write for this record. |

One row exists per `scheduleId`. A student may have multiple `pending` or `due` rows simultaneously across different skills, each tracked independently.

### Status Lifecycle

| Status | Meaning | Set by |
| --- | --- | --- |
| `pending` | `dueAt` is in the future. | Backend, mechanically, when `now() < dueAt`. |
| `due` | `dueAt` has passed and the review has not yet been completed. | Backend, mechanically, when `now() >= dueAt` and no completing review attempt has been recorded. |
| `completed` | The student completed a `review_question` attempt that the AIM Engine used as the basis for a new schedule entry (a fresh `scheduleId` with an incremented `repetitionCount`), at which point the prior schedule row transitions to `completed`. | Backend, when a new schedule entry for the same skill arrives with `repetitionCount` greater than the existing row's, indicating the prior cycle closed. |
| `rescheduled` | A new schedule entry for the same `scheduleId` arrived with an updated `dueAt` before the previous `dueAt` was reached or acted upon (the AIM Engine revised its own decision, for example after detecting a relevant attempt outside the review flow). | Backend, when an update to the same `scheduleId` changes `dueAt` without a `repetitionCount` increase. |

`status` transitions are computed mechanically by the Backend from timestamps and from the relationship between successive wire outputs; the AIM Engine does not send `status` directly.

## Update Rules

When the Backend persistence service receives a validated `AimReviewScheduleOutput` entry:

1. Look up the existing `review_schedules` row by `id = scheduleId`.
2. If no row exists, insert a new row with `status` computed from `dueAt` relative to `now()` (`pending` or `due`), and `createdAt = updatedAt = now()`.
3. If a row exists and the incoming `repetitionCount` is greater than the stored value, this is a new spaced-repetition cycle for the same skill. The Backend records the prior cycle's closure (`completed`) in the AIM audit log for history purposes, then overwrites the row in place with the incoming `dueAt`, `intervalDays`, `repetitionCount`, `basedOnAttemptId`, `scheduledAt`, and recomputes `status` as `pending` or `due`. This table holds one current row per active schedule; it is not a cycle-history table.
4. If a row exists and the incoming `repetitionCount` equals the stored value but `dueAt` differs, update the row's `dueAt`, `intervalDays`, `scheduledAt`, and set `status = rescheduled`, then immediately recompute `status` to `pending` or `due` based on the new `dueAt` relative to `now()` (`rescheduled` is a transient audit signal recorded in the AIM audit log, not a long-lived row state).
5. The write is part of the same transaction as any other category persisted from the same response.
6. The Backend never computes `dueAt`, `intervalDays`, or `repetitionCount` itself. They are exclusively AIM Engine outputs.

A response that omits `reviewSchedule` for a given call leaves all existing `review_schedules` rows for that student unchanged. The Backend's own background process (outside this contract's scope to define in detail, but governed by the status lifecycle above) is responsible for mechanically flipping `pending` rows to `due` as time passes, independent of any AIM Engine call.

## Backend Authority Rules

- `dueAt`, `intervalDays`, `repetitionCount`, and `basedOnAttemptId` are exclusively AIM Engine outputs.
- `status` is exclusively backend-computed from timestamps and update relationships, never accepted from the wire output.
- `studentId` on the persisted record is always backend-resolved from session context.
- Clients never write to `review_schedules` directly. A client cannot mark a review "done" by itself; completion is recognized only when the Backend records a qualifying `review_question` attempt and a subsequent AIM Engine response increments `repetitionCount`, per the pipeline in `docs/phase-5/backend-aim-pipeline-map.md`.
- Reads of this table by any module other than the AIM persistence service happen only through backend AIM result APIs.

## Validation Rules

| Rule | Failure |
| --- | --- |
| `scheduleId` is a valid UUID | Category entry dropped; validation event recorded |
| `skillId` resolves to an existing skill key | Category entry dropped; validation event recorded |
| `dueAt` is a valid ISO-8601 UTC timestamp | Category entry dropped; validation event recorded |
| `intervalDays` is a positive number | Category entry dropped; validation event recorded |
| `repetitionCount` is a non-negative integer | Category entry dropped; validation event recorded |
| `repetitionCount` on an update for an existing `scheduleId` is not less than the currently stored value | Category entry dropped as a contract violation; existing row unchanged |
| `basedOnAttemptId` is a valid UUID corresponding to an attempt referenced in the originating request batch | Category entry dropped; validation event recorded |
| `scheduledAt` is a valid ISO-8601 UTC timestamp not materially in the future | Category entry dropped; validation event recorded |

A dropped entry does not block persistence of other valid entries in the same array or of other categories in the same response.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A client-writable due date, interval, or repetition count.
- A client-writable completion flag; completion is derived only from a qualifying attempt plus an AIM Engine response.
- Speed or response time as an input to scheduling. Timing of the review session itself may exist as behavioral context in the originating attempt (per `packages/shared-contracts/api/aim-attempt-input-contracts.md`), but never as a direct override of `dueAt`.
- Direct AIM Engine credentials or connection details.
- Any AI Teacher override of a review schedule.
- The spaced-repetition algorithm itself (interval growth function, ease factors, or similar); those are AIM Engine internals not exposed through this contract.

## Out of Scope

- The `review_schedules` migration.
- The spaced-repetition algorithm.
- The `review_practice` session type and `review_question` item type definitions.
- The `review_due` recommendation entries.
- Client-facing presentation of upcoming or overdue reviews.
- Background sweep mechanics that flip `pending` to `due` (implementation detail outside contract scope; behavior is specified, mechanism is not).

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/backend-aim-pipeline-map.md` — Persistence stage (Stage 6) this record fits into.
- `docs/phase-5/aim-error-handling-policy.md` — Validation failure handling.
- `packages/shared-contracts/api/aim-engine-response-contracts.md` — Parent envelope contract.
- `packages/shared-contracts/api/aim-session-input-contracts.md` — `review_practice` session type that consumes due schedules.
- `packages/shared-contracts/api/aim-attempt-input-contracts.md` — `review_question` item type and `basedOnAttemptId` correlation.
- `packages/shared-contracts/api/aim-recommendation-contracts.md` — `review_due` recommendation reason.
- P5-017 — AIM Session Summary Contract.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-016 |
| Branch | phase5/P5-016-review-schedule-contract |
| Priority | P1 |
| Dependency | P5-011 |
| Output | packages/shared-contracts/api/review-schedule-contracts.md |
