# Phase 6 — No One-Off Styling Rule

**Phase:** 6  
**Task:** P6-015  
**Status:** Active  
**Branch:** `phase6/P6-015-no-one-off-styling-rule`  
**Dependency:** P6-011  
**Output:** `docs/phase-6/no-one-off-styling-rule.md`

---

## 1. Purpose

This document states, explains, and enforces the No One-Off Styling Rule for Phase 6. It is binding for every contributor, agent, and code reviewer.

**The rule in one sentence:**

> No Phase 6 feature file may contain a hard-coded color, font size, spacing value, corner radius, shadow, or duration literal — and no feature file may implement a widget that already exists in the AIM Mobile Design System.

Violations are a **stop condition**. A PR that breaks this rule must not be merged.

---

## 2. What "One-Off Styling" Means

A one-off style is any visual value or component defined outside the design system for a single use inside a feature. Examples:

- A hex color written directly in a `Color(0xFF...)` constructor inside a feature file.
- A `TextStyle(fontSize: 14, fontWeight: FontWeight.w600)` constructed inline instead of using `AimTextStyles.*`.
- A `SizedBox(height: 12)` using a raw number instead of `AimSpacing.componentGap`.
- A `BorderRadius.circular(8)` using a raw number instead of `AimRadius.borderSm`.
- A `Container` with a custom `BoxDecoration` that duplicates what `AIMCard` already provides.
- A custom loading spinner built inline instead of using `AIMSkeleton`.
- A bespoke answer tile built in a feature file instead of using `AIMAnswerOption`.

These are one-off styles. They are banned.

---

## 3. The Banned List

### 3.1 Colors — Banned patterns

```dart
// ❌ BANNED — hard-coded hex
Color(0xFF4762EE)
Color(0xFFFFFFFF)
Colors.white
Colors.black
Colors.green
Colors.red
Colors.blue
Colors.grey
Colors.transparent   // use const Color(0x00000000) only if no token fits
Color.fromRGBO(...)
Color.fromARGB(...)

// ✅ REQUIRED
AimColors.primary500
aimSurfacesOf(context).surface
aimSurfacesOf(context).textPrimary
aimSoftFillsOf(context).success
aimSoftFillsOf(context).error
```

### 3.2 Typography — Banned patterns

```dart
// ❌ BANNED — inline TextStyle construction
TextStyle(fontSize: 16)
TextStyle(fontSize: 14, fontWeight: FontWeight.w600)
TextStyle(fontFamily: 'Inter', fontSize: 17)
TextStyle(fontFamily: 'IBM Plex Sans Arabic')
Text('Hello', style: TextStyle(...))

// ✅ REQUIRED
AimTextStyles.bodyMd
AimTextStyles.title
AimTextStyles.arabicBodyMd
AimTextStyles.button
// With color override:
AimTextStyles.bodyMd.copyWith(color: aimSurfacesOf(context).textPrimary)
```

### 3.3 Spacing — Banned patterns

```dart
// ❌ BANNED — raw number literals in padding/gap
SizedBox(height: 12)
SizedBox(width: 8)
Padding(padding: EdgeInsets.all(16))
Padding(padding: EdgeInsets.symmetric(horizontal: 20))
EdgeInsets.only(left: 16)      // ← also violates RTL rule
EdgeInsets.only(right: 8)      // ← also violates RTL rule

// ✅ REQUIRED
SizedBox(height: AimSpacing.componentGap)
SizedBox(width: AimSpacing.innerGap)
Padding(padding: AimSpacing.card)
Padding(padding: EdgeInsets.symmetric(horizontal: AimSpacing.screenPaddingMobile))
EdgeInsetsDirectional.only(start: AimSpacing.space16)   // RTL-safe
```

### 3.4 Radius — Banned patterns

```dart
// ❌ BANNED
BorderRadius.circular(8)
BorderRadius.circular(12)
BorderRadius.all(Radius.circular(16))
RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))

// ✅ REQUIRED
AimRadius.borderSm           // BorderRadius.all(Radius.circular(8))
AimRadius.borderMd           // BorderRadius.all(Radius.circular(12))
AimRadius.borderLg           // BorderRadius.all(Radius.circular(16))
BorderRadius.circular(AimRadius.sm)   // acceptable if preset doesn't exist
```

### 3.5 Shadows — Banned patterns

```dart
// ❌ BANNED
BoxDecoration(
  boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8)],
)
BoxShadow(color: Color(0x1A000000), offset: Offset(0, 4), blurRadius: 12)

// ✅ REQUIRED
BoxDecoration(boxShadow: AimShadows.card)
BoxDecoration(boxShadow: aimShadowsOf(context).card)
BoxDecoration(boxShadow: AimShadows.modal)
```

### 3.6 Motion / Duration — Banned patterns

```dart
// ❌ BANNED
Duration(milliseconds: 200)
Duration(milliseconds: 120)
Curves.easeOut
Curves.easeInOut

// ✅ REQUIRED
AimMotion.durationBase      // 180 ms
AimMotion.durationFast      // 120 ms
AimMotion.durationSlow      // 260 ms
AimMotion.easeStandard
AimMotion.easeEmphasis
```

### 3.7 Component duplication — Banned patterns

```dart
// ❌ BANNED — reimplementing widgets that exist in the design system

// Custom button
GestureDetector(
  onTap: onPressed,
  child: Container(
    height: 48, color: Color(0xFF4762EE),
    child: Text('Submit', style: TextStyle(color: Colors.white)),
  ),
)

// Custom card
Container(
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    boxShadow: [BoxShadow(...)],
  ),
  child: child,
)

// Custom loading indicator
Center(child: CircularProgressIndicator(color: Color(0xFF4762EE)))

// Custom answer tile
GestureDetector(
  onTap: onTap,
  child: Container(
    decoration: BoxDecoration(border: Border.all(color: ...)),
    child: Row(children: [Text(label)]),
  ),
)

// ✅ REQUIRED
AIMButton(child: Text('Submit'), onPressed: onPressed)
AIMCard(child: child)
AIMSkeleton(shape: AIMSkeletonShape.rect)
AIMAnswerOption(child: Text(label), state: state, onTap: onTap)
```

---

## 4. The Positive Rule: What to Do Instead

Every styling decision maps to a token or widget. Use this lookup:

| Need | Use |
|---|---|
| A color for text | `aimSurfacesOf(context).textPrimary` / `.textSecondary` / `.textMuted` |
| A background color | `aimSurfacesOf(context).background` / `.surface` |
| A brand color | `AimColors.primary500` (or scale variant) |
| A success/error color | `aimSoftFillsOf(context).success` / `.error` |
| Body text style | `AimTextStyles.bodyMd` or `bodySm` |
| Heading text style | `AimTextStyles.h1` / `h2` / `h3` / `title` |
| Arabic text | `AimTextStyles.arabicBodyMd` / `arabicH1` etc. |
| Screen-edge padding | `AimSpacing.screenPaddingMobile` (16 dp) |
| Space between components | `AimSpacing.componentGap` (12 dp) |
| Space inside a component | `AimSpacing.innerGap` (8 dp) |
| Card interior padding | `AimSpacing.card` (`EdgeInsets.all(16)`) |
| Gap between list items | `AimSpacing.listItemGap` (12 dp) |
| Card corner radius | `AimRadius.borderMd` (12 dp) |
| Button corner radius | `AimRadius.borderSm` (sm) or `borderMd` (md) based on size |
| Card shadow | `AimShadows.card` or `aimShadowsOf(context).card` |
| A button | `AIMButton` with `AIMButtonVariant.*` |
| An icon button | `AIMIconButton` |
| A text input | `AIMInput` |
| A loading state | `AIMSkeleton` |
| An error state | `AIMAlertBanner(tone: AIMAlertTone.error, ...)` |
| An answer choice | `AIMAnswerOption` |
| A content card | `AIMCard` with `AIMCardVariant.*` |
| A progress bar | `AIMProgressBar` |
| A circular ring | `AIMCircularProgress` |
| AI feedback text | `AIMAIFeedbackBubble` |
| A status label | `AIMBadge` |
| A top bar | `AIMTopAppBar` |
| A bottom nav | `AIMBottomNav` |

---

## 5. The Extension Rule

If a required component does not exist in the design system, the correct action is:

1. **Search first.** Check `apps/mobile/lib/core/widgets/` and `apps/mobile/lib/core/design_tokens/` — the token or widget may already exist under a different name.
2. **Extend, don't duplicate.** Add the missing token to the relevant class in `core/design_tokens/`, or add the missing widget to `core/widgets/<category>/` and export it from the category barrel.
3. **Document it.** Update `docs/phase-6/shared-widget-catalog.md` or `docs/phase-6/theme-token-map.md` to reflect the addition.
4. **Never improvise inline.** Under no circumstances should a one-off value or component be created inside a feature file, even temporarily.

---

## 6. RTL / Arabic Co-violation

One-off styling violations frequently co-occur with RTL violations. The most common co-violations:

| One-off pattern | RTL problem it causes |
|---|---|
| `EdgeInsets.only(left: 16)` | Hard-codes LTR direction — breaks Arabic layout |
| `EdgeInsets.only(right: 8)` | Hard-codes LTR direction — breaks Arabic layout |
| `Row(children: [...])` with manual `SizedBox(width: 8)` | Spacing not RTL-aware |
| Inline `TextStyle(fontFamily: 'Inter')` on Arabic content | Wrong font for RTL text |
| `Align(alignment: Alignment.centerLeft)` | Breaks RTL — use `AlignmentDirectional.centerStart` |

The fix for all of these is the same: use the design system. `EdgeInsetsDirectional`, `AlignmentDirectional`, `AimTextStyles.arabicBodyMd`, and `AIMSpacing.*` constants handle RTL automatically.

---

## 7. Review Checklist

Before every commit touching a UI file, verify:

- [ ] No `Color(0xFF...)` or `Colors.*` literals in feature files
- [ ] No `TextStyle(...)` constructed inline — only `AimTextStyles.*` or `.copyWith()`
- [ ] No raw number literals in `SizedBox`, `Padding`, `EdgeInsets` — only `AimSpacing.*`
- [ ] No `BorderRadius.circular(<number>)` with a raw number — only `AimRadius.*`
- [ ] No inline `BoxShadow` — only `AimShadows.*` or `aimShadowsOf(context).*`
- [ ] No raw `Duration(milliseconds: ...)` — only `AimMotion.*`
- [ ] No custom button, card, input, loading, error, or answer widget — only design system components
- [ ] No `EdgeInsets.only(left:...)` or `EdgeInsets.only(right:...)` — only `EdgeInsetsDirectional`
- [ ] No `Alignment.centerLeft` / `.centerRight` — only `AlignmentDirectional.*`

---

## 8. Enforcement

This rule is enforced at two levels:

**During implementation:** Every agent or contributor must check this document before writing any UI code. If in doubt about whether a value is "one-off", it is.

**At review:** Any reviewer finding a violation must reject the PR. The fix is always the same: replace the one-off value with the appropriate token or widget. There are no exceptions for "simple" or "temporary" values.

---

## 9. References

- Theme Token Map: `docs/phase-6/theme-token-map.md`
- Shared Widget Catalog: `docs/phase-6/shared-widget-catalog.md`
- Design System Contract: `docs/phase-6/mobile-design-system-contract.md`
- RTL/Arabic Design Rules: `docs/phase-6/rtl-arabic-design-rules.md` (P6-014)
- Design tokens source: `apps/mobile/lib/core/design_tokens/`
- Widget source: `apps/mobile/lib/core/widgets/`

---

*No one-off styling rule created: P6-015 | Branch: phase6/P6-015-no-one-off-styling-rule*
