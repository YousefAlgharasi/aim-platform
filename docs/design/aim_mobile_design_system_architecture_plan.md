# AIM Mobile Design System Architecture Plan

Task: Inspect the real Flutter app architecture and determine where the AIM mobile design system should live.

Depends on: [AIM Design System Flutter Conversion Map](aim_design_system_flutter_conversion_map.md)

No design-system Dart code was implemented for this task.

## Inspected App Areas

- [x] `apps/mobile/pubspec.yaml`
- [x] `apps/mobile/lib/app/`
- [x] `apps/mobile/lib/core/theme/`
- [x] `apps/mobile/lib/core/localization/`
- [x] `apps/mobile/lib/core/routing/`
- [x] `apps/mobile/lib/features/`
- [x] `apps/mobile/test/`

## SDK And Dependency Summary

Current local toolchain from `flutter --version` and `flutter pub deps`:

- Flutter SDK: `3.44.1` stable
- Dart SDK: `3.12.1`
- App package: `aim_mobile 0.1.0+1`

`pubspec.yaml` constraints and direct dependencies:

- Dart SDK constraint: `>=3.3.0 <4.0.0`
- Flutter SDK dependency
- `flutter_riverpod`: declared `^2.5.1`, resolved `2.6.1`
- `http`: declared `^1.2.2`, resolved `1.6.0`
- `flutter_test`
- `flutter_lints`: `^4.0.0`
- `uses-material-design: true`

There are no current design-system, icon, localization generation, font, animation, or golden-test packages declared.

## Material 3 Confirmation

Material 3 is enabled.

`apps/mobile/lib/core/theme/app_theme.dart` currently returns:

```dart
ThemeData(
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
  useMaterial3: true,
)
```

The app entry in `apps/mobile/lib/app/aim_mobile_app.dart` passes `theme: AppTheme.light` into `MaterialApp`.

## Existing Theme Structure

Current theme structure is intentionally minimal:

- `apps/mobile/lib/core/theme/app_theme.dart` defines `AppTheme.light`.
- `apps/mobile/lib/core/theme/theme.dart` exports `app_theme.dart`.
- No `darkTheme` is configured in `MaterialApp`.
- No `ThemeExtension` exists yet.
- No AIM token classes exist yet.
- No typography/font assets are configured yet.
- Feature screens consume `Theme.of(context)` and Material widgets directly.

Current UI patterns observed:

- App shell uses `MaterialApp`, named routing, and `AppTheme.light`.
- Screens use `Scaffold`, `AppBar`, `Card`, `Chip`, `TextField`, `TextFormField`, `FilledButton`, `FilledButton.tonal`, `OutlinedButton`, `TextButton`, `NavigationBar`, and `NavigationDestination`.
- Feature pages use hard-coded spacing such as `16`, `20`, `24`, `32`.
- Several private helper widgets duplicate future design-system concerns, including error banners, section cards, profile avatar, field labels, and placeholder cards.

## Existing Localization And RTL Support

Current localization support is a small constant-only foundation:

- `apps/mobile/lib/core/localization/app_locale.dart`
  - `AppLocale.english = 'en'`
  - `AppLocale.arabic = 'ar'`
  - `supportedLanguageCodes = ['en', 'ar']`
- `apps/mobile/lib/core/localization/localization.dart` exports `app_locale.dart`.

Current gaps:

- `MaterialApp` does not set `locale`, `supportedLocales`, or `localizationsDelegates`.
- No generated ARB/localization files exist.
- No explicit `Directionality`, `TextDirection.rtl`, or Arabic font handling exists.
- Current visible strings are hard-coded English in feature widgets and tests.

Implication: design-system tokens and widgets should be RTL-ready from the start, but full app localization should remain a separate app-level localization task.

## Existing Routing And Feature Architecture

Routing:

- `AppRoutePaths` defines splash, auth, main shell, and primary app destinations.
- `AppRouter.onGenerateRoute` centralizes route resolution.
- Auth-aware redirect logic lives in `AppRouter.resolveRouteName`.
- `MainShellPage` uses an `IndexedStack` plus Material `NavigationBar`.

Feature structure:

- The app is feature-first under `apps/mobile/lib/features/<feature>/`.
- Feature folders follow `data`, `logic`, and `ui` boundaries.
- Shared state/networking/config live under `apps/mobile/lib/core/`.
- Current feature UI includes placeholders plus real auth/profile screens.

Tests:

- There are 11 Dart tests under `apps/mobile/test/`.
- Coverage includes networking envelopes/client, routing, shared state, auth flow/context, profile models, shell navigation, role-aware placeholder visibility, and the app splash widget.
- Existing widget tests pump `MaterialApp` or `AimMobileApp`; future design-system tests should use small theme wrappers to avoid fighting these patterns.

## Recommended Design-System Location

The design system should not live inside `features/`. It is cross-feature UI infrastructure.

Use a two-layer structure:

1. App-wide tokens and theme integration live in `core/theme`.
2. Reusable AIM widgets live in a new top-level `design_system` library.

This fits the current app because `core/theme` already owns `ThemeData`, while `features/*/ui` can import reusable widgets without introducing feature dependencies.

## Proposed Folder Structure

### Token And Theme Layer

```text
apps/mobile/lib/core/theme/
  app_theme.dart
  theme.dart
  tokens/
    aim_colors.dart
    aim_fonts.dart
    aim_gradients.dart
    aim_motion.dart
    aim_radius.dart
    aim_shadows.dart
    aim_sizes.dart
    aim_spacing.dart
    aim_typography.dart
    tokens.dart
  extensions/
    aim_color_theme.dart
    aim_theme_extensions.dart
    extensions.dart
```

Why here:

- `core/theme` already owns `AppTheme.light`.
- AIM colors/typography/motion are app-wide foundations, not widgets.
- `AppTheme.light` and future `AppTheme.dark` can compose these tokens into `ThemeData`.

### Design-System Widgets

```text
apps/mobile/lib/design_system/
  design_system.dart
  components/
    buttons/
      aim_button.dart
      aim_fab.dart
      aim_icon_button.dart
      buttons.dart
    forms/
      aim_checkbox.dart
      aim_otp_input.dart
      aim_radio.dart
      aim_select.dart
      aim_switch.dart
      aim_text_area.dart
      aim_text_field.dart
      forms.dart
    feedback/
      aim_alert_banner.dart
      aim_badge.dart
      aim_chip.dart
      aim_skeleton.dart
      feedback.dart
    navigation/
      aim_bottom_nav.dart
      aim_segmented_control.dart
      aim_tabs.dart
      aim_top_app_bar.dart
      navigation.dart
    learning/
      aim_ai_feedback_bubble.dart
      aim_answer_option.dart
      aim_card.dart
      aim_circular_progress.dart
      aim_progress_bar.dart
      aim_record_button.dart
      learning.dart
```

Why here:

- Widgets are shared by all features and should not be owned by `core`.
- `design_system.dart` gives feature screens one stable import.
- Component groups match Task 1's source groups and the web design-system taxonomy.

### Core Widgets

Do not create a broad `core/widgets` layer for the design system.

Use `apps/mobile/lib/design_system/components/` for reusable AIM primitives. Keep `core/` for platform/app infrastructure like config, networking, routing, state, localization, and theme.

If a future widget is app infrastructure rather than AIM UI, it can live under:

```text
apps/mobile/lib/core/widgets/
```

Examples: app bootstrap/loading boundary, global error boundary, or route guard UI. None are needed for this design-system folder task.

### Docs

```text
docs/design/
  aim_design_system_flutter_conversion_map.md
  aim_mobile_design_system_architecture_plan.md
  source/
    aim-design-system/
```

Future implementation notes can stay in `docs/design/`. Do not duplicate long token values in feature READMEs.

### Preview Screen

Use a dev-only feature area, not a production route in the learner flow:

```text
apps/mobile/lib/features/design_system_preview/
  ui/
    pages/
      design_system_preview_page.dart
    widgets/
      token_preview_section.dart
      component_preview_section.dart
```

Route recommendation:

- Add a preview route only behind a debug/development gate, for example `AppConfig.environment != 'production'`.
- Suggested path: `/dev/design-system`
- Do not add it to `MainShellPage` bottom navigation.
- Keep the learner shell focused on Home/Learn/Review/Progress/Profile.

Test recommendation:

```text
apps/mobile/test/design_system/
  components/
  theme/
  preview/
```

Use widget tests first. Add golden tests only after a golden-test package and CI policy are intentionally chosen.

## Proposed Export Strategy

Theme exports:

```text
core/theme/theme.dart
  exports app_theme.dart
  exports tokens/tokens.dart
  exports extensions/extensions.dart
```

Design-system exports:

```text
design_system/design_system.dart
  exports components/buttons/buttons.dart
  exports components/forms/forms.dart
  exports components/feedback/feedback.dart
  exports components/navigation/navigation.dart
  exports components/learning/learning.dart
```

Feature screens should import:

```dart
import 'package:aim_mobile/design_system/design_system.dart';
```

Theme internals should import token files through:

```dart
import 'package:aim_mobile/core/theme/theme.dart';
```

## Integration Plan For Later Tasks

1. Create documentation and empty folders/barrel files only.
2. Add token constants and theme extensions under `core/theme`.
3. Update `AppTheme.light` and add `AppTheme.dark` without changing feature behavior yet.
4. Add component widgets under `design_system/components`.
5. Add the debug-only preview feature/route.
6. Migrate existing feature UI gradually from direct Material widgets to AIM design-system widgets.

## Architecture Risks

- Current `MaterialApp` has only `theme`, not `darkTheme`; dark-mode token parity will require app-level theme wiring.
- Localization is only constants. Full RTL behavior needs `supportedLocales`, delegates, locale selection, and Arabic font configuration later.
- Existing screens use hard-coded English strings, spacing, colors, and private helper widgets; migration should be incremental to avoid destabilizing auth/profile behavior.
- Existing tests assert exact text and Material shell behavior. Design-system adoption may require test updates, especially around `NavigationBar`, auth forms, and profile cards.
- No font assets are declared. Inter and IBM Plex Sans Arabic cannot be guaranteed until fonts are bundled or a font-loading strategy is chosen.
- No icon package is declared. Current UI uses Material Icons; matching the web system's Lucide/Feather-style outline icons may require either accepting Material Symbols for Phase 1 or adding an icon dependency later.
- `core/theme` currently has a flat file structure. Adding token subfolders should be done with barrel exports so existing imports of `core/theme/theme.dart` keep working.
- A preview route could leak into production if not gated. Keep design-system preview out of bottom navigation and guard it with environment/debug checks.
- Creating widgets inside `features/` would fight the current feature-first architecture because shared UI would then depend on one feature's ownership. Keep shared AIM UI in top-level `design_system`.

## Decision

The AIM mobile design system should live as:

- Theme tokens and ThemeData integration in `apps/mobile/lib/core/theme/`.
- Shared reusable AIM widgets in `apps/mobile/lib/design_system/`.
- Optional visual preview as a debug-only feature under `apps/mobile/lib/features/design_system_preview/`.
- Planning docs under `docs/design/`.

This extends the existing architecture instead of creating a parallel one.
