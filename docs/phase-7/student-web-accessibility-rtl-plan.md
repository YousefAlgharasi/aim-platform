# Phase 7 — Student Web Accessibility and RTL Plan

**Phase:** 7 (Deferred)
**Date:** 2026-06-21

## Purpose

Define accessibility, Arabic/English bilingual support, RTL layout, keyboard navigation, and responsive requirements for the Student Web App.

## Language Support

### Supported Languages

| Language | Direction | Font Family | Code |
|----------|-----------|------------|------|
| English | LTR | Inter | `en` |
| Arabic | RTL | IBM Plex Sans Arabic | `ar` |

### Implementation

```html
<!-- English -->
<html lang="en" dir="ltr">

<!-- Arabic -->
<html lang="ar" dir="rtl">
```

The `lang` and `dir` attributes are set on `<html>` based on user locale preference (stored in settings, defaulting to browser language).

## RTL Layout Rules

### Logical CSS Properties

Use CSS logical properties instead of physical directional properties:

| Physical (Do NOT use) | Logical (Use this) |
|----------------------|-------------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `left: 0` | `inset-inline-start: 0` |
| `right: 0` | `inset-inline-end: 0` |
| `border-left` | `border-inline-start` |

### Flexbox and Grid

```css
/* ✅ Automatically respects RTL */
.row {
  display: flex;
  flex-direction: row; /* Reverses in RTL automatically */
  gap: var(--component-gap);
}

/* ❌ WRONG — hardcoded direction */
.row {
  display: flex;
  flex-direction: row;
  padding-left: 16px; /* Won't flip in RTL */
}
```

### Icons

Icons with directional meaning must flip in RTL:

| Icon | LTR | RTL |
|------|-----|-----|
| Arrow forward | → | ← |
| Arrow back | ← | → |
| Chevron next | › | ‹ |
| Progress bar | Left to right | Right to left |

```css
[dir="rtl"] .icon-directional {
  transform: scaleX(-1);
}
```

Non-directional icons (checkmark, star, bell) do NOT flip.

### Arabic Typography

Per the AIM design system (`tokens/typography.css`):

- Arabic uses IBM Plex Sans Arabic
- Arabic line-height uses `--type-ar-line-*` multipliers (slightly looser than English)
- Arabic text is generally larger-feeling at the same font size — no size adjustment needed
- Numbers in Arabic context use Eastern Arabic numerals if locale requires, but default to Western Arabic numerals (0–9) for consistency

```css
[lang="ar"] body {
  font-family: 'IBM Plex Sans Arabic', sans-serif;
  line-height: 1.7; /* Looser than English 1.5 */
}
```

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Color Contrast

- Normal text: minimum 4.5:1 contrast ratio
- Large text (≥18px bold or ≥24px): minimum 3:1
- Interactive components and graphical objects: minimum 3:1
- The AIM design system colors are designed to meet these ratios when used as specified

#### Keyboard Navigation

All interactive elements must be:

1. **Focusable** via Tab key
2. **Activatable** via Enter or Space
3. **Dismissible** via Escape (modals, dropdowns, popovers)
4. **Navigable** via Arrow keys (menus, tabs, radio groups)

Focus order must follow visual reading order (top-to-bottom, start-to-end).

#### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

Never remove focus indicators (`outline: none`) without providing a visible alternative.

#### Screen Reader Support

| Element | Requirement |
|---------|------------|
| Images | `alt` text describing content (or `alt=""` for decorative) |
| Buttons | Visible label or `aria-label` |
| Icon buttons | `aria-label` describing the action |
| Form inputs | Associated `<label>` or `aria-label` |
| Form errors | Linked via `aria-describedby` |
| Loading states | `aria-live="polite"` region announcing loading/loaded |
| Modals | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Navigation | `<nav>` element with `aria-label` |
| Page sections | Landmark roles (`main`, `nav`, `aside`, `header`) |
| Dynamic content | `aria-live` regions for content updates |
| Progress bars | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

#### Semantic HTML

Use native HTML elements before ARIA:

```html
<!-- ✅ CORRECT -->
<button>Submit</button>
<nav aria-label="Main navigation">
<main>

<!-- ❌ WRONG -->
<div onclick="submit()">Submit</div>
<div class="nav">
<div class="main-content">
```

## Responsive Design

### Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| Mobile | < 768px | Single column, bottom nav, stacked cards |
| Tablet | 768–1024px | Collapsible sidebar, 2-column where appropriate |
| Desktop | > 1024px | Full sidebar, multi-column layouts |

### Responsive Patterns

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Navigation | Bottom tab bar | Collapsible sidebar | Fixed sidebar |
| Top bar | Hamburger menu | Logo + nav | Logo + nav + profile |
| Cards | Full width, stacked | 2-column grid | 3-column grid |
| Forms | Full width | 60% centered | 50% centered |
| Tables | Card view (stacked) | Scrollable table | Full table |
| Modals | Full screen | Centered overlay | Centered overlay |
| Page padding | `--screen-padding-mobile` (16px) | 20px | `--screen-padding-web` (24px) |

### Touch Targets

- Minimum touch target: 44×44px (WCAG 2.5.5)
- Adequate spacing between interactive elements on mobile
- No hover-only interactions — all interactions work with tap

## Testing Plan

| Category | Method |
|----------|--------|
| Keyboard navigation | Manual testing of all interactive flows |
| Screen reader | VoiceOver (macOS/iOS) and NVDA (Windows) |
| Color contrast | Automated contrast checking via axe-core |
| RTL layout | Manual testing with `dir="rtl"` and Arabic content |
| Responsive | Browser dev tools at mobile/tablet/desktop breakpoints |
| Focus indicators | Visual inspection in all interactive states |
| Semantic HTML | axe-core automated audit |
