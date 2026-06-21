# Phase 12 — Parent Dashboard Design System Rules

**Date:** 2026-06-20
**Task:** P12-004
**Author:** GHOST3030
**Dependencies:** P12-001 (Charter), DES-001 (AIM Design System)

---

## 1. Purpose

All parent dashboard UI must use the approved AIM design system from `docs/design/source/aim-design-system`. This document specifies how parent UI components, pages, and layouts must apply design tokens, components, and patterns. No one-off styling is permitted.

---

## 2. Design Token Reference

### 2.1 Colors

Use CSS custom properties from `tokens/colors.css`. Never use hard-coded hex/rgb values.

| Usage | Token |
|---|---|
| Page background | `--background` |
| Card/container surface | `--surface` |
| Elevated surface | `--surface-raised` |
| Inset/sunken surface | `--surface-sunken` |
| Primary text | `--text-primary` |
| Secondary text | `--text-secondary` |
| Muted/helper text | `--text-muted` |
| Text on primary buttons | `--text-on-primary` |
| Links | `--text-link` |
| Borders | `--border` |
| Strong borders | `--border-strong` |
| Dividers | `--divider` |
| Focus ring | `--focus-ring` |

**Status colors** (for badges, alerts, progress indicators):

| Status | Background | Foreground |
|---|---|---|
| Success | `--success-soft` | `--success-soft-fg` |
| Warning | `--warning-soft` | `--warning-soft-fg` |
| Error | `--error-soft` | `--error-soft-fg` |
| Info | `--info-soft` | `--info-soft-fg` |
| Primary | `--primary-soft` | `--primary-soft-fg` |
| Secondary | `--secondary-soft` | `--secondary-soft-fg` |
| Accent | `--accent-soft` | `--accent-soft-fg` |

**Interaction states:**

| State | Token |
|---|---|
| Hover | `--state-hover` |
| Pressed | `--state-pressed` |
| Disabled bg | `--disabled-bg` |
| Disabled fg | `--disabled-fg` |
| Disabled border | `--disabled-border` |

### 2.2 Typography

Use tokens from `tokens/typography.css`. Never set font sizes, weights, or line heights directly.

| Usage | Shorthand Token |
|---|---|
| Page title | `--type-h1` |
| Section heading | `--type-h2` |
| Subsection heading | `--type-h3` |
| Card title | `--type-title` |
| Body large | `--type-body-lg` |
| Body default | `--type-body-md` |
| Body small | `--type-body-sm` |
| Caption/metadata | `--type-caption` |
| Button text | `--type-button` |
| Label | `--type-label` |
| Helper text | `--type-helper` |

**Fonts:**
- English: `--font-en` (Inter)
- Arabic: `--font-ar` (IBM Plex Sans Arabic)
- Monospace: `--font-mono`
- Auto-switch: `--font-sans` resolves to `--font-ar` under `[dir="rtl"]`

**Arabic line height:** Multiply line heights by `--ar-line-scale` (1.18) for RTL content.

### 2.3 Spacing

Use tokens from `tokens/spacing.css`. Never use arbitrary pixel values.

| Token | Value | Usage |
|---|---|---|
| `--space-4` | 4px | Tight inner gaps |
| `--space-8` | 8px | Inner gap (`--inner-gap`) |
| `--space-12` | 12px | Component gap (`--component-gap`), list item gap |
| `--space-16` | 16px | Card padding, mobile screen padding, form field gap |
| `--space-20` | 20px | Large card padding |
| `--space-24` | 24px | Section gap, web screen padding |
| `--space-32` | 32px | Large section spacing |
| `--space-40` | 40px | Page-level spacing |
| `--space-48` | 48px | Major section breaks |
| `--space-64` | 64px | Page top/bottom margins |

**Semantic spacing aliases:**

| Alias | Token |
|---|---|
| `--screen-padding-mobile` | `--space-16` |
| `--screen-padding-web` | `--space-24` |
| `--card-padding` | `--space-16` |
| `--card-padding-lg` | `--space-20` |
| `--section-gap` | `--space-24` |
| `--component-gap` | `--space-12` |
| `--inner-gap` | `--space-8` |

### 2.4 Radius

Use tokens from `tokens/radius.css`.

| Token | Value | Usage |
|---|---|---|
| `--radius-xs` | 6px | Small chips, tags |
| `--radius-sm` | 8px | Inputs, small cards |
| `--radius-md` | 12px | Cards, containers |
| `--radius-lg` | 16px | Large cards, modals |
| `--radius-xl` | 24px | Sheets, panels |
| `--radius-pill` | 999px | Pill buttons, badges |
| `--radius-full` | 50% | Avatars, circular elements |

### 2.5 Elevation / Shadows

Use tokens from `tokens/shadows.css`.

| Token | Usage |
|---|---|
| `--shadow-card` | Default card elevation |
| `--shadow-card-hover` | Card hover state |
| `--shadow-dropdown` | Dropdown menus, popovers |
| `--shadow-modal` | Modal dialogs |
| `--shadow-sheet` | Bottom sheets |
| `--shadow-focus` | Focus ring shadow |

### 2.6 Sizes

| Token | Value | Usage |
|---|---|---|
| `--size-btn-sm` | 36px | Small buttons |
| `--size-btn-md` | 44px | Default buttons |
| `--size-btn-lg` | 52px | Large buttons |
| `--size-input` | 48px | Default inputs |
| `--touch-target` | 44px | Minimum tap target |
| `--content-max-web` | 1200px | Max content width |
| `--sidebar-width` | 260px | Sidebar navigation |
| `--top-bar-height` | 56px | Top app bar |

---

## 3. Component Usage

### 3.1 Available Design System Components

Use these components from the AIM design system before creating new ones:

| Category | Components |
|---|---|
| Buttons | Button, Fab, IconButton |
| Feedback | AlertBanner, Badge, Chip, Skeleton |
| Forms | Checkbox, Input, OTPInput, Radio, Select, Switch, Textarea |
| Learning | Card, CircularProgress, ProgressBar |
| Navigation | BottomNav, SegmentedControl, Tabs, TopAppBar |

### 3.2 Parent-Specific Components

When a parent-specific component is needed (e.g., ParentTable, ParentCard), it must:

- Extend or wrap an existing design system component
- Use only design tokens for all styling
- Follow the same API patterns as existing components
- Support RTL layout
- Include accessible labels and ARIA attributes
- Handle loading, empty, error, and forbidden states

---

## 4. Layout Rules

### 4.1 Page Layout

- Max content width: `--content-max-web` (1200px)
- Sidebar width: `--sidebar-width` (260px)
- Top bar height: `--top-bar-height` (56px)
- Screen padding: `--screen-padding-web` for desktop, `--screen-padding-mobile` for mobile

### 4.2 Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Single column, bottom nav, mobile padding |
| Tablet | 768px–1024px | Collapsible sidebar, adjusted spacing |
| Desktop | > 1024px | Sidebar + main content area |

### 4.3 RTL / Arabic Support

- All layouts must work with `dir="rtl"`
- Use logical properties (`margin-inline-start`, `padding-inline-end`) instead of physical (`margin-left`, `padding-right`)
- Font switches automatically via `--font-sans` under `[dir="rtl"]`
- Apply `--ar-line-scale` (1.18x) line height multiplier for Arabic text
- Icons that indicate direction (arrows, chevrons) must flip in RTL
- Tables and lists must reverse column/item order in RTL

---

## 5. State Patterns

Every parent UI view must handle these states consistently:

### 5.1 Loading State

- Use `Skeleton` component for content placeholders
- Show skeleton shapes that match the expected content layout
- Never show empty or stale content while loading

### 5.2 Empty State

- Center an illustration or icon with a clear message
- Use `--text-secondary` for the message
- Include an action button if applicable (e.g., "Link a child")

### 5.3 Error State

- Use `AlertBanner` with error variant
- Show a user-friendly message (never raw error details)
- Include a retry action when possible

### 5.4 Forbidden State (403)

- Show a clear "access denied" message
- Use `--text-secondary` for the message
- Do not reveal the specific guard that blocked access
- Provide navigation back to allowed areas

### 5.5 No Consent State

- Show a specific "consent required" message
- Explain that consent must be granted by the student or admin
- Do not show cached or partial data

---

## 6. Accessibility Requirements

- All interactive elements must have a minimum touch target of `--touch-target` (44px)
- All form inputs must have associated labels (visible or `aria-label`)
- Focus must be visible using `--shadow-focus`
- Color must not be the sole indicator of state — use icons or text alongside
- All images and icons must have alt text or `aria-hidden="true"` for decorative elements
- Keyboard navigation must follow logical tab order
- Dialog/modal focus must be trapped while open
- Screen reader announcements for dynamic content changes

---

## 7. Dark Mode

- All parent UI must support dark mode via `[data-theme="dark"]` tokens
- Dark mode tokens are defined in `tokens/colors.css` and activate automatically
- Never hard-code light-mode colors; always use semantic tokens

---

## 8. Prohibited Patterns

| Prohibited | Use Instead |
|---|---|
| Hard-coded hex colors | Design token CSS variables |
| Arbitrary pixel spacing | Spacing tokens (`--space-*`) |
| Custom font sizes | Typography tokens (`--type-*`) |
| Inline styles for layout | CSS classes using tokens |
| Custom border radius values | Radius tokens (`--radius-*`) |
| Custom shadows | Shadow tokens (`--shadow-*`) |
| One-off component styling | Extend existing design system components |
| Physical direction properties | Logical properties (inline-start/end) |
| Fixed-width layouts | Responsive layouts with breakpoints |
| Color-only state indication | Color + icon/text |
