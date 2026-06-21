# Phase 15 — Analytics UI Design System Rules

## Purpose

Document how all analytics/reporting UI must follow the approved AIM design
system at `docs/design/source/aim-design-system`, preventing inconsistent
charts, cards, tables, filters, and export UI across admin, parent, and student
surfaces.

## Required Usage

- Use design tokens from `docs/design/source/aim-design-system/tokens` for all
  color, spacing, typography, radius, and elevation values. No hard-coded hex
  colors, pixel spacing, or ad-hoc font sizes.
- Use shared components from
  `docs/design/source/aim-design-system/components` for cards, tables, badges,
  dialogs, filters, and chart containers before creating anything new.
- If a needed primitive (e.g. a specific chart type) does not exist in the
  shared component set, extend the design system's component layer rather than
  building a one-off styled component inside a feature folder.

## Charts

- Use one consistent chart library/wrapper across all analytics surfaces.
- Chart colors must come from the design system's data-visualization token
  palette, not arbitrary hex values.
- Every chart must have an accessible text alternative (data table or
  aria-label summary) for screen readers.

## Tables

- Use the shared table component for all report/metric tabular data, with
  consistent header, sort, pagination, and empty-state styling.

## Filters

- Use the shared filter/form components (date range, select, multi-select) for
  report/dashboard filters. Filter state is submitted to backend APIs; the UI
  never filters already-fetched aggregate data to produce a "new" metric.

## Cards / Widgets

- Dashboard KPI widgets use the shared card component with a consistent
  layout: label, value, optional trend indicator, optional period label.

## States

- Loading, empty, error, and forbidden states must use the shared state
  components defined in the design system, applied consistently across admin,
  parent, and student analytics surfaces.

## Responsive and RTL

- All analytics layouts must be responsive per the design system's breakpoint
  tokens.
- All analytics layouts must support Arabic/RTL mirroring: chart legends,
  table column order, and filter bars must flip correctly under RTL direction.

## Accessibility

- All interactive analytics elements (filters, export buttons, pagination,
  chart legends) must have accessible labels and a logical keyboard tab order.

## Enforcement

- Any Phase 15 UI task that cannot be implemented using existing design system
  tokens/components must stop and flag the gap rather than introducing one-off
  styling.

## Dependencies

- P15-001 — Analytics and Reports Charter.
- AIM Design System (`docs/design/source/aim-design-system`).
