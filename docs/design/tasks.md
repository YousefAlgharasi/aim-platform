# AIM Mobile Design System Implementation Tasks

These tasks are written for an implementation agent that will convert the existing AIM HTML/CSS/JS design system into the real Flutter mobile app in `YousefAlgharasi/aim-platform`.

Important rule: do not skip Task 1. The real design system must be inspected before writing Flutter code, so the mobile implementation matches the actual source instead of guessing.

---

## Task 1: Study The Real AIM Design System Source

Prompt:

You are a senior Flutter design-system engineer. Before implementing anything, inspect the real AIM design system source files and create a conversion map. Do not write Flutter code in this task.

Source design-system files to inspect:
which you find in doce/design/source/
- `readme.md`
- `styles.css`
- `tokens/colors.css`
- `tokens/fonts.css`
- `tokens/typography.css`
- `tokens/spacing.css`
- `tokens/radius.css`
- `tokens/shadows.css`
- `tokens/sizes.css`
- `foundations/*.html`
- `components/**/*.d.ts`
- `components/**/*.prompt.md`
- `components/**/*.jsx`

Output:

- A full checklist of all design tokens.
- A full checklist of all 24 components.
- A mapping from each web token/component to the planned Flutter file/class.
- A list of any design details that need special Flutter handling, including gradients, dark mode, RTL, Arabic typography, focus states, pressed states, loading states, and reduced motion.

Acceptance criteria:

- Every token file has been reviewed.
- Every `.d.ts` component contract has been reviewed.
- Every `.prompt.md` usage guide has been reviewed.
- No Flutter code has been changed yet.
- The next task can use this map as the source of truth.

Depends on:

- None.

---

## Task 2: Inspect The Real Flutter App Architecture

Prompt:

You are a senior Flutter architect. Inspect the real Flutter app in `YousefAlgharasi/aim-platform` and determine exactly where the AIM mobile design system should live. Do not implement design-system code yet.

Repo areas to inspect:

- `apps/mobile/pubspec.yaml`
- `apps/mobile/lib/app/`
- `apps/mobile/lib/core/theme/`
- `apps/mobile/lib/core/localization/`
- `apps/mobile/lib/core/routing/`
- `apps/mobile/lib/features/`
- existing tests in `apps/mobile/test/`

Output:

- Current Flutter SDK and dependency summary.
- Confirmation whether Material 3 is enabled.
- Existing theme structure summary.
- Existing localization/RTL support summary.
- Proposed folder structure for design tokens, theme, core widgets, docs, and preview screen.
- Any risks caused by current app architecture.

Acceptance criteria:

- The proposed structure fits the existing app.
- The plan does not create a parallel architecture that fights the current app.
- The next task can safely create documentation and folders.

Depends on:

- Task 1.

---

## Task 3: Create The Mobile Design-System Documentation

Prompt:

You are a technical writer and Flutter design-system engineer. Create `docs/design/mobile-ui-design-system.md` in the real repo. This document must be useful for both developers and designers.

The documentation must include:

- AIM brand personality: smart, encouraging, modern, calm.
- Product context: AI-powered English learning for Arabic-speaking learners.
- Bilingual rule: English LTR and Arabic RTL are first-class.
- Voice and copy rules.
- Color system, including raw scales and semantic aliases.
- Dark mode rules.
- Typography system, including Inter, IBM Plex Sans Arabic, and Arabic line-height guidance.
- Spacing system.
- Radius system.
- Shadow/elevation system.
- Size and touch-target rules.
- Motion rules.
- Icon rules.
- Accessibility rules.
- Component index.
- Mapping from original web components to Flutter widgets.
- Rules for when feature screens should use core AIM widgets instead of one-off styling.

Acceptance criteria:

- The doc is created at `docs/design/mobile-ui-design-system.md`.
- It references every token category from the original design system.
- It references every component category: buttons, forms, feedback, navigation, learning.
- It is clear enough for designers and developers.
- No Flutter implementation is required in this task.

Depends on:

- Task 2.

---

## Task 4: Create Flutter Design Token Files

Prompt:

You are a Flutter design-system engineer. Implement the AIM design tokens in Dart using the conversion map from Task 1 and the architecture from Task 2.

Create:

- `apps/mobile/lib/core/design_tokens/aim_colors.dart`
- `apps/mobile/lib/core/design_tokens/aim_spacing.dart`
- `apps/mobile/lib/core/design_tokens/aim_radius.dart`
- `apps/mobile/lib/core/design_tokens/aim_shadows.dart`
- `apps/mobile/lib/core/design_tokens/aim_sizes.dart`
- `apps/mobile/lib/core/design_tokens/aim_typography.dart`
- `apps/mobile/lib/core/design_tokens/aim_motion.dart`
- `apps/mobile/lib/core/design_tokens/aim_gradients.dart`
- `apps/mobile/lib/core/design_tokens/design_tokens.dart`

Must include:

- Primary, secondary, accent, neutral, success, warning, error, and info color scales.
- Light semantic aliases.
- Dark semantic aliases.
- Soft fill colors and foreground colors.
- AI gradient, AI soft gradient, growth gradient.
- All spacing tokens and semantic spacing aliases.
- All radius tokens.
- All shadow/elevation tokens adapted to Flutter `BoxShadow`.
- All size tokens: button heights, input heights, icon sizes, avatar sizes, touch target, nav heights.
- Typography roles from the original system.
- Motion duration and curve equivalents.

Acceptance criteria:

- Every CSS token has a Dart equivalent or a documented reason why it does not apply to Flutter.
- Token files contain constants only and do not depend on feature code.
- Barrel export file exists.
- Flutter analyzer passes.

Depends on:

- Task 3.

---

## Task 5: Upgrade The Flutter Theme System

Prompt:

You are a Flutter Material 3 theme engineer. Replace the basic seed-color theme with a complete AIM light and dark theme using the token files from Task 4.

Create or update:

- `apps/mobile/lib/core/theme/app_theme.dart`
- `apps/mobile/lib/core/theme/aim_light_theme.dart`
- `apps/mobile/lib/core/theme/aim_dark_theme.dart`
- `apps/mobile/lib/core/theme/aim_theme_extensions.dart`
- `apps/mobile/lib/core/theme/theme.dart`

Must support:

- `AppTheme.light`
- `AppTheme.dark`
- Material 3 `ColorScheme`
- AIM `TextTheme`
- buttons
- icon buttons
- inputs
- cards
- chips
- navigation bars
- app bars
- dialogs
- snackbars
- bottom sheets
- custom theme extensions for gradients, semantic soft fills, shadows, and AIM-specific surfaces

Acceptance criteria:

- The app no longer depends on `Colors.indigo` seed styling.
- Light and dark themes are both available.
- Theme extensions expose AIM-specific tokens that Flutter does not provide natively.
- Existing app still compiles.
- Flutter analyzer passes.

Depends on:

- Task 4.

---

## Task 6: Enable App-Level Dark Mode

Prompt:

You are a Flutter app integration engineer. Wire the new AIM light and dark themes into the mobile app.

Update:

- `apps/mobile/lib/app/aim_mobile_app.dart`
- any existing theme provider/state file if one exists, or create the smallest appropriate theme-mode provider if needed.

Must support:

- light theme
- dark theme
- system theme mode by default
- future ability to add a user setting for light/dark/system

Acceptance criteria:

- `MaterialApp` uses both `theme` and `darkTheme`.
- `themeMode` is controlled in a clean way.
- The current app routes still work.
- Flutter analyzer and tests pass.

Depends on:

- Task 5.

---

## Task 7: Add AIM Font Support

Prompt:

You are a Flutter typography engineer. Add the AIM font system to the Flutter app.

Required font behavior:

- English uses Inter.
- Arabic uses IBM Plex Sans Arabic.
- Arabic line height is looser, following the original design-system guidance.
- Learner-facing body text is not below the original minimum sizes.

Implementation decisions:

- Prefer local bundled fonts for production reliability if font files are available.
- If font files are not available yet, document the exact font asset paths/names needed and implement the theme in a way that can accept them cleanly later.

Acceptance criteria:

- Font choices are represented in the theme/token layer.
- `pubspec.yaml` is updated only if actual font assets exist.
- Arabic text rendering strategy is documented.
- Flutter analyzer passes.

Depends on:

- Task 6.

---

## Task 8: Implement Core Button Widgets

Prompt:

You are a Flutter design-system component engineer. Implement the AIM button components using the original web design-system contracts and prompts as the source of truth.

Create:

- `apps/mobile/lib/core/widgets/buttons/aim_button.dart`
- `apps/mobile/lib/core/widgets/buttons/aim_icon_button.dart`
- `apps/mobile/lib/core/widgets/buttons/aim_fab.dart`
- appropriate barrel exports

Must support:

- `AIMButton`: primary, secondary, outline, ghost, destructive.
- sizes: small 36, medium 44, large 52.
- full-width mode.
- loading state.
- disabled state.
- leading/trailing icons using start/end behavior.
- `AIMIconButton`: ghost, solid, soft, outline, round, disabled, semantic label.
- `AIMFab`: gradient default, non-gradient option, extended option, semantic label.

Acceptance criteria:

- Components match original visual behavior as closely as Flutter allows.
- RTL icon placement works.
- Minimum touch target is respected.
- Loading/disabled states are implemented.
- Flutter analyzer and widget tests pass where added.

Depends on:

- Task 7.

---

## Task 9: Implement Core Surface And Feedback Widgets

Prompt:

You are a Flutter design-system component engineer. Implement AIM surface and feedback components using the original component contracts.

Create:

- `apps/mobile/lib/core/widgets/learning/aim_card.dart`
- `apps/mobile/lib/core/widgets/feedback/aim_badge.dart`
- `apps/mobile/lib/core/widgets/feedback/aim_chip.dart`
- `apps/mobile/lib/core/widgets/feedback/aim_alert_banner.dart`
- `apps/mobile/lib/core/widgets/feedback/aim_skeleton.dart`
- appropriate barrel exports

Must support:

- `AIMCard`: default, elevated, AI gradient ring, full gradient, padded, interactive.
- `AIMBadge`: primary, secondary, accent, success, warning, error, info, neutral.
- badge variants: soft, solid, outline, pill, dot, optional icon.
- `AIMChip`: selected, removable, disabled, optional icon.
- `AIMAlertBanner`: info, success, warning, error, title, dismissible, action.
- `AIMSkeleton`: text, rect, circle, multiple lines, reduced-motion friendly.

Acceptance criteria:

- Feedback tones match the original semantic mapping.
- AI gradient is reserved for AI/adaptive contexts.
- Dark mode colors remain readable.
- RTL layout works.
- Flutter analyzer passes.

Depends on:

- Task 8.

---

## Task 10: Implement Core Form Widgets

Prompt:

You are a Flutter form component engineer. Implement AIM form controls based on the original design system.

Create:

- `apps/mobile/lib/core/widgets/forms/aim_input.dart`
- `apps/mobile/lib/core/widgets/forms/aim_textarea.dart`
- `apps/mobile/lib/core/widgets/forms/aim_select.dart`
- `apps/mobile/lib/core/widgets/forms/aim_checkbox.dart`
- `apps/mobile/lib/core/widgets/forms/aim_radio.dart`
- `apps/mobile/lib/core/widgets/forms/aim_switch.dart`
- `apps/mobile/lib/core/widgets/forms/aim_otp_input.dart`
- appropriate barrel exports

Must support:

- labels
- helpers
- errors
- disabled state
- required state
- leading icons
- password show/hide
- search/email/tel/number keyboard types
- textarea max-length counter
- select placeholder/options
- checkbox indeterminate state
- radio group usage
- switch RTL thumb direction
- OTP auto-advance, paste, backspace, completion callback, LTR digits inside RTL layouts

Acceptance criteria:

- All form states from the web design system are supported.
- Error/helper behavior is consistent.
- Tap targets meet 44px minimum.
- RTL behavior works.
- Flutter analyzer and form widget tests pass where added.

Depends on:

- Task 9.

---

## Task 11: Implement Core Navigation Widgets

Prompt:

You are a Flutter navigation component engineer. Implement AIM navigation components based on the original design system.

Create:

- `apps/mobile/lib/core/widgets/navigation/aim_top_app_bar.dart`
- `apps/mobile/lib/core/widgets/navigation/aim_bottom_nav.dart`
- `apps/mobile/lib/core/widgets/navigation/aim_tabs.dart`
- `apps/mobile/lib/core/widgets/navigation/aim_segmented_control.dart`
- appropriate barrel exports

Must support:

- `AIMTopAppBar`: title, back button, leading, actions, centered title, transparent mode, RTL-flipped back arrow.
- `AIMBottomNav`: 3-5 destinations, selected state, active icon, badge, safe-area support.
- `AIMTabs`: value, items, optional count, optional icon, animated indicator.
- `AIMSegmentedControl`: 2-4 options, icon support, full-width option, animated thumb.

Acceptance criteria:

- Existing `MainShellPage` can be migrated to `AIMBottomNav` after this task.
- RTL behavior works.
- Dark mode works.
- Flutter analyzer passes.

Depends on:

- Task 10.

---

## Task 12: Implement Learning-Specific Widgets

Prompt:

You are a Flutter learning-product UI engineer. Implement the AIM learning components exactly from the design-system contracts and usage guidance.

Create:

- `apps/mobile/lib/core/widgets/learning/aim_progress_bar.dart`
- `apps/mobile/lib/core/widgets/learning/aim_circular_progress.dart`
- `apps/mobile/lib/core/widgets/learning/aim_answer_option.dart`
- `apps/mobile/lib/core/widgets/learning/aim_ai_feedback_bubble.dart`
- `apps/mobile/lib/core/widgets/learning/aim_record_button.dart`
- appropriate barrel exports

Must support:

- `AIMProgressBar`: value, max, label, show value, primary/gradient/success/warning tones, sm/md/lg sizes, custom formatter.
- `AIMCircularProgress`: value, max, size, thickness, primary/gradient/success tones, custom center label, caption, show value.
- `AIMAnswerOption`: default, selected, correct, incorrect, reveal, option key, disabled after grading, start-aligned text.
- `AIMAIFeedbackBubble`: neutral, praise, correction, typing indicator, gradient avatar, RTL mirroring.
- `AIMRecordButton`: idle, recording, disabled, timer caption, reduced-motion friendly pulse behavior.

Acceptance criteria:

- Learning states match the original component behavior.
- AI-generated/adaptive surfaces use the AI gradient correctly.
- Arabic and English content both render cleanly.
- Flutter analyzer passes.

Depends on:

- Task 11.

---

## Task 13: Create A Design-System Preview Screen

Prompt:

You are a Flutter design-system QA engineer. Create a debug-only AIM design-system preview experience so the Flutter implementation can be visually compared against the original HTML design system.

Create:

- `apps/mobile/lib/features/design_system_preview/`

The preview should show:

- color specimens
- typography specimens
- spacing/radius/shadow specimens
- button states
- form states
- feedback states
- navigation components
- learning components
- light/dark toggle
- English/Arabic toggle
- RTL/LTR comparison

Acceptance criteria:

- All implemented AIM components are visible in one preview area.
- Preview can be opened during development without affecting production navigation.
- The preview is suitable for comparing against the original `overview.html`, `foundations/*.html`, and component card HTML files.
- Flutter analyzer passes.

Depends on:

- Task 12.

---

## Task 14: Migrate Existing App Shell And Shared Screens

Prompt:

You are a Flutter app integration engineer. Start using the AIM design system in the real app, beginning with shared app shell and existing placeholder screens.

Migrate:

- `apps/mobile/lib/features/shell/ui/pages/main_shell_page.dart`
- shell widgets
- placeholder pages where appropriate
- shared banners/cards/buttons in current screens

Use:

- `AIMBottomNav`
- `AIMTopAppBar`
- `AIMCard`
- `AIMButton`
- `AIMBadge`
- other already-created core widgets as needed

Acceptance criteria:

- App shell visually follows the AIM design system.
- Bottom navigation matches AIM rules.
- Existing routes still work.
- No feature logic is rewritten unnecessarily.
- Flutter analyzer and tests pass.

Depends on:

- Task 13.

---

## Task 15: Migrate Auth And Profile UI

Prompt:

You are a Flutter feature UI engineer. Migrate authentication and profile screens to use the AIM design-system widgets.

Migrate relevant files under:

- `apps/mobile/lib/features/auth/ui/`
- `apps/mobile/lib/features/profile/ui/`

Use:

- `AIMInput`
- `AIMTextarea` where needed
- `AIMButton`
- `AIMIconButton`
- `AIMAlertBanner`
- `AIMCard`
- `AIMSwitch`

Acceptance criteria:

- Login/register/profile/edit-profile screens use AIM core widgets.
- Error, loading, disabled, and validation states use AIM styles.
- English and Arabic layouts remain possible.
- Dark mode works.
- Flutter analyzer and tests pass.

Depends on:

- Task 14.

---

## Task 16: Migrate Learning, Practice, Progress, Review, And AI Teacher UI

Prompt:

You are a Flutter learning-product engineer. Migrate the learning-related feature screens to use the AIM design system.

Migrate relevant files under:

- `apps/mobile/lib/features/home/ui/`
- `apps/mobile/lib/features/lessons/ui/`
- `apps/mobile/lib/features/practice/ui/`
- `apps/mobile/lib/features/progress/ui/`
- `apps/mobile/lib/features/reviews/ui/`
- `apps/mobile/lib/features/placement/ui/`
- `apps/mobile/lib/features/ai_teacher/ui/`

Use:

- `AIMCard`
- `AIMProgressBar`
- `AIMCircularProgress`
- `AIMAnswerOption`
- `AIMAIFeedbackBubble`
- `AIMRecordButton`
- `AIMBadge`
- `AIMChip`
- `AIMTabs`
- `AIMSegmentedControl`

Acceptance criteria:

- Learning states follow the original design-system status mapping.
- AI surfaces use the AI gradient carefully and consistently.
- Progress, mastery, quiz, speaking, and review UI use AIM components.
- Dark mode works.
- RTL works.
- Flutter analyzer and tests pass.

Depends on:

- Task 15.

---

## Task 17: Add Tests And Visual Verification

Prompt:

You are a Flutter QA engineer. Add verification coverage for the AIM mobile design system.

Add or update tests for:

- theme creation
- token availability
- light/dark mode
- RTL rendering basics
- buttons
- forms
- feedback components
- navigation components
- learning components
- design-system preview smoke test

Also perform manual visual checks against:

- `overview.html`
- `foundations/*.html`
- `components/**/**/*.card.html`
- original component `.prompt.md` examples

Acceptance criteria:

- `flutter analyze` passes.
- `flutter test` passes.
- A checklist confirms every original component has a Flutter equivalent.
- A checklist confirms every original token has a Flutter equivalent or documented exception.
- Light, dark, English, and Arabic states have been checked.

Depends on:

- Task 16.

---

## Task 18: Final Design-System Completion Audit

Prompt:

You are a senior design-system reviewer. Audit the completed Flutter implementation against the original AIM design system. Do not add new features unless needed to fix mismatches.

Audit:

- docs
- tokens
- theme
- fonts
- dark mode
- RTL/Arabic
- accessibility
- all core widgets
- preview screen
- migrated app screens
- tests

Acceptance criteria:

- No original design-system component is missing.
- No original token category is missing.
- Any intentional differences from the HTML/CSS/JS design system are documented.
- The Flutter app has a clear path for future screens to use the AIM design system.
- Final summary lists what was implemented, what was verified, and what remains optional/future.

Depends on:

- Task 17.
