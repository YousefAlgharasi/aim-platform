# Phase 14 — Billing Architecture Review

**Scope:** Backend/API/UI/provider architecture, feature boundaries, and
maintainability of the Phase 14 billing system.

## System Layers (as built)

```
┌──────────────────────────────────────────────┐
│ Mobile (Flutter) — apps/mobile/lib/features/billing/   │
│ Parent Web — apps/web/src/features/parent-dashboard/   │
│ Admin Web — apps/admin-dashboard/components/billing/   │
│  (display-only, defer all authority to backend)        │
├──────────────────────────────────────────────┤
│ Backend API — services/backend-api/src/features/billing/ │
│ ├── billing.entities.ts      (type contracts)           │
│ ├── billing.repository.ts    (raw SQL data access)       │
│ ├── billing.dtos.ts / billing.validation.ts              │
│ ├── entitlement.service.ts   (entitlement logic)         │
│ ├── product-price.service.ts (pricing logic)             │
│ ├── billing.module.ts        (NOT wired into app.module) │
│ └── *.spec.ts                (mock-driven contract tests)│
├──────────────────────────────────────────────┤
│ Provider (Stripe-shaped) — NOT YET IMPLEMENTED            │
│   no adapter, no webhook controller, no signature check  │
├──────────────────────────────────────────────┤
│ Database — Prisma migrations for products/prices/plans/  │
│ subscriptions/checkout/payments/invoices/refunds/coupons/ │
│ provider events/audit logs (schema complete)              │
└──────────────────────────────────────────────┘
```

## Feature Boundaries

- The billing feature folder is self-contained
  (`services/backend-api/src/features/billing/`), consistent with this
  repository's existing feature-based architecture — no billing logic
  leaks into unrelated features.
- UI layers (mobile/parent/admin) each consume billing through their own
  feature-scoped API client (`billingApiClient.js`, the mobile
  `billing_datasource.dart`/`billing_repository_impl.dart`, and the admin
  views' documented `GET /admin/billing/*` contract) rather than reaching
  into backend internals directly — boundary is clean even though the
  backend endpoints themselves don't exist yet.
- Entitlement logic is isolated in `entitlement.service.ts` rather than
  inlined into subscription/checkout logic, which is the correct
  separation for a concept that multiple billing flows (subscriptions,
  refunds, provider events) need to consult.

## Maintainability Gaps

1. **`billing.module.ts` references two services that don't exist**
   (`SubscriptionService`, `CheckoutService`) and the module itself is
   never imported by `app.module.ts`. This means the billing feature
   cannot currently be exercised as a running NestJS module — it is
   data-model and repository scaffolding plus mock-driven spec files, not
   a deployable feature yet.
2. **No controller layer exists** for any billing concern (products,
   prices, checkout, payments, invoices, refunds, provider events, admin
   read endpoints). All current tests (`checkout-flow.spec.ts`,
   `refund.spec.ts`, `entitlement.spec.ts`, `sensitive-data.spec.ts`)
   exercise hand-rolled `jest.fn()` mocks rather than real service/
   controller code, so passing specs do not yet indicate a working HTTP
   surface — they confirm the *intended contract*, which is valuable for
   driving the next implementation step but should not be read as
   integration coverage.
3. **No provider adapter** exists to isolate Stripe-specific (or any
   provider-specific) logic behind an interface, which the platform's own
   rules require ("Use provider abstraction"). This must be added before
   any webhook or checkout-session-creation code is written, so the
   provider can be swapped or mocked without touching business logic.
4. **Admin billing UI duplicates a hand-rolled table/filter pattern six
   times** (`admin-subscriptions-view.tsx`, `-payments-view.tsx`,
   `-invoices-view.tsx`, `-refunds-view.tsx`, `-provider-events-view.tsx`,
   plus the tabbed `admin-billing-monitor.tsx`) instead of using the
   shared `components/common/AdminTable` used elsewhere in the admin
   dashboard. This was a deliberate choice in P14-071/072 to stay
   consistent with the existing billing-view pattern rather than
   introduce a second table implementation mid-feature (see
   `phase-14-billing-design-system-review.md`), but it is technical debt
   worth a dedicated follow-up once the billing surface stabilizes.

## Recommendations

1. Implement `SubscriptionService` and `CheckoutService` referenced by
   `billing.module.ts`, then wire `BillingModule` into `app.module.ts`.
2. Add billing controllers with permission guards, backed by the existing
   repository/service layer.
3. Add a provider adapter interface (e.g. `PaymentProviderAdapter`) with a
   Stripe implementation behind it, including webhook signature
   verification and idempotent event processing using the existing
   `findProviderEventByEventId`/`createProviderEvent` repository methods.
4. Once the above lands, migrate all six admin billing views to the
   shared `components/common/` primitives in one consistent pass.

## Verdict

**Architecturally sound at the design level** — feature boundaries,
layering, and the entitlement/pricing separation are correct and
consistent with the rest of the codebase. **Not yet a deployable
feature** — the controller, provider-adapter, and module-wiring layers
that turn this scaffolding into a running billing system are the
remaining work, already flagged in the security review as blockers.
