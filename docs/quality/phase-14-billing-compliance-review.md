# Phase 14 — Billing Compliance Review

**Scope:** No raw card storage, provider redirection model, invoice/refund
handling, and sensitive logging rules across the Phase 14 billing
implementation.

## 1. No Raw Card Storage

- `services/backend-api/src/features/billing/billing.entities.ts` and
  `billing.dtos.ts` contain no card number, CVV/CVC, or PAN fields. The
  only card-related field is `payment.paymentMethodType: 'card' | ...`
  (`billing.entities.ts:109`), a payment-method category label, not raw
  card data.
- `sensitive-data.spec.ts` asserts this deny-list at the type level.
- No Prisma migration defines a card-data column; `refunds`,
  `payment_provider_events`, and other billing tables store only
  identifiers, amounts, statuses, and provider references.
- Mobile/parent/admin billing UI never collects or displays card number,
  CVV/CVC, or full PAN — all checkout UI documented in the prompt set
  defers card entry to the payment provider's own hosted flow.
- **Verdict: PASS.** No raw card data is stored or planned to be stored
  anywhere in this codebase.

## 2. Provider Redirection Model

- Checkout pages (`apps/mobile/lib/features/billing/ui/pages/checkout_start_page.dart`,
  `checkout_status_page.dart`, `apps/web/src/features/parent-dashboard/pages/ParentCheckout.js`)
  are structured around starting a checkout session and displaying its
  backend-reported status — consistent with redirecting the user to a
  provider-hosted checkout/payment page rather than collecting payment
  details directly.
- No backend checkout controller exists yet to confirm the actual
  redirect target or session-creation contract (see
  `phase-14-billing-security-review.md` §2/§4) — the UI-side pattern is
  compliant, but end-to-end verification is blocked on the missing
  backend checkout service.
- **Verdict: PASS for UI pattern; BLOCKED for end-to-end verification**
  pending backend checkout/webhook implementation.

## 3. Invoice / Refund Handling

- Invoice and refund entities (`billing.entities.ts:147` `Refund`, and the
  `Invoice`/`InvoiceItem` entities) model status as an authority-owned
  enum (e.g. refund status: pending/succeeded/failed/canceled/denied) —
  never a free-form client-writable field.
- Admin invoices view (`admin-invoices-view.tsx`) and admin refunds view
  (`admin-refunds-view.tsx`, P14-071) are both read-only; the refunds view
  explicitly disables its action column until a protected backend
  refund-action endpoint exists, rather than allowing the UI to assume
  refund authority prematurely.
- `refund.spec.ts` exercises `requestRefund/approveRefund/denyRefund/getRefundById/syncProviderRefundStatus`
  against mocks, establishing the intended contract, though the real
  `RefundService` implementing it does not exist yet (see security review
  §4).
- **Verdict: PASS for compliance posture** (no client-side status
  authority anywhere); implementation completeness is a security/
  architecture concern tracked separately, not a compliance violation.

## 4. Sensitive Logging Rules

- No logging statement exists anywhere in the billing feature folder
  (confirmed via grep for `console.log`/`logger.*`), so no sensitive
  provider payload, webhook secret, or payment credential is currently
  logged.
- Admin provider-events view (P14-072) explicitly states only safe
  metadata (event id, type, processing status, idempotency key,
  timestamps) is rendered — raw provider payloads and signing secrets are
  never displayed to admin users.
- **Verdict: PASS.** No violation today; this must be re-verified once a
  webhook/event-processing service is implemented and begins logging, to
  ensure secrets and full payloads are redacted at that point.

## Summary

| Compliance Area | Status |
|---|---|
| No raw card data stored | PASS |
| Provider redirection model (UI pattern) | PASS |
| Provider redirection (end-to-end) | BLOCKED — pending backend checkout service |
| Invoice status authority backend-owned | PASS |
| Refund status authority backend-owned | PASS |
| Sensitive payload/secret logging | PASS (nothing logs yet — re-verify once webhook service ships) |

**Overall verdict: PASS for everything currently implemented.** No
compliance violation was found. The one open item — end-to-end
verification of the provider redirection and webhook flow — is blocked on
the same missing backend controller/webhook-service gap already raised in
`phase-14-billing-security-review.md`, and is tracked there rather than
duplicated as a compliance failure.
