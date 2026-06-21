import 'package:flutter/material.dart';

import '../design_tokens/design_tokens.dart';
import 'aim_theme_extensions.dart';

final ThemeData aimLightTheme = buildAimTheme(
  colorScheme: aimLightColorScheme,
  colors: AimColorTheme.light,
);

const ColorScheme aimLightColorScheme = ColorScheme.light(
  primary: AimColors.primary500,
  onPrimary: AimColors.neutral0,
  primaryContainer: AimColors.primary50,
  onPrimaryContainer: AimColors.primary700,
  secondary: AimColors.secondary500,
  onSecondary: AimColors.neutral0,
  secondaryContainer: AimColors.secondary50,
  onSecondaryContainer: AimColors.secondary700,
  tertiary: AimColors.accent500,
  onTertiary: AimColors.neutral0,
  tertiaryContainer: AimColors.accent50,
  onTertiaryContainer: AimColors.accent700,
  error: AimColors.error500,
  onError: AimColors.neutral0,
  errorContainer: AimColors.error50,
  onErrorContainer: AimColors.error700,
  surface: AimColors.neutral0,
  onSurface: AimColors.neutral900,
  surfaceContainerHighest: AimColors.neutral100,
  onSurfaceVariant: AimColors.neutral600,
  outline: AimColors.neutral200,
  outlineVariant: AimColors.neutral300,
  shadow: AimColors.neutral900,
  scrim: AimColors.neutral900,
  inverseSurface: AimColors.neutral900,
  onInverseSurface: AimColors.neutral50,
  inversePrimary: AimColors.primary300,
);

ThemeData buildAimTheme({
  required ColorScheme colorScheme,
  required AimColorTheme colors,
}) {
  final textTheme = _textTheme(colors);

  return ThemeData(
    useMaterial3: true,
    brightness: colorScheme.brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: colors.background,
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: AimTextStyles.englishFallbacks,
    textTheme: textTheme,
    primaryTextTheme: textTheme,
    disabledColor: colors.disabledFg,
    dividerColor: colors.divider,
    extensions: <ThemeExtension<dynamic>>[
      AimSurfaceTheme.fromColors(colors),
      AimSoftFillTheme.fromColors(colors),
      AimGradientTheme.defaults,
      AimShadowTheme.defaults,
    ],
    appBarTheme: _appBarTheme(colorScheme, colors),
    bottomSheetTheme: _bottomSheetTheme(colors),
    cardTheme: _cardTheme(colors),
    chipTheme: _chipTheme(colors),
    dialogTheme: _dialogTheme(colors, textTheme),
    elevatedButtonTheme: _elevatedButtonTheme(colors),
    filledButtonTheme: _filledButtonTheme(colors),
    iconButtonTheme: _iconButtonTheme(colors),
    inputDecorationTheme: _inputDecorationTheme(colors),
    navigationBarTheme: _navigationBarTheme(colors),
    outlinedButtonTheme: _outlinedButtonTheme(colors),
    snackBarTheme: _snackBarTheme(colors),
    textButtonTheme: _textButtonTheme(colors),
  );
}

TextTheme _textTheme(AimColorTheme colors) {
  return TextTheme(
    displayLarge: AimTextStyles.display.copyWith(color: colors.textPrimary),
    headlineLarge: AimTextStyles.h1.copyWith(color: colors.textPrimary),
    headlineMedium: AimTextStyles.h2.copyWith(color: colors.textPrimary),
    headlineSmall: AimTextStyles.h3.copyWith(color: colors.textPrimary),
    titleLarge: AimTextStyles.title.copyWith(color: colors.textPrimary),
    titleMedium: AimTextStyles.title.copyWith(color: colors.textPrimary),
    titleSmall: AimTextStyles.label.copyWith(color: colors.textSecondary),
    bodyLarge: AimTextStyles.bodyLg.copyWith(color: colors.textPrimary),
    bodyMedium: AimTextStyles.bodyMd.copyWith(color: colors.textPrimary),
    bodySmall: AimTextStyles.bodySm.copyWith(color: colors.textSecondary),
    labelLarge: AimTextStyles.button.copyWith(color: colors.textPrimary),
    labelMedium: AimTextStyles.label.copyWith(color: colors.textSecondary),
    labelSmall: AimTextStyles.caption.copyWith(color: colors.textMuted),
  );
}

AppBarTheme _appBarTheme(ColorScheme colorScheme, AimColorTheme colors) {
  return AppBarTheme(
    backgroundColor: colors.surface,
    foregroundColor: colors.textPrimary,
    surfaceTintColor: const Color(0x00000000),
    elevation: 0,
    centerTitle: false,
    iconTheme: IconThemeData(
      color: colors.textPrimary,
      size: AimSizes.iconLg,
    ),
    actionsIconTheme: IconThemeData(
      color: colors.textPrimary,
      size: AimSizes.iconLg,
    ),
    titleTextStyle: AimTextStyles.h3.copyWith(color: colors.textPrimary),
    shape: Border(bottom: BorderSide(color: colors.border)),
  );
}

BottomSheetThemeData _bottomSheetTheme(AimColorTheme colors) {
  return BottomSheetThemeData(
    backgroundColor: colors.surface,
    surfaceTintColor: const Color(0x00000000),
    modalBackgroundColor: colors.surface,
    modalBarrierColor: colors.textPrimary.withValues(alpha: 0.42),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: AimRadius.radiusXl),
    ),
  );
}

CardThemeData _cardTheme(AimColorTheme colors) {
  return CardThemeData(
    color: colors.surface,
    surfaceTintColor: const Color(0x00000000),
    shadowColor: AimColors.neutral900.withValues(alpha: 0.08),
    elevation: 0,
    margin: EdgeInsets.zero,
    shape: RoundedRectangleBorder(
      borderRadius: AimRadius.borderLg,
      side: BorderSide(color: colors.border),
    ),
  );
}

ChipThemeData _chipTheme(AimColorTheme colors) {
  return ChipThemeData(
    backgroundColor: colors.surface,
    selectedColor: colors.primarySoft,
    disabledColor: colors.disabledBg,
    deleteIconColor: colors.textSecondary,
    checkmarkColor: colors.primarySoftFg,
    labelStyle: AimTextStyles.bodySm.copyWith(color: colors.textSecondary),
    secondaryLabelStyle:
        AimTextStyles.bodySm.copyWith(color: colors.primarySoftFg),
    padding: const EdgeInsets.symmetric(horizontal: AimSpacing.space12),
    side: BorderSide(color: colors.border),
    shape: const StadiumBorder(),
  );
}

DialogThemeData _dialogTheme(AimColorTheme colors, TextTheme textTheme) {
  return DialogThemeData(
    backgroundColor: colors.surfaceRaised,
    surfaceTintColor: const Color(0x00000000),
    titleTextStyle: textTheme.headlineSmall,
    contentTextStyle: textTheme.bodyMedium,
    shape: const RoundedRectangleBorder(borderRadius: AimRadius.borderXl),
  );
}

ElevatedButtonThemeData _elevatedButtonTheme(AimColorTheme colors) {
  return ElevatedButtonThemeData(
    style: _filledButtonStyle(colors).copyWith(
      elevation: const WidgetStatePropertyAll<double>(0),
      shadowColor: const WidgetStatePropertyAll<Color>(
        Color(0x00000000),
      ),
    ),
  );
}

FilledButtonThemeData _filledButtonTheme(AimColorTheme colors) {
  return FilledButtonThemeData(style: _filledButtonStyle(colors));
}

ButtonStyle _filledButtonStyle(AimColorTheme colors) {
  return ButtonStyle(
    minimumSize: const WidgetStatePropertyAll<Size>(
      Size(0, AimSizes.buttonMd),
    ),
    padding: const WidgetStatePropertyAll<EdgeInsetsGeometry>(
      EdgeInsets.symmetric(horizontal: AimSpacing.space20),
    ),
    textStyle: const WidgetStatePropertyAll<TextStyle>(AimTextStyles.button),
    shape: const WidgetStatePropertyAll<OutlinedBorder>(
      RoundedRectangleBorder(borderRadius: AimRadius.borderMd),
    ),
    backgroundColor: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.disabled)) return colors.disabledBg;
      if (states.contains(WidgetState.pressed)) return AimColors.primary700;
      if (states.contains(WidgetState.hovered)) return AimColors.primary600;
      return AimColors.primary500;
    }),
    foregroundColor: WidgetStateProperty.resolveWith((states) {
      if (states.contains(WidgetState.disabled)) return colors.disabledFg;
      return colors.textOnPrimary;
    }),
    overlayColor: WidgetStatePropertyAll<Color>(colors.statePressed),
  );
}

IconButtonThemeData _iconButtonTheme(AimColorTheme colors) {
  return IconButtonThemeData(
    style: ButtonStyle(
      minimumSize: const WidgetStatePropertyAll<Size>(
        Size.square(AimSizes.iconButton),
      ),
      iconSize: const WidgetStatePropertyAll<double>(AimSizes.iconMd),
      tapTargetSize: MaterialTapTargetSize.padded,
      shape: const WidgetStatePropertyAll<OutlinedBorder>(
        RoundedRectangleBorder(borderRadius: AimRadius.borderMd),
      ),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return colors.disabledFg;
        if (states.contains(WidgetState.hovered)) return colors.textPrimary;
        return colors.textSecondary;
      }),
      backgroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return const Color(0x00000000);
        }
        if (states.contains(WidgetState.pressed)) return colors.statePressed;
        if (states.contains(WidgetState.hovered)) return colors.surfaceSunken;
        return const Color(0x00000000);
      }),
    ),
  );
}

InputDecorationTheme _inputDecorationTheme(AimColorTheme colors) {
  final normalBorder = OutlineInputBorder(
    borderRadius: AimRadius.borderSm,
    borderSide: BorderSide(color: colors.border),
  );

  return InputDecorationTheme(
    filled: true,
    fillColor: colors.surface,
    contentPadding: const EdgeInsets.symmetric(
      horizontal: AimSpacing.space16,
      vertical: AimSpacing.space12,
    ),
    labelStyle: AimTextStyles.label.copyWith(color: colors.textSecondary),
    floatingLabelStyle:
        AimTextStyles.label.copyWith(color: AimColors.primary600),
    helperStyle: AimTextStyles.helper.copyWith(color: colors.textMuted),
    hintStyle: AimTextStyles.bodyMd.copyWith(color: colors.textMuted),
    errorStyle: AimTextStyles.helper.copyWith(color: AimColors.error600),
    border: normalBorder,
    enabledBorder: normalBorder,
    focusedBorder: const OutlineInputBorder(
      borderRadius: AimRadius.borderSm,
      borderSide: BorderSide(color: AimColors.primary500),
    ),
    errorBorder: const OutlineInputBorder(
      borderRadius: AimRadius.borderSm,
      borderSide: BorderSide(color: AimColors.error500),
    ),
    focusedErrorBorder: const OutlineInputBorder(
      borderRadius: AimRadius.borderSm,
      borderSide: BorderSide(color: AimColors.error500),
    ),
    disabledBorder: OutlineInputBorder(
      borderRadius: AimRadius.borderSm,
      borderSide: BorderSide(color: colors.disabledBorder),
    ),
  );
}

NavigationBarThemeData _navigationBarTheme(AimColorTheme colors) {
  return NavigationBarThemeData(
    height: AimSizes.bottomNavHeight,
    backgroundColor: colors.surface,
    surfaceTintColor: const Color(0x00000000),
    shadowColor: AimColors.neutral900.withValues(alpha: 0.14),
    indicatorColor: colors.primarySoft,
    iconTheme: WidgetStateProperty.resolveWith((states) {
      final color = states.contains(WidgetState.selected)
          ? AimColors.primary600
          : colors.textMuted;
      return IconThemeData(color: color, size: AimSizes.iconLg);
    }),
    labelTextStyle: WidgetStateProperty.resolveWith((states) {
      final color = states.contains(WidgetState.selected)
          ? AimColors.primary600
          : colors.textMuted;
      return AimTextStyles.caption.copyWith(
        color: color,
        fontWeight: AimFontWeights.semibold,
      );
    }),
  );
}

OutlinedButtonThemeData _outlinedButtonTheme(AimColorTheme colors) {
  return OutlinedButtonThemeData(
    style: ButtonStyle(
      minimumSize: const WidgetStatePropertyAll<Size>(
        Size(0, AimSizes.buttonMd),
      ),
      padding: const WidgetStatePropertyAll<EdgeInsetsGeometry>(
        EdgeInsets.symmetric(horizontal: AimSpacing.space20),
      ),
      textStyle: const WidgetStatePropertyAll<TextStyle>(AimTextStyles.button),
      shape: const WidgetStatePropertyAll<OutlinedBorder>(
        RoundedRectangleBorder(borderRadius: AimRadius.borderMd),
      ),
      side: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) {
          return BorderSide(color: colors.disabledBorder);
        }
        if (states.contains(WidgetState.hovered)) {
          return const BorderSide(color: AimColors.primary300);
        }
        return BorderSide(color: colors.borderStrong);
      }),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return colors.disabledFg;
        return AimColors.primary600;
      }),
      overlayColor: WidgetStatePropertyAll<Color>(colors.primarySoft),
    ),
  );
}

SnackBarThemeData _snackBarTheme(AimColorTheme colors) {
  return SnackBarThemeData(
    backgroundColor: colors.textPrimary,
    contentTextStyle: AimTextStyles.bodyMd.copyWith(color: colors.background),
    actionTextColor: AimColors.primary300,
    behavior: SnackBarBehavior.floating,
    shape: const RoundedRectangleBorder(borderRadius: AimRadius.borderMd),
  );
}

TextButtonThemeData _textButtonTheme(AimColorTheme colors) {
  return TextButtonThemeData(
    style: ButtonStyle(
      minimumSize: const WidgetStatePropertyAll<Size>(
        Size(0, AimSizes.buttonMd),
      ),
      padding: const WidgetStatePropertyAll<EdgeInsetsGeometry>(
        EdgeInsets.symmetric(horizontal: AimSpacing.space12),
      ),
      textStyle: const WidgetStatePropertyAll<TextStyle>(AimTextStyles.button),
      shape: const WidgetStatePropertyAll<OutlinedBorder>(
        RoundedRectangleBorder(borderRadius: AimRadius.borderMd),
      ),
      foregroundColor: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.disabled)) return colors.disabledFg;
        return AimColors.primary600;
      }),
      overlayColor: WidgetStatePropertyAll<Color>(colors.primarySoft),
    ),
  );
}
