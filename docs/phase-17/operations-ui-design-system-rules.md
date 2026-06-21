# Phase 17 — Operations UI Design System Rules

**Task:** P17-008
**Date:** 2026-06-21
**Author:** GHOST3030

## Purpose

Document how all operations, support, and status UI must follow the approved AIM design system. Prevent one-off styling in post-launch UI.

## Design System Source

All Phase 17 UI must reference:
```
docs/design/source/aim-design-system
```

## Required Token Usage

### Colors

| Usage | Token | Notes |
|---|---|---|
| Success/resolved status | `--color-success` | Green states |
| Warning/degraded status | `--color-warning` | Yellow states |
| Error/critical status | `--color-error` | Red states |
| Info/maintenance status | `--color-info` | Blue states |
| Primary actions | `--color-primary` | Buttons, links |
| Surface backgrounds | `--color-surface` | Cards, panels |
| Text | `--color-text-primary`, `--color-text-secondary` | Body, labels |

### Typography

| Usage | Token |
|---|---|
| Page headings | `--type-heading-lg` |
| Section headings | `--type-heading-md` |
| Card titles | `--type-heading-sm` |
| Body text | `--type-body` |
| Labels and captions | `--type-caption` |
| Monospace (IDs, codes) | `--type-mono` |

### Spacing

| Usage | Token |
|---|---|
| Page padding | `--space-lg` |
| Card padding | `--space-md` |
| Element gaps | `--space-sm` |
| Inline spacing | `--space-xs` |

### Radius and Elevation

| Usage | Token |
|---|---|
| Cards and panels | `--radius-md`, `--shadow-sm` |
| Buttons | `--radius-sm` |
| Badges and chips | `--radius-full` |
| Dialogs | `--radius-lg`, `--shadow-lg` |

## Component Patterns

### Status Badges

Use shared badge component with semantic color tokens:
- `operational` → `--color-success`
- `degraded` → `--color-warning`
- `partial_outage` / `major_outage` → `--color-error`
- `maintenance` → `--color-info`
- Ticket statuses: `open` → info, `in_progress` → warning, `resolved`/`closed` → success

### Support Ticket Cards

- Use shared card component with `--radius-md`, `--shadow-sm`
- Subject as `--type-heading-sm`
- Category and severity as badge chips
- Status badge in top-right
- Timestamps as `--type-caption`

### Tables

- Use shared table component
- Sortable columns where applicable
- Pagination from backend API
- Empty state with `--color-text-secondary` message

### Forms

- Use shared form input, textarea, select components
- Validation errors in `--color-error`
- Labels with `--type-caption`
- Submit buttons with `--color-primary`

### Loading, Empty, Error, Forbidden States

| State | Pattern |
|---|---|
| Loading | Shared spinner/skeleton with `--color-primary` |
| Empty | Centered text with `--color-text-secondary`, optional icon |
| Error | Error card with `--color-error` border, retry action |
| Forbidden | 403 message, no data leakage |

## Layout Rules

- Responsive: mobile-first, breakpoints per design system
- Arabic/RTL: all layouts must support `dir="rtl"`
- No fixed pixel widths on containers
- Use flexbox/grid with design system gap tokens

## Prohibited Patterns

- Hard-coded hex/rgb colors
- Custom spacing values outside tokens
- Inline styles that bypass the design system
- One-off card/table/badge components
- Layout patterns that break RTL
- Client-side status computation (display backend values only)

## Verdict

**READY** — Operations UI design system rules documented. All Phase 17 UI must follow these rules.
