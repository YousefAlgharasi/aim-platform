# Phase 6 — RTL and Arabic Design Rules

**Phase:** 6  
**Task:** P6-014  
**Branch:** `phase6/P6-014-rtl-arabic-design-rules`  
**Dependency:** P6-011 (Mobile Design System Contract — Done)  
**Output:** `docs/phase-6/rtl-arabic-design-rules.md`

---

## 1. Purpose

This document defines the mandatory RTL and Arabic UI rules for every Phase 6 screen. No screen may be merged without passing RTL/Arabic verification. Violating these rules is a stop condition.

---

## 2. Core Principle

> **The AIM student mobile app is an Arabic-first product. All screens must render correctly in RTL layout with Arabic text, not just in LTR with English.**

RTL compliance is not a post-launch concern. It is a first-class requirement for every task that touches UI.

---

## 3. Direction Rules

### 3.1 Never Hardcode LTR

```dart
// ❌ BANNED — forces LTR regardless of locale
Directionality(
  textDirection: TextDirection.ltr,
  child: MyWidget(),
)

// ❌ BANNED — explicit LTR in Text widget
Text('Submit', textDirection: TextDirection.ltr)
```

```dart
// ✅ CORRECT — inherits direction from locale
Text('Submit') // direction comes from MaterialApp locale
```

### 3.2 Set Direction at App Root

The `MaterialApp` must set locale from the user's preference. The `AimMobileApp` already handles this via `AppLocale`. Feature code must not override it.

```dart
// ✅ CORRECT — locale-driven direction at app root
MaterialApp(
  locale: ref.watch(localProvider),
  supportedLocales: AppLocale.supportedLocales,
  localizationsDelegates: AppLocale.delegates,
  ...
)
```

---

## 4. Layout Rules

### 4.1 Padding and Margins — Use `EdgeInsetsDirectional`

```dart
// ❌ BANNED — assumes LTR, left becomes right in RTL
padding: const EdgeInsets.only(left: 16, right: 8)

// ✅ CORRECT — start/end flip automatically in RTL
padding: const EdgeInsetsDirectional.only(start: 16, end: 8)
```

```dart
// ✅ CORRECT — symmetric padding is fine with EdgeInsets
padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12)
```

### 4.2 Row Children Order

In RTL, `Row` children are laid out right-to-left. Design leading content (icons, avatars, indicators) as "start" not "left".

```dart
// ✅ CORRECT — icon at start, text at end (reverses naturally in RTL)
Row(
  children: [
    Icon(Icons.book), // appears on right in RTL
    SizedBox(width: AimSpacing.space8),
    Text('Lesson Title'),
  ],
)
```

### 4.3 Alignment — Use Start/End Not Left/Right

```dart
// ❌ BANNED
Align(alignment: Alignment.centerLeft, child: label)
CrossAxisAlignment.end // when you mean "trailing"

// ✅ CORRECT
Align(alignment: AlignmentDirectional.centerStart, child: label)
CrossAxisAlignment.start // "start" is right in RTL
```

### 4.4 Stack Positioning — Use `Positioned.directional`

```dart
// ❌ BANNED — hardcodes left
Positioned(left: 16, child: badge)

// ✅ CORRECT — start is right in RTL
Positioned.directional(
  textDirection: Directionality.of(context),
  start: 16,
  child: badge,
)
```

---

## 5. Icon Rules

### 5.1 Mirror Directional Icons

Icons that imply direction must be mirrored in RTL. Use `Directionality.of(context)` to detect and `Transform.scale` or `Icon(textDirection:)` to mirror.

| Icon | LTR | RTL |
|---|---|---|
| Back arrow (`arrow_back`) | Points left | Points right |
| Forward arrow (`arrow_forward`) | Points right | Points left |
| Chevron right (`chevron_right`) | Points right | Points left |
| Send (`send`) | Points right | Points left |
| Play (`play_arrow`) | Points right | Points left |

```dart
// ✅ CORRECT — mirror directional icon in RTL
Icon(
  Icons.arrow_back,
  textDirection: Directionality.of(context), // Flutter mirrors automatically
)

// ✅ CORRECT — explicit mirror transform
Transform.scale(
  scaleX: Directionality.of(context) == TextDirection.rtl ? -1 : 1,
  child: Icon(Icons.send),
)
```

### 5.2 Non-Directional Icons — Do Not Mirror

Icons that have no inherent direction should not be mirrored.

| Icon | Mirror in RTL? |
|---|---|
| `star`, `favorite`, `check`, `close` | No |
| `settings`, `notifications`, `home` | No |
| `arrow_back`, `arrow_forward`, `chevron_right` | Yes |
| `send`, `play_arrow` | Yes |

---

## 6. Typography Rules

### 6.1 Arabic Font — IBM Plex Sans Arabic

All Arabic text must render in IBM Plex Sans Arabic. This is handled automatically by the design system when `Directionality` is RTL and locale is Arabic.

```dart
// ✅ CORRECT — design system typography auto-selects Arabic font
Text(
  arabicString,
  style: AimTextStyles.bodyMd, // uses IBM Plex Sans Arabic in RTL
)
```

Do not manually specify font family in feature code.

### 6.2 Text Alignment

```dart
// ❌ BANNED — hardcodes left alignment
Text('Hello', textAlign: TextAlign.left)

// ✅ CORRECT — start is right for RTL
Text('Hello', textAlign: TextAlign.start)

// ✅ ALSO CORRECT — natural alignment (defaults to start)
Text('Hello')
```

### 6.3 Number Formatting

Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) are standard in Arabic UIs. The backend returns numeric values; display formatting is a Flutter presentation concern. Use locale-aware number formatting.

```dart
// ✅ CORRECT — locale-aware number display
import 'package:intl/intl.dart';
NumberFormat.decimalPattern(locale.languageCode).format(value)
```

---

## 7. Input Field Rules

### 7.1 Text Input Direction

`AimInput` handles RTL internally. Do not override `textDirection` on any `AimInput`.

For inputs where the content language may differ from UI language (e.g. an English word in an Arabic UI), use `TextDirection.ltr` only on the specific input, not globally.

### 7.2 Keyboard Type

For Arabic text entry, the keyboard will automatically be Arabic when locale is `ar`. Do not suppress or override this.

---

## 8. Navigation Rules

### 8.1 Back Navigation

In RTL, the back gesture swipes from left edge (same finger direction, but semantic direction reverses). Flutter's `Navigator` handles this automatically with RTL locale. Do not implement custom back gesture handling that assumes LTR.

### 8.2 Bottom Navigation

`AimBottomNav` handles RTL tab ordering. Do not hardcode tab positions.

### 8.3 Screen Transitions

Use standard Flutter route transitions. They respect `Directionality` automatically. Do not write custom `SlideTransition` that hardcodes left/right offsets.

```dart
// ❌ BANNED — hardcodes LTR slide
SlideTransition(
  position: Tween(begin: Offset(1.0, 0), end: Offset.zero).animate(animation),
)

// ✅ CORRECT — let Navigator handle transition direction
Navigator.of(context).push(MaterialPageRoute(builder: (_) => NextPage()))
```

---

## 9. RTL Verification Checklist

Before marking any UI task Done, verify all of the following with `Locale('ar')` active:

- [ ] Text reads right-to-left
- [ ] Layout flows right-to-left (leading content on right)
- [ ] Padding/margins are correct on both sides
- [ ] Directional icons are mirrored
- [ ] Back navigation works correctly
- [ ] Input fields accept Arabic text and align correctly
- [ ] Numbers display correctly
- [ ] No layout overflow or clipping introduced by RTL
- [ ] Arabic font (IBM Plex Sans Arabic) renders correctly
- [ ] Screen transitions animate in the correct direction

---

## 10. Testing RTL in Flutter

To test RTL without a physical device in Arabic locale:

```dart
// Option 1 — wrap specific widget in test
testWidgets('renders correctly in RTL', (tester) async {
  await tester.pumpWidget(
    Directionality(
      textDirection: TextDirection.rtl,
      child: MaterialApp(
        locale: const Locale('ar'),
        home: MyScreen(),
      ),
    ),
  );
  // assertions here
});

// Option 2 — set locale in MaterialApp for manual testing
MaterialApp(
  locale: const Locale('ar'), // force Arabic for manual RTL check
  ...
)
```

---

## 11. References

- Mobile Design System Contract: `docs/phase-6/mobile-design-system-contract.md`
- Design System Inventory: `docs/phase-6/mobile-design-system-file-inventory.md`
- Phase 6 Charter: `docs/phase-6/student-mobile-mvp-charter.md`

---

*RTL and Arabic Design Rules created: P6-014 | Branch: phase6/P6-014-rtl-arabic-design-rules*
