import 'package:aim_mobile/core/theme/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('AIM Theme Light and Dark Mode Tests', () {
    test('AppTheme.light creates valid ThemeData with light colors and extensions', () {
      final theme = AppTheme.light;

      expect(theme.brightness, Brightness.light);
      expect(theme.colorScheme.brightness, Brightness.light);
      expect(theme.scaffoldBackgroundColor, AimColors.neutral50);

      // Verify theme extensions are present
      final surfaceTheme = theme.extension<AimSurfaceTheme>();
      expect(surfaceTheme, isNotNull);
      expect(surfaceTheme!.background, AimColors.neutral50);
      expect(surfaceTheme.surface, AimColors.neutral0);
      expect(surfaceTheme.textPrimary, AimColors.neutral900);

      final softFillTheme = theme.extension<AimSoftFillTheme>();
      expect(softFillTheme, isNotNull);
      expect(softFillTheme!.primary, AimColors.primary50);
      expect(softFillTheme.onPrimary, AimColors.primary700);

      final gradientTheme = theme.extension<AimGradientTheme>();
      expect(gradientTheme, isNotNull);
      expect(gradientTheme!.ai, AimGradients.ai);

      final shadowTheme = theme.extension<AimShadowTheme>();
      expect(shadowTheme, isNotNull);
      expect(shadowTheme!.card, AimShadows.card);
    });

    test('AppTheme.dark creates valid ThemeData with dark colors and extensions', () {
      final theme = AppTheme.dark;

      expect(theme.brightness, Brightness.dark);
      expect(theme.colorScheme.brightness, Brightness.dark);
      expect(theme.scaffoldBackgroundColor, const Color(0xFF0E1118));

      // Verify theme extensions are present with dark values
      final surfaceTheme = theme.extension<AimSurfaceTheme>();
      expect(surfaceTheme, isNotNull);
      expect(surfaceTheme!.background, const Color(0xFF0E1118));
      expect(surfaceTheme.surface, const Color(0xFF181C26));
      expect(surfaceTheme.textPrimary, const Color(0xFFF2F4F8));

      final softFillTheme = theme.extension<AimSoftFillTheme>();
      expect(softFillTheme, isNotNull);
      expect(softFillTheme!.primary, const Color(0xFF222B52));

      final gradientTheme = theme.extension<AimGradientTheme>();
      expect(gradientTheme, isNotNull);

      final shadowTheme = theme.extension<AimShadowTheme>();
      expect(shadowTheme, isNotNull);
    });

    test('themeModeProvider initializes to ThemeMode.system and updates correctly', () {
      final container = ProviderContainer();
      addTearDown(container.dispose);

      expect(container.read(themeModeProvider), ThemeMode.system);

      container.read(themeModeProvider.notifier).state = ThemeMode.light;
      expect(container.read(themeModeProvider), ThemeMode.light);

      container.read(themeModeProvider.notifier).state = ThemeMode.dark;
      expect(container.read(themeModeProvider), ThemeMode.dark);
    });

    testWidgets('aimSurfacesOf helper resolves correctly from context in light and dark mode', (tester) async {
      late AimSurfaceTheme lightSurfaces;
      late AimSurfaceTheme darkSurfaces;

      await tester.pumpWidget(
        MaterialApp(
          home: Theme(
            data: AppTheme.light,
            child: Builder(
              builder: (context) {
                lightSurfaces = aimSurfacesOf(context);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      expect(lightSurfaces.background, AimColors.neutral50);

      await tester.pumpWidget(
        MaterialApp(
          home: Theme(
            data: AppTheme.dark,
            child: Builder(
              builder: (context) {
                darkSurfaces = aimSurfacesOf(context);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      expect(darkSurfaces.background, const Color(0xFF0E1118));
      expect(darkSurfaces.textPrimary, const Color(0xFFF2F4F8));
    });

    testWidgets('aimSoftFillsOf helper resolves correctly from context', (tester) async {
      late AimSoftFillTheme lightSoftFills;
      late AimSoftFillTheme darkSoftFills;

      await tester.pumpWidget(
        MaterialApp(
          home: Theme(
            data: AppTheme.light,
            child: Builder(
              builder: (context) {
                lightSoftFills = aimSoftFillsOf(context);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      expect(lightSoftFills.primary, AimColors.primary50);

      await tester.pumpWidget(
        MaterialApp(
          home: Theme(
            data: AppTheme.dark,
            child: Builder(
              builder: (context) {
                darkSoftFills = aimSoftFillsOf(context);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      expect(darkSoftFills.primary, const Color(0xFF222B52));
    });

    testWidgets('aimGradientsOf and aimShadowsOf helpers return valid themes', (tester) async {
      late AimGradientTheme gradients;
      late AimShadowTheme shadows;

      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.light,
          home: Builder(
            builder: (context) {
              gradients = aimGradientsOf(context);
              shadows = aimShadowsOf(context);
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      expect(gradients.ai, AimGradients.ai);
      expect(shadows.card, AimShadows.card);
    });
  });
}
