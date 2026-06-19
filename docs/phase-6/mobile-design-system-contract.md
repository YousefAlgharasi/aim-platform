# Phase 6 — Mobile Design System Contract

**Phase:** 6  
**Task:** P6-011  
**Branch:** `phase6/P6-011-mobile-design-system-contract`  
**Dependency:** P6-010 (Design System File Inventory — Done)  
**Output:** `docs/phase-6/mobile-design-system-contract.md`

---

## 1. Purpose

This contract defines exactly how Phase 6 must use the AIM Mobile Design System. It prevents random styling, enforces shared components, and is binding for every contributor and code reviewer.

Violating this contract is a stop condition. PRs with violations must not be merged.

---

## 2. The Contract

> **Every Phase 6 screen and widget must use AIM design system tokens and shared components exclusively. No hardcoded style values. No custom implementations of components that already exist in the design system.**

---

## 3. Token Usage Rules

### 3.1 Colors

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| All colors from `AimColors` | `AimColors.primary500` | `Color(0xFF4762EE)` |
| Theme-aware colors via extension | `Theme.of(context).extension<AimThemeExtensions>()!.surfacePrimary` | `Colors.white` |
| Status colors from scale | `AimColors.success500` | `Colors.green` |
| Error colors from scale | `AimColors.error500` | `Colors.red` |

**Import:** `import 'package:aim_mobile/core/design_tokens/design_tokens.dart';`

### 3.2 Typography

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| Text styles from `AimTextStyles` | `AimTextStyles.bodyMd` | `TextStyle(fontSize: 14, fontWeight: FontWeight.w400)` |
| Font family from `AimFontFamilies` | `AimFontFamilies.sansRtl` | `'IBM Plex Sans Arabic'` (string literal) |
| Font weight from `AimFontWeights` | `AimFontWeights.semiBold` | `FontWeight.w600` |

### 3.3 Spacing

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| Spacing constants from `AimSpacing` | `AimSpacing.space16` | `16.0` |
| Screen padding from token | `AimSpacing.screenPaddingMobile` | `EdgeInsets.all(16)` |
| Card padding from token | `AimSpacing.cardPadding` | `EdgeInsets.all(16)` |
| Gaps from token | `AimSpacing.componentGap` | `SizedBox(height: 12)` with raw value |
| Directional padding | `EdgeInsetsDirectional.only(start: AimSpacing.space16)` | `EdgeInsets.only(left: 16)` |

### 3.4 Radius

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| Border radius from `AimRadius` | `BorderRadius.circular(AimRadius.md)` | `BorderRadius.circular(8)` |

### 3.5 Shadows

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| Shadows from `AimShadows` | `AimShadows.md` | `BoxShadow(color: Colors.black12, blurRadius: 8)` |

### 3.6 Motion

| Rule | ✅ Correct | ❌ Banned |
|---|---|---|
| Durations from `AimMotion` | `AimMotion.durationFast` | `Duration(milliseconds: 200)` |
| Curves from `AimMotion` | `AimMotion.easeOut` | `Curves.easeOut` (unless it matches the token value) |

---

## 4. Widget Usage Rules

### 4.1 Buttons

| Scenario | Required Widget | Banned |
|---|---|---|
| Primary action (Submit, Continue, Save) | `AIMButton(variant: AIMButtonVariant.primary)` | `ElevatedButton`, `FilledButton` |
| Secondary action | `AIMButton(variant: AIMButtonVariant.secondary)` | `OutlinedButton` |
| Ghost/text action | `AIMButton(variant: AIMButtonVariant.ghost)` | `TextButton` |
| Destructive action | `AIMButton(variant: AIMButtonVariant.destructive)` | Custom red button |
| Icon-only action | `AimIconButton` | `IconButton` |
| FAB | `AimFab` | `FloatingActionButton` |
| Loading state | `AIMButton(loading: true)` | Custom loading overlay on button |

### 4.2 Inputs

| Scenario | Required Widget | Banned |
|---|---|---|
| Text entry (email, name, password) | `AimInput` | `TextField`, `TextFormField` |
| Multi-line text | `AimTextarea` | `TextField(maxLines: n)` |
| Dropdown | `AimSelect` | `DropdownButton`, `DropdownButtonFormField` |
| Checkbox | `AimCheckbox` | `Checkbox` |
| Radio | `AimRadio` | `Radio` |
| Toggle | `AimSwitch` | `Switch` |
| OTP/PIN | `AimOtpInput` | Custom pin field |

### 4.3 Content Display

| Scenario | Required Widget | Banned |
|---|---|---|
| Any card surface | `AimCard` | `Card`, custom `Container` with decoration |
| Answer choice in Q&A | `AimAnswerOption` | Custom tap container |
| Backend AI feedback | `AimAiFeedbackBubble` | Custom bubble widget |
| Linear progress | `AimProgressBar` | `LinearProgressIndicator` |
| Circular progress | `AimCircularProgress` | `CircularProgressIndicator` |
| Topic/category tag | `AimChip` | Custom chip |
| Status indicator | `AimBadge` | Custom badge |
| Loading placeholder | `AimSkeleton` | `CircularProgressIndicator` as content placeholder |
| In-page alert | `AimAlertBanner` | `SnackBar` for persistent alerts, custom banner |

### 4.4 Navigation

| Scenario | Required Widget | Banned |
|---|---|---|
| Bottom tab bar | `AimBottomNav` | `BottomNavigationBar`, `NavigationBar` |
| Screen header | `AimTopAppBar` | `AppBar` |
| Secondary tabs | `AimTabs` | `TabBar` |
| Segmented toggle | `AimSegmentedControl` | `ToggleButtons`, `SegmentedButton` |

---

## 5. RTL/Arabic Contract

These RTL rules are non-negotiable for every screen:

| Rule | Implementation |
|---|---|
| Never hardcode LTR direction | Do not use `TextDirection.ltr` in feature code |
| Use directional padding | `EdgeInsetsDirectional` instead of `EdgeInsets` for asymmetric padding |
| Use semantic alignment | `CrossAxisAlignment.start` respects RTL; never use `Alignment.centerLeft` |
| Arabic font switches automatically | Provided `Directionality` is set from locale |
| Mirror directional icons | Back arrow, forward arrow, navigation chevrons must mirror in RTL |
| Text fields are RTL-aware | `AimInput` handles this internally; do not override |
| Lists read RTL | Leading content (avatars, icons) appears on right in RTL |

**Verification:** Before marking any UI task Done, test with `Locale('ar')` or force `TextDirection.rtl` and confirm layout is correct.

---

## 6. Theme Integration

All screens must be wrapped (directly or via ancestor) in a `MaterialApp` that uses `AppTheme.lightTheme` / `AppTheme.darkTheme`. Features access theme via:

```dart
// Access theme extension for AIM-specific tokens
final aimTheme = Theme.of(context).extension<AimThemeExtensions>()!;

// Access standard Material theme tokens
final colorScheme = Theme.of(context).colorScheme;
```

Do not construct `ThemeData` inline inside feature code.

---

## 7. Adding to the Design System

If a screen requires a component that does not exist in `core/widgets/`:

1. **Do not build it inline in the feature.** Stop and assess.
2. Determine if an existing component can be composed or extended.
3. If a genuinely new component is needed, build it in `core/widgets/<category>/` following the existing file and naming patterns.
4. Export it from the category barrel and from `widgets.dart`.
5. Add it to this inventory (`docs/phase-6/mobile-design-system-file-inventory.md`).
6. Then use it in the feature.

---

## 8. Code Review Checklist

Reviewers must reject PRs that contain:

- [ ] `Color(0xFF...)` literals in feature code
- [ ] `TextStyle(fontSize: ...)` literals in feature code
- [ ] `EdgeInsets.all(N)` with raw numbers (not tokens) in feature code
- [ ] `BorderRadius.circular(N)` with raw numbers in feature code
- [ ] `ElevatedButton`, `OutlinedButton`, `TextButton` in feature code
- [ ] `TextField` or `TextFormField` in feature code
- [ ] `Card` with custom decoration in feature code
- [ ] `BottomNavigationBar` or `AppBar` in feature code
- [ ] `LinearProgressIndicator` or `CircularProgressIndicator` as content widgets
- [ ] `TextDirection.ltr` forced in feature code
- [ ] `EdgeInsets.only(left: ...)` or `EdgeInsets.only(right: ...)` (use `EdgeInsetsDirectional`)

---

## 9. References

- Design System Inventory: `docs/phase-6/mobile-design-system-file-inventory.md`
- Branch Review: `docs/quality/phase-6-design-system-branch-review.md`
- Phase 6 Charter: `docs/phase-6/student-mobile-mvp-charter.md`
- Task Execution Rules: `docs/phase-6/task-execution-rules.md`

---

*Mobile Design System Contract created: P6-011 | Branch: phase6/P6-011-mobile-design-system-contract*
