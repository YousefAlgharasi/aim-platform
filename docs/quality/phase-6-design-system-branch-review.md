# Phase 6 — AIM Mobile Design System Branch Review

**Phase:** 6  
**Task:** P6-009  
**Branch:** `phase6/P6-009-design-system-branch-review`  
**Dependency:** P6-001 (Student Mobile MVP Charter — Done)  
**Source Branch Reviewed:** `aim-mobile-design-system`  
**Output:** `docs/quality/phase-6-design-system-branch-review.md`

---

## 1. Purpose

This document reviews the `aim-mobile-design-system` branch to identify all available theme tokens, shared widgets, and design system infrastructure that Phase 6 must use. It makes the existing design system the official Phase 6 UI source.

**Verdict: The design system is complete and ready for Phase 6 adoption.**

---

## 2. Design Token Files

Located at `apps/mobile/lib/core/design_tokens/`

| File | Class | Contents |
|---|---|---|
| `aim_colors.dart` | `AimColors` | Full color palette: primary (50–900), secondary (50–900), accent (50–900), neutral (0–900), success, warning, error, info scales |
| `aim_typography.dart` | `AimFontFamilies`, `AimFontAssets`, `AimFontWeights`, `AimTextStyles` | Inter (English) + IBM Plex Sans Arabic (RTL); full text style scale (display, heading, body, label, caption) |
| `aim_spacing.dart` | `AimSpacing` | Spacing scale (xs → 3xl and named values) |
| `aim_radius.dart` | `AimRadius` | Border radius scale (none → full) |
| `aim_shadows.dart` | `AimShadows` | Elevation shadow presets (sm, md, lg, xl) |
| `aim_sizes.dart` | `AimSizes` | Component sizing constants |
| `aim_gradients.dart` | `AimGradients` | Gradient presets |
| `aim_motion.dart` | `AimMotion` | Animation durations and curves |
| `design_tokens.dart` | barrel export | Exports all token classes |

**All Phase 6 feature code must import from `design_tokens.dart` or `theme.dart` — never hard-code values.**

---

## 3. Theme Files

Located at `apps/mobile/lib/core/theme/`

| File | Purpose |
|---|---|
| `aim_light_theme.dart` | Light `ThemeData` wired to AIM tokens |
| `aim_dark_theme.dart` | Dark `ThemeData` wired to AIM tokens |
| `aim_theme_extensions.dart` | Custom `ThemeExtension` for AIM-specific properties |
| `app_theme.dart` | `AppTheme` entry point — exposes `lightTheme` and `darkTheme` |
| `theme_mode_provider.dart` | Riverpod provider for theme mode state |
| `theme.dart` | Barrel export |

---

## 4. Shared Widget Library

Located at `apps/mobile/lib/core/widgets/`

### 4.1 Buttons (`widgets/buttons/`)

| Widget | Description |
|---|---|
| `AIMButton` | Primary shared button — variants: `primary`, `secondary`, `outline`, `ghost`, `destructive`; sizes: `small`, `medium`, `large`; supports loading, disabled, leading/trailing icons |
| `AimFab` | Floating action button |
| `AimIconButton` | Icon-only button |

### 4.2 Forms (`widgets/forms/`)

| Widget | Description |
|---|---|
| `AimInput` | Text field with RTL support |
| `AimTextarea` | Multi-line text input |
| `AimSelect` | Dropdown select |
| `AimCheckbox` | Checkbox |
| `AimRadio` | Radio button |
| `AimSwitch` | Toggle switch |
| `AimOtpInput` | OTP/PIN code input |

### 4.3 Feedback (`widgets/feedback/`)

| Widget | Description |
|---|---|
| `AimAlertBanner` | In-page alert/banner |
| `AimBadge` | Status badge |
| `AimChip` | Tag/chip |
| `AimSkeleton` | Loading skeleton placeholder |

### 4.4 Learning (`widgets/learning/`)

| Widget | Description |
|---|---|
| `AimAnswerOption` | Answer choice widget for Q&A flows |
| `AimAiFeedbackBubble` | AI feedback display container |
| `AimCard` | Content card |
| `AimProgressBar` | Linear progress bar |
| `AimCircularProgress` | Circular progress indicator |
| `AimRecordButton` | Voice recording button |

### 4.5 Navigation (`widgets/navigation/`)

| Widget | Description |
|---|---|
| `AimBottomNav` | Bottom navigation bar |
| `AimTopAppBar` | Top app bar / header |
| `AimTabs` | Tab bar |
| `AimSegmentedControl` | Segmented control |

---

## 5. RTL/Arabic Support in Design System

The design system has built-in RTL/Arabic infrastructure:

- **Fonts:** `AimFontFamilies.sansRtl = 'IBM Plex Sans Arabic'` is declared alongside `sansDefault = 'Inter'`. Typography switches per locale/direction.
- **Font assets:** Both Inter and IBM Plex Sans Arabic font files are declared in `AimFontAssets`.
- **Localization:** `apps/mobile/lib/core/localization/app_locale.dart` provides locale handling.
- **Design tokens** use direction-agnostic names (start/end, not left/right).

Phase 6 screens must rely on `Directionality` widget and locale — never force `TextDirection.ltr`.

---

## 6. Feature Scaffolding

The following features already have folder structure on this branch (empty stubs ready for Phase 6 implementation):

| Feature | Status |
|---|---|
| `auth` | ✅ Data sources, models, repository, providers, pages (login, register, sign-in placeholder) |
| `placement` | ✅ Models, entities, providers, pages (start, question, section, result, submit) |
| `home` | 🔲 Folder structure only — implementation needed |
| `lessons` | 🔲 Folder structure only |
| `practice` | 🔲 Folder structure only |
| `profile` | ✅ Data sources, models, repository, providers, pages (profile, edit profile) |
| `progress` | 🔲 Folder structure only |
| `reviews` | 🔲 Folder structure only |
| `notifications` | 🔲 Folder structure only |
| `onboarding` | 🔲 Folder structure + splash placeholder |
| `ai_teacher` | 🔲 Folder structure only (out of Phase 6 MVP scope) |
| `shell` | ✅ Main shell page, role-aware placeholder section |
| `design_system_preview` | ✅ Live preview of all design system components |

---

## 7. Infrastructure

| Area | File(s) | Status |
|---|---|---|
| Networking | `core/networking/backend_api_client.dart`, `backend_api_paths.dart` | ✅ Exists |
| Routing | `core/routing/app_router.dart`, `app_route_paths.dart` | ✅ Exists |
| State management | `core/state/app_async_state.dart`, `app_state_notifier.dart` | ✅ Exists |
| Config | `core/config/app_config.dart`, `app_config_provider.dart` | ✅ Exists |
| Errors | `core/errors/app_exception.dart` | ✅ Exists |
| State management lib | Riverpod `flutter_riverpod: ^2.5.1` | ✅ In pubspec |

**pubspec.yaml is clean — no AI SDK packages, no AIM Engine client, no secrets.**

---

## 8. Design System Preview App

A `design_system_preview` feature exists with live sections for all component categories:

- Colors, Typography, Foundations
- Buttons, Forms, Feedback
- Learning widgets, Navigation components

This serves as the reference implementation for how each widget is used. Phase 6 feature developers should consult `ds_preview_page.dart` before implementing any screen.

---

## 9. Phase 6 Adoption Verdict

| Check | Result |
|---|---|
| Design tokens are complete and centralized | ✅ Pass |
| Shared widget library covers all MVP UI needs | ✅ Pass |
| RTL/Arabic font and locale infrastructure exists | ✅ Pass |
| No AI SDK packages in pubspec | ✅ Pass |
| No secrets in source | ✅ Pass |
| Feature folder structure is ready | ✅ Pass |
| Backend-only networking client exists | ✅ Pass |

**The `aim-mobile-design-system` branch is the official Phase 6 UI source. All Phase 6 UI work must be built on this foundation.**

---

## 10. Mandatory Usage Rules (Summary)

1. Import colors from `AimColors` — no `Color(0xFF...)` literals in feature code.
2. Import typography from `AimTextStyles` / `AimFontFamilies` — no inline `TextStyle` literals.
3. Import spacing from `AimSpacing` — no raw `EdgeInsets.all(16)` literals.
4. Import radius from `AimRadius` — no raw `BorderRadius.circular(8)` literals.
5. Use `AIMButton` for all buttons — no raw `ElevatedButton` or `TextButton` in feature code.
6. Use `AimInput` for all text fields — no raw `TextField` in feature code.
7. Use `AimCard` for all cards — no raw `Card` with custom decoration in feature code.
8. Use `AimBottomNav` / `AimTopAppBar` for navigation — no custom nav implementations.
9. Use `AimSkeleton` for loading states — no custom shimmer implementations.
10. Use `AimAnswerOption` for Q&A answer choices — no custom answer widgets.

---

*Design system branch review created: P6-009 | Branch: phase6/P6-009-design-system-branch-review*
