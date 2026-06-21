# Phase 15 Readiness Checklist — From Phase 14

This document records what Phase 14 (Payments and Billing) has prepared
for Phase 15 (Analytics/Reporting), and what handoff items remain. No
Phase 15 analytics or reporting feature is implemented here — this is a
readiness document only.

---

## 1. Billing data available as future analytics input

Phase 14 built a complete billing data model that Phase 15 can read from
(read-only) once analytics/reporting work begins.

### What is ready

| Component | Status | Phase 15 usage |
|---|---|---|
| `products` / `prices` / `plans` tables | Schema ready | Revenue-by-product/plan breakdowns |
| `subscriptions` table | Schema ready | Active/churned subscriber counts, MRR/ARR inputs |
| `checkout_sessions` table | Schema ready | Funnel/conversion analytics (pricing view → checkout → payment) |
| `payments` table | Schema ready | Payment volume, success/failure-rate reporting |
| `invoices` / `invoice_items` tables | Schema ready | Revenue recognition, invoice aging reports |
| `refunds` table | Schema ready | Refund-rate and refund-reason reporting |
| `coupons` / `promotion_codes` tables | Schema ready | Discount/promotion effectiveness reporting |
| `payment_provider_events` table | Schema ready | Webhook reliability/processing-latency reporting |
| `billing_audit_logs` table | Schema ready (unused by services yet) | Compliance/audit trail reporting |
| `entitlement.service.ts` | Implemented | Entitlement coverage / feature-access reporting |
| `product-price.service.ts` | Implemented | Pricing-tier distribution reporting |

### What Phase 15 needs to add

1. **Read-only analytics queries against billing tables.** Phase 15 must
   add its own reporting queries/services — it must never write to
   billing tables, and must never recompute payment/subscription/refund
   status itself (those remain backend/provider authority per the
   Phase 14 charter).
2. **Backend completion is a prerequisite.** As documented in
   `docs/quality/phase-14-billing-security-review.md` and
   `phase-14-billing-architecture-review.md`, the billing feature
   currently has no HTTP controller layer, no webhook/provider-event
   processing service, and `BillingModule` is not wired into
   `app.module.ts`. Phase 15 reporting on live data is blocked until
   that backend work lands — reporting against the current schema would
   only see empty/test-fixture data.
3. **Audit log population.** `billing_audit_logs` exists but no service
   writes to it yet (`createAuditLog`/`findAuditLogs` repository methods
   are unused). Phase 15 compliance reporting depends on this being
   wired up as part of the backend completion work in item 2.
4. **No new analytics dashboard in Phase 14.** Per the Phase 14 charter,
   "Do not implement Phase 15 analytics except readiness documentation,"
   so this document intentionally stops at identifying readiness — it
   does not implement any reporting query, dashboard, or aggregation.

## 2. UI surfaces available for future analytics display

| Surface | Status | Phase 15 usage |
|---|---|---|
| Admin billing monitor overview tab (`admin-billing-monitor.tsx`) | Stat-card placeholders only (`StatCard` with `"—"` values) | Natural insertion point for real MRR/revenue/failed-payment stat cards once backend reporting exists |
| Admin refunds/provider-events views (P14-071, P14-072) | Read-only list views | Could be extended with admin-only aggregate panels (e.g. refund-rate-by-reason) once backend supports it |

## 3. Risks Phase 15 must account for

- **Do not treat schema existence as data availability.** Tables exist;
  they are largely unpopulated because the services that would write to
  them (checkout, webhook/provider-event processing) are not implemented
  yet (see `phase-14-billing-checkout-e2e-check.md`).
- **Do not give Phase 15 UI/reporting any write or status-decision
  authority over billing entities** — this would violate the same
  backend/provider-authority rule Phase 14 enforces, and must continue to
  be enforced in Phase 15.
- **No raw card data, provider secrets, or sensitive payloads should ever
  flow into analytics/reporting outputs** — only safe, aggregated
  metadata, consistent with `phase-14-billing-compliance-review.md`.

## Summary

Phase 14 leaves Phase 15 a complete, well-typed billing schema and two
implemented services (entitlement, pricing) to report against, plus clear
UI insertion points for future stats. The primary blocker for Phase 15
billing analytics is not this readiness work — it is the still-open
backend completion (controllers, provider adapter, webhook service,
module wiring) documented in Phase 14's security and architecture
reviews, which must land first so there is real data to analyze.
