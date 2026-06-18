# AIM Mobile Font Assets

Task 7 status: AIM font families are represented in Flutter tokens and theme, but local production font files are not present in `apps/mobile` yet.

## Required Fonts

English UI and content:

- Family name: `Inter`
- Required weights: 400, 500, 600, 700, 800

Arabic UI and content:

- Family name: `IBM Plex Sans Arabic`
- Required weights: 400, 500, 600, 700
- Fallback family: `Noto Sans Arabic`

## Expected Asset Paths

Add files at these exact paths before updating `pubspec.yaml`:

```text
apps/mobile/assets/fonts/inter/Inter-Regular.ttf
apps/mobile/assets/fonts/inter/Inter-Medium.ttf
apps/mobile/assets/fonts/inter/Inter-SemiBold.ttf
apps/mobile/assets/fonts/inter/Inter-Bold.ttf
apps/mobile/assets/fonts/inter/Inter-ExtraBold.ttf

apps/mobile/assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Regular.ttf
apps/mobile/assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Medium.ttf
apps/mobile/assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-SemiBold.ttf
apps/mobile/assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Bold.ttf
```

The same paths are represented as constants in `AimFontAssets`.

## Pubspec Block To Add Later

Do not add this block until the files above exist.

```yaml
flutter:
  uses-material-design: true
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/inter/Inter-Regular.ttf
          weight: 400
        - asset: assets/fonts/inter/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/inter/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/inter/Inter-Bold.ttf
          weight: 700
        - asset: assets/fonts/inter/Inter-ExtraBold.ttf
          weight: 800
    - family: IBM Plex Sans Arabic
      fonts:
        - asset: assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Regular.ttf
          weight: 400
        - asset: assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Medium.ttf
          weight: 500
        - asset: assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Bold.ttf
          weight: 700
```

## Current Theme Strategy

- `ThemeData.fontFamily` is set to `Inter`.
- `ThemeData.fontFamilyFallback` includes `IBM Plex Sans Arabic` and `Noto Sans Arabic`.
- AIM English text styles use `Inter` with Arabic fallbacks.
- AIM Arabic text styles use `IBM Plex Sans Arabic` with `Noto Sans Arabic` fallback.
- Arabic text styles use the original design-system line-height scale of `1.18`.
- Arabic styles remove tight/negative letter spacing.

## Arabic Rendering Strategy

When localization and RTL are implemented:

- Use English text styles for English LTR strings.
- Use Arabic text styles for Arabic RTL strings and learner-facing Arabic content.
- Apply Arabic text styles through locale-aware helpers, localized widgets, or future theme extensions.
- Keep OTP codes, timers, percentages, and short technical codes LTR even inside Arabic layouts.
- Do not reduce learner-facing body text below the source system's body sizes: body medium is 16px, body small is 14px only for secondary or dense UI.

## Why `pubspec.yaml` Was Not Updated

No Inter or IBM Plex Sans Arabic source font files currently exist in `apps/mobile/assets/`. Updating `pubspec.yaml` before the files exist would break Flutter asset resolution.
