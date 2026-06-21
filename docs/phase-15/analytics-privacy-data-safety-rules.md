# Phase 15 — Analytics Privacy and Data Safety Rules

## Purpose

Define anonymization, aggregation, PII boundaries, child data rules, sensitive
event rules, and export limits to protect students, parents, and platform data
in all Phase 15 analytics and reporting surfaces.

## Anonymization and Aggregation

- Platform-wide and cohort-level metrics must report aggregate values only
  (counts, rates, sums, averages) — never row-level user data in admin
  platform-overview surfaces.
- Minimum cohort/aggregate size: an aggregate scoped to a cohort smaller than 5
  distinct users must be suppressed or merged with a broader scope, to prevent
  re-identification.
- Event metadata stored in `analytics_events` must exclude free-text answer
  content, raw AI/voice transcripts, raw payment payloads, and authentication
  secrets — metadata is limited to safe, structured fields defined in
  `docs/phase-15/analytics-event-taxonomy.md`.

## PII Boundaries

Analytics outputs (events, aggregates, reports, dashboards, exports) must never
include:

- Secrets, service-role keys, database credentials, AI/payment provider keys,
  or production tokens.
- Raw AIM engine outputs or raw AI/voice teacher transcripts.
- Raw payment provider payloads (only Phase 14-approved billing summary fields).
- Sensitive assessment answers (only scored/aggregate outcomes).
- Full names, emails, phone numbers, or addresses in aggregate/cohort reports
  (only in row-level, role-scoped reports where the viewer already has a
  legitimate relationship to the subject, e.g. a parent viewing their own
  child).
- Unauthorized PII for any user outside the viewer's authorized scope.

## Child Data Rules

- Any report or dashboard that includes child-identifiable data must enforce
  Phase 12 consent and child-scope rules (`docs/phase-12/parent-data-retention-rules.md`,
  `docs/phase-12/parent-privacy-consent-rules.md`).
- A parent may only see analytics for children within their own consented
  scope. Admin may see aggregate-only child metrics; admin must not see
  individually identified child data unless an explicit, separately-scoped
  admin task grants narrow row-level access for support purposes.
- Cohorts built from child data must be aggregate-only when surfaced outside
  the parent's own scope.

## Sensitive Event Rules

- Sensitive event types (payment events, assessment submission events,
  authentication events) may be ingested into `analytics_events`, but their
  `metadata` field is restricted to the safe-field allowlist per event type
  defined in the event taxonomy.
- No event may store a raw answer, a raw payment instrument, a raw provider
  webhook body, or a session token.

## Billing Report Rules

- Billing/revenue reports must respect Phase 14 sensitive payment data rules:
  no raw card data, no provider secrets, no full payment provider payloads —
  only Phase 14-approved status/amount/currency/period summary fields.

## Export Limits

- Exports must be permission-checked and scope-limited to the requester's
  authorized data (see `docs/phase-15/reporting-access-map.md`).
- Exports must never include any field excluded above.
- Every export request and result is recorded in
  `analytics_access_audit_logs`, including denials.

## Dependencies

- P15-001 — Analytics and Reports Charter.
