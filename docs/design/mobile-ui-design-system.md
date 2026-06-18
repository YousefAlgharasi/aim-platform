# AIM Mobile UI Design System

This document defines the mobile UI design system for the AIM Flutter app. It is for designers and developers working on AIM Mobile.

Source references:

- Web design-system source: `docs/design/source/aim-design-system/`
- Flutter conversion map: `docs/design/aim_design_system_flutter_conversion_map.md`
- Flutter architecture plan: `docs/design/aim_mobile_design_system_architecture_plan.md`

No Flutter implementation is required by this document. It describes what future Flutter tokens, theme extensions, and widgets must follow.

## Product And Brand

AIM is an AI-powered English learning platform for Arabic-speaking learners. The mobile app helps learners build English skills through adaptive lessons, quizzes, speaking practice, review, progress feedback, and a personal AI tutor.

Brand personality:

- Smart: AIM should feel capable, adaptive, and trustworthy.
- Encouraging: feedback should help the learner keep going.
- Modern: UI should be clean, responsive, and focused.
- Calm: avoid noise, clutter, and childish treatment.

Signature visual ideas:

- Trust: AIM Blue is the primary action, focus, and progress color.
- Intelligence: Purple and the AI gradient identify AI-generated or adaptive moments.
- Growth: Teal marks progress, mastery, improvement, and positive momentum.

## Bilingual Rule

English LTR and Arabic RTL are first-class. Neither language is an afterthought.

Rules:

- Every learner-facing string must have English and Arabic coverage once localization is implemented.
- Use natural Arabic, not literal translation.
- Layouts must mirror correctly under RTL.
- Use `TextAlign.start`, `AlignmentDirectional`, and `EdgeInsetsDirectional` in Flutter.
- Directional icons, including back arrows and chevrons, must flip in RTL.
- Numbers, OTP codes, timers, percentages, and short technical codes should remain LTR even inside Arabic screens.

## Voice And Copy

Voice:

- Speak directly to the learner.
- Be warm, plain, and specific.
- Celebrate effort and improvement.
- Correct gently and clearly.

Copy rules:

- Prefer short sentences.
- Button labels should be verbs: `Continue`, `Check answer`, `Start lesson`.
- Avoid jargon and filler.
- Do not add stats, badges, or helper text unless they help the learner act.
- Praise should be specific: `Your past perfect is spot on.`
- Corrections should be supportive: `Try "have" instead of "has" with "I".`
- Arabic copy should be idiomatic and readable, not mechanically translated.

## Token Categories

The original design system defines these token categories:

- Global entry: `styles.css`
- Colors: `tokens/colors.css`
- Fonts: `tokens/fonts.css`
- Typography: `tokens/typography.css`
- Spacing: `tokens/spacing.css`
- Radius: `tokens/radius.css`
- Shadows and elevation: `tokens/shadows.css`
- Sizes, z-order, and motion: `tokens/sizes.css`

Flutter should keep app-wide token and theme files under `apps/mobile/lib/core/theme/`, then expose reusable components from `apps/mobile/lib/design_system/`.

## Color System

Use semantic colors in components and feature screens. Raw color scales are allowed inside token definitions and low-level component internals only.

### Raw Scales

Primary AIM Blue:

| Token | Hex |
| --- | --- |
| `primary.50` | `#EDF1FF` |
| `primary.100` | `#DCE4FF` |
| `primary.200` | `#BBC9FF` |
| `primary.300` | `#93A6FF` |
| `primary.400` | `#6B82FB` |
| `primary.500` | `#4762EE` |
| `primary.600` | `#3349D6` |
| `primary.700` | `#2837AC` |
| `primary.800` | `#243189` |
| `primary.900` | `#1F2A6E` |

Secondary Purple:

| Token | Hex |
| --- | --- |
| `secondary.50` | `#F5F1FE` |
| `secondary.100` | `#EBE3FD` |
| `secondary.200` | `#D7C8FB` |
| `secondary.300` | `#BBA1F6` |
| `secondary.400` | `#9E78EF` |
| `secondary.500` | `#8455E4` |
| `secondary.600` | `#6F3FD0` |
| `secondary.700` | `#5C32AE` |
| `secondary.800` | `#4C2C8C` |
| `secondary.900` | `#3F2772` |

Accent Teal:

| Token | Hex |
| --- | --- |
| `accent.50` | `#ECFBF8` |
| `accent.100` | `#D2F5EE` |
| `accent.200` | `#A7EBDF` |
| `accent.300` | `#6FDAC9` |
| `accent.400` | `#38C2AF` |
| `accent.500` | `#15A898` |
| `accent.600` | `#0C897C` |
| `accent.700` | `#0E6D64` |
| `accent.800` | `#105751` |
| `accent.900` | `#114945` |

Neutral Cool Gray:

| Token | Hex |
| --- | --- |
| `neutral.0` | `#FFFFFF` |
| `neutral.50` | `#F7F8FA` |
| `neutral.100` | `#EEF0F4` |
| `neutral.200` | `#E2E5EC` |
| `neutral.300` | `#CDD2DD` |
| `neutral.400` | `#A6AEBF` |
| `neutral.500` | `#7A8499` |
| `neutral.600` | `#5A6377` |
| `neutral.700` | `#424A5C` |
| `neutral.800` | `#2B3140` |
| `neutral.900` | `#181C26` |

Semantic status scales:

| Family | Tokens |
| --- | --- |
| Success | `success.50 #E7F7EF`, `success.100 #C6ECD9`, `success.500 #1FA971`, `success.600 #168A5C`, `success.700 #126E4A` |
| Warning | `warning.50 #FEF4E2`, `warning.100 #FCE6BC`, `warning.500 #F5A524`, `warning.600 #D8871A`, `warning.700 #A96512` |
| Error | `error.50 #FDECEC`, `error.100 #FAC9CB`, `error.500 #E5484D`, `error.600 #C7363B`, `error.700 #9E282D` |
| Info | `info.50 #E8F2FC`, `info.100 #C7DFF8`, `info.500 #3A8DDE`, `info.600 #2A72BC`, `info.700 #205893` |

### Semantic Aliases

Light mode aliases:

- Surfaces: `background`, `surface`, `surfaceRaised`, `surfaceSunken`
- Text: `textPrimary`, `textSecondary`, `textMuted`, `textOnPrimary`, `textLink`
- Borders: `border`, `borderStrong`, `divider`
- Focus: `focusRing`
- Disabled: `disabledBg`, `disabledFg`, `disabledBorder`
- Interaction overlays: `stateHover`, `statePressed`

Soft fill pairs:

- `primarySoft` and `primarySoftFg`
- `secondarySoft` and `secondarySoftFg`
- `accentSoft` and `accentSoftFg`
- `successSoft` and `successSoftFg`
- `warningSoft` and `warningSoftFg`
- `errorSoft` and `errorSoftFg`
- `infoSoft` and `infoSoftFg`

Status mapping:

- Success: completed, correct, strong area.
- Primary: in progress, recommended.
- Warning: needs review, weak area.
- Neutral: locked, not started.
- Error: wrong, destructive.
- Secondary: new or AI-adjacent metadata.
- Info: informational messages.

### Gradients

Gradients are tokens, not decoration.

- `gradientAi`: primary 500 to secondary 500 at 135 degrees.
- `gradientAiSoft`: primary 50 to secondary 50 at 135 degrees.
- `gradientGrowth`: accent 500 to primary 500 at 135 degrees.

Rules:

- Use `gradientAi` only for AI-generated or adaptive elements.
- Use `gradientGrowth` for progress and growth states.
- Do not use gradients on ordinary buttons or decorative backgrounds.

## Dark Mode

Dark mode must be semantic, not raw-color swapping in feature screens.

Rules:

- Components must read semantic aliases from the Flutter theme extension.
- Do not hard-code light-mode surfaces in widgets.
- Dark mode must define background, surfaces, text, borders, divider, focus, soft fills, disabled colors, and interaction overlays.
- AI and growth gradients remain recognizable in dark mode, but surrounding surfaces and text must remain accessible.
- `AppTheme.light` and future `AppTheme.dark` should be the only app-level theme entry points.

## Typography System

Fonts:

- English: Inter.
- Arabic: IBM Plex Sans Arabic.
- Fallback Arabic font: Noto Sans Arabic or platform sans.
- Monospace: platform monospace for technical specimens and codes.

Type roles:

| Role | Size/Line | Weight | Tracking |
| --- | --- | --- | --- |
| Display | `34/40` | 800 | `-0.02em` |
| H1 | `28/34` | 700 | `-0.01em` |
| H2 | `23/30` | 700 | `-0.01em` |
| H3 | `19/26` | 600 | `0` |
| Title | `17/24` | 600 | `0` |
| Body large | `17/26` | 400 | `0` |
| Body medium | `16/24` | 400 | `0` |
| Body small | `14/21` | 400 | `0` |
| Caption | `12/16` | 500 | `0.01em` |
| Button | `15/20` | 600 | `0.01em` |
| Label | `13/18` | 600 | `0.01em` |
| Helper | `12/16` | 400 | `0` |

Arabic typography:

- Use IBM Plex Sans Arabic for Arabic text.
- Arabic line-height should be looser: multiply role line heights by about `1.18`.
- Avoid all-caps styling for Arabic.
- Avoid tight or negative letter spacing for Arabic.
- Learner content should not be smaller than 16px unless it is helper, metadata, or dense secondary UI.

## Spacing System

AIM uses an 8-point grid with 4px half steps.

Scale:

- `space0`: 0
- `space2`: 2
- `space4`: 4
- `space8`: 8
- `space12`: 12
- `space16`: 16
- `space20`: 20
- `space24`: 24
- `space32`: 32
- `space40`: 40
- `space48`: 48
- `space64`: 64

Semantic spacing:

- Mobile screen padding: 16
- Web/tablet screen padding: 24
- Card padding: 16
- Large card padding: 20
- Section gap: 24
- Component gap: 12
- Inner gap: 8
- List item gap: 12
- Form field gap: 16

Rules:

- Use `gap`-style layout through `SizedBox`, `Wrap.spacing`, `Row`, `Column`, and padding helpers.
- Prefer token spacing over one-off numeric values.
- Feature screens should not invent new page padding unless a layout truly needs it.

## Radius System

Radius tokens:

- `xs`: 6, for chips and small inner shapes.
- `sm`: 8, for inputs, small buttons, and badges.
- `md`: 12, for buttons and default cards.
- `lg`: 16, for feature cards and sheets.
- `xl`: 24, for large sheets and hero cards.
- `2xl`: 32, for large AI surfaces.
- `pill`: 999, for pills, toggles, FABs, and avatars.
- `full`: circular shapes.

Rules:

- Preserve the soft, friendly shape language.
- Use `pill` only for intentionally pill-shaped controls.
- Use directional border radius where a bubble or notch must mirror in RTL.

## Shadow And Elevation

Shadow tokens:

- `none`: no shadow.
- `card`: resting card elevation.
- `cardHover`: lifted interactive card elevation.
- `dropdown`: popover and menu elevation.
- `modal`: dialog elevation.
- `sheet`: bottom sheet elevation rising upward.
- `fab`: primary-tinted floating action elevation.
- `focus`: visible focus ring.
- `inset`: sunken input or track treatment.

Rules:

- Shadows should be soft and cool-tinted.
- Use elevation sparingly.
- Use `cardHover` only for interactive surfaces.
- Flutter has no direct CSS inset shadow; use subtle borders/fills unless custom painting is clearly needed.

## Sizes And Touch Targets

Control sizes:

- Button small: 36
- Button medium: 44
- Button large: 52
- Input: 48
- Input small: 40
- Icon button: 44
- FAB: 56

Icon sizes:

- Small: 16
- Medium: 20
- Large: 24

Avatar sizes:

- Small: 32
- Medium: 40
- Large: 56

Layout sizes:

- Bottom navigation height: 64 before safe-area inset.
- Top app bar height: 56.
- Web content max width: 1200.
- Sidebar width: 260.

Accessibility:

- Minimum touch target is 44.
- Icon-only controls must still provide a 44px target.
- Do not shrink tappable UI below token sizes to fit dense layouts.

Z-order tokens:

- `base`, `raised`, `sticky`, `dropdown`, `overlay`, `modal`, `sheet`, `toast`, `tooltip`.
- Flutter should use these as overlay-order guidance, not as a CSS-style z-index clone.

## Motion

Motion tokens:

- Fast: 120ms.
- Base: 180ms.
- Slow: 260ms.
- Standard curve: cubic `0.2, 0, 0, 1`.
- Emphasis curve: cubic `0.2, 0, 0, 1.2`.

Rules:

- Motion should be quick and physical.
- Buttons scale down slightly on press.
- Progress bars and rings may animate into position.
- Tabs and segmented controls should animate their active indicators.
- Skeleton shimmer, record pulse, and typing dots must honor reduced motion.
- If platform reduce motion is enabled, disable decorative repeated animation and shorten or remove progress animations.

## Icons

Icon style:

- Outline icons.
- 2px stroke.
- Round caps and joins.
- 24px grid.
- Use current text color.

Rules:

- Use icon sizes from the token scale.
- Icon-only buttons require an accessible label.
- Directional icons must flip in RTL.
- Inline icons should align with text and use an 8px gap.
- Avoid decorative emoji except where the brand intentionally uses them.

## Accessibility

Required behavior:

- Minimum touch target: 44.
- Visible focus state on every interactive element.
- Proper semantic labels for icon buttons, FABs, remove buttons, dismiss buttons, and record buttons.
- Progress widgets must expose value, min, and max semantics.
- Selected, pressed, disabled, loading, and error states must be exposed to assistive technologies where Flutter supports it.
- Color must not be the only signal for correctness, warning, selection, or errors.
- Error text must be placed near the relevant field or action.
- Dark mode and soft fills must preserve contrast.

## Component Index

Buttons:

- `Button`
- `IconButton`
- `Fab`

Forms:

- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `Radio`
- `Switch`
- `OTPInput`

Feedback:

- `Badge`
- `Chip`
- `AlertBanner`
- `Skeleton`

Navigation:

- `Tabs`
- `SegmentedControl`
- `TopAppBar`
- `BottomNav`

Learning:

- `Card`
- `ProgressBar`
- `CircularProgress`
- `AnswerOption`
- `AIFeedbackBubble`
- `RecordButton`

## Web Components To Flutter Widgets

| Original web component | Flutter widget |
| --- | --- |
| `Button` | `AimButton` |
| `IconButton` | `AimIconButton` |
| `Fab` | `AimFab` |
| `Input` | `AimTextField` |
| `Textarea` | `AimTextArea` |
| `Select` | `AimSelect<T>` |
| `Checkbox` | `AimCheckbox` |
| `Radio` | `AimRadio<T>` |
| `Switch` | `AimSwitch` |
| `OTPInput` | `AimOtpInput` |
| `Badge` | `AimBadge` |
| `Chip` | `AimChip` |
| `AlertBanner` | `AimAlertBanner` |
| `Skeleton` | `AimSkeleton` |
| `Tabs` | `AimTabs` |
| `SegmentedControl` | `AimSegmentedControl<T>` |
| `TopAppBar` | `AimTopAppBar` |
| `BottomNav` | `AimBottomNav` |
| `Card` | `AimCard` |
| `ProgressBar` | `AimProgressBar` |
| `CircularProgress` | `AimCircularProgress` |
| `AnswerOption` | `AimAnswerOption` |
| `AIFeedbackBubble` | `AimAiFeedbackBubble` |
| `RecordButton` | `AimRecordButton` |

## Flutter Location

Tokens and theme integration:

```text
apps/mobile/lib/core/theme/
  tokens/
  extensions/
  app_theme.dart
  theme.dart
```

Reusable AIM widgets:

```text
apps/mobile/lib/design_system/
  design_system.dart
  components/
    buttons/
    forms/
    feedback/
    navigation/
    learning/
```

Preview screen:

```text
apps/mobile/lib/features/design_system_preview/
```

The preview route must be debug/development-only and must not appear in the learner bottom navigation.

## When To Use AIM Widgets

Feature screens should use core AIM design-system widgets instead of one-off styling when:

- The UI matches a listed component category.
- The component has interactive states such as disabled, pressed, focus, loading, selected, or error.
- The component needs RTL mirroring.
- The component needs dark-mode support.
- The component displays semantic status, progress, feedback, badges, alerts, or AI tutor content.
- The screen repeats a pattern already used elsewhere.
- The layout uses AIM spacing, radius, color, typography, shadow, or motion tokens.

One-off styling is acceptable only when:

- The UI is temporary scaffolding for a feature placeholder.
- The pattern is truly feature-specific and not reusable.
- The styling is inside a preview or experiment that will not ship.
- A designer and engineer agree that the pattern should not become part of the shared system.

If a feature creates the same private helper widget twice, promote the pattern into the design system or open a follow-up task.

## Implementation Guardrails

- Do not calculate mastery, level, weakness, difficulty, retention, or recommendations in Flutter UI.
- Do not expose provider keys, service-role keys, database credentials, or privileged backend details.
- Do not place shared AIM UI inside a feature folder.
- Do not bypass semantic tokens with raw colors in feature screens.
- Do not use the AI gradient for ordinary decoration.
- Do not add a production design-system route to the learner shell.

## Handoff Summary

The AIM Mobile design system should be implemented as:

- Brand, color, type, spacing, radius, shadow, size, motion, icon, and accessibility rules in docs and token files.
- Theme tokens and `ThemeData` integration under `core/theme`.
- Shared components under `design_system/components`.
- A debug-only preview feature for designers and developers.
- Gradual feature migration from direct Material styling to AIM widgets.
