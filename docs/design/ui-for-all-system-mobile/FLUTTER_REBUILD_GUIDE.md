# Flutter rebuild guide — for Claude Code

Paste the prompt below to Claude Code (or any AI dev agent) **with this whole folder available**. It tells the agent exactly how to turn this design reference into your real Flutter app.

> ⚠️ This folder is a **design reference**, not code to copy. The HTML/React here shows *how the app should look and behave*. The agent must **rebuild every screen as native Flutter widgets** inside your existing app — using your current architecture, navigation, and state management — not embed HTML or port React.

---

## ✅ Copy-paste prompt for Claude Code

```
I'm redesigning my existing Flutter app to the "AIM — Gen Z" visual style. This folder is the
design reference. Do NOT copy the HTML or React — REBUILD each screen as native Flutter widgets
inside my existing app, using my current architecture, routing, and state management.

WHAT'S IN THE FOLDER
- screenshots/light/ and screenshots/dark/  → exactly how every screen must look (59 screens, both themes).
- screenshots/menu/                          → the side menu drawer (light + dark) and the notifications bottom sheet.
- screenshots/INDEX.md                       → maps screenshot number → screen name.
- SCREENS.md                                 → every screen, its purpose, layout, and components.
- design-system/tokens/*.css                 → the SINGLE SOURCE OF TRUTH for colors, spacing,
                                               radius, typography, shadows. Convert these to Flutter.
- README.md                                  → folder map + the Gen Z gradient definitions.
- Run App (standalone).html                  → open in a browser to click through the live prototype
                                               (use the top-right picker; toggle Light/Dark and EN/عربي).

STEP 1 — Build the theme from the tokens (do this FIRST)
- Read design-system/tokens/colors.css, typography.css, spacing.css, radius.css, shadows.css.
- Create a Flutter theme/token layer: AppColors, AppSpacing, AppRadius, AppTextStyles, AppShadows,
  and a light + dark ThemeData. Map the CSS custom properties 1:1 (e.g. --surface, --text-primary,
  --primary-soft, --radius-2xl, --shadow-card). Wire dark mode through ThemeData, not hardcoded colors.
- Add the Gen Z gradients as constants (from README.md):
    gzHero  = LinearGradient(142°, [#8B5CF6, #6C63FF, #5AC8FA])
    gzFire  = LinearGradient(135°, [#FFB14E, #FF6B8A])
    gzLime  = LinearGradient(135°, [#C8FF3D, #74E08A])
    gzCoral = LinearGradient(135°, [#FF6B8A, #FF9F45])

STEP 2 — Build shared widgets
- Recreate the reusable pieces as Flutter widgets: gradient hero header, glassy app bar, rounded
  "blob" card, pill gradient button, stat tile, progress ring, skill blob, the side menu drawer,
  and the notifications bottom sheet. Use outline icons (e.g. lucide_icons / a 2px-stroke set) —
  NO emoji.

STEP 3 — Build screens
- Work screen by screen using the screenshots as the visual target and SCREENS.md for behavior.
  Recommended order: theme → Splash → Login/Register → Home → Courses/Chapters/Lessons → Review/
  Progress → Profile → then the rest tab by tab.
- For each screen, match: layout, spacing, corner radius, colors, type, and the exact copy shown.
- Match both light and dark (compare to screenshots/light vs screenshots/dark).

REQUIREMENTS
- Full RTL support: the prototype supports Arabic. Use Flutter's Directionality / logical insets
  (EdgeInsetsDirectional, AlignmentDirectional) so everything mirrors. Flip directional icons.
- Min 44px touch targets. Respect reduced-motion for the animations.
- Use MY app's existing networking/state for real data — the prototype data is placeholder.

PROCESS
- Before adding any screen, content, or feature that is NOT in the reference, ASK me first.
- After each screen, show me a screenshot/preview so I can compare against the reference.
- Tell me if any token or screenshot is ambiguous instead of guessing.
```

---

## Token → Flutter cheat sheet

| CSS token (in `design-system/tokens/`) | Flutter target |
| --- | --- |
| `colors.css` semantic vars (`--surface`, `--text-primary`, `--border`, `--primary-soft`…) | `AppColors` + light/dark `ColorScheme` |
| `typography.css` roles (`--type-h1`, `--type-body-md`, `--type-button`…) | `AppTextStyles` / `TextTheme` |
| `spacing.css` (8-pt scale) | `AppSpacing` constants → `EdgeInsetsDirectional`, `SizedBox`, `gap` |
| `radius.css` (`--radius-sm…--radius-pill`) | `AppRadius` → `BorderRadius` |
| `shadows.css` (`--shadow-card`, `--shadow-modal`…) | `AppShadows` → `List<BoxShadow>` |
| Gen Z gradients (README) | `LinearGradient` constants |

## Notes
- The **screenshots are the ground truth** for pixel layout; the **tokens are the ground truth** for exact values. When in doubt, read the token file rather than eyedropping a screenshot.
- The React components in `design-system/components/` are there as a behavior/prop reference (what props each component takes, its states) — handy when deciding what your Flutter widget's parameters should be. Don't port them literally.
- If your app has no theming layer yet, Step 1 establishes it; every later screen then "just works" in light/dark.
