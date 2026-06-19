# Phase 6 — Design System Adoption Checklist

**Phase:** 6  
**Task:** P6-018  
**Status:** Active  
**Branch:** `phase6/P6-018-design-system-adoption-checklist`  
**Dependency:** P6-012, P6-013, P6-014, P6-015  
**Output:** `docs/phase-6/design-system-adoption-checklist.md`

---

## 1. Purpose

This checklist must be completed by the implementing agent or contributor for every UI task in Phase 6. It proves that the screen or widget being delivered correctly uses the AIM Mobile Design System, respects RTL/Arabic rules, and preserves backend authority.

A task whose checklist cannot be fully checked passes the done test. A task with unchecked items does not pass — even if the UI looks correct visually.

**When to use this checklist:** Before marking any UI task Done in Notion.

---

## 2. How to Use

Copy the per-screen checklist below into the task completion comment in Notion. Work through each item. Mark `✅` for pass, `❌` for fail (with explanation), or `N/A` where genuinely not applicable (e.g. a screen with no icons has no icon-direction items to check).

If any item is `❌`, fix it before marking Done. Do not leave failures and mark Done anyway.

---

## 3. Section A — Token Usage

Verify that no raw values appear in any feature file touched by this task.

- [ ] **A1 — No hard-coded colors.** No `Color(0xFF...)`, `Colors.white`, `Colors.green`, `Colors.red`, `Colors.grey`, or any `Color.fromRGBO/fromARGB` in feature files. All colors come from `AimColors.*`, `aimSurfacesOf(context).*`, or `aimSoftFillsOf(context).*`.

- [ ] **A2 — No inline TextStyle construction.** No `TextStyle(fontSize: ..., fontWeight: ...)` constructed inline in feature files. All text styles use `AimTextStyles.*` or `.copyWith()` on an existing style.

- [ ] **A3 — No raw spacing literals.** No bare numbers in `SizedBox(height: N)`, `SizedBox(width: N)`, `Padding(padding: EdgeInsets.all(N))`, or `EdgeInsets.symmetric(horizontal: N)`. All spacing values come from `AimSpacing.*` constants.

- [ ] **A4 — No raw radius literals.** No `BorderRadius.circular(N)` with a raw integer in feature files. All radii use `AimRadius.borderXs/borderSm/borderMd/borderLg/borderXl/borderX2l/borderPill`.

- [ ] **A5 — No inline shadows.** No `BoxShadow(color: ..., blurRadius: ...)` constructed in feature files. All shadows use `AimShadows.*` or `aimShadowsOf(context).*`.

- [ ] **A6 — No raw Duration literals.** No `Duration(milliseconds: N)` in animation or transition code. All durations use `AimMotion.durationFast/durationBase/durationSlow`. All curves use `AimMotion.easeStandard/easeEmphasis`.

---

## 4. Section B — Widget Usage

Verify that no design system widget has been reimplemented inline.

- [ ] **B1 — Buttons use `AIMButton` or `AIMIconButton`.** No custom button containers, `GestureDetector` wrappers, or `InkWell` + `Container` combinations used as buttons. `AIMFab` used for FABs.

- [ ] **B2 — Cards use `AIMCard`.** No custom `Container` + `BoxDecoration` + shadow combinations used as cards. Correct `AIMCardVariant` selected (`standard`, `elevated`, `ai`, `gradient`).

- [ ] **B3 — Text inputs use `AIMInput`, `AIMTextarea`, or `AIMSelect`.** No raw `TextField`, `TextFormField`, or `DropdownButton` in feature UI. OTP/PIN inputs use `AIMOTPInput`.

- [ ] **B4 — Loading states use `AIMSkeleton`.** No `CircularProgressIndicator` used directly in feature screens for content-area loading. Full-screen loading uses the sealed `loading` state from the notifier with an appropriate skeleton layout.

- [ ] **B5 — Error states use `AIMAlertBanner`.** No custom error containers or inline red text for error display. `AIMAlertTone.error` or `AIMAlertTone.warning` used as appropriate.

- [ ] **B6 — Answer options use `AIMAnswerOption`.** No custom answer tile implementations for placement or session question screens. Correct `AIMAnswerOptionState` applied based on backend response — never derived in Flutter.

- [ ] **B7 — Progress indicators use `AIMProgressBar` or `AIMCircularProgress`.** No custom progress track widgets. Correct tone and size selected from enums.

- [ ] **B8 — Status labels use `AIMBadge` or `AIMChip`.** No custom label containers. Correct `AIMBadgeTone` and `AIMBadgeVariant` used.

- [ ] **B9 — AI feedback uses `AIMAIFeedbackBubble`.** No custom chat-bubble widgets. Correct `AIMAIFeedbackTone` applied. Content is backend-returned text — never generated in Flutter.

- [ ] **B10 — Navigation bar uses `AIMBottomNav`.** Raw `NavigationBar` replaced with `AIMBottomNav<T>` for the main shell. Top bars use `AIMTopAppBar`. In-screen tab strips use `AIMTabs`. Toggle selectors use `AIMSegmentedControl`.

---

## 5. Section C — RTL / Arabic Layout

Verify that the screen renders correctly under `TextDirection.rtl`.

- [ ] **C1 — No `EdgeInsets.only(left:)` or `EdgeInsets.only(right:)`.** All directional padding uses `EdgeInsetsDirectional.only(start:)` / `EdgeInsetsDirectional.only(end:)`.

- [ ] **C2 — No `Alignment.centerLeft` or `Alignment.centerRight`.** All directional alignment uses `AlignmentDirectional.centerStart` / `AlignmentDirectional.centerEnd`.

- [ ] **C3 — No `Positioned(left:)` or `Positioned(right:)` in `Stack`.** All directional stack positioning uses `Positioned.directional(start:)` / `Positioned.directional(end:)`.

- [ ] **C4 — Directional icons are mirrored.** Navigation arrows (`arrow_back`, `arrow_forward`, `chevron_left`, `chevron_right`), list-item trailing icons, and progress direction icons use `Directionality.of(context)` or Flutter's built-in icon mirroring. Non-directional icons (close X, mic, camera) are NOT mirrored.

- [ ] **C5 — Arabic content uses the Arabic text style.** Any text rendered in Arabic locale uses `AimTextStyles.arabicH1/arabicH3/arabicBodyMd/arabicBodySm` (IBM Plex Sans Arabic, 1.18× line height). No Arabic content uses the default Inter `TextStyle`.

- [ ] **C6 — Text alignment uses `TextAlign.start` / `TextAlign.end`.** No `TextAlign.left` or `TextAlign.right` in feature files. Body text uses `TextAlign.start`. Centered text uses `TextAlign.center` (acceptable for both directions).

- [ ] **C7 — Input fields handle RTL text entry.** `AIMInput` and `AIMTextarea` do not force `textDirection: TextDirection.ltr` on Arabic content. If explicit direction is needed for a mixed-content field, it is set via `Directionality` wrapper — not hard-coded inside the widget.

- [ ] **C8 — Screen has been visually verified under RTL.** The screen was either (a) run in an RTL locale on a simulator/device, or (b) wrapped in `Directionality(textDirection: TextDirection.rtl, child: ...)` in a widget test. The result was inspected and no layout breakage was observed. Document the verification method used.

  **Verification method used:** `_______________`

---

## 6. Section D — Backend Authority

Verify that Flutter displays backend data and does not compute learning values.

- [ ] **D1 — No score calculation in Flutter.** No placement score, section score, or session score computed in Flutter. All numeric results come from backend response fields and are displayed as-is.

- [ ] **D2 — No correctness determination in Flutter.** `AIMAnswerOptionState.correct` and `AIMAnswerOptionState.incorrect` are only set after the backend returns `isCorrect` in the answer-submission response. During active placement, only `defaultState` and `selected` states are used.

- [ ] **D3 — No CEFR band derivation in Flutter.** CEFR band labels (A1–C2) come from backend response fields. Flutter never maps a score number to a band string.

- [ ] **D4 — No mastery / weakness computation in Flutter.** Mastery levels, weakness labels, difficulty ratings, and topic coverage percentages are displayed from AIM result endpoint responses — never calculated.

- [ ] **D5 — No AIM Engine or AI provider calls from Flutter.** No HTTP calls to AIM Engine service URLs or to OpenAI/Anthropic/etc. from any feature or core file touched by this task.

- [ ] **D6 — `student_id` not sent as client-supplied body parameter.** All endpoints that require `student_id` in the URL path use the value from the stored JWT-decoded profile — never from user input or a Flutter-side variable that the user could influence.

---

## 7. Section E — Code Quality

- [ ] **E1 — `flutter analyze` passes with no errors.** Run `flutter analyze` from `apps/mobile/` before committing. Zero errors required. Warnings should be reviewed and resolved where practical.

- [ ] **E2 — No secrets in committed files.** No API keys, tokens, Supabase URLs, or service credentials in any Dart file, asset, or config file. Environment values come from `.env` or platform-specific config — never hard-coded.

- [ ] **E3 — No debug code left in production paths.** No `print()` statements, `debugPrint()` calls, or `TODO: remove` comments in committed feature code.

- [ ] **E4 — Feature folder follows feature-first architecture.** New files placed in the correct feature folder (`features/<feature>/ui/`, `features/<feature>/logic/`, `features/<feature>/data/`). No feature logic placed in `core/`.

---

## 8. Per-Screen Completion Record

Copy this block into the Notion task completion comment for each screen delivered:

```
## Design System Adoption Checklist — <ScreenName>

### A — Token Usage
- [ ] A1 No hard-coded colors
- [ ] A2 No inline TextStyle
- [ ] A3 No raw spacing literals
- [ ] A4 No raw radius literals
- [ ] A5 No inline shadows
- [ ] A6 No raw Duration literals

### B — Widget Usage
- [ ] B1 Buttons: AIMButton / AIMIconButton / AIMFab
- [ ] B2 Cards: AIMCard
- [ ] B3 Inputs: AIMInput / AIMTextarea / AIMSelect / AIMOTPInput
- [ ] B4 Loading: AIMSkeleton
- [ ] B5 Errors: AIMAlertBanner
- [ ] B6 Answer options: AIMAnswerOption (state from backend)
- [ ] B7 Progress: AIMProgressBar / AIMCircularProgress
- [ ] B8 Labels: AIMBadge / AIMChip
- [ ] B9 AI feedback: AIMAIFeedbackBubble (content from backend)
- [ ] B10 Navigation: AIMBottomNav / AIMTopAppBar / AIMTabs / AIMSegmentedControl

### C — RTL / Arabic
- [ ] C1 EdgeInsetsDirectional (no left/right)
- [ ] C2 AlignmentDirectional (no centerLeft/centerRight)
- [ ] C3 Positioned.directional (no left/right in Stack)
- [ ] C4 Directional icons mirrored; non-directional icons not mirrored
- [ ] C5 Arabic content uses AimTextStyles.arabic*
- [ ] C6 TextAlign.start/end/center (no left/right)
- [ ] C7 Input fields handle RTL text entry
- [ ] C8 RTL visual verification completed — method: ___

### D — Backend Authority
- [ ] D1 No score calculation in Flutter
- [ ] D2 No correctness determination in Flutter
- [ ] D3 No CEFR band derivation in Flutter
- [ ] D4 No mastery/weakness computation in Flutter
- [ ] D5 No AIM Engine / AI provider calls
- [ ] D6 student_id from JWT profile, not user input

### E — Code Quality
- [ ] E1 flutter analyze passes (zero errors)
- [ ] E2 No secrets committed
- [ ] E3 No debug code in production paths
- [ ] E4 Feature-first folder structure followed
```

---

## 9. References

- Theme Token Map: `docs/phase-6/theme-token-map.md`
- Shared Widget Catalog: `docs/phase-6/shared-widget-catalog.md`
- RTL/Arabic Design Rules: `docs/phase-6/rtl-arabic-design-rules.md`
- No One-Off Styling Rule: `docs/phase-6/no-one-off-styling-rule.md`
- Design System Contract: `docs/phase-6/mobile-design-system-contract.md`
- No Client Authority Rule: `docs/phase-6/no-client-authority-rule.md`

---

*Design system adoption checklist created: P6-018 | Branch: phase6/P6-018-design-system-adoption-checklist*
