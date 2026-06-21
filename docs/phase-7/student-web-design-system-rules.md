# Phase 7 — Student Web Design System Rules

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

All Student Web App UI must follow the approved AIM design system defined in `docs/design/source/aim-design-system`. No one-off styling is permitted.

## Design System Source

**Location:** `docs/design/source/aim-design-system/`

### Token Files

| File | Contains |
|------|---------|
| `tokens/colors.css` | Primary (blue), secondary (purple), accent (teal), neutral, semantic colors |
| `tokens/spacing.css` | 8-point grid spacing scale (0–64px) with semantic aliases |
| `tokens/typography.css` | Inter (English) + IBM Plex Sans Arabic, display/h1–h3/body/caption/overline roles |
| `tokens/radius.css` | Radius scale: xs(6)→sm(8)→md(12)→lg(16)→xl(24)→2xl(32)→pill(999) |
| `tokens/shadows.css` | Elevation shadows |
| `tokens/sizes.css` | Component sizing |
| `tokens/fonts.css` | Font family declarations |

### Component Library

| Directory | Components |
|-----------|-----------|
| `components/buttons/` | Primary, secondary, ghost, icon buttons |
| `components/forms/` | Inputs, selects, checkboxes, radio, text areas |
| `components/feedback/` | Alerts, toasts, progress bars, skeletons |
| `components/navigation/` | Tabs, breadcrumbs, sidebar, top bar |
| `components/learning/` | Lesson cards, question renderers, progress rings |

### Foundation Pages

| File | Defines |
|------|---------|
| `foundations/color-primary.html` | Primary blue palette usage |
| `foundations/color-secondary.html` | Secondary purple palette usage |
| `foundations/color-accent.html` | Accent teal palette usage |
| `foundations/color-semantic.html` | Success/warning/error/info colors |
| `foundations/color-surface.html` | Surface and background colors |
| `foundations/spacing-scale.html` | Spacing usage guidelines |
| `foundations/type-headings.html` | Heading typography |
| `foundations/type-body.html` | Body text typography |
| `foundations/type-arabic.html` | Arabic typography rules |
| `foundations/radius-scale.html` | Border radius usage |
| `foundations/shadow-scale.html` | Shadow/elevation usage |

## Mandatory Rules

### 1. Use Design Tokens

```css
/* ✅ CORRECT */
.card {
  padding: var(--card-padding);
  border-radius: var(--radius-md);
  background: var(--color-neutral-0);
  color: var(--color-neutral-900);
}

/* ❌ WRONG */
.card {
  padding: 15px;
  border-radius: 10px;
  background: white;
  color: #333;
}
```

### 2. Use Typography Tokens

```css
/* ✅ CORRECT */
.heading {
  font-size: var(--type-h2-size);
  line-height: var(--type-h2-line);
  font-weight: var(--type-h2-weight);
}

/* ❌ WRONG */
.heading {
  font-size: 22px;
  line-height: 1.4;
  font-weight: bold;
}
```

### 3. Use Spacing Tokens

```css
/* ✅ CORRECT */
.section {
  margin-bottom: var(--section-gap);
  padding: var(--screen-padding-web);
}

/* ❌ WRONG */
.section {
  margin-bottom: 30px;
  padding: 25px;
}
```

### 4. Use Color Tokens

```css
/* ✅ CORRECT */
.button-primary {
  background: var(--color-primary-500);
  color: var(--color-neutral-0);
}

/* ❌ WRONG */
.button-primary {
  background: #4762EE;
  color: white;
}
```

## Responsive Layout

- Mobile-first approach
- Breakpoints: mobile (<768px), tablet (768–1024px), desktop (>1024px)
- Use `--screen-padding-mobile` for mobile, `--screen-padding-web` for desktop
- Sidebar collapses to bottom nav on mobile
- Cards stack vertically on mobile, grid on desktop

## Arabic / RTL

- All layouts must support `dir="rtl"`
- Use logical CSS properties: `margin-inline-start` not `margin-left`
- Arabic font: IBM Plex Sans Arabic with looser line-height (`--type-ar-line-*`)
- Text alignment: `text-align: start` not `text-align: left`
- Icons with directional meaning must flip in RTL

## Accessibility

- All interactive elements must have accessible labels (`aria-label` or visible label)
- Color contrast must meet WCAG 2.1 AA (4.5:1 for text, 3:1 for large text)
- Focus indicators must be visible
- Keyboard navigation must work for all interactive elements
- Form errors must be associated with fields via `aria-describedby`

## State Patterns

Every data-fetching view must handle:

| State | Pattern |
|-------|---------|
| Loading | Skeleton placeholder using design system skeleton component |
| Empty | Centered illustration + message + optional CTA |
| Error | Error feedback component with retry action |
| Forbidden | 403 message with navigation back |
| Blocked | Blocked state message (e.g., prerequisite not met) |

## Enforcement

- Code review checks for hardcoded values (px, hex colors, raw font sizes)
- Design system adherence linter (`_adherence.oxlintrc.json`) should be integrated
- Any deviation from design tokens blocks the task from being marked Done
