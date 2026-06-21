# Phase 14 — Billing Security Review

**Scope:** Provider secrets, webhook signature verification, permissions,
idempotency, sensitive data handling, logging, and client exposure across
`services/backend-api/src/features/billing/`, the mobile/parent/admin
billing UI, and related Prisma migrations.

## 1. Provider Secrets

- Grep across the repository for provider secret prefixes (`sk_live_`,
  `sk_test_`, `whsec_`) returns matches **only** inside
  `services/backend-api/src/features/billing/sensitive-data.spec.ts`
  (lines 17-19), where they appear as string literals in a deny-list test
  asserting these prefixes never appear in entities/DTOs. No hardcoded
  provider secret was found anywhere in application code.
- **Verdict: PASS** — no hardcoded secrets detected.

## 2. Webhook Signature Verification

- No provider adapter file (e.g. a Stripe client/adapter) exists under
  `services/backend-api/src`. A grep for `webhook|signature|verifyWebhook|constructEvent`
  in the billing feature returns no matches.
- The `payment_provider_events` table (migration
  `20260621011000_create_payment_provider_events_table`) and
  `PaymentProviderEvent` entity (`billing.entities.ts:190`) model event
  storage, but no webhook controller or service consumes them yet.
- **Verdict: BLOCKED / NOT YET IMPLEMENTED.** Webhook signature
  verification cannot be confirmed as present because no webhook
  ingestion endpoint exists in this codebase yet. This is a real gap, not
  a passed check — it must be implemented and re-reviewed before any
  webhook endpoint is exposed to a payment provider.

## 3. Idempotency

- The `payment_provider_events` table enforces `provider_event_id` and
  `idempotency_key` as `UNIQUE` columns at the schema level (migration
  `20260621011000_create_payment_provider_events_table`).
- `billing.repository.ts` provides `findProviderEventByEventId` and
  `createProviderEvent` (lookup-before-insert), but no service currently
  calls these methods — there is no event-processing service wired to
  exercise this idempotency path end-to-end.
- **Verdict: PARTIAL.** Schema-level idempotency protection exists and is
  sound by design (unique constraints), but cannot be verified as
  enforced in practice until a webhook/event-processing service is
  implemented and tested against it.

## 4. Permission Guards

- No `.controller.ts` file exists under
  `services/backend-api/src/features/billing/`, and no `@UseGuards`,
  `@Roles`, or equivalent guard decorator was found in the billing
  feature folder. `billing.module.ts` references `SubscriptionService`
  and `CheckoutService`, neither of which exists as a file, and the
  module itself is not imported into `app.module.ts` — billing is not
  wired into the running backend application.
- The admin billing UI (`apps/admin-dashboard/components/billing/*.tsx`)
  documents the expectation "Backend admin role required — enforced by
  PermissionGuard" in every view's boundary note, consistent with the
  platform-wide rule that UI never decides authority. This is correct as
  written, but there is currently no backend endpoint for it to call.
- **Verdict: BLOCKED.** No billing HTTP surface exists yet to attach
  permission guards to. This must be addressed before any billing
  endpoint is exposed.

## 5. Sensitive Data / Logging

- No `console.log` or `logger.*` call exists anywhere in the billing
  feature folder — there is nothing to log payloads/secrets through yet.
  `billing_audit_logs` table and `createAuditLog`/`findAuditLogs`
  repository methods (`billing.repository.ts:482-497`) exist but are
  unused by any service, so audit logging is also not yet wired.
- `sensitive-data.spec.ts` is a deny-list test confirming no raw card
  data, CVV/CVC, or secret-prefixed strings appear in
  `billing.entities.ts` or `billing.dtos.ts`. Confirmed clean by direct
  grep as well (case-insensitive search for "card", "cvv", "cvc", "pan").
- Admin billing UI explicitly states in each boundary note that no raw
  card data, provider secrets, or webhook secrets are rendered.
- **Verdict: PASS** for what exists today; revisit once audit logging and
  webhook ingestion are implemented to ensure secrets/payloads are
  redacted in real log output, not just absent because nothing logs yet.

## 6. Client/UI Authority

- Every billing UI surface reviewed (mobile student billing, parent web
  billing, admin web billing including the new refunds/provider-events
  views) is read-only or routes mutations through backend APIs only — no
  UI component computes or sets price, payment, subscription, invoice,
  refund, or entitlement status locally.
- **Verdict: PASS.**

## Summary

| Area | Status |
|------|--------|
| Provider secrets excluded | PASS |
| Webhook signature verification | **BLOCKED — not implemented** |
| Idempotency enforcement | PARTIAL — schema-level only, unexercised |
| Permission guards on billing endpoints | **BLOCKED — no controllers exist** |
| Sensitive data / logging hygiene | PASS (nothing logs yet) |
| Client/UI authority boundaries | PASS |

**Overall verdict: NOT YET PRODUCTION-READY.** The billing data model,
repository layer, entitlement/product-price services, and all UI surfaces
correctly avoid client-side authority and secret exposure. However, the
billing feature has no HTTP controllers, no webhook ingestion service, no
permission guards, and `BillingModule` is not wired into the application
— these must be implemented and re-reviewed (recommended as a dedicated
backend task) before this billing system can process real payments.
