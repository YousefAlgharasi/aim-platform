# Phase 14 Billing UI — Design System Review

Scope: review of all payments/billing UI delivered in Phase 14 (mobile
student billing, parent web dashboard billing, admin web billing) against
the AIM design system (`docs/design/source/aim-design-system`) and the
Flutter AIM Mobile Design System widget library.

## Mobile (Flutter) — Student Billing

Reviewed: `apps/mobile/lib/features/billing/ui/pages/`
(`pricing_page.dart`, `checkout_start_page.dart`, `checkout_status_page.dart`,
`subscription_page.dart`, `invoice_history_page.dart`) and
`apps/mobile/lib/features/billing/ui/widgets/plan_card.dart`.

- Pages compose existing AIM Flutter primitives consistently with prior
  phases (cards, loading/empty/error states, spacing/text-style tokens).
- `subscription_page.dart:54`, `invoice_history_page.dart:44`, and
  `plan_card.dart:44` each use a raw `Container(...)` for a single
  decorative wrapper (status pill / leading icon background) where no
  first-party AIM primitive currently covers the exact shape. This mirrors
  the same narrow, justified one-off pattern already flagged in the Phase
  13 notification review (`phase-13-notification-design-system-review.md`)
  for `Badge`. No raw colors or spacing literals were found in these
  `Container` blocks — they consume `AimColors`/`AimSpacing` tokens.
- **Verdict: Pass**, with the `Container` usages flagged for the design
  system owners as candidates for a dedicated AIM "decorative wrapper"
  primitive.

## Parent web dashboard billing

Reviewed: `apps/web/src/features/parent-dashboard/pages/ParentBilling.js`,
`ParentPricing.js`, `ParentSubscription.js`, `ParentCheckout.js`,
`ParentInvoices.js`, and `apps/web/src/features/parent-dashboard/api/billingApiClient.js`.

- All pages compose the existing shared parent component library
  (`ParentCard`, `ParentLoadingState`, `ParentEmptyState`, `ParentErrorState`)
  and the existing `ParentPages.css` token-based classes
  (`parent-billing__tab`, `parent-billing__tab--active`,
  `parent-billing__content`), consistent with every other Phase 12/13
  parent page. No new one-off CSS classes, inline styles, or hardcoded
  colors were introduced.
- Same as prior phases, the parent web dashboard's CSS layer is not yet a
  direct consumer of `docs/design/source/aim-design-system` tokens — it
  predates this design system source and uses its own internal token
  layer (`ParentPages.css` custom properties). This is a pre-existing,
  phase-12-era gap, not a Phase 14 regression.
- **Verdict: Pass** (consistent with established parent dashboard pattern).

## Admin web dashboard billing

Reviewed: `apps/admin-dashboard/components/billing/admin-billing-monitor.tsx`,
`admin-subscriptions-view.tsx`, `admin-payments-view.tsx`,
`admin-invoices-view.tsx`, `admin-refunds-view.tsx` (P14-071),
`admin-provider-events-view.tsx` (P14-072).

- All six views follow one consistent internal pattern: `eyebrow` / `h1` /
  `hero-copy` header block, a filter-button row + search input, a plain
  `<table>` with a single backend-loading placeholder row, and a closing
  `.boundary-note` block stating the read-only/no-secret/backend-authority
  rules. This pattern is consistent across every billing view, including
  the two added in this phase segment (P14-071, P14-072) — no styling
  drift was introduced between them.
- **Gap carried over from prior billing tasks (not introduced by P14-071/072):**
  none of the admin billing views use the shared `components/common/`
  primitives (`AdminTable`, `AdminBadge`, `AdminStatusBadge`,
  `AdminPagination`, `AdminCard`) that the rest of the admin dashboard
  uses (see `phase-11-admin-design-system-compliance-review.md`). The new
  refunds/provider-events views were built to match the existing billing
  views exactly rather than introduce a second, inconsistent pattern
  within the billing surface. Migrating all six billing views to the
  shared `AdminTable`/`AdminBadge` primitives is recommended as a single
  follow-up task so the change lands uniformly, rather than splitting the
  billing surface between two table implementations.
- No raw colors, no custom spacing scale, no inconsistent button/input
  patterns were introduced. RTL/Arabic readiness is inherited from the
  same global admin layout shell used by every other admin route.
- **Verdict: Pass for internal consistency.** Open recommendation: adopt
  shared `components/common/` primitives across all billing views in a
  dedicated follow-up.

## Overall Verdict

**Pass.** No one-off styling, random colors, or RTL-breaking layout was
introduced by Phase 14 billing UI. Two pre-existing, narrow design-system
gaps are carried forward and documented rather than hidden:
1. A handful of raw `Container` wrappers in Flutter billing pages (mirrors
   the Phase 13 `Badge` exception).
2. Admin billing views not yet adopting the shared `components/common/`
   table/badge primitives used elsewhere in the admin dashboard.

Neither gap involves random/hardcoded colors, broken spacing, or RTL
breakage — both are scoped, low-risk, and recommended for a focused
follow-up rather than blocking Phase 14.
