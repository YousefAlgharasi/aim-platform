# Phase 6 — Mobile Design System File Inventory

**Phase:** 6  
**Task:** P6-010  
**Branch:** `phase6/P6-010-design-system-file-inventory`  
**Dependency:** P6-009 (Design System Branch Review — Done)  
**Output:** `docs/phase-6/mobile-design-system-file-inventory.md`

---

## 1. Purpose

This document is the authoritative inventory of all design system files, tokens, themes, and shared widgets available in the `aim-mobile-design-system` branch. Every Phase 6 screen must reuse items from this inventory. Adding new components without first checking this inventory is a violation.

---

## 2. Design Tokens

**Root path:** `apps/mobile/lib/core/design_tokens/`  
**Barrel export:** `design_tokens.dart`

### 2.1 Colors — `aim_colors.dart` → `AimColors`

| Scale | Stops |
|---|---|
| `primary` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `secondary` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `accent` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `neutral` | 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 |
| `success` | 50, 100, 500, 600, 700 |
| `warning` | 50, 100, 500, 600 |
| `error` | (in scale) |
| `info` | (in scale) |

**Usage:** `AimColors.primary500`, `AimColors.neutral0`, etc.

### 2.2 Typography — `aim_typography.dart`

| Class | Members |
|---|---|
| `AimFontFamilies` | `english` = Inter, `arabic` = IBM Plex Sans Arabic, `arabicFallback` = Noto Sans Arabic, `mono`, `sansDefault`, `sansRtl` |
| `AimFontAssets` | Inter (Regular/Medium/SemiBold/Bold/ExtraBold), IBM Plex Sans Arabic (Regular/Medium/SemiBold/Bold) |
| `AimFontWeights` | `regular` (w400), `medium` (w500), `semiBold` (w600), `bold` (w700), `extraBold` (w800) |
| `AimTextStyles` | Full scale: display (lg/md/sm), heading (h1–h6), body (lg/md/sm), label (lg/md/sm), caption, overline |

**Usage:** `AimTextStyles.bodyMd`, `AimFontFamilies.sansRtl`, etc.

### 2.3 Spacing — `aim_spacing.dart` → `AimSpacing`

Scale values in logical pixels. Use for padding, margin, and gap values.

**Usage:** `AimSpacing.md`, `EdgeInsetsDirectional.all(AimSpacing.sm)`, etc.

### 2.4 Radius — `aim_radius.dart` → `AimRadius`

| Token | Usage |
|---|---|
| `AimRadius.none` | 0 — sharp corners |
| `AimRadius.sm` | Small radius |
| `AimRadius.md` | Default component radius |
| `AimRadius.lg` | Card / modal radius |
| `AimRadius.xl` | Large surface radius |
| `AimRadius.full` | Pill / avatar radius |

**Usage:** `BorderRadius.circular(AimRadius.md)`, etc.

### 2.5 Shadows — `aim_shadows.dart` → `AimShadows`

Presets: `sm`, `md`, `lg`, `xl` — use for card and modal elevation.

### 2.6 Sizes — `aim_sizes.dart` → `AimSizes`

Component sizing constants — icon sizes, avatar sizes, input heights, button heights.

### 2.7 Gradients — `aim_gradients.dart` → `AimGradients`

Brand gradient presets — use for hero sections and accent elements.

### 2.8 Motion — `aim_motion.dart` → `AimMotion`

Animation durations and curves — use for all animated transitions.

---

## 3. Theme

**Root path:** `apps/mobile/lib/core/theme/`  
**Barrel export:** `theme.dart`

| File | Export | Purpose |
|---|---|---|
| `app_theme.dart` | `AppTheme` | Entry point — `AppTheme.lightTheme`, `AppTheme.darkTheme` |
| `aim_light_theme.dart` | — | Light `ThemeData` implementation |
| `aim_dark_theme.dart` | — | Dark `ThemeData` implementation |
| `aim_theme_extensions.dart` | `AimThemeExtensions` | Custom `ThemeExtension` for AIM-specific tokens |
| `theme_mode_provider.dart` | `themeModeProvider` | Riverpod provider for theme mode |

**Usage:** `Theme.of(context).extension<AimThemeExtensions>()`, `ref.watch(themeModeProvider)`.

---

## 4. Shared Widgets

**Root path:** `apps/mobile/lib/core/widgets/`  
**Barrel export:** `widgets.dart`

### 4.1 Buttons — `widgets/buttons/buttons.dart`

| Widget | File | When to Use |
|---|---|---|
| `AIMButton` | `aim_button.dart` | Every tappable action — primary CTA, secondary actions, ghost links |
| `AimFab` | `aim_fab.dart` | Floating action button |
| `AimIconButton` | `aim_icon_button.dart` | Icon-only tappable actions |

**`AIMButton` variants:** `primary`, `secondary`, `outline`, `ghost`, `destructive`  
**`AIMButton` sizes:** `small`, `medium`, `large`  
**`AIMButton` props:** `loading`, `disabled`, `leadingIcon`, `trailingIcon`, `fullWidth`

### 4.2 Forms — `widgets/forms/forms.dart`

| Widget | File | When to Use |
|---|---|---|
| `AimInput` | `aim_input.dart` | Single-line text entry — email, name, search |
| `AimTextarea` | `aim_textarea.dart` | Multi-line text entry |
| `AimSelect` | `aim_select.dart` | Dropdown selection |
| `AimCheckbox` | `aim_checkbox.dart` | Boolean checkbox |
| `AimRadio` | `aim_radio.dart` | Single-select radio group |
| `AimSwitch` | `aim_switch.dart` | Toggle switch |
| `AimOtpInput` | `aim_otp_input.dart` | OTP / PIN code entry |

### 4.3 Feedback — `widgets/feedback/feedback.dart`

| Widget | File | When to Use |
|---|---|---|
| `AimAlertBanner` | `aim_alert_banner.dart` | In-page success/warning/error banners |
| `AimBadge` | `aim_badge.dart` | Status indicators on items |
| `AimChip` | `aim_chip.dart` | Tags, filters, topic labels |
| `AimSkeleton` | `aim_skeleton.dart` | Loading placeholder — use instead of spinner for content areas |

### 4.4 Learning — `widgets/learning/learning.dart`

| Widget | File | When to Use |
|---|---|---|
| `AimAnswerOption` | `aim_answer_option.dart` | Every answer choice in placement/session Q&A |
| `AimAiFeedbackBubble` | `aim_ai_feedback_bubble.dart` | Display AIM/backend feedback after answer submission |
| `AimCard` | `aim_card.dart` | Content cards — course cards, session cards, plan items |
| `AimProgressBar` | `aim_progress_bar.dart` | Linear progress — section progress, course completion |
| `AimCircularProgress` | `aim_circular_progress.dart` | Circular progress — overall score, mastery level display |
| `AimRecordButton` | `aim_record_button.dart` | Voice/audio recording interactions |

### 4.5 Navigation — `widgets/navigation/navigation.dart`

| Widget | File | When to Use |
|---|---|---|
| `AimBottomNav` | `aim_bottom_nav.dart` | Bottom tab bar — all main shell navigation |
| `AimTopAppBar` | `aim_top_app_bar.dart` | Top header / app bar — every screen header |
| `AimTabs` | `aim_tabs.dart` | Secondary tab navigation within a screen |
| `AimSegmentedControl` | `aim_segmented_control.dart` | Toggle between 2–4 options (e.g. All / Active / Completed) |

---

## 5. Localization & RTL

**Root path:** `apps/mobile/lib/core/localization/`

| File | Export | Purpose |
|---|---|---|
| `app_locale.dart` | `AppLocale` | Locale definitions and helpers |
| `localization.dart` | barrel | Exports localization utilities |

**RTL Rule:** All screens must use `Directionality` driven by locale — not hardcoded direction. Use `EdgeInsetsDirectional` for directional padding. Arabic font switches automatically via `AimFontFamilies.sansRtl`.

---

## 6. Core Infrastructure (Not Design System, but Required)

| Area | Barrel Export | Key Classes |
|---|---|---|
| Networking | `core/networking/networking.dart` | `BackendApiClient`, `BackendApiPaths`, `ApiResponseEnvelope`, `ApiErrorEnvelope` |
| Routing | `core/routing/routing.dart` | `AppRouter`, `AppRoutePaths` |
| State | `core/state/state.dart` | `AppAsyncState`, `AppStateNotifier`, `AppFormState`, `RetryState` |
| Config | `core/config/config.dart` | `AppConfig`, `appConfigProvider` |
| Errors | `core/errors/errors.dart` | `AppException` |

---

## 7. What Phase 6 Must Not Create From Scratch

If any of the following are needed, use the existing design system item — do not build a new one:

- ❌ Custom button widget → use `AIMButton`
- ❌ Custom text field → use `AimInput`
- ❌ Custom card → use `AimCard`
- ❌ Custom loading shimmer → use `AimSkeleton`
- ❌ Custom answer widget → use `AimAnswerOption`
- ❌ Custom feedback bubble → use `AimAiFeedbackBubble`
- ❌ Custom bottom nav → use `AimBottomNav`
- ❌ Custom app bar → use `AimTopAppBar`
- ❌ Custom color values → use `AimColors`
- ❌ Custom text styles → use `AimTextStyles`
- ❌ Custom spacing values → use `AimSpacing`

If a required component genuinely does not exist, extend the design system — add it to `core/widgets/` following existing patterns, then use it.

---

## 8. Design System Preview Reference

`apps/mobile/lib/features/design_system_preview/` contains a live preview app (`DSPreviewPage`) with sections for every component category. Consult this before implementing any new screen.

---

*Design system file inventory created: P6-010 | Branch: phase6/P6-010-design-system-file-inventory*
