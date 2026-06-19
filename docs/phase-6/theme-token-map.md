# Phase 6 — Theme Token Map

**Phase:** 6  
**Task:** P6-012  
**Status:** Active  
**Branch:** `phase6/P6-012-theme-token-map`  
**Dependency:** P6-010  
**Output:** `docs/phase-6/theme-token-map.md`

---

## 1. Purpose

This document maps every design token in the AIM Mobile Design System to its Dart constant, its semantic meaning, and the correct accessor for use inside Flutter widgets. It is the authoritative reference for all Phase 6 UI tasks.

**Rule:** Feature code must never hard-code hex values, pixel sizes, font sizes, or padding literals. Every value must trace back to a token in this document.

---

## 2. Token Files & Import Path

All tokens are exported from a single barrel:

```dart
import 'package:aim_mobile/core/theme/theme.dart';
```

This re-exports:
- `core/design_tokens/design_tokens.dart` — all raw token classes
- `core/theme/aim_theme_extensions.dart` — `ThemeExtension` classes + context accessors
- `core/theme/app_theme.dart`, `aim_light_theme.dart`, `aim_dark_theme.dart`

| Class | File | Purpose |
|---|---|---|
| `AimColors` | `design_tokens/aim_colors.dart` | Raw color palette (50–900 scales) |
| `AimColorTheme` | `design_tokens/aim_colors.dart` | Semantic color mappings (light & dark) |
| `AimTypography` | `design_tokens/aim_typography.dart` | Font size, line height, weight, tracking constants |
| `AimFontFamilies` | `design_tokens/aim_typography.dart` | Font family name strings |
| `AimFontWeights` | `design_tokens/aim_typography.dart` | `FontWeight` constants |
| `AimTextStyles` | `design_tokens/aim_typography.dart` | Ready-to-use `TextStyle` instances |
| `AimSpacing` | `design_tokens/aim_spacing.dart` | Spacing scale + named semantic gaps |
| `AimRadius` | `design_tokens/aim_radius.dart` | Corner radius values + `BorderRadius` presets |
| `AimShadows` | `design_tokens/aim_shadows.dart` | `BoxShadow` lists by elevation level |
| `AimSizes` | `design_tokens/aim_sizes.dart` | Component heights, icon sizes, z-index constants |
| `AimMotion` | `design_tokens/aim_motion.dart` | Animation durations + easing curves |
| `AimGradients` | `design_tokens/aim_gradients.dart` | `LinearGradient` presets |

---

## 3. Color Tokens

### 3.1 Raw Palette (`AimColors`)

The palette is never used directly in feature UI. Use semantic tokens from `AimColorTheme` (§3.2) instead. The raw scale exists for design system internals only.

| Scale | Steps available |
|---|---|
| `primary` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `secondary` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `accent` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `neutral` | 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `success` | 50, 100, 500, 600, 700 |
| `warning` | 50, 100, 500, 600, 700 |
| `error` | 50, 100, 500, 600, 700 |
| `info` | 50, 100, 500, 600, 700 |

---

### 3.2 Semantic Color Tokens (`AimColorTheme` / `AimSurfaceTheme`)

**How to access in widgets:**

```dart
final surfaces = aimSurfacesOf(context);   // AimSurfaceTheme
final softFills = aimSoftFillsOf(context); // AimSoftFillTheme
```

#### Surface & Background

| Token | `AimSurfaceTheme` field | Light value | Dark value | Use case |
|---|---|---|---|---|
| Background | `surfaces.background` | `neutral50` | `#0E1118` | Screen background |
| Surface | `surfaces.surface` | `neutral0` (white) | `#181C26` | Cards, sheets |
| Surface Raised | `surfaces.surfaceRaised` | `neutral0` | `#202533` | Elevated cards, modals |
| Surface Sunken | `surfaces.surfaceSunken` | `neutral100` | `#11141C` | Input backgrounds, inset areas |

#### Text

| Token | `AimSurfaceTheme` field | Light value | Dark value | Use case |
|---|---|---|---|---|
| Text Primary | `surfaces.textPrimary` | `neutral900` | `#F2F4F8` | Body text, headings |
| Text Secondary | `surfaces.textSecondary` | `neutral600` | `neutral400` | Labels, subtitles |
| Text Muted | `surfaces.textMuted` | `neutral500` | `neutral500` | Captions, helper text |
| Text On Primary | `surfaces.textOnPrimary` | `neutral0` | `neutral0` | Text on primary-filled buttons |
| Text Link | `surfaces.textLink` | `primary600` | `primary300` | Hyperlinks |

#### Borders & Dividers

| Token | `AimSurfaceTheme` field | Light value | Dark value | Use case |
|---|---|---|---|---|
| Border | `surfaces.border` | `neutral200` | `neutral800` | Default input/card borders |
| Border Strong | `surfaces.borderStrong` | `neutral300` | `#3A4253` | Focused/emphasized borders |
| Divider | `surfaces.divider` | `neutral100` | `#232838` | List separators |
| Focus Ring | `surfaces.focusRing` | `primary400` | `primary400` | Keyboard/accessibility focus |

#### Interaction States

| Token | `AimSurfaceTheme` field | Light value | Dark value | Use case |
|---|---|---|---|---|
| State Hover | `surfaces.stateHover` | `rgba(neutral900, 6%)` | `rgba(white, 8%)` | Hover overlay on interactive elements |
| State Pressed | `surfaces.statePressed` | `rgba(neutral900, 12%)` | `rgba(white, 14%)` | Press overlay |
| Disabled Bg | `surfaces.disabledBg` | `neutral100` | `#202533` | Disabled control background |
| Disabled Fg | `surfaces.disabledFg` | `neutral400` | `neutral600` | Disabled text/icon |
| Disabled Border | `surfaces.disabledBorder` | `neutral200` | `neutral800` | Disabled control border |

#### Soft Fills (`AimSoftFillTheme`) — Status & Semantic Chips

| Token | Field | Background | Foreground | Use case |
|---|---|---|---|---|
| Primary soft | `softFills.primary` / `.onPrimary` | `primary50` / `primary700` | — | Info badges, active states |
| Secondary soft | `softFills.secondary` / `.onSecondary` | `secondary50` / `secondary700` | — | Tags |
| Accent soft | `softFills.accent` / `.onAccent` | `accent50` / `accent700` | — | Highlights |
| Success soft | `softFills.success` / `.onSuccess` | `success50` / `success700` | — | Correct answer feedback |
| Warning soft | `softFills.warning` / `.onWarning` | `warning50` / `warning700` | — | Caution states |
| Error soft | `softFills.error` / `.onError` | `error50` / `error700` | — | Wrong answer feedback, errors |
| Info soft | `softFills.info` / `.onInfo` | `info50` / `info700` | — | Informational callouts |

---

## 4. Typography Tokens

### 4.1 How to access

```dart
// Pre-built TextStyle (preferred):
Text('Hello', style: AimTextStyles.bodyMd.copyWith(color: surfaces.textPrimary))

// Raw constants (for custom overrides only):
AimTypography.bodyMdSize    // 16.0
AimTypography.bodyMdLine    // 24.0
AimFontWeights.semibold     // FontWeight.w600
```

### 4.2 Type Scale

| Style constant | Size | Line height | Weight | Tracking | Use case |
|---|---|---|---|---|---|
| `AimTextStyles.display` | 34 | 40 | ExtraBold (800) | -0.68 | Hero / splash headlines |
| `AimTextStyles.h1` | 28 | 34 | Bold (700) | -0.28 | Screen titles |
| `AimTextStyles.h2` | 23 | 30 | Bold (700) | -0.23 | Section headers |
| `AimTextStyles.h3` | 19 | 26 | SemiBold (600) | 0 | Card headers, subsections |
| `AimTextStyles.title` | 17 | 24 | SemiBold (600) | 0 | List item titles, app bar |
| `AimTextStyles.bodyLg` | 17 | 26 | Regular (400) | 0 | Large body text |
| `AimTextStyles.bodyMd` | 16 | 24 | Regular (400) | 0 | Default body text |
| `AimTextStyles.bodySm` | 14 | 21 | Regular (400) | 0 | Secondary body text |
| `AimTextStyles.caption` | 12 | 16 | Medium (500) | +0.12 | Timestamps, metadata |
| `AimTextStyles.button` | 15 | 20 | SemiBold (600) | +0.15 | Button labels |
| `AimTextStyles.label` | 13 | 18 | SemiBold (600) | +0.13 | Form labels, badges |
| `AimTextStyles.helper` | 12 | 16 | Regular (400) | 0 | Helper/error text below inputs |

### 4.3 Arabic / RTL Text Styles

Arabic text uses **IBM Plex Sans Arabic** with a `1.18×` line-height scale applied to compensate for Arabic ascenders.

| Style constant | Use case |
|---|---|
| `AimTextStyles.arabicH1` | Arabic screen titles |
| `AimTextStyles.arabicH3` | Arabic card headers |
| `AimTextStyles.arabicBodyMd` | Arabic body text |
| `AimTextStyles.arabicBodySm` | Arabic secondary text |

**Rule:** Detect `Directionality.of(context) == TextDirection.rtl` and switch to the Arabic `TextStyle` variant. Never apply Arabic styles to LTR content or vice versa.

### 4.4 Font Families

| Constant | Value | When to use |
|---|---|---|
| `AimFontFamilies.english` | `'Inter'` | All LTR / English content |
| `AimFontFamilies.arabic` | `'IBM Plex Sans Arabic'` | RTL / Arabic content |
| `AimFontFamilies.arabicFallback` | `'Noto Sans Arabic'` | Arabic fallback (already in `fontFamilyFallback`) |
| `AimFontFamilies.mono` | `'monospace'` | Code snippets only |

---

## 5. Spacing Tokens (`AimSpacing`)

### 5.1 Base Scale

| Constant | Value | Usage |
|---|---|---|
| `AimSpacing.space0` | 0 | No spacing |
| `AimSpacing.space2` | 2 | Micro gaps (icon-to-label) |
| `AimSpacing.space4` | 4 | Tight inner gaps |
| `AimSpacing.space8` | 8 | Inner gap (`innerGap`) |
| `AimSpacing.space12` | 12 | Component gap (`componentGap`), list item gap |
| `AimSpacing.space16` | 16 | Card padding, screen padding mobile, form field gap |
| `AimSpacing.space20` | 20 | Large card padding (`cardPaddingLg`) |
| `AimSpacing.space24` | 24 | Section gap, screen padding web |
| `AimSpacing.space32` | 32 | Large section spacing |
| `AimSpacing.space40` | 40 | Extra large spacing |
| `AimSpacing.space48` | 48 | Hero padding |
| `AimSpacing.space64` | 64 | Max hero padding |

### 5.2 Semantic Spacing Constants

| Constant | Value | Use case |
|---|---|---|
| `AimSpacing.screenPaddingMobile` | 16 | Horizontal screen padding on mobile |
| `AimSpacing.screenPaddingWeb` | 24 | Horizontal screen padding on web |
| `AimSpacing.cardPadding` | 16 | Default card interior padding |
| `AimSpacing.cardPaddingLg` | 20 | Large card interior padding |
| `AimSpacing.sectionGap` | 24 | Gap between page sections |
| `AimSpacing.componentGap` | 12 | Gap between related components |
| `AimSpacing.innerGap` | 8 | Gap within a component (icon + label) |
| `AimSpacing.listItemGap` | 12 | Gap between list items |
| `AimSpacing.formFieldGap` | 16 | Gap between form fields |

### 5.3 Pre-built `EdgeInsets` Presets

| Constant | Value |
|---|---|
| `AimSpacing.screenMobile` | `EdgeInsets.all(16)` |
| `AimSpacing.screenWeb` | `EdgeInsets.all(24)` |
| `AimSpacing.card` | `EdgeInsets.all(16)` |
| `AimSpacing.cardLg` | `EdgeInsets.all(20)` |

---

## 6. Radius Tokens (`AimRadius`)

| Constant | Value | `BorderRadius` preset | Use case |
|---|---|---|---|
| `AimRadius.xs` | 6 | `AimRadius.borderXs` | Small chips, badges |
| `AimRadius.sm` | 8 | `AimRadius.borderSm` | Input fields, small cards |
| `AimRadius.md` | 12 | `AimRadius.borderMd` | Default cards, modals |
| `AimRadius.lg` | 16 | `AimRadius.borderLg` | Large cards, sheets |
| `AimRadius.xl` | 24 | `AimRadius.borderXl` | Bottom sheet top corners |
| `AimRadius.x2l` | 32 | `AimRadius.borderX2l` | Feature hero cards |
| `AimRadius.pill` | 999 | `AimRadius.borderPill` | Pill-shaped buttons, tags |

---

## 7. Shadow Tokens (`AimShadows` / `AimShadowTheme`)

**How to access in widgets:**

```dart
final shadows = aimShadowsOf(context); // AimShadowTheme
// e.g. shadows.card, shadows.modal, shadows.sheet
```

| Token | `AimShadowTheme` field | Static fallback | Use case |
|---|---|---|---|
| None | `shadows.none` | `AimShadows.none` | Flat elements |
| Card | `shadows.card` | `AimShadows.card` | Default card elevation |
| Card Hover | `shadows.cardHover` | `AimShadows.cardHover` | Card on hover/press |
| Dropdown | `shadows.dropdown` | `AimShadows.dropdown` | Dropdown menus, popups |
| Modal | `shadows.modal` | `AimShadows.modal` | Dialogs, modals |
| Sheet | `shadows.sheet` | `AimShadows.sheet` | Bottom nav bar, bottom sheets |
| FAB | `shadows.fab` | `AimShadows.fab` | Floating action button |
| Focus | `shadows.focus` | `AimShadows.focus` | Keyboard focus ring |

---

## 8. Size Tokens (`AimSizes`)

### 8.1 Component Heights

| Constant | Value | Use case |
|---|---|---|
| `AimSizes.buttonSm` | 36 | Small button height |
| `AimSizes.buttonMd` | 44 | Default button height |
| `AimSizes.buttonLg` | 52 | Large button height |
| `AimSizes.input` | 48 | Default text input height |
| `AimSizes.inputSm` | 40 | Compact input height |
| `AimSizes.iconButton` | 44 | Icon button tap target |
| `AimSizes.fab` | 56 | Floating action button size |
| `AimSizes.touchTarget` | 44 | Minimum accessible touch target |
| `AimSizes.bottomNavHeight` | 64 | Bottom navigation bar height |
| `AimSizes.topBarHeight` | 56 | Top app bar height |

### 8.2 Icon Sizes

| Constant | Value | Use case |
|---|---|---|
| `AimSizes.iconSm` | 16 | Inline icons |
| `AimSizes.iconMd` | 20 | Default icons |
| `AimSizes.iconLg` | 24 | Navigation icons, leading icons |

### 8.3 Avatar Sizes

| Constant | Value |
|---|---|
| `AimSizes.avatarSm` | 32 |
| `AimSizes.avatarMd` | 40 |
| `AimSizes.avatarLg` | 56 |

### 8.4 Z-Index Constants (for `Stack` / overlay ordering)

| Constant | Value | Use case |
|---|---|---|
| `AimSizes.zBase` | 0 | Default content |
| `AimSizes.zRaised` | 10 | Raised cards |
| `AimSizes.zSticky` | 100 | Sticky headers |
| `AimSizes.zDropdown` | 1000 | Dropdowns |
| `AimSizes.zOverlay` | 1100 | Overlays |
| `AimSizes.zModal` | 1200 | Modals / bottom sheets |
| `AimSizes.zToast` | 1400 | Toast notifications |
| `AimSizes.zTooltip` | 1500 | Tooltips |

---

## 9. Motion Tokens (`AimMotion`)

| Constant | Value | Use case |
|---|---|---|
| `AimMotion.durationFast` | 120 ms | Icon transitions, opacity fades |
| `AimMotion.durationBase` | 180 ms | Default transitions (buttons, inputs) |
| `AimMotion.durationSlow` | 260 ms | Screen transitions, modal open/close |
| `AimMotion.easeStandard` | `Cubic(0.2, 0, 0, 1)` | Standard enter/exit |
| `AimMotion.easeEmphasis` | `Cubic(0.2, 0, 0, 1.2)` | Emphasis/bounce on enter |

---

## 10. Gradient Tokens (`AimGradients` / `AimGradientTheme`)

**How to access:**

```dart
final grads = aimGradientsOf(context); // AimGradientTheme
```

| Token | Field | Colors | Use case |
|---|---|---|---|
| AI gradient | `grads.ai` | `primary500` → `secondary500` | AIM branding, hero banners |
| AI Soft gradient | `grads.aiSoft` | `primary50` → `secondary50` | Subtle background fills |
| Growth gradient | `grads.growth` | `accent500` → `primary500` | Progress / achievement |

---

## 11. Theme Extension Accessor Summary

All runtime-resolved tokens are accessed via these four functions from `aim_theme_extensions.dart`:

```dart
// Surface, text, border, interaction state colors
AimSurfaceTheme surfaces = aimSurfacesOf(context);

// Semantic soft fills for status chips, feedback containers
AimSoftFillTheme softFills = aimSoftFillsOf(context);

// Gradients
AimGradientTheme grads = aimGradientsOf(context);

// Box shadows by elevation level
AimShadowTheme shadows = aimShadowsOf(context);
```

All four fall back gracefully if the extension is not registered — they derive from `Brightness` in that case.

---

## 12. Usage Rules

| Rule | Detail |
|---|---|
| No hard-coded hex values | Always use `AimColors.*` raw or a semantic accessor |
| No hard-coded padding literals | Always use `AimSpacing.*` constants or `EdgeInsets` presets |
| No hard-coded font sizes | Always use `AimTypography.*` or `AimTextStyles.*` |
| No hard-coded corner radii | Always use `AimRadius.*` |
| No hard-coded shadow values | Always use `AimShadows.*` or `aimShadowsOf(context).*` |
| Color in widgets | Prefer `aimSurfacesOf(context).*` — it adapts to light/dark automatically |
| Arabic text | Switch to `AimTextStyles.arabic*` when `Directionality.of(context) == TextDirection.rtl` |
| Design system extension | If a needed token is missing, add it to the relevant token class — never improvise inline |

---

## 13. References

- Color tokens: `apps/mobile/lib/core/design_tokens/aim_colors.dart`
- Typography tokens: `apps/mobile/lib/core/design_tokens/aim_typography.dart`
- Spacing tokens: `apps/mobile/lib/core/design_tokens/aim_spacing.dart`
- Radius tokens: `apps/mobile/lib/core/design_tokens/aim_radius.dart`
- Shadow tokens: `apps/mobile/lib/core/design_tokens/aim_shadows.dart`
- Size tokens: `apps/mobile/lib/core/design_tokens/aim_sizes.dart`
- Motion tokens: `apps/mobile/lib/core/design_tokens/aim_motion.dart`
- Gradient tokens: `apps/mobile/lib/core/design_tokens/aim_gradients.dart`
- Theme extensions & accessors: `apps/mobile/lib/core/theme/aim_theme_extensions.dart`
- Barrel export: `apps/mobile/lib/core/theme/theme.dart`
- Design System File Inventory: `docs/phase-6/mobile-design-system-file-inventory.md`

---

*Theme token map created: P6-012 | Branch: phase6/P6-012-theme-token-map*
