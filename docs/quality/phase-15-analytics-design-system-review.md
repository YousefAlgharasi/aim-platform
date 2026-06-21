# Phase 15 — Analytics Design System Review

**Task:** P15-074
**Date:** 2026-06-21
**Reviewer:** GHOST3030

## Scope

Verify all analytics/reporting UI introduced in Phase 15 uses AIM design
system tokens and shared components — no one-off styling, hard-coded hex
colors, custom spacing, or inconsistent chart/table/filter/card primitives.

Surfaces reviewed:
- `apps/web/src/features/admin-analytics/` (P15-057 – P15-066)
- `apps/web/src/features/parent-dashboard/` (P15-068 – P15-071)
- `apps/mobile/lib/features/analytics_summary/` (P15-072 – P15-073)

Reference: `docs/phase-15/analytics-design-system-rules.md`,
`docs/design/source/aim-design-system/tokens/`.

## 1. Color Tokens

| Surface | Uses Design Tokens | Hard-Coded Colors |
|---|---|---|
| Admin analytics (web) | `--color-primary-*`, `--color-neutral-*`, `--color-accent-*`, `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*`, semantic aliases (`--surface`, `--text-primary`, `--text-secondary`, `--border`, `--divider`) | Fallback values only (e.g. `var(--color-neutral-0, #fff)`) |
| Parent dashboard (web) | Same token set via `ParentComponents.css`, `ParentLayout.css`, `ParentPages.css` | Some legacy one-off values in `ParentDashboardShell.css` (`#eff6ff`, `#1d4ed8`, `#fff7ed`, `#c2410c`) — predates Phase 15, not introduced by analytics tasks |
| Student analytics (mobile) | Flutter theme tokens via `Theme.of(context)` | None found |

**Verdict: PASS** — Phase 15 analytics UI uses design system tokens. The
hard-coded values in `ParentDashboardShell.css` are pre-existing (Phase 12)
and out of scope for this review.

## 2. Spacing Tokens

- Admin analytics components use `--space-*` and semantic aliases
  (`--card-padding`, `--section-gap`, `--component-gap`, `--inner-gap`,
  `--screen-padding-web`, `--screen-padding-mobile`) consistently.
- Parent reporting pages (`ParentAnalyticsReports`, `ParentProgressReport`,
  `ParentAssessmentReport`) inherit spacing from `ParentComponents.css` and
  `ParentPages.css`, which use `--space-*` tokens throughout.
- Mobile analytics summary uses Flutter's `SizedBox` and `EdgeInsets` with
  values that correspond to the 8-point grid (8, 12, 16, 24).
- **Verdict: PASS.**

## 3. Typography Tokens

- Admin analytics uses `--type-h1-size`, `--type-h2-size`, `--type-h3-size`,
  `--type-body-size`, `--weight-semibold`, `--weight-medium` via CSS
  custom properties.
- Parent reporting inherits the same tokens from `ParentComponents.css`.
- **Verdict: PASS.**

## 4. Shared Components

| Primitive | Admin Analytics | Parent Analytics |
|---|---|---|
| Card | `AnalyticsKpiCard` (new, follows card token contract) | `ParentCard` |
| Table | `AnalyticsTableShell` (new) | `ParentTable` |
| Chart container | `AnalyticsChartShell` (new) | `ParentChartShell` |
| Filter bar | `AnalyticsFilterBar` (new) | N/A (parent uses per-page controls) |
| Badge | Inline status labels using `-soft` token pairs | `ParentBadge` |
| Loading state | `AdminAnalyticsShell` loading status | `ParentLoadingState` |
| Empty state | `AdminAnalyticsShell` empty status | `ParentEmptyState` |
| Error state | `AdminAnalyticsShell` error status | `ParentErrorState` |

All new admin analytics components follow the design system's component
contract (token-based colors, spacing, radius, elevation).

**Verdict: PASS.**

## 5. Responsive Layout and RTL

- Admin analytics layout uses `AnalyticsPageLayout` with CSS Grid/Flexbox,
  `max-width: var(--content-max-web)`, mobile breakpoint at 768px, and
  `border-inline-*` / `inset-inline-*` for RTL support.
- Arabic labels are used throughout (`لوحة التحليلات`, `نظرة عامة`, etc.).
- Parent analytics pages inherit RTL-ready layout from `ParentLayout`
  (`dir="auto"`, `border-inline-end`, `inset-inline-start`).
- **Verdict: PASS.**

## 6. Accessibility

- `aria-label` attributes on all page sections and interactive controls.
- `role="status"` for loading states, `role="alert"` for error states.
- Keyboard-navigable filter bars and sidebar navigation.
- **Verdict: PASS.**

## 7. States Coverage

All analytics pages implement the four required states:
- **Loading:** Visible spinner/text with `role="status"`.
- **Empty:** Explicit empty-state message.
- **Error:** Styled error message with `role="alert"`.
- **Forbidden:** 403 state rendered when access is denied.
- **Verdict: PASS.**

## Overall Verdict

**APPROVED** — All Phase 15 analytics/reporting UI follows the AIM design
system. No blocking issues found.

## Limitations

- The pre-existing `ParentDashboardShell.css` (Phase 12) has some hard-coded
  status colors that should be migrated to design system tokens in a future
  cleanup pass — this is not a Phase 15 regression.
- Chart data-visualization color palette tokens are not yet defined in the
  design system; chart shells currently use `--color-primary-*` /
  `--color-accent-*` as a substitute. A dedicated data-vis palette should
  be added to the token set.
