import 'package:flutter/material.dart';

import '../design_tokens/design_tokens.dart';
import 'aim_light_theme.dart';

final ThemeData aimDarkTheme = buildAimTheme(
  colorScheme: aimDarkColorScheme,
  colors: AimColorTheme.dark,
);

const ColorScheme aimDarkColorScheme = ColorScheme.dark(
  primary: AimColors.primary300,
  onPrimary: AimColors.neutral900,
  primaryContainer: AimColors.primary800,
  onPrimaryContainer: AimColors.primary100,
  secondary: AimColors.secondary300,
  onSecondary: AimColors.neutral900,
  secondaryContainer: AimColors.secondary800,
  onSecondaryContainer: AimColors.secondary100,
  tertiary: AimColors.accent300,
  onTertiary: AimColors.neutral900,
  tertiaryContainer: AimColors.accent800,
  onTertiaryContainer: AimColors.accent100,
  error: Color(0xFFF2A6A8),
  onError: AimColors.neutral900,
  errorContainer: Color(0xFF45262F),
  onErrorContainer: Color(0xFFF2A6A8),
  surface: Color(0xFF181C26),
  onSurface: Color(0xFFF2F4F8),
  surfaceContainerHighest: Color(0xFF202533),
  onSurfaceVariant: AimColors.neutral400,
  outline: AimColors.neutral800,
  outlineVariant: Color(0xFF3A4253),
  shadow: AimColors.neutral900,
  scrim: AimColors.neutral900,
  inverseSurface: AimColors.neutral50,
  onInverseSurface: AimColors.neutral900,
  inversePrimary: AimColors.primary600,
);
