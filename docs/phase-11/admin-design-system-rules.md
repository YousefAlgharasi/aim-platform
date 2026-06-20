# Phase 11 — Admin Design System Rules

**Task:** P11-003
**Depends on:** P11-001 (Admin Dashboard Charter), DES-001 (AIM Design System)
**Design system source:** `docs/design/source/aim-design-system`

---

## 1. Rule: Always Use the AIM Design System

Every admin UI component, page, layout, and interaction in Phase 11 must use the approved AIM design system.

Source of truth:
```
docs/design/source/aim-design-system/
  readme.md              ← start here
  foundations/           ← color, typography, spacing, radius, shadow
  components/            ← buttons, forms, feedback, navigation, learning
  styles.css             ← token definitions
  _ds_manifest.json      ← component manifest
```

Stop and do not implement a UI task if you cannot follow the design system.

---

## 2. Color Tokens

Use semantic aliases, not raw scale steps.

### Required aliases (from `styles.css`)

| Token | Usage |
|---|---|
| `--surface` | Page/card background |
| `--surface-raised` | Elevated card background |
| `--text-primary` | Main body text |
| `--text-secondary` | Supporting / muted text |
| `--text-disabled` | Disabled state text |
| `--border` | Default border |
| `--border-focus` | Focus ring border |
| `--primary` | Primary actions, links, progress |
| `--primary-soft` | Tonal button/badge fill |
| `--primary-soft-fg` | Text on primary-soft background |
| `--secondary` | AI-related accents |
| `--accent` | Growth, mastery, streak indicators |
| `--error` | Error / destructive states |
| `--warning` | Weak / needs-review states |
| `--success` | Correct / completed states |

### Status color mapping

| Status | Token |
|---|---|
| Completed / correct | `--success` |
| In progress / recommended | `--primary` |
| Needs review / weak | `--warning` |
| Locked / not started | neutral |
| Wrong / destructive | `--error` |

### Forbidden

- No hardcoded hex, rgb, or hsl values in component code
- No raw scale steps (e.g. `--color-primary-500`) in component surfaces
- No one-off color variables
- The AI gradient (`--gradient-ai`) is reserved for AI-generated content only — do not apply to admin navigation or generic buttons

---

## 3. Typography

Use role shorthands from the design system. Do not hand-pick pixel sizes.

| Token | Usage |
|---|---|
| `var(--type-h1)` | Page titles |
| `var(--type-h2)` | Section headings |
| `var(--type-h3)` | Card/panel headings |
| `var(--type-h4)` | Sub-section headings |
| `var(--type-body-md)` | Default body text |
| `var(--type-body-sm)` | Supporting / meta text |
| `var(--type-label)` | Form labels, table column headers |
| `var(--type-button)` | Button labels |
| `var(--type-caption)` | Captions, timestamps |

### Font families

- English (LTR): **Inter**
- Arabic (RTL): **IBM Plex Sans Arabic** — applied automatically under `[dir="rtl"]`

### Minimum sizes

- Body text: 16px on mobile
- Never below 14px for any user-facing content

### Arabic/RTL typography

- Add `--ar-line-scale` (~18% extra leading) to Arabic text blocks
- No all-caps in Arabic
- No tight letter-spacing in Arabic

---

## 4. Spacing

Use the 8-point grid tokens exclusively.

| Token | Value | Usage |
|---|---|---|
| `--space-4` | 4px | Half-step, tight gaps |
| `--space-8` | 8px | Compact gaps |
| `--space-12` | 12px | Inner padding (sm) |
| `--space-16` | 16px | Card padding, screen edge padding |
| `--space-20` | 20px | Card padding (lg) |
| `--space-24` | 24px | Section gaps |
| `--space-32` | 32px | Section separators |
| `--space-40` | 40px | Major layout gaps |
| `--space-48` | 48px | Header/hero spacing |
| `--space-64` | 64px | Page-level spacing |

### Layout rules

- Use `flex`/`grid` + `gap` for rows and groups — not margins between inline elements
- Mobile screen padding = `--space-16`
- Card internal padding = `--space-16` or `--space-20`

### Forbidden

- No hardcoded pixel or rem values for spacing
- No `margin-top`/`margin-bottom` between sibling flex/grid children — use `gap`

---

## 5. Border Radius

| Token | Usage |
|---|---|
| `--radius-sm` | Inputs, small controls |
| `--radius-md` | Buttons, cards (default) |
| `--radius-lg` | Large cards, panels |
| `--radius-xl` | Bottom sheets, dialogs |
| `--radius-pill` | Pills, tags, badges |

---

## 6. Elevation / Shadows

| Token | Usage |
|---|---|
| `--shadow-card` | Cards at rest |
| `--shadow-card-hover` | Cards on hover/lift |
| `--shadow-modal` | Modals and dialogs |
| `--shadow-sheet` | Bottom sheets |
| `--shadow-fab` | Floating action buttons |
| `--shadow-focus` | Focus rings on interactive elements |

---

## 7. Motion

| Token | Usage |
|---|---|
| `--duration-fast` | Quick micro-interactions |
| `--duration-base` | Standard transitions |
| `--duration-slow` | Emphasis animations |
| `--ease-standard` | Default easing curve |

Always include:
```css
@media (prefers-reduced-motion: reduce) {
  /* disable or simplify animations */
}
```

---

## 8. Components

Use shared components before creating new ones. Component source:
```
docs/design/source/aim-design-system/components/
  buttons/
  forms/
  feedback/
  navigation/
  learning/
  _util/
```

### Required shared components for admin UI

| Component type | Where used |
|---|---|
| Button (primary, secondary, ghost, destructive) | All action triggers |
| Input, textarea, select | All admin forms |
| Checkbox, radio, toggle | Form controls |
| Table | All list views |
| Pagination | All paginated lists |
| Badge | Status indicators, role tags |
| Alert / toast | Success/error/warning feedback |
| Modal / dialog | Confirmation flows |
| Empty state | Zero-result list views |
| Loading skeleton | Data-fetching states |
| Breadcrumb | Navigation context |
| Sidebar nav | Admin shell navigation |
| Dropdown menu | Row actions, filter menus |

### Forbidden

- No ad-hoc `<div>` styled to look like a button — use the Button component
- No custom table implementations that bypass shared table/pagination
- No modal built from scratch — use the shared dialog component
- No one-off badge colors — use the semantic color tokens

---

## 9. Layout

### Admin shell layout

All admin pages use the shared admin layout:
```
AdminShell
  ├── AdminSidebar (navigation)
  ├── AdminHeader (breadcrumb, user menu)
  └── AdminContent (page content area)
```

### Responsive rules

| Breakpoint | Behaviour |
|---|---|
| Mobile (< 768px) | Sidebar collapses to drawer |
| Tablet (768–1024px) | Sidebar icon-only or collapsed |
| Desktop (> 1024px) | Sidebar expanded |

### RTL/Arabic readiness

- All layout must mirror correctly under `[dir="rtl"]`
- Do not hardcode `left`/`right` CSS properties — use `inline-start`/`inline-end` or `margin-inline-start`, etc.
- Test every admin page layout in both LTR and RTL

---

## 10. Accessibility Requirements

Every admin UI component must:

- Have a visible focus ring using `--shadow-focus`
- Meet minimum touch target of 44px (`--touch-target`) for all controls
- Provide `aria-label` on every icon-only button
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<table>`, `<form>`, `<label>`)
- Associate every form input with a `<label>` (via `for`/`id` or `aria-labelledby`)
- Support full keyboard navigation (Tab, Enter, Escape, arrow keys where applicable)
- Not rely on color alone to convey status (pair color with icon or text label)

---

## 11. Required States

Every admin UI view must implement all four states:

| State | Requirement |
|---|---|
| Loading | Skeleton loader using `--surface-raised` and shimmer animation |
| Empty | Empty state component with icon, message, and optional action |
| Error | Error alert with message from backend; no stack traces exposed to UI |
| Forbidden | 403 forbidden state when admin role is insufficient |

---

## 12. What Is Forbidden

| Forbidden | Why |
|---|---|
| Hardcoded hex/rgb colors | Breaks theming and dark mode |
| Custom spacing values | Breaks grid consistency |
| One-off `style=` attributes | Bypasses design system |
| Inline font-size/weight | Bypasses typography scale |
| `left`/`right` CSS properties | Breaks RTL |
| AI gradient on non-AI elements | Dilutes brand signal |
| Missing loading/empty/error/forbidden state | Broken UX |
| Icon-only button without `aria-label` | Accessibility violation |
| Form input without `<label>` | Accessibility violation |
| Touch target below 44px | Accessibility violation |

---

## 13. Compliance Check for Every UI Task

Before marking a UI task Done, verify:

- [ ] All colors use semantic token aliases
- [ ] All spacing uses `--space-*` tokens
- [ ] All typography uses `--type-*` role shorthands
- [ ] All radius uses `--radius-*` tokens
- [ ] All shadows use `--shadow-*` tokens
- [ ] Shared components are used (not recreated)
- [ ] Layout uses `AdminShell` pattern
- [ ] RTL layout is supported
- [ ] All four states implemented (loading, empty, error, forbidden)
- [ ] Accessibility requirements met
- [ ] `prefers-reduced-motion` honored
- [ ] No one-off styling introduced

---

*Design system rules created: Phase 11 P11-003*
*Depends on: P11-001, DES-001*
