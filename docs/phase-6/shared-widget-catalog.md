# Phase 6 — Shared Widget Catalog

**Phase:** 6  
**Task:** P6-013  
**Status:** Active  
**Branch:** `phase6/P6-013-widget-catalog-map`  
**Dependency:** P6-010  
**Output:** `docs/phase-6/shared-widget-catalog.md`

---

## 1. Purpose

This document catalogs every shared widget in the AIM Mobile Design System available to Phase 6 feature screens. It is the authoritative reference for UI task implementation — every button, card, input, feedback component, progress indicator, and navigation widget is listed here with its constructor, enum variants, and usage guidance.

**Rule:** Feature code must never create one-off widget implementations. If a required component exists here, use it. If it is missing, extend the design system — do not improvise inline.

---

## 2. Import Path

All widgets are exported from a single barrel:

```dart
import 'package:aim_mobile/core/widgets/widgets.dart';
```

This re-exports all four widget category barrels:
- `core/widgets/buttons/buttons.dart`
- `core/widgets/feedback/feedback.dart`
- `core/widgets/forms/forms.dart`
- `core/widgets/learning/learning.dart`
- `core/widgets/navigation/navigation.dart`

---

## 3. Buttons

### 3.1 `AIMButton` — Primary action button

**File:** `core/widgets/buttons/aim_button.dart`

```dart
AIMButton(
  child: Text('Start'),
  onPressed: () {},
  variant: AIMButtonVariant.primary,   // default
  size: AIMButtonSize.medium,           // default
  fullWidth: false,
  loading: false,
  disabled: false,
  leadingIcon: Icon(Icons.play_arrow),
  trailingIcon: null,
  semanticLabel: 'Start placement test',
)
```

| Enum | Values |
|---|---|
| `AIMButtonVariant` | `primary`, `secondary`, `outline`, `ghost`, `destructive` |
| `AIMButtonSize` | `small` (36h), `medium` (44h), `large` (52h) |

**Variant usage:**

| Variant | Use case |
|---|---|
| `primary` | Main CTA (Start, Submit, Continue) |
| `secondary` | Secondary CTA (Save, Confirm) |
| `outline` | Alternative action with visible border |
| `ghost` | Tertiary / text-like action |
| `destructive` | Destructive actions (Delete, Remove) |

**RTL:** Icon positions (`leadingIcon`/`trailingIcon`) are layout-order; Flutter mirrors `Row` in RTL — no extra handling needed.

---

### 3.2 `AIMIconButton` — Icon-only button

**File:** `core/widgets/buttons/aim_icon_button.dart`

```dart
AIMIconButton(
  icon: Icon(Icons.close),
  semanticLabel: 'Close',
  onPressed: () {},
  variant: AIMIconButtonVariant.ghost,  // default
  size: AIMIconButtonSize.medium,        // default
  round: false,
  disabled: false,
)
```

| Enum | Values |
|---|---|
| `AIMIconButtonVariant` | `ghost`, `solid`, `soft`, `outline` |
| `AIMIconButtonSize` | `small`, `medium`, `large` |

**RTL:** Always use semantically mirrored icons (`Icons.arrow_back` → Flutter auto-mirrors in RTL via `Icons.arrow_back` directionality). Use `Directionality`-aware icon choices.

---

### 3.3 `AIMFab` — Floating action button

**File:** `core/widgets/buttons/aim_fab.dart`

```dart
AIMFab(
  semanticLabel: 'Record answer',
  onPressed: () {},
  icon: Icon(Icons.mic),
  child: Text('Record'),   // shown when extended: true
  extended: false,
  gradient: true,           // uses AI gradient by default
  disabled: false,
)
```

---

## 4. Feedback & Status

### 4.1 `AIMBadge` — Status badge / tag

**File:** `core/widgets/feedback/aim_badge.dart`

```dart
AIMBadge(
  child: Text('Correct'),
  tone: AIMBadgeTone.success,
  variant: AIMBadgeVariant.soft,  // default
  icon: Icon(Icons.check),
  pill: false,
  dot: false,
  semanticLabel: 'Correct answer',
)
```

| Enum | Values |
|---|---|
| `AIMBadgeTone` | `primary`, `secondary`, `accent`, `success`, `warning`, `error`, `neutral` |
| `AIMBadgeVariant` | `soft`, `solid`, `outline` |

**Use cases:** Answer result badges, CEFR band labels, topic difficulty indicators, status chips.

---

### 4.2 `AIMChip` — Selectable / removable chip

**File:** `core/widgets/feedback/aim_chip.dart`

```dart
AIMChip(
  child: Text('Grammar'),
  icon: Icon(Icons.label),
  selected: false,
  removable: false,
  onPressed: () {},
  onRemove: null,
  disabled: false,
  semanticLabel: 'Grammar topic',
  removeSemanticLabel: 'Remove Grammar',
)
```

**Use cases:** Topic filters, weakness labels, selected answer tags.

---

### 4.3 `AIMAlertBanner` — Alert / notification banner

**File:** `core/widgets/feedback/aim_alert_banner.dart`

```dart
AIMAlertBanner(
  child: Text('Placement test is unavailable for retake.'),
  tone: AIMAlertTone.warning,
  title: 'Retake not allowed',
  dismissible: true,
  onDismiss: () {},
  action: TextButton(onPressed: () {}, child: Text('Learn more')),
  semanticLabel: 'Retake warning',
  dismissSemanticLabel: 'Dismiss warning',
)
```

| Enum | Values |
|---|---|
| `AIMAlertTone` | `info`, `success`, `warning`, `error` |

**Use cases:** Retake policy notices, network errors, session completion messages, empty state notices.

---

### 4.4 `AIMSkeleton` — Loading skeleton

**File:** `core/widgets/feedback/aim_skeleton.dart`

```dart
AIMSkeleton(
  shape: AIMSkeletonShape.text,  // default
  lines: 3,                       // for text shape
)

AIMSkeleton(shape: AIMSkeletonShape.rect)
AIMSkeleton(shape: AIMSkeletonShape.circle)
```

| Enum | Values | Use case |
|---|---|---|
| `AIMSkeletonShape` | `text`, `rect`, `circle` | Text lines, card placeholders, avatar placeholders |

**Use cases:** All loading states while API data is fetching. Never use `CircularProgressIndicator` directly in feature screens — use `AIMSkeleton` for content areas and the standard loading state from the notifier for full-screen loads.

---

## 5. Forms

### 5.1 `AIMInput` — Text input field

**File:** `core/widgets/forms/aim_input.dart`

```dart
AIMInput(
  label: 'Email',
  placeholder: 'you@example.com',
  helper: 'We'll never share your email.',
  error: null,               // shows error state + message when set
  type: AIMInputType.email,
  size: AIMInputSize.medium, // default
  controller: _controller,
  focusNode: _focusNode,
  leadingIcon: Icon(Icons.email_outlined),
  required: false,
  disabled: false,
  onChanged: (v) {},
  onSubmitted: (v) {},
  textInputAction: TextInputAction.next,
  autofillHints: [AutofillHints.email],
  semanticLabel: 'Email address',
)
```

| Enum | Values |
|---|---|
| `AIMInputType` | `text`, `password`, `search`, `email`, `tel` |
| `AIMInputSize` | `small` (40h), `medium` (48h) |

**RTL:** The widget uses Flutter's default RTL-aware text direction. For Arabic input, set `textDirection: TextDirection.rtl` on the underlying `TextField` via a subclass or wrap in `Directionality` — raise as design system extension if needed.

---

### 5.2 `AIMTextarea` — Multi-line text input

**File:** `core/widgets/forms/aim_textarea.dart`

```dart
AIMTextarea(
  label: 'Answer',
  placeholder: 'Type your answer here…',
  helper: null,
  error: null,
  rows: 4,
  controller: _controller,
  required: false,
  disabled: false,
  onChanged: (v) {},
  semanticLabel: 'Free-text answer',
)
```

**Use cases:** Fill-in-the-blank answers, open-response questions.

---

### 5.3 `AIMSelect` — Dropdown selector

**File:** `core/widgets/forms/aim_select.dart`

```dart
AIMSelect(
  options: [
    AIMSelectOption(value: 'en', label: 'English'),
    AIMSelectOption(value: 'ar', label: 'Arabic'),
  ],
  value: 'en',
  onChanged: (v) {},
  label: 'Language',
  placeholder: 'Select…',
  helper: null,
  error: null,
  required: false,
  disabled: false,
  semanticLabel: 'Language selector',
)
```

---

### 5.4 `AIMCheckbox` — Checkbox

**File:** `core/widgets/forms/aim_checkbox.dart`

```dart
AIMCheckbox(
  value: false,
  indeterminate: false,
  disabled: false,
  label: 'I agree to terms',
  onChanged: (v) {},
  semanticLabel: 'Agree to terms',
)
```

---

### 5.5 `AIMRadio<T>` — Radio button

**File:** `core/widgets/forms/aim_radio.dart`

```dart
AIMRadio<String>(
  value: 'A',
  groupValue: _selected,
  label: 'Option A',
  disabled: false,
  onChanged: (v) {},
  semanticLabel: 'Option A',
)
```

**Use cases:** Multiple-choice answer selection (where options are rendered as radio group).

---

### 5.6 `AIMSwitch` — Toggle switch

**File:** `core/widgets/forms/aim_switch.dart`

```dart
AIMSwitch(
  value: false,
  disabled: false,
  label: 'Dark mode',
  onChanged: (v) {},
  semanticLabel: 'Dark mode toggle',
)
```

---

### 5.7 `AIMOTPInput` — OTP / PIN input

**File:** `core/widgets/forms/aim_otp_input.dart`

```dart
AIMOTPInput(
  length: 4,
  value: '',
  label: 'Verification code',
  helper: 'Check your email.',
  error: null,
  required: false,
  disabled: false,
  onChanged: (v) {},
  onCompleted: (v) {},
  semanticLabel: 'OTP code input',
)
```

---

## 6. Learning Widgets

### 6.1 `AIMAnswerOption` — Answer choice tile

**File:** `core/widgets/learning/aim_answer_option.dart`

```dart
AIMAnswerOption(
  child: Text('Paris'),
  state: AIMAnswerOptionState.defaultState,  // default
  optionKey: 'A',                              // letter badge (A/B/C/D)
  onTap: () {},
  semanticLabel: 'Option A: Paris',
)
```

| Enum | Value | Visual |
|---|---|---|
| `AIMAnswerOptionState.defaultState` | Unselected | Neutral border |
| `AIMAnswerOptionState.selected` | User-selected, ungraded | Primary border highlight |
| `AIMAnswerOptionState.correct` | Selected + correct | Success green fill |
| `AIMAnswerOptionState.incorrect` | Selected + wrong | Error red fill |

**Security invariant:** The `correct` and `incorrect` states are only applied **after** the backend returns post-submission feedback. Flutter never determines which state to apply — it maps the backend `isCorrect` field to `correct`/`incorrect`. During active placement, only `defaultState` and `selected` are valid states.

**RTL:** `optionKey` badge appears on the leading edge; it auto-mirrors in RTL via `Row` directionality.

---

### 6.2 `AIMCard` — Content card container

**File:** `core/widgets/learning/aim_card.dart`

```dart
AIMCard(
  child: Column(children: [...]),
  variant: AIMCardVariant.standard,  // default
  padded: true,
  interactive: false,
  onTap: null,
  padding: null,  // overrides default card padding when set
  semanticLabel: 'Course card',
)
```

| Variant | Visual | Use case |
|---|---|---|
| `standard` | Flat surface, subtle shadow | Default content cards |
| `elevated` | Higher shadow | Featured cards, modals |
| `ai` | AI gradient border accent | AIM plan cards, AI feedback |
| `gradient` | Full gradient background | Hero / promotional cards |

---

### 6.3 `AIMProgressBar` — Linear progress indicator

**File:** `core/widgets/learning/aim_progress_bar.dart`

```dart
AIMProgressBar(
  value: 68,
  max: 100,                               // default
  label: 'Grammar',
  tone: AIMProgressBarTone.primary,       // default
  size: AIMProgressBarSize.md,            // default
  showValue: false,
  valueFormat: (v, max) => '${v.toInt()}%',
)
```

| Enum | Values |
|---|---|
| `AIMProgressBarTone` | `primary` (blue), `gradient` (growth gradient) |
| `AIMProgressBarSize` | `sm` (5dp track), `md` (8dp track) |

**Use cases:** Placement section progress, skill coverage bars, session completion.

---

### 6.4 `AIMCircularProgress` — Circular progress ring

**File:** `core/widgets/learning/aim_circular_progress.dart`

```dart
AIMCircularProgress(
  value: 68,
  max: 100,                                    // default
  size: 96,                                    // diameter in dp
  thickness: 9,
  tone: AIMCircularProgressTone.primary,       // default
  showValue: true,
  label: Text('Grammar'),
  caption: 'daily goal',
)
```

| Enum | Values |
|---|---|
| `AIMCircularProgressTone` | `primary`, `gradient`, `success` |

**Use cases:** Home screen mastery rings, skill state summary, session score display.

---

### 6.5 `AIMAIFeedbackBubble` — AI tutor feedback container

**File:** `core/widgets/learning/aim_ai_feedback_bubble.dart`

```dart
AIMAIFeedbackBubble(
  child: Text('Great answer! You used the past perfect correctly.'),
  name: 'AI Tutor',
  tone: AIMAIFeedbackTone.praise,
  typing: false,            // shows animated typing indicator
)

AIMAIFeedbackBubble(typing: true)  // loading state
```

| Enum | Value | Use case |
|---|---|---|
| `AIMAIFeedbackTone.neutral` | Default surface | General feedback |
| `AIMAIFeedbackTone.praise` | Green-tinted surface | Correct / encouraging feedback |
| `AIMAIFeedbackTone.correction` | Amber-tinted surface | Incorrect / corrective feedback |

**Security invariant:** Content inside this bubble is always text returned by the backend. Flutter never generates AI feedback — it renders backend `explanation` text.

---

### 6.6 `AIMRecordButton` — Voice recording toggle

**File:** `core/widgets/learning/aim_record_button.dart`

```dart
AIMRecordButton(
  recording: false,
  disabled: false,
  caption: 'Hold to record',
  onToggle: () {},
)
```

Animates a pulsing ring when `recording: true`. Used for speaking/oral answer questions.

---

## 7. Navigation

### 7.1 `AIMBottomNav<T>` — Bottom navigation bar

**File:** `core/widgets/navigation/aim_bottom_nav.dart`

```dart
AIMBottomNav<int>(
  items: [
    AIMBottomNavDestination(value: 0, label: 'Home', icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home)),
    AIMBottomNavDestination(value: 1, label: 'Learn', icon: Icon(Icons.menu_book_outlined), activeIcon: Icon(Icons.menu_book)),
    AIMBottomNavDestination(value: 2, label: 'Review', icon: Icon(Icons.replay_outlined)),
    AIMBottomNavDestination(value: 3, label: 'Progress', icon: Icon(Icons.insights_outlined)),
    AIMBottomNavDestination(value: 4, label: 'Profile', icon: Icon(Icons.person_outline)),
  ],
  value: _selectedIndex,
  onChanged: (i) => setState(() => _selectedIndex = i),
  useSafeArea: true,
)
```

**Constraints:** 3–5 destinations only (enforced by assertion).  
**RTL:** Tab order is reading-order aware; icon mirroring uses Flutter's `Icon` directionality — no manual override needed.  
**Current state:** `MainShellPage` uses raw `NavigationBar`. Replace with `AIMBottomNav` during P6-028 (design system adoption).

---

### 7.2 `AIMTopAppBar` — Top app bar / screen header

**File:** `core/widgets/navigation/aim_top_app_bar.dart`

```dart
AIMTopAppBar(
  title: 'Placement Test',
  onBack: () => Navigator.pop(context),
  leading: null,            // overrides the back button when set
  actions: [
    AIMIconButton(icon: Icon(Icons.close), semanticLabel: 'Close', onPressed: () {}),
  ],
  centerTitle: false,
  transparent: false,
  backSemanticLabel: 'Back',
)
```

**RTL:** Uses `leading`/`actions` (not left/right) — Flutter places them correctly in both LTR and RTL. Back chevron auto-mirrors.

---

### 7.3 `AIMTabs<T>` — Horizontal tab strip

**File:** `core/widgets/navigation/aim_tabs.dart`

```dart
AIMTabs<String>(
  items: [
    AIMTabItem(value: 'all', label: 'All'),
    AIMTabItem(value: 'grammar', label: 'Grammar', icon: Icon(Icons.abc)),
    AIMTabItem(value: 'vocab', label: 'Vocabulary'),
  ],
  value: _tab,
  onChanged: (v) => setState(() => _tab = v),
)
```

**Use cases:** Content filters within a screen (course list by topic, learning plan by category).

---

### 7.4 `AIMSegmentedControl<T>` — Binary/multi-option toggle

**File:** `core/widgets/navigation/aim_segmented_control.dart`

```dart
AIMSegmentedControl<String>(
  items: [
    AIMSegmentedOption(value: 'list', label: 'List', icon: Icon(Icons.list)),
    AIMSegmentedOption(value: 'grid', label: 'Grid', icon: Icon(Icons.grid_view)),
  ],
  value: _view,
  onChanged: (v) => setState(() => _view = v),
  fullWidth: false,
)
```

**Use cases:** View mode toggles, question type filters (2–4 options).

---

## 8. Widget × Screen Usage Map

| Screen | Widgets to use |
|---|---|
| Login | `AIMInput` (email, password), `AIMButton` (primary — Sign in) |
| Home | `AIMCard` (plan summary, weakness strip), `AIMCircularProgress` (mastery rings), `AIMProgressBar` (topic coverage), `AIMBadge` (band labels), `AIMTopAppBar` |
| Learning Plan | `AIMCard`, `AIMProgressBar`, `AIMBadge`, `AIMChip` (weakness labels), `AIMTopAppBar` |
| Course List | `AIMCard` (course cards), `AIMTabs` or `AIMSegmentedControl` (topic filter), `AIMTopAppBar` |
| Placement Start | `AIMCard`, `AIMButton` (primary — Start), `AIMTopAppBar` |
| Placement Sections | `AIMProgressBar` (section progress), `AIMCard`, `AIMTopAppBar` |
| Placement Question | `AIMAnswerOption` (MC/T-F), `AIMInput` or `AIMTextarea` (fill-in), `AIMButton` (Next/Submit), `AIMProgressBar`, `AIMTopAppBar` |
| Placement Result | `AIMCard`, `AIMBadge` (CEFR band), `AIMCircularProgress`, `AIMButton` (Continue), `AIMTopAppBar` |
| Session Question | `AIMAnswerOption`, `AIMInput`/`AIMTextarea`, `AIMRecordButton` (speaking), `AIMButton`, `AIMProgressBar`, `AIMTopAppBar` |
| Session Summary | `AIMCard`, `AIMAIFeedbackBubble`, `AIMCircularProgress`, `AIMBadge`, `AIMButton` (Done), `AIMTopAppBar` |
| Profile | `AIMCard`, `AIMTopAppBar`, `AIMSwitch` (settings) |

Loading states across all screens: `AIMSkeleton` for content areas.  
Error states across all screens: `AIMAlertBanner` for inline errors.

---

## 9. Missing Widget Checklist

If a UI task requires a component not in this catalog, the correct action is:

1. Search `core/widgets/` for a close match that can be extended via props.
2. If none exists, add the new widget to the appropriate `core/widgets/<category>/` folder.
3. Export it from the category barrel (`buttons.dart`, `feedback.dart`, etc.).
4. Document it in this catalog in a follow-up update.

Never create one-off widget implementations inside a feature folder.

---

## 10. References

- Theme Token Map: `docs/phase-6/theme-token-map.md`
- Design System File Inventory: `docs/phase-6/mobile-design-system-file-inventory.md`
- Widget sources: `apps/mobile/lib/core/widgets/`
- Barrel export: `apps/mobile/lib/core/widgets/widgets.dart`

---

*Shared widget catalog created: P6-013 | Branch: phase6/P6-013-widget-catalog-map*
