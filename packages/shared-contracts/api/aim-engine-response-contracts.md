# Phase 5 — AIM Engine Response Contract

## Purpose

This document defines the shared contract for the structured response returned by the AIM Engine on a successful `POST /aim/v1/analysis` call. It standardizes the response envelope, the set of decision categories it may carry, and the cross-cutting rules every category must follow.

This is a documentation-only contract. It does not implement backend services, controllers, database migrations, Flutter views, Admin Dashboard UI, AI Teacher behavior, or AIM Engine runtime logic.

This contract defines the **envelope and cross-cutting rules only**. The detailed field shape of each decision category is owned by its own dedicated contract task, listed in the table below. This document is the parent contract those tasks extend; it does not duplicate their field-level detail.

| Category | Detailed contract |
| --- | --- |
| Student skill state | `P5-012` → `packages/shared-contracts/api/student-skill-state-contracts.md` |
| Weakness records | `P5-013` → `packages/shared-contracts/api/weakness-record-contracts.md` |
| Difficulty decision | `P5-014` → `packages/shared-contracts/api/difficulty-decision-contracts.md` |
| Recommendations | `P5-015` → `packages/shared-contracts/api/aim-recommendation-contracts.md` |
| Review schedule | `P5-016` → `packages/shared-contracts/api/review-schedule-contracts.md` |
| Session summary | `P5-017` → `packages/shared-contracts/api/aim-session-summary-contracts.md` |
| Integration error codes | `P5-018` → `packages/shared-contracts/api/errors.md` (update) |

Frustration signals are carried inside the session summary category per `P5-017`; they are not a separate top-level category, consistent with `docs/phase-5/aim-engine-integration-charter.md`, which treats frustration as an educational behavioral signal rather than an independent persisted entity with its own lifecycle.

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
packages/shared-contracts/api/aim-attempt-input-contracts.md
```

## Scope

This contract defines:

- The top-level response envelope shape.
- The full set of decision categories the envelope may carry.
- Cross-cutting rules: optionality, correlation to the request, contract versioning, value ranges shared across categories, and the relationship between this response and backend persistence.
- The boundary between this contract and the per-category contracts.

This contract does not define:

- Per-category field-level shapes (owned by `P5-012`–`P5-017`).
- The safe failure response shape for unsuccessful calls (owned by `P5-025`; referenced here only for contrast).
- Integration error code identifiers (owned by `P5-018`).
- Backend persistence table schemas (owned by the migration tasks).
- Backend AIM result API response shapes exposed to clients (owned by downstream API tasks; those APIs return backend-persisted projections of this response, not this response verbatim).

## Response Envelope

```ts
type AimAnalysisResponse = {
  backendRequestId: string;
  contractVersion: string;
  studentId: string;
  sessionId: string;
  generatedAt: string;
  categories: AimResponseCategories;
};

type AimResponseCategories = {
  skillState?: AimSkillStateOutput[];
  weaknessRecords?: AimWeaknessRecordOutput[];
  difficultyDecision?: AimDifficultyDecisionOutput;
  recommendations?: AimRecommendationOutput[];
  reviewSchedule?: AimReviewScheduleOutput[];
  sessionSummary?: AimSessionSummaryOutput;
};
```

### Envelope Field Rules

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `backendRequestId` | `string` (UUID) | Yes | Echoes the `backendRequestId` from the originating request. Used by the Backend to correlate the response and to validate idempotent replay. |
| `contractVersion` | `string` | Yes | The contract version the AIM Engine used to produce this response. Must match a version the Backend supports per `docs/phase-5/aim-engine-api-map.md`. |
| `studentId` | `string` (UUID) | Yes | Must match the `studentId` carried in the originating session input segment. The Backend rejects any response where this does not match. |
| `sessionId` | `string` (UUID) | Yes | Must match the `sessionId` carried in the originating session input segment. The Backend rejects any response where this does not match. |
| `generatedAt` | `string` (ISO-8601 UTC) | Yes | When the AIM Engine produced this response. |
| `categories` | `AimResponseCategories` | Yes | Container for every decision category. May contain any subset of the categories below, including none, depending on what the pipeline determined for this request. |

### Category Optionality Rule

Every field inside `AimResponseCategories` is optional. The AIM Engine includes a category only when its pipeline produced a decision for that category on this call. An empty `categories` object (no fields present) is a valid response meaning "no new decisions for this call"; it is not an error and is not treated as a failure.

The Backend never infers a missing category as a negative or zero-value decision. A missing category means "unchanged," not "reset." Persistence services act only on categories present in the response (Stage 6 of `docs/phase-5/backend-aim-pipeline-map.md`).

### Category Cardinality

| Category | Cardinality | Reason |
| --- | --- | --- |
| `skillState` | Array (zero or more) | A single analysis call may update more than one skill's state, since one attempt can carry multiple `skillIds` (per `P5-010`) and a batch may contain multiple attempts. |
| `weaknessRecords` | Array (zero or more) | A call may surface, update, or resolve more than one weakness simultaneously. |
| `difficultyDecision` | Single object or absent | Difficulty decisions apply to the immediate next presentation for the session in progress; at most one decision per call. |
| `recommendations` | Array (zero or more) | A call may produce zero, one, or several ranked recommendations. |
| `reviewSchedule` | Array (zero or more) | A call may schedule reviews for more than one skill or item. |
| `sessionSummary` | Single object or absent | A session summary is produced at most once per call, typically when a session reaches a natural close-out point; not every call produces one. |

## Cross-Cutting Rules

### Correlation to Request

Every response must be traceable to exactly one request through `backendRequestId`, `studentId`, and `sessionId`. The Backend's response validation service (Stage 5 of `docs/phase-5/backend-aim-pipeline-map.md`) rejects any response that does not match all three against the original request context. A mismatch is treated as a contract violation per `docs/phase-5/aim-error-handling-policy.md`, not as a valid response with an error inside it.

### Contract Versioning

`contractVersion` follows the versioning rule established in `docs/phase-5/aim-engine-api-map.md`: a breaking change to this envelope or to any category contract requires a new version identifier and, if the change is breaking at the transport level, a new endpoint prefix (`/aim/v2/...`). A non-breaking additive change (a new optional field) may ship under the same `contractVersion` major identifier with a documented minor increment.

### Backend Validation Before Persistence

Every category present in `categories` must independently pass its own contract's validation rules (`P5-012`–`P5-017`) before the Backend persists it. A category that fails its own validation is dropped from persistence for that call; categories that pass are still persisted. A partial-category failure does not abort the entire response when other categories are independently valid, but it is recorded as a validation event per category, consistent with `docs/phase-5/aim-error-handling-policy.md`. If the **envelope itself** is malformed (missing required envelope fields, correlation mismatch, unsupported `contractVersion`), the entire response is rejected and no category is persisted.

### Relationship to Persistence

This contract describes what the AIM Engine returns over the wire. It is not the persisted record shape. Each persistence service (Stage 6) maps a validated category output to its own table schema, which may include backend-only fields (created/updated timestamps, audit linkage, soft-delete flags) not present in the wire response. The per-category contracts (`P5-012`–`P5-017`) own that mapping.

### Relationship to Client-Facing APIs

This contract is internal to the Backend-to-AIM Engine boundary. Clients never receive this envelope directly. Backend AIM result APIs (owned by downstream tasks) expose their own response shapes built from persisted, backend-validated data, filtered and permission-checked for the requesting client. The wire contract and the client-facing contract are allowed to diverge in shape; only the underlying values must remain consistent with what was validated and persisted.

### Frustration and Behavioral Signals

Frustration and other behavioral interpretations produced by the AIM Engine are carried as fields inside `sessionSummary` (`P5-017`), not as a standalone top-level category. They remain educational behavioral signals, never clinical diagnoses, consistent with `docs/phase-5/aim-engine-integration-charter.md`.

### Speed and Timing

No category in this envelope may carry a field that represents speed or response time as a mastery, level, or difficulty input. Categories may reference timing only as descriptive output (for example, a session summary noting average pace for the session) and never as a justification field that the Backend or any client could mistake for a scoring input. This rule is enforced by each category's own contract and is restated here because it applies to the envelope as a whole.

## Validation Rules (Envelope Level)

| Rule | Failure |
| --- | --- |
| `backendRequestId`, `studentId`, `sessionId` are valid UUIDs | Contract violation per `docs/phase-5/aim-error-handling-policy.md` |
| `backendRequestId`, `studentId`, `sessionId` match the originating request | Contract violation; response rejected entirely |
| `contractVersion` is a version the Backend supports | Contract violation; response rejected entirely |
| `generatedAt` is a valid ISO-8601 UTC timestamp not materially in the future | Contract violation |
| `categories` is present, even if empty | Contract violation if absent entirely |
| Each present category passes its own contract's validation (`P5-012`–`P5-017`) | That category is dropped from persistence; other valid categories proceed |

Category-level validation detail (required sub-fields, ranges, enums) is owned by the per-category contracts and is not duplicated here.

## Explicit Exclusions

This contract does not include and must never be extended to include:

- A field that lets the AIM Engine instruct the Backend to bypass validation for any category.
- A field that lets the AIM Engine write directly to the database; the AIM Engine returns data only, per `docs/phase-5/aim-data-flow.md`.
- Any AI Teacher dialogue, persona, or prompt content.
- Any field representing payment, parent dashboard, or voice AI data.
- A field that asserts client-facing presentation details (UI copy, layout); those belong to downstream client-facing API and UI tasks, not to this internal contract.

## Out of Scope

- Per-category field-level contracts (`P5-012`–`P5-017`).
- The AIM Engine safe failure response shape (`P5-025`).
- Integration error code identifiers (`P5-018`).
- Backend persistence table schemas.
- Backend AIM result API response shapes exposed to clients.
- The AIM Engine's internal pipeline implementation (`P5-023`).

## References

- `docs/phase-5/aim-engine-integration-charter.md` — Phase 5 scope and authority hierarchy.
- `docs/phase-5/aim-integration-scope-boundaries.md` — In-scope/out-of-scope boundary.
- `docs/phase-5/no-client-aim-rule.md` — Client cannot compute or submit AIM-owned values.
- `docs/phase-5/aim-data-flow.md` — End-to-end data flow this response fits into.
- `docs/phase-5/aim-engine-api-map.md` — Transport, versioning, and endpoint definitions for `POST /aim/v1/analysis`.
- `docs/phase-5/backend-aim-pipeline-map.md` — Backend orchestration stages that consume this response (Stages 5 and 6).
- `docs/phase-5/aim-error-handling-policy.md` — Contract-violation and validation-failure handling.
- `packages/shared-contracts/api/aim-session-input-contracts.md` — Companion session input segment.
- `packages/shared-contracts/api/aim-attempt-input-contracts.md` — Companion attempt input segment.
- P5-012 — Student Skill State Contract.
- P5-013 — Weakness Record Contract.
- P5-014 — Difficulty Decision Contract.
- P5-015 — AIM Recommendation Contract.
- P5-016 — Review Schedule Contract.
- P5-017 — AIM Session Summary Contract.
- P5-018 — AIM Integration Error Codes.
- P5-022 — AIM Engine Response Schema (Python implementation of this contract).
- P5-025 — AIM Engine Safe Failure Response.

## Metadata

| Field | Value |
| --- | --- |
| Task ID | P5-011 |
| Branch | phase5/P5-011-aim-engine-response-contract |
| Priority | P0 |
| Dependency | P5-009 |
| Output | packages/shared-contracts/api/aim-engine-response-contracts.md |
