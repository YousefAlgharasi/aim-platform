# AIM Design System Flutter Conversion Map

Task: Study the real AIM design-system source and create the Flutter conversion map.

Source reviewed: `docs/design/source/aim-design-system`

No Flutter code was changed for this task. This document is the source of truth for the next implementation task.

## Source Review Checklist

- [x] `readme.md`
- [x] `styles.css`
- [x] `tokens/colors.css`
- [x] `tokens/fonts.css`
- [x] `tokens/typography.css`
- [x] `tokens/spacing.css`
- [x] `tokens/radius.css`
- [x] `tokens/shadows.css`
- [x] `tokens/sizes.css`
- [x] `foundations/color-accent.html`
- [x] `foundations/color-gradients.html`
- [x] `foundations/color-neutral.html`
- [x] `foundations/color-primary.html`
- [x] `foundations/color-secondary.html`
- [x] `foundations/color-semantic.html`
- [x] `foundations/color-surface.html`
- [x] `foundations/radius-scale.html`
- [x] `foundations/shadow-scale.html`
- [x] `foundations/spacing-scale.html`
- [x] `foundations/type-arabic.html`
- [x] `foundations/type-body.html`
- [x] `foundations/type-headings.html`
- [x] 24 component `.d.ts` contracts
- [x] 24 component `.prompt.md` usage guides
- [x] 24 component `.jsx` implementations

## Planned Flutter Structure

Token/theme files:

- `apps/mobile/lib/core/theme/aim_colors.dart`
- `apps/mobile/lib/core/theme/aim_fonts.dart`
- `apps/mobile/lib/core/theme/aim_typography.dart`
- `apps/mobile/lib/core/theme/aim_spacing.dart`
- `apps/mobile/lib/core/theme/aim_radius.dart`
- `apps/mobile/lib/core/theme/aim_shadows.dart`
- `apps/mobile/lib/core/theme/aim_sizes.dart`
- `apps/mobile/lib/core/theme/aim_motion.dart`
- `apps/mobile/lib/core/theme/aim_theme_extensions.dart`
- `apps/mobile/lib/core/theme/app_theme.dart`

Component files:

- `apps/mobile/lib/design_system/components/buttons/...`
- `apps/mobile/lib/design_system/components/forms/...`
- `apps/mobile/lib/design_system/components/feedback/...`
- `apps/mobile/lib/design_system/components/navigation/...`
- `apps/mobile/lib/design_system/components/learning/...`

## Token Checklist And Mapping

### Global Entry

| Web source | Reviewed tokens/details | Planned Flutter file/class |
| --- | --- | --- |
| `styles.css` | Import order only: fonts, colors, typography, spacing, radius, shadows, sizes. | `app_theme.dart` imports token classes through `theme.dart`; no runtime CSS equivalent. |

### Colors

Source: `tokens/colors.css`

Planned Flutter: `AimColors`, `AimColorScale`, `AimSemanticColors`, `AimGradients`, and a ThemeExtension in `aim_theme_extensions.dart`.

- [x] Primary AIM Blue: `--color-primary-50 #EDF1FF`, `--color-primary-100 #DCE4FF`, `--color-primary-200 #BBC9FF`, `--color-primary-300 #93A6FF`, `--color-primary-400 #6B82FB`, `--color-primary-500 #4762EE`, `--color-primary-600 #3349D6`, `--color-primary-700 #2837AC`, `--color-primary-800 #243189`, `--color-primary-900 #1F2A6E`
- [x] Secondary Purple: `--color-secondary-50 #F5F1FE`, `--color-secondary-100 #EBE3FD`, `--color-secondary-200 #D7C8FB`, `--color-secondary-300 #BBA1F6`, `--color-secondary-400 #9E78EF`, `--color-secondary-500 #8455E4`, `--color-secondary-600 #6F3FD0`, `--color-secondary-700 #5C32AE`, `--color-secondary-800 #4C2C8C`, `--color-secondary-900 #3F2772`
- [x] Accent Teal: `--color-accent-50 #ECFBF8`, `--color-accent-100 #D2F5EE`, `--color-accent-200 #A7EBDF`, `--color-accent-300 #6FDAC9`, `--color-accent-400 #38C2AF`, `--color-accent-500 #15A898`, `--color-accent-600 #0C897C`, `--color-accent-700 #0E6D64`, `--color-accent-800 #105751`, `--color-accent-900 #114945`
- [x] Neutral Cool Gray: `--color-neutral-0 #FFFFFF`, `--color-neutral-50 #F7F8FA`, `--color-neutral-100 #EEF0F4`, `--color-neutral-200 #E2E5EC`, `--color-neutral-300 #CDD2DD`, `--color-neutral-400 #A6AEBF`, `--color-neutral-500 #7A8499`, `--color-neutral-600 #5A6377`, `--color-neutral-700 #424A5C`, `--color-neutral-800 #2B3140`, `--color-neutral-900 #181C26`
- [x] Success: `--color-success-50 #E7F7EF`, `--color-success-100 #C6ECD9`, `--color-success-500 #1FA971`, `--color-success-600 #168A5C`, `--color-success-700 #126E4A`
- [x] Warning: `--color-warning-50 #FEF4E2`, `--color-warning-100 #FCE6BC`, `--color-warning-500 #F5A524`, `--color-warning-600 #D8871A`, `--color-warning-700 #A96512`
- [x] Error: `--color-error-50 #FDECEC`, `--color-error-100 #FAC9CB`, `--color-error-500 #E5484D`, `--color-error-600 #C7363B`, `--color-error-700 #9E282D`
- [x] Info: `--color-info-50 #E8F2FC`, `--color-info-100 #C7DFF8`, `--color-info-500 #3A8DDE`, `--color-info-600 #2A72BC`, `--color-info-700 #205893`
- [x] Light semantic aliases: `--background`, `--surface`, `--surface-raised`, `--surface-sunken`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-primary`, `--text-link`, `--border`, `--border-strong`, `--divider`, `--focus-ring`
- [x] Light soft fills: `--primary-soft`, `--primary-soft-fg`, `--secondary-soft`, `--secondary-soft-fg`, `--accent-soft`, `--accent-soft-fg`, `--success-soft`, `--success-soft-fg`, `--warning-soft`, `--warning-soft-fg`, `--error-soft`, `--error-soft-fg`, `--info-soft`, `--info-soft-fg`
- [x] Interaction/disabled aliases: `--state-hover`, `--state-pressed`, `--disabled-bg`, `--disabled-fg`, `--disabled-border`
- [x] Gradients: `--gradient-ai`, `--gradient-ai-soft`, `--gradient-growth`
- [x] Dark semantic aliases: dark values for `--background`, `--surface`, `--surface-raised`, `--surface-sunken`, text, borders, divider, focus, all soft fills, interaction states, and disabled aliases.

### Fonts

Source: `tokens/fonts.css`

Planned Flutter: `AimFonts`.

- [x] `--font-en`: Inter, then system sans fallback.
- [x] `--font-ar`: IBM Plex Sans Arabic, then Noto Sans Arabic/system fallback.
- [x] `--font-mono`: platform monospace stack.
- [x] `--font-sans`: defaults to English font and switches to Arabic under RTL.

### Typography

Source: `tokens/typography.css`

Planned Flutter: `AimTypography`, `AimTextStyles`, and `ThemeData.textTheme`.

- [x] Weights: `--weight-regular 400`, `--weight-medium 500`, `--weight-semibold 600`, `--weight-bold 700`, `--weight-extrabold 800`
- [x] Display: size `34`, line `40`, weight `800`, tracking `-0.02em`, shorthand `--type-display`
- [x] H1: size `28`, line `34`, weight `700`, tracking `-0.01em`, shorthand `--type-h1`
- [x] H2: size `23`, line `30`, weight `700`, tracking `-0.01em`, shorthand `--type-h2`
- [x] H3: size `19`, line `26`, weight `600`, tracking `0`, shorthand `--type-h3`
- [x] Title: size `17`, line `24`, weight `600`, tracking `0`, shorthand `--type-title`
- [x] Body large: size `17`, line `26`, weight `400`, tracking `0`, shorthand `--type-body-lg`
- [x] Body medium: size `16`, line `24`, weight `400`, tracking `0`, shorthand `--type-body-md`
- [x] Body small: size `14`, line `21`, weight `400`, tracking `0`, shorthand `--type-body-sm`
- [x] Caption: size `12`, line `16`, weight `500`, tracking `0.01em`, shorthand `--type-caption`
- [x] Button: size `15`, line `20`, weight `600`, tracking `0.01em`, shorthand `--type-button`
- [x] Label: size `13`, line `18`, weight `600`, tracking `0.01em`, shorthand `--type-label`
- [x] Helper: size `12`, line `16`, weight `400`, tracking `0`, shorthand `--type-helper`
- [x] Arabic line scale: `--ar-line-scale 1.18`

### Spacing

Source: `tokens/spacing.css`

Planned Flutter: `AimSpacing`.

- [x] Scale: `--space-0 0`, `--space-2 2`, `--space-4 4`, `--space-8 8`, `--space-12 12`, `--space-16 16`, `--space-20 20`, `--space-24 24`, `--space-32 32`, `--space-40 40`, `--space-48 48`, `--space-64 64`
- [x] Semantic aliases: `--screen-padding-mobile 16`, `--screen-padding-web 24`, `--card-padding 16`, `--card-padding-lg 20`, `--section-gap 24`, `--component-gap 12`, `--inner-gap 8`, `--list-item-gap 12`, `--form-field-gap 16`
- [x] Layout dimensions: `--content-max-web 1200`, `--sidebar-width 260`, `--bottom-nav-height 64`, `--top-bar-height 56`

### Radius

Source: `tokens/radius.css`

Planned Flutter: `AimRadius`.

- [x] `--radius-xs 6`
- [x] `--radius-sm 8`
- [x] `--radius-md 12`
- [x] `--radius-lg 16`
- [x] `--radius-xl 24`
- [x] `--radius-2xl 32`
- [x] `--radius-pill 999`
- [x] `--radius-full 50%`

### Shadows

Source: `tokens/shadows.css`

Planned Flutter: `AimShadows`, using `BoxShadow` lists.

- [x] `--shadow-none`
- [x] `--shadow-card`: two cool neutral shadows
- [x] `--shadow-card-hover`: lifted card shadow
- [x] `--shadow-dropdown`: popover/menu shadow
- [x] `--shadow-modal`: modal/dialog shadow
- [x] `--shadow-sheet`: upward bottom-sheet shadow
- [x] `--shadow-fab`: primary-tinted floating action shadow
- [x] `--shadow-focus`: 3px focus ring from `--focus-ring` at 40 percent mix
- [x] `--shadow-inset`: inset input/track shadow

### Sizes, Motion, And Z Order

Source: `tokens/sizes.css`

Planned Flutter: `AimSizes`, `AimMotion`, and overlay order constants where useful.

- [x] Z order: `--z-base 0`, `--z-raised 10`, `--z-sticky 100`, `--z-dropdown 1000`, `--z-overlay 1100`, `--z-modal 1200`, `--z-sheet 1200`, `--z-toast 1400`, `--z-tooltip 1500`
- [x] Control heights: `--size-btn-sm 36`, `--size-btn-md 44`, `--size-btn-lg 52`, `--size-input 48`, `--size-input-sm 40`, `--size-icon-btn 44`, `--size-fab 56`
- [x] Icon sizes: `--icon-sm 16`, `--icon-md 20`, `--icon-lg 24`
- [x] Avatars: `--avatar-sm 32`, `--avatar-md 40`, `--avatar-lg 56`
- [x] Accessibility: `--touch-target 44`
- [x] Motion easing: `--ease-standard cubic-bezier(0.2, 0, 0, 1)`, `--ease-emphasis cubic-bezier(0.2, 0, 0, 1.2)`
- [x] Motion durations: `--duration-fast 120ms`, `--duration-base 180ms`, `--duration-slow 260ms`

## Component Checklist And Mapping

### Buttons

| Web component | Reviewed source | Key contract | Planned Flutter file/class |
| --- | --- | --- | --- |
| `Button` | `.d.ts`, `.prompt.md`, `.jsx` | Variants `primary`, `secondary`, `outline`, `ghost`, `destructive`; sizes `sm`, `md`, `lg`; `fullWidth`, `loading`, `disabled`, leading/trailing icons; pressed scale and spinner. | `design_system/components/buttons/aim_button.dart` - `AimButton`, `AimButtonVariant`, `AimButtonSize` |
| `IconButton` | `.d.ts`, `.prompt.md`, `.jsx` | Variants `ghost`, `solid`, `soft`, `outline`; sizes `sm`, `md`, `lg`; `round`; required accessibility label; pressed scale. | `design_system/components/buttons/aim_icon_button.dart` - `AimIconButton`, `AimIconButtonVariant`, `AimIconButtonSize` |
| `Fab` | `.d.ts`, `.prompt.md`, `.jsx` | Default AI gradient, optional solid primary, optional extended label, icon, accessibility label, hover lift/pressed scale. | `design_system/components/buttons/aim_fab.dart` - `AimFab` |

### Forms

| Web component | Reviewed source | Key contract | Planned Flutter file/class |
| --- | --- | --- | --- |
| `Input` | `.d.ts`, `.prompt.md`, `.jsx` | Label, types `text/password/search/email/tel/number`, sizes `sm/md`, helper/error, required, disabled, leading icon, password reveal. | `design_system/components/forms/aim_text_field.dart` - `AimTextField`, `AimTextFieldSize` |
| `Textarea` | `.d.ts`, `.prompt.md`, `.jsx` | Label, helper/error, disabled, rows, `maxLength` live counter, minimum height 96. | `design_system/components/forms/aim_text_area.dart` - `AimTextArea` |
| `Select` | `.d.ts`, `.prompt.md`, `.jsx` | Label, string/object options, placeholder, helper/error, disabled, RTL-aware chevron/padding. | `design_system/components/forms/aim_select.dart` - `AimSelect<T>`, `AimSelectOption<T>` |
| `Checkbox` | `.d.ts`, `.prompt.md`, `.jsx` | Label, checked, disabled, indeterminate mixed state, focus ring. | `design_system/components/forms/aim_checkbox.dart` - `AimCheckbox` |
| `Radio` | `.d.ts`, `.prompt.md`, `.jsx` | Label, checked, disabled, grouped by value/name equivalent. | `design_system/components/forms/aim_radio.dart` - `AimRadio<T>` |
| `Switch` | `.d.ts`, `.prompt.md`, `.jsx` | Label, checked, disabled, `role=switch`, thumb travels opposite direction in RTL. | `design_system/components/forms/aim_switch.dart` - `AimSwitch` |
| `OTPInput` | `.d.ts`, `.prompt.md`, `.jsx` | Length default 4, controlled value, `onChange`, `onComplete`, error, numeric input, paste, backspace, auto-advance, always LTR. | `design_system/components/forms/aim_otp_input.dart` - `AimOtpInput` |

### Feedback

| Web component | Reviewed source | Key contract | Planned Flutter file/class |
| --- | --- | --- | --- |
| `Badge` | `.d.ts`, `.prompt.md`, `.jsx` | Tones `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`, `neutral`; variants `soft`, `solid`, `outline`; `pill`, `dot`, icon. | `design_system/components/feedback/aim_badge.dart` - `AimBadge`, `AimBadgeTone`, `AimBadgeVariant` |
| `Chip` | `.d.ts`, `.prompt.md`, `.jsx` | `selected`, `removable`, `disabled`, icon, `onRemove`, `onClick`, static or button semantics. | `design_system/components/feedback/aim_chip.dart` - `AimChip` |
| `AlertBanner` | `.d.ts`, `.prompt.md`, `.jsx` | Tones `info`, `success`, `warning`, `error`; title, dismissible, action, role alert, tone icons. | `design_system/components/feedback/aim_alert_banner.dart` - `AimAlertBanner`, `AimAlertTone` |
| `Skeleton` | `.d.ts`, `.prompt.md`, `.jsx` | Shapes `text`, `rect`, `circle`; width/height; multi-line text with shorter last line; shimmer disabled under reduced motion. | `design_system/components/feedback/aim_skeleton.dart` - `AimSkeleton`, `AimSkeletonShape` |

### Navigation

| Web component | Reviewed source | Key contract | Planned Flutter file/class |
| --- | --- | --- | --- |
| `Tabs` | `.d.ts`, `.prompt.md`, `.jsx` | Items with value/label/count/icon, controlled value, animated underline, role tablist/tab. | `design_system/components/navigation/aim_tabs.dart` - `AimTabs`, `AimTabItem` |
| `SegmentedControl` | `.d.ts`, `.prompt.md`, `.jsx` | 2-4 string/object items, value, `onChange`, full width, sliding thumb. | `design_system/components/navigation/aim_segmented_control.dart` - `AimSegmentedControl<T>`, `AimSegmentItem<T>` |
| `TopAppBar` | `.d.ts`, `.prompt.md`, `.jsx` | Title, back action, custom leading, actions, centered title, transparent mode, RTL-flipped back chevron. | `design_system/components/navigation/aim_top_app_bar.dart` - `AimTopAppBar` |
| `BottomNav` | `.d.ts`, `.prompt.md`, `.jsx` | 3-5 destinations, value, `onChange`, icon/activeIcon, badge, safe-area bottom padding, sheet shadow. | `design_system/components/navigation/aim_bottom_nav.dart` - `AimBottomNav`, `AimBottomNavItem` |

### Learning

| Web component | Reviewed source | Key contract | Planned Flutter file/class |
| --- | --- | --- | --- |
| `Card` | `.d.ts`, `.prompt.md`, `.jsx` | Variants `default`, `elevated`, `ai`, `gradient`; padded default; interactive hover/focus/press; flexible tag in web. | `design_system/components/learning/aim_card.dart` - `AimCard`, `AimCardVariant` |
| `ProgressBar` | `.d.ts`, `.prompt.md`, `.jsx` | Value/max clamp, label, value readout, tones `primary`, `gradient`, `success`, `warning`, sizes `sm/md/lg`, formatter. | `design_system/components/learning/aim_progress_bar.dart` - `AimProgressBar`, `AimProgressTone`, `AimProgressSize` |
| `CircularProgress` | `.d.ts`, `.prompt.md`, `.jsx` | Value/max clamp, size, thickness, tones `primary`, `gradient`, `success`, label/caption/showValue, SVG progressbar equivalent. | `design_system/components/learning/aim_circular_progress.dart` - `AimCircularProgress`, `AimCircularProgressTone` |
| `AnswerOption` | `.d.ts`, `.prompt.md`, `.jsx` | States `default`, `selected`, `correct`, `incorrect`, `reveal`; option key, marks, start-aligned text, graded states disabled. | `design_system/components/learning/aim_answer_option.dart` - `AimAnswerOption`, `AimAnswerOptionState` |
| `AIFeedbackBubble` | `.d.ts`, `.prompt.md`, `.jsx` | Name default `AI Tutor`, tones `neutral`, `praise`, `correction`, typing dots, gradient avatar, leading-edge bubble notch. | `design_system/components/learning/aim_ai_feedback_bubble.dart` - `AimAiFeedbackBubble`, `AimAiFeedbackTone` |
| `RecordButton` | `.d.ts`, `.prompt.md`, `.jsx` | Recording boolean, caption/default hint/timer, disabled, `onToggle`, gradient idle, red recording state, pulse rings, reduced motion. | `design_system/components/learning/aim_record_button.dart` - `AimRecordButton` |

## Web-To-Flutter Token Mapping

| Web token family | Planned Flutter representation |
| --- | --- |
| Raw color scales | `AimColors.primary50`, `AimColors.primary100`, etc. using `Color(0xFF...)`. |
| Semantic light/dark colors | `AimSemanticColors.light` and `AimSemanticColors.dark`, exposed through `ThemeExtension<AimColorTheme>`. |
| Soft fills and foreground pairs | Pair values in `AimColorTheme` so components always consume matched background/foreground colors. |
| CSS `color-mix` dark soft fills | Precompute equivalent colors with alpha blending or define explicit dark constants matching CSS output. |
| Gradients | `LinearGradient` constants in `AimGradients`, with begin/end matching CSS 135deg. |
| Font stacks | `AimFonts.inter`, `AimFonts.ibmPlexSansArabic`, `AimFonts.mono`; actual availability depends on bundled fonts or package setup. |
| Type role shorthands | Named `TextStyle` getters in `AimTextStyles`, then bridged into `ThemeData.textTheme` where roles align. |
| Negative/positive tracking in `em` | Convert to Flutter `letterSpacing` in logical pixels per style. Use zero tracking for Arabic overrides where needed. |
| Spacing and layout aliases | `double` constants and `EdgeInsets` helpers in `AimSpacing`. |
| Radius | `double`, `Radius`, and `BorderRadius` helpers in `AimRadius`. `radiusFull` maps to circular/shape logic, not a literal percentage. |
| Shadows | `List<BoxShadow>` constants in `AimShadows`; `shadowFocus` maps to a focus outline/decoration rather than elevation. |
| Z-index | Flutter overlay/navigator layering guidance constants only; no direct widget z-index equivalent. |
| Control/icon/avatar sizes | `double` constants in `AimSizes`. |
| Motion durations/eases | `Duration` and `Curve` constants in `AimMotion`; CSS emphasis curve may need a custom `Cubic(0.2, 0, 0, 1.2)`. |

## Special Flutter Handling

- Gradients: `--gradient-ai` is reserved for AI/adaptive surfaces only: `AimFab`, `AimCard.ai`, `AimCard.gradient`, `AimAiFeedbackBubble` avatar, and `AimRecordButton`. `--gradient-growth` is for progress growth states. Do not use gradients for ordinary primary actions.
- Dark mode: CSS uses semantic aliases and `[data-theme="dark"]`. Flutter should expose a light and dark `ThemeData` plus an `AimColorTheme` extension. Components must read semantic colors, not raw scale colors, unless reproducing component internals.
- RTL: CSS relies on logical properties. Flutter widgets must use `EdgeInsetsDirectional`, `AlignmentDirectional`, `TextAlign.start`, and `Directionality.of(context)`. Specific cases: switch thumb movement reverses in RTL, top app bar back chevron flips, select chevron/padding mirrors, bottom-nav badges use directional trailing positioning, AI bubble starts at the leading edge.
- Arabic typography: Use IBM Plex Sans Arabic for Arabic/RTL subtrees. Apply `arLineScale` of 1.18 to Arabic text styles, avoid tight/negative tracking for Arabic, and keep learner body text at least 16px where content is primary.
- Numbers in RTL: OTP cells, timers, percentages, and numeric progress readouts should use LTR direction or tabular numeric styling where appropriate. OTP input must remain LTR even inside Arabic layouts.
- Focus states: Web `:focus-visible` uses `--shadow-focus`. Flutter should provide visible focus decorations for keyboard/focus traversal on all interactive controls, including cards, chips, bottom-nav items, tabs, and form controls.
- Pressed states: Web buttons scale on active: button `0.97`, icon button `0.92`, FAB `0.96`, record `0.95`, answer option `0.99`. Flutter components should use `InkResponse`, `GestureDetector` animation, or Material states to preserve pressed feedback.
- Hover states: Web has hover colors/lift. Flutter mobile can keep hover for desktop/web builds through `MouseRegion`/Material states without making mobile behavior depend on hover.
- Loading states: `AimButton` needs spinner plus auto-disabled behavior; `AimSkeleton` needs shimmer; `AimAiFeedbackBubble` needs typing dots; `AimRecordButton` needs recording pulse and caption/timer support.
- Reduced motion: Respect platform accessibility settings. Disable skeleton shimmer, AI typing-dot bounce, and record pulse when reduce-motion is enabled. Progress width/ring animations may be shortened or disabled under the same policy.
- Accessibility: Preserve minimum touch target `44`, required labels for icon-only buttons/FABs, alert semantics, progress semantics, selected/pressed states, disabled states, and dismiss/remove labels.
- Progress math: `ProgressBar` and `CircularProgress` clamp display percentage to 0-100 while preserving `value` and `max` in accessibility metadata.
- Gradient borders: `Card` variant `ai` uses a gradient ring with a normal surface interior. In Flutter this needs a gradient-decorated outer container with an inner surface container, or a custom painter.
- Shadows and inset: Flutter has no CSS inset shadow equivalent. Use subtle border/fill for inset controls, or a custom painter only if the visual gap is obvious.
- Component state enums: Preserve web naming exactly in Dart enums where possible so design QA can compare states one-to-one.
- Icons: Web inline SVGs are outline 2px currentColor. Flutter should use `IconData`/custom icons with current text color, 16/20/24 sizes, and directional icon flipping where needed.
- Safe areas: `BottomNav` must include `SafeArea(bottom: true)` while keeping visual height close to `64` before inset padding.
- Source quirk: `AIFeedbackBubble.jsx` references `--color-success-200` with a fallback to `--color-success-100`, but `tokens/colors.css` does not define `--color-success-200`. Flutter should use the fallback color unless a later token task adds that step.
- Source quirk: `Badge.d.ts` allows outline badges for all tones, but `Badge.jsx` only defines outline styling for `primary`, `success`, `warning`, `error`, and `neutral`. Flutter should either match that behavior exactly or intentionally fill the missing outline tones in a later implementation task.
