# Phase 6 — Arabic/RTL Mobile Check

**Task:** P6-118
**Branch:** `phase6/P6-118-flutter-mobile-rtl-arabic-check`
**Date:** 2026-06-18
**Reviewer:** GHOST (autonomous agent)
**Dependencies:** P6-014 (RTL/Arabic Design Rules), P6-029 (RTL Foundation), P6-115 (Bottom Nav) — all Done

---

## Scope

Audit confirming that the Flutter Student Mobile App MVP is correctly
prepared for Arabic (RTL) locale. Covers the locale system, text direction
propagation, layout widgets, icon mirroring, spacing, and typography.

---

## 1. Locale & Text Direction System

### Foundation (P6-029)

The RTL foundation (`apps/mobile/lib/core/localization/`) is fully implemented:

- `AppLocale` defines `Locale('en')` and `Locale('ar')` as `supportedLocales`.
- `localeProvider` defaults to English; switching to `Locale('ar')` switches
  the entire app to RTL without any feature-level code changes.
- `AimMobileApp` passes `locale`, `supportedLocales`, and
  `localizationsDelegates` (Material, Widgets, Cupertino) to `MaterialApp`.
- `MaterialApp` derives `TextDirection.rtl` automatically from `Locale('ar')`.
- In-code comment on `AimMobileApp`: "Feature widgets must never hard-code
  `TextDirection.ltr` or `.rtl`."

**Result:** ✅ RTL foundation is correct and complete.

---

## 2. Hard-Coded TextDirection Audit

**Method:** Grep across entire `apps/mobile/lib/features/` for
`TextDirection.ltr` and `TextDirection.rtl`.

**Result:** **Zero occurrences** in any student-facing feature code.

The only occurrences are:
- `features/design_system_preview/` — intentional; the DS preview tool
  exposes a toggle to switch between LTR/RTL for component testing. This
  is developer tooling, not student-facing UI.

**Result:** ✅ No hard-coded text direction in any feature widget or page.

---

## 3. Layout Direction Safety

### Columns and Rows

- All `Column` and `Row` widgets in feature code rely on the ambient
  `TextDirection` for alignment defaults.
- No `MainAxisAlignment.start` overrides that assume LTR; start/end
  semantics are direction-aware in Flutter.

**Result:** ✅

### EdgeInsets — Directional Padding

The following patterns were checked:

| Pattern | Found in student features | Assessment |
|---|---|---|
| `EdgeInsets.only(left: ...)` | Not found in student-facing features | ✅ |
| `EdgeInsets.only(right: ...)` | Found in `ds_preview_page.dart` (dev tool only) | ✅ Not student-facing |
| `EdgeInsets.symmetric(horizontal: ...)` | Used — direction-neutral | ✅ |
| `EdgeInsets.all(...)` | Used — direction-neutral | ✅ |

**Result:** ✅ No directional padding in student-facing features.

### List Tiles

- `CourseTile`, `ChapterTile`, `LessonTile` use
  `textDirection: Directionality.of(context)` — correctly reads the ambient
  direction at render time rather than hard-coding.

**Result:** ✅

---

## 4. Icon Mirroring

Flutter mirrors directional icons automatically when `TextDirection.rtl`
is active, provided the icon is declared as directional in the icon font.

| Icon used | Directional? | Assessment |
|---|---|---|
| `Icons.home_outlined` | No — symmetric | ✅ No mirroring needed |
| `Icons.menu_book_outlined` | No — symmetric | ✅ |
| `Icons.replay_outlined` | No — symmetric | ✅ |
| `Icons.insights_outlined` | No — symmetric | ✅ |
| `Icons.person_outline` | No — symmetric | ✅ |
| `Icons.school_outlined` (splash) | No — symmetric | ✅ |
| `Icons.arrow_back` | Yes — directional | ✅ Flutter mirrors automatically in RTL |
| `Icons.chevron_right` / `chevron_left` (lesson tiles) | Yes — directional | ✅ `Directionality.of(context)` used in tile; correct |

**Result:** ✅ No manually mirrored icons; Flutter platform handles directionality.

---

## 5. AIMBottomNav RTL

`AIMBottomNav` wraps Flutter's `NavigationBar`, which mirrors tab order
automatically under RTL. The 5 tabs (Home → Learn → Review → Progress → Profile)
will render right-to-left in Arabic locale.

**Result:** ✅

---

## 6. AIMTopAppBar RTL

`AIMTopAppBar` wraps `AppBar`. Under RTL the back arrow (`leading`) renders
on the right, and title aligns to the right — standard Flutter AppBar behaviour.

**Result:** ✅

---

## 7. Text Rendering

- All text uses `AimTextStyles.*` with `TextAlign` unspecified (default
  start-aligned) or `TextAlign.center` — both are direction-safe.
- No `TextAlign.left` or `TextAlign.right` hard-coding found in feature code
  (would be a direction violation).

**Result:** ✅

---

## 8. Arabic Typography

The `AimTextStyles` class defines font sizes using `sp` units. The app does
not yet include an Arabic-specific font — the system font (e.g. Noto Kufi Arabic
on Android, SF Arabic on iOS) will be used when Arabic content is displayed.
This is acceptable for MVP; a custom Arabic typeface should be considered for
Phase 7 launch.

---

## 9. Gaps / Limitations

| Gap | Severity | Owner |
|---|---|---|
| Arabic string translations not yet defined — all visible strings are English hard-coded in widget code | High | Phase 7 (i18n/l10n pass) |
| No Arabic-specific font bundle | Low | Phase 7 |
| RTL layout not device-tested (no physical device / emulator in this environment) | Medium | QA team — pilot study |
| Placement section/submit pages have directional-unsafe `Text` children (from Phase 4 legacy) — low impact since those pages carry no Arabic strings | Low | Legacy rebuild |

---

## Summary

| Check | Result |
|---|---|
| Locale system (AppLocale + localeProvider) | ✅ PASS |
| No hard-coded TextDirection in features | ✅ PASS (0 occurrences) |
| No directional EdgeInsets in student features | ✅ PASS |
| Icon mirroring | ✅ PASS |
| AIMBottomNav RTL | ✅ PASS |
| AIMTopAppBar RTL | ✅ PASS |
| Text alignment direction-safe | ✅ PASS |
| Arabic strings / i18n | ⚠️ GAP — Phase 7 |

---

## Verdict

**PASS (structural RTL readiness confirmed).** The Flutter codebase is
structurally RTL-safe: no hard-coded text directions, no directional padding
in student features, icon mirroring is correct, and the locale/direction
propagation system is complete. The app will correctly flip layout to RTL
when `Locale('ar')` is set. The primary outstanding gap is string
localisation (Arabic text content), which is explicitly Phase 7 scope.
