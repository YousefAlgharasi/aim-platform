# Phase 6 — Design System Dependencies Map

**Phase:** 6  
**Task:** P6-016  
**Branch:** `phase6/P6-016-design-system-dependency-map`  
**Dependency:** P6-011 (Mobile Design System Contract — Done)  
**Output:** `docs/phase-6/design-system-dependency-map.md`

---

## 1. Purpose

This document maps every Phase 6 UI task to the exact design system tokens and widgets it must use. It makes design system adoption enforceable at the task level, so reviewers can check compliance without reading the full contract.

---

## 2. How to Use This Map

Before implementing any UI task:
1. Find the task ID in the table below.
2. Import the listed token files and widget files.
3. Use only the listed components — no custom implementations.
4. Verify RTL compliance using the RTL checklist in `docs/phase-6/rtl-arabic-design-rules.md`.

---

## 3. Token Quick Reference

All tokens import from: `package:aim_mobile/core/design_tokens/design_tokens.dart`  
All widgets import from: `package:aim_mobile/core/widgets/widgets.dart`  
Theme access: `Theme.of(context).extension<AimThemeExtensions>()`

| Token Class | File | Key Members |
|---|---|---|
| `AimColors` | `aim_colors.dart` | `primary500`, `neutral0`, `success500`, `error500`, `neutral900` |
| `AimTextStyles` | `aim_typography.dart` | `displaySm`, `headingH4`, `bodyMd`, `bodySm`, `labelMd`, `caption` |
| `AimFontFamilies` | `aim_typography.dart` | `sansDefault` (Inter), `sansRtl` (IBM Plex Sans Arabic) |
| `AimSpacing` | `aim_spacing.dart` | `space4`–`space64`, `screenPaddingMobile`, `cardPadding`, `componentGap` |
| `AimRadius` | `aim_radius.dart` | `borderSm` (8), `borderMd` (12), `borderLg` (16), `borderPill` |
| `AimShadows` | `aim_shadows.dart` | `sm`, `md`, `lg` |
| `AimMotion` | `aim_motion.dart` | Duration and curve presets |

---

## 4. UI Task → Design System Dependency Map

### Authentication

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Login screen | `LoginPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimInput` (email, password), `AIMButton` (primary: Sign In), `AimAlertBanner` (error state) |
| Register screen | `RegisterPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimInput` (name, email, password), `AIMButton` (primary: Register), `AimAlertBanner` (error) |
| Auth gate | `AuthGate` | `AimColors` | `AimSkeleton` (loading), `AIMButton` (ghost: redirect) |

### Placement Test

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Placement start | `PlacementStartPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius`, `AimShadows` | `AimCard` (test info), `AIMButton` (primary: Start Test), `AimProgressBar` |
| Placement section | `PlacementSectionPage` | `AimColors`, `AimTextStyles`, `AimSpacing` | `AimTopAppBar`, `AimProgressBar`, `AimCard` (section info), `AIMButton` (primary: Next) |
| Placement question | `PlacementQuestionPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimTopAppBar`, `AimProgressBar`, `AimAnswerOption` (×N options), `AIMButton` (primary: Submit Answer) |
| Placement result | `PlacementResultPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius`, `AimShadows` | `AimCircularProgress` (score display), `AimCard` (result detail), `AimChip` (skill tags), `AIMButton` (primary: Go to Home) |
| Placement submit | `PlacementSubmitPage` | `AimColors`, `AimTextStyles`, `AimSpacing` | `AimSkeleton` (processing), `AimAlertBanner` (error) |

### Home

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Home screen | `HomePage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius`, `AimShadows` | `AimTopAppBar`, `AimBottomNav`, `AimCard` (plan summary), `AimProgressBar` (overall progress), `AimChip` (topic tags), `AIMButton` (primary: Continue), `AimSkeleton` (loading) |

### Learning / Sessions

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Learn / lesson list | `LearnPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius`, `AimShadows` | `AimTopAppBar`, `AimBottomNav`, `AimCard` (lesson cards), `AimProgressBar`, `AimBadge` (status), `AimSkeleton` |
| Session question | Session Q&A page | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimTopAppBar`, `AimProgressBar`, `AimAnswerOption` (×N), `AIMButton` (primary: Submit) |
| Session feedback | Feedback page | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimAiFeedbackBubble`, `AimCard`, `AIMButton` (primary: Next Question / Continue) |

### Progress

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Progress screen | `ProgressPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius`, `AimShadows` | `AimTopAppBar`, `AimBottomNav`, `AimCircularProgress` (mastery), `AimProgressBar` (per-topic), `AimCard`, `AimChip`, `AimSkeleton` |

### Profile

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Profile screen | `ProfilePage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimTopAppBar`, `AimBottomNav`, `AimCard`, `AIMButton` (outline: Edit Profile, ghost: Sign Out) |
| Edit profile | `EditProfilePage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimTopAppBar`, `AimInput` (name, email), `AIMButton` (primary: Save, ghost: Cancel), `AimAlertBanner` |

### Reviews

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Review screen | `ReviewPage` | `AimColors`, `AimTextStyles`, `AimSpacing`, `AimRadius` | `AimTopAppBar`, `AimBottomNav`, `AimCard` (review items), `AimBadge` (due date), `AimSkeleton` |

### Onboarding / Shell

| Task | Screen | Required Tokens | Required Widgets |
|---|---|---|---|
| Splash screen | `SplashPage` | `AimColors`, `AimGradients` | `AimSkeleton` (while loading) |
| Main shell | `MainShellPage` | `AimColors`, `AimSpacing` | `AimBottomNav` |

---

## 5. State-Specific Widget Map

Every screen must handle all four states using design system components:

| State | Required Widget | Notes |
|---|---|---|
| Loading | `AimSkeleton` | Match skeleton shape to content layout |
| Empty | `AimCard` with `AimTextStyles.bodyMd` + `AIMButton` (ghost: action) | Show helpful empty message |
| Error | `AimAlertBanner` + `AIMButton` (outline: Retry) | Always offer retry |
| Success | Full content render | Use widgets from task map above |

---

## 6. RTL Required on All Tasks

Every task in this map must pass the full RTL checklist from `docs/phase-6/rtl-arabic-design-rules.md` before marking Done:

- `EdgeInsetsDirectional` for asymmetric padding ✓
- `AlignmentDirectional` for directional alignment ✓
- Directional icons mirrored in RTL ✓
- Arabic font active under RTL locale ✓
- No `TextDirection.ltr` forced in feature code ✓

---

## 7. References

- Full widget specs: `docs/phase-6/mobile-design-system-file-inventory.md`
- Usage rules: `docs/phase-6/mobile-design-system-contract.md`
- RTL rules: `docs/phase-6/rtl-arabic-design-rules.md`

---

*Design System Dependency Map created: P6-016 | Branch: phase6/P6-016-design-system-dependency-map*
