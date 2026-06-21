# Phase 14 — Billing UI E2E Check

**Scope:** End-to-end check of student (mobile), parent (web), and admin
(web) billing UI flows delivered in Phase 14.

## Student (Flutter Mobile)

Reviewed: `apps/mobile/lib/features/billing/ui/pages/`
(`pricing_page.dart`, `checkout_start_page.dart`, `checkout_status_page.dart`,
`subscription_page.dart`, `invoice_history_page.dart`).

- Flow: pricing list → start checkout → checkout status → subscription
  view → invoice history, each page reading from
  `billing_repository_impl.dart` / `billing_datasource.dart`.
- Covered by `apps/mobile/test/features/billing/billing_models_test.dart`
  and `billing_ui_test.dart` (P14-062 output), which assert UI renders
  backend-supplied state without computing price/payment/subscription
  status locally.
- **Verdict: UI flow PASS** — wiring is internally consistent and
  authority-safe. Cannot be run against a live backend because no
  checkout/payment HTTP endpoint exists yet (see
  `phase-14-billing-checkout-e2e-check.md`); the datasource layer is
  built against the intended contract, not a running API.

## Parent (Web Dashboard)

Reviewed: `apps/web/src/features/parent-dashboard/pages/ParentBilling.js`,
`ParentPricing.js`, `ParentSubscription.js`, `ParentCheckout.js`,
`ParentInvoices.js`, `apps/web/src/features/parent-dashboard/api/billingApiClient.js`.

- Covered by `apps/web/src/features/parent-dashboard/__tests__/parent-billing-ui.test.js`
  (P14-067 output), which asserts the parent billing UI never processes
  payments client-side, never stores card data, and always defers to
  backend authority.
- Flow: billing shell with subscription/invoices/plans tabs, backed by
  `ParentLoadingState`/`ParentEmptyState`/`ParentErrorState` for the three
  states a real backend call can produce.
- **Verdict: UI flow PASS** for the same reason as mobile — internally
  consistent and authority-safe, not yet runnable end-to-end against a
  live backend.

## Admin (Web Dashboard)

Reviewed: `admin-billing-monitor.tsx`, `admin-subscriptions-view.tsx`,
`admin-payments-view.tsx`, `admin-invoices-view.tsx`,
`admin-refunds-view.tsx` (P14-071), `admin-provider-events-view.tsx`
(P14-072), all covered by `apps/admin-dashboard/__tests__/billing/*.test.tsx`
(P14-073 output, 6 suites / 22 tests, all passing as of this check).

- Flow: monitor overview tabs into each sub-view; each standalone view
  supports filter-by-status and free-text search, with a single
  backend-loading row standing in for real data and a `.boundary-note`
  stating read-only/no-secret/backend-authority rules.
- Tests assert filter-button active-state toggling, search input
  behavior, and presence of every boundary-note rule per view; the
  refunds and provider-events tests additionally assert no raw
  card/secret strings are ever rendered.
- **Verdict: UI flow PASS.** Runnable today as static/mocked UI; full
  end-to-end with live data is blocked on the missing `GET
  /admin/billing/*` controller endpoints (see
  `phase-14-billing-security-review.md` §4).

## Summary

| Surface | Internal flow consistency | Authority-safe (no client decides status) | Live backend E2E |
|---|---|---|---|
| Student (mobile) | PASS | PASS | BLOCKED — no checkout/payment endpoint |
| Parent (web) | PASS | PASS | BLOCKED — same |
| Admin (web) | PASS | PASS | BLOCKED — no admin billing controller |

**Overall verdict: PASS for UI-level flow and authority correctness
across all three surfaces.** True end-to-end verification against a live
backend is blocked on the backend implementation gaps already documented
in `phase-14-billing-security-review.md` and
`phase-14-billing-architecture-review.md`, and should be re-run once those
land.
