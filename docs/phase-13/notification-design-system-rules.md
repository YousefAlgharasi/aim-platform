# Phase 13 — Notification UI Design System Rules

**Dependencies:** P13-001 (Charter), DES-001 (AIM Design System)

## Purpose

Document how all notification/reminder UI must use the approved AIM design
system (`docs/design/source/aim-design-system`), preventing one-off styling
across student, parent, and admin surfaces.

## Tokens and Foundations

- **Color** — Build with semantic aliases (`--surface`, `--text-primary`,
  `--border`, `--primary-soft` + `--primary-soft-fg`, etc.), never raw scale
  steps in notification UI. Unread notification rows use `--primary-soft` as
  background, not a custom highlight color. Status colors follow the existing
  mapping: success=delivered/read-confirmed, primary=active reminder, warning=
  retry/needs-attention (admin oversight only), neutral=disabled/paused,
  error=failed.
- **AI gradient** — Not used for notification UI. Notifications are not an
  "AI-generated" surface; reserve the gradient for AI tutor/AI-card contexts
  elsewhere in the app.
- **Typography** — Use role shorthands (`--type-body-md`, `--type-h2`,
  `--type-button`, etc.). Notification list titles use the body/label scale,
  not ad-hoc font sizes. Arabic blocks use the existing `--ar-line-scale`
  adjustment; no manual line-height overrides.
- **Spacing** — 8-point grid. Notification list rows, preference toggle rows,
  and digest cards use `--space-16`/`--space-20` padding consistent with other
  list/card patterns already in the app.
- **Radius/elevation** — Cards/sheets use `--radius-lg`/`--radius-xl` per
  existing card/sheet conventions; notification toasts (if used) follow
  `--shadow-sheet`/`--shadow-modal` rules, not custom shadows.
- **Motion** — Badge count updates and list item read-state transitions use
  `--duration-fast`/`--ease-standard` and honor `prefers-reduced-motion`.

## Shared Components

- Reuse existing list, toggle, badge, empty-state, and error-state components
  from the design system component library wherever they exist. New
  notification-specific components (e.g. notification list item, time-window
  picker) must be added to the shared component set — not built as one-off,
  screen-local widgets duplicated across student/parent/admin code.

## Responsive Layout

- Notification inbox and preferences screens must work at mobile widths first
  (per the design system's mobile-first posture) and respond correctly on
  larger admin/parent web breakpoints using the system's existing layout rules.

## Arabic / RTL Readiness

- All notification UI strings ship in English and Arabic.
- Layouts mirror correctly under `dir="rtl"` with no hardcoded left/right
  positioning (use logical properties / the design system's existing RTL-safe
  patterns).
- Numbers, timestamps, and quiet-hour time values remain LTR even inside
  RTL-set text, per existing design system content rules.

## Accessibility

- All interactive elements (toggle rows, mark-read/dismiss actions, reminder
  create/cancel buttons) meet the `--touch-target` minimum (44px).
- Icon-only controls (e.g. dismiss "x") require an `ariaLabel`.
- Every interactive element has a visible focus ring (`--shadow-focus`).
- Loading/empty/error/forbidden states use accessible, non-color-only signaling
  (icon + text), consistent with existing design system state patterns.

## Prohibited Patterns

- No inline hex colors, custom px font sizes, or ad-hoc spacing values in
  notification UI code.
- No notification-specific shadow/elevation values outside the documented
  tokens.
- No duplicated component implementations per surface (student/parent/admin)
  when a shared component already covers the pattern.
