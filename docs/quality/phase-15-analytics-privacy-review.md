# Phase 15 Analytics Privacy Review

Scope: review of cohort-aggregate suppression, event metadata content,
PII boundaries, child-data/consent scope, sensitive-event handling,
billing-report fields, and export logging across
`services/backend-api/src/features/analytics/*`, against the rules in
`docs/phase-15/analytics-privacy-data-safety-rules.md` and the safe-field
allowlist in `docs/phase-15/analytics-event-taxonomy.md`.

## Minimum cohort size (no re-identification via small cohorts)

- `analytics.validation.ts:18` defines `MIN_COHORT_AGGREGATE_SIZE = 5`, and
  `assertMinimumAggregateSize()` (`analytics.validation.ts:82-88`) throws
  `ForbiddenException` whenever a resolved cohort's distinct member count is
  below 5.
- This check is actually called before any cohort aggregate is computed or
  served — from `cohort.service.ts:43-48` (`resolveReportableMembers`) and
  `metric-aggregation.service.ts:45-48,77-80`.
- **Status: Pass.** This rule is enforced in code, not just documented.

## Event metadata content (no raw answers, transcripts, secrets)

- `analytics_events.metadata` is stored as an untyped
  `Record<string, unknown>` at both the entity (`analytics.entities.ts:3-13`)
  and DTO (`analytics.dtos.ts:46-48`) level — there is no per-event-type
  schema validation against the safe-field allowlist defined in
  `docs/phase-15/analytics-event-taxonomy.md`.
- `analytics-event-ingestion.service.ts:27-39,46-58` does call
  `stripUnsafeMetadata`, which strips any metadata key matching
  `/password|secret|token|api[_-]?key|credential|card[_-]?number/i`. This
  reliably blocks credential/secret leakage.
- However, nothing in the ingestion path checks `eventType` against its
  allowed field list, so a caller that attaches a key like
  `raw_answer`, `transcript`, or a free-text PII field that doesn't match
  the forbidden-pattern regex would currently pass through unblocked.
- **Status: Partial / documented-only for the per-event-type allowlist.**
  Secret/credential stripping is enforced; the broader "only the
  taxonomy's approved fields per event type" rule is not.

## PII boundaries in aggregates vs. row-level reports

- `MetricAggregate` (`analytics.entities.ts:46-56`) only carries a numeric
  `value` plus scope/period identifiers — there is no field on this entity
  that could hold a name, email, or phone number, so aggregate output is
  structurally incapable of leaking PII today.
- A repository-wide grep of `features/analytics/` for `name`, `email`, or
  `phone` fields on any analytics entity/DTO returns no matches.
- The doc's allowance for PII in "row-level, role-scoped reports (e.g. a
  parent viewing their own child)" is not implemented inside the analytics
  feature at all: `ReportRunnerService.execute()`
  (`report-runner.service.ts:56-85`) is a stub that returns only a
  `resultRef` pointer, with no field-assembly logic of any kind — so there
  is no code path in analytics that could be checked against this rule one
  way or the other. `parent-reports.controller.ts:13-17` notes (in comment)
  that real per-child row-level reads happen via `ParentChildAccessGuard`
  in `features/parents/`, outside analytics.
- **Status: Pass for "no PII in aggregates" (true by absence of fields).
  Documented-only for the row-level PII allowance, since no analytics
  service yet assembles row-level report content to apply it to.**

## Child data rules (Phase 12 consent/scope)

- A repository-wide grep of `features/analytics/` for `consent`, `child`,
  `Phase 12`, or `Phase12` returns a single hit: the comment in
  `parent-reports.controller.ts:13-17` noting that child-row access is
  handled by a separate mechanism. No analytics file imports
  `ParentChildAccessGuard` or any parent-consent service from
  `features/parents/`.
- Analytics' own access control
  (`analytics-access-policy.service.ts:12-22`) is a role/ownership check
  only — it has no concept of Phase 12 consent scope, so it cannot today
  enforce "a parent may only see analytics for children within their own
  consented scope" if a report ever surfaced per-child detail.
- **Status: Documented-only.** This rule exists in
  `docs/phase-15/analytics-privacy-data-safety-rules.md` but is not wired
  into any analytics code path. Since `ReportRunnerService` does not yet
  assemble real child-level content (see above), there is no active leak
  today — but the consent check would need to be added before any report
  definition starts returning child-identifiable rows.

## Sensitive event rules (payment, assessment, auth events)

- The same blanket `stripUnsafeMetadata` regex (see "Event metadata
  content" above) applies uniformly to every event type; there is no
  branching in `analytics-event-ingestion.service.ts` or
  `analytics.validation.ts` that applies a different, narrower allowlist to
  `payment.*`, `assessment.*`, or `user.login`/`user.registered` events.
- `validateEventType()` (`analytics.validation.ts:69-76`) only checks that
  `eventType` is a non-empty string of reasonable length — it does not
  check membership in the taxonomy's approved event-type list.
- **Status: Documented-only.** The taxonomy correctly defines a narrow
  per-type allowlist (e.g. `assessment.scored` → `assessment_id, score,
  passed`; `payment.succeeded` → `amount, currency, status`), but nothing
  in the ingestion path enforces it — only the universal secret/credential
  pattern is blocked.

## Billing report rules (Phase 14 fields only, no raw card data)

- `admin-revenue-reports.controller.ts:35-50` delegates to
  `ReportRunnerService.runReport()`, which (as noted above) is a stub
  returning only a `resultRef` pointer — there is no real field assembly
  for billing reports yet to check for raw card data one way or the other.
- Independently, Phase 14's own billing entities are confirmed clean:
  `features/billing/sensitive-data.spec.ts:27-37,49-59` asserts `Payment`
  and checkout-session entities exclude `cardNumber`, `pan`, `cvc`, `cvv`,
  `expiry`, `exp_month`, `exp_year`, and related raw-card fields. A
  repository-wide grep for `card_number`, `cardNumber`, `cvv`, or `pan` in
  backend `src` only matches test fixtures, never real stored/returned
  fields.
- **Status: Pass for "no raw card data exists anywhere" (true by absence
  at the Phase 14 entity level). Documented-only for an analytics-specific
  billing-report field restriction, since the analytics report runner does
  not yet assemble billing report content to restrict.**

## Export limits and audit logging

- `analytics-export.controller.ts:19,24,40` guards every export route with
  `@UseGuards(SupabaseJwtAuthGuard, AnalyticsAccessGuard)` plus
  `@RequireAnalyticsAccess({ category: 'admin', action: 'request_export' })`.
- `AnalyticsAccessPolicyService.evaluateAccess()`
  (`analytics-access-policy.service.ts:44-58`) unconditionally writes an
  audit log entry with `result: 'allowed'` or `result: 'denied'` before
  returning, for every access decision, not only successful ones.
- `analytics-export.service.ts:17-42` independently verifies
  `reportRun.requestedByUserId === params.requestedByUserId` before
  serving an export; a mismatch produces both a denial audit log
  (lines 32-39) and a thrown `ForbiddenException`. Further allow/deny
  audit writes occur at lines 44-67 and 70-85.
- The audit table write path is confirmed end-to-end: migration
  `20260621022000_create_analytics_access_audit_logs_table` creates
  `analytics_access_audit_logs`, and the only writer found repository-wide
  is `analytics.repository.ts:341-343`.
- **Status: Pass.** Export permission checks, scope checks, and audit
  logging of both grants and denials are all enforced in code, matching
  the documented rule exactly.

## Summary

| Area | Status |
|---|---|
| Minimum cohort size (5) for aggregates | Pass |
| Event metadata: secret/credential stripping | Pass |
| Event metadata: per-event-type safe-field allowlist | Documented-only |
| No PII in aggregates (structural) | Pass |
| PII allowed in row-level parent reports | Documented-only (no report content assembled yet) |
| Phase 12 child consent/scope enforcement in analytics | Documented-only |
| Sensitive event (payment/assessment/auth) field allowlist | Documented-only |
| Billing report field restriction (analytics-specific) | Documented-only |
| No raw card data anywhere (Phase 14 entities) | Pass |
| Export permission checks, scope checks, and audit logging | Pass |

**Overall: Partial.** The privacy controls that are wired into running
code — minimum cohort-size suppression, secret/credential stripping from
event metadata, and export permission/scope/audit logging — are correctly
enforced and match the documented rules. However, several rules in
`docs/phase-15/analytics-privacy-data-safety-rules.md` are not yet backed
by code: the per-event-type metadata safe-field allowlist, Phase 12
child-consent scoping, the sensitive-event field allowlist, and any
billing-report-specific field restriction. In each of these cases the
underlying risk is currently latent rather than active, because
`ReportRunnerService` is still a stub that does not assemble real report
content — but these checks must be implemented before any report
definition starts returning row-level child, payment, or assessment detail,
and before event ingestion is opened to less-trusted callers.
