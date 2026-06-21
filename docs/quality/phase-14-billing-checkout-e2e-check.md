# Phase 14 — Billing Checkout E2E Check

**Scope:** End-to-end flow check for pricing → checkout → provider event →
entitlement, based on the current state of
`services/backend-api/src/features/billing/` (`checkout-flow.spec.ts`,
`entitlement.spec.ts`, `refund.spec.ts`).

## Flow Under Test

```
pricing (product-price.service.ts)
   → checkout session creation
   → provider event (webhook) processing
   → entitlement grant (entitlement.service.ts)
```

## What Exists Today

- `product-price.service.ts` (135 lines) implements pricing lookup logic
  and is exercised indirectly through `checkout-flow.spec.ts`.
- `checkout-flow.spec.ts` (151 lines) defines the expected checkout
  contract against mocked dependencies — it documents the intended
  request/response shape for starting a checkout session and the
  expected transition into a payment/subscription record once a provider
  event confirms success.
- `entitlement.service.ts` (115 lines) and `entitlement.spec.ts` (135
  lines) define how entitlement state should be derived once a payment or
  subscription is confirmed.
- The `payment_provider_events` table and `findProviderEventByEventId` /
  `createProviderEvent` repository methods exist to receive and
  deduplicate the provider event step.

## What Cannot Be Verified End-to-End Yet

- There is no checkout controller, no `CheckoutService` implementation
  (only referenced by name in `billing.module.ts`), and no webhook
  ingestion endpoint. This means the chain
  "pricing → checkout → provider event → entitlement" can be verified
  **unit-by-unit against mocks**, but not as a real, running HTTP flow.
- `checkout-flow.spec.ts` and `entitlement.spec.ts` both mock their
  collaborators rather than calling real services, so green specs confirm
  the *contract*, not the *integration*.
- This gap matches the blockers already raised in
  `phase-14-billing-security-review.md` (§2 webhook verification, §4
  permission guards) and `phase-14-billing-architecture-review.md`
  (missing `CheckoutService`, no controller layer, no provider adapter).

## Result of This Check

| Step | Contract Defined | Unit-Tested (mocked) | Integration-Verified |
|---|---|---|---|
| Pricing | YES (`product-price.service.ts`) | YES | N/A — pure function, no I/O |
| Checkout session creation | YES (spec contract) | YES (mocked) | NO — no `CheckoutService`/controller |
| Provider event processing | Schema only | NO | NO — no webhook service |
| Entitlement grant | YES (`entitlement.service.ts`) | YES (mocked) | NO — no real upstream event to trigger it |

**Verdict: BLOCKED for full end-to-end verification.** The pricing and
entitlement units are implemented and unit-tested; checkout-session
creation and provider-event processing are not yet implemented as real
services, so the end-to-end chain cannot be exercised against running
code. This check should be re-run once `CheckoutService` and the
webhook/provider-event service from the architecture review are
implemented.

## Recommended Next Step

Implement `CheckoutService` and a webhook/provider-event processing
service per `phase-14-billing-architecture-review.md`, then replace this
document's mock-based table with a real integration test exercising the
full chain against a test database and a stubbed provider adapter.
