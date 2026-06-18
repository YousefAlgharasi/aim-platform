import 'package:flutter/material.dart';

import '../design_tokens/design_tokens.dart';

@immutable
final class AimSurfaceTheme extends ThemeExtension<AimSurfaceTheme> {
  const AimSurfaceTheme({
    required this.background,
    required this.surface,
    required this.surfaceRaised,
    required this.surfaceSunken,
    required this.textPrimary,
    required this.textSecondary,
    required this.textMuted,
    required this.textOnPrimary,
    required this.textLink,
    required this.border,
    required this.borderStrong,
    required this.divider,
    required this.focusRing,
    required this.stateHover,
    required this.statePressed,
    required this.disabledBg,
    required this.disabledFg,
    required this.disabledBorder,
  });

  final Color background;
  final Color surface;
  final Color surfaceRaised;
  final Color surfaceSunken;
  final Color textPrimary;
  final Color textSecondary;
  final Color textMuted;
  final Color textOnPrimary;
  final Color textLink;
  final Color border;
  final Color borderStrong;
  final Color divider;
  final Color focusRing;
  final Color stateHover;
  final Color statePressed;
  final Color disabledBg;
  final Color disabledFg;
  final Color disabledBorder;

  factory AimSurfaceTheme.fromColors(AimColorTheme colors) {
    return AimSurfaceTheme(
      background: colors.background,
      surface: colors.surface,
      surfaceRaised: colors.surfaceRaised,
      surfaceSunken: colors.surfaceSunken,
      textPrimary: colors.textPrimary,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      textOnPrimary: colors.textOnPrimary,
      textLink: colors.textLink,
      border: colors.border,
      borderStrong: colors.borderStrong,
      divider: colors.divider,
      focusRing: colors.focusRing,
      stateHover: colors.stateHover,
      statePressed: colors.statePressed,
      disabledBg: colors.disabledBg,
      disabledFg: colors.disabledFg,
      disabledBorder: colors.disabledBorder,
    );
  }

  @override
  AimSurfaceTheme copyWith({
    Color? background,
    Color? surface,
    Color? surfaceRaised,
    Color? surfaceSunken,
    Color? textPrimary,
    Color? textSecondary,
    Color? textMuted,
    Color? textOnPrimary,
    Color? textLink,
    Color? border,
    Color? borderStrong,
    Color? divider,
    Color? focusRing,
    Color? stateHover,
    Color? statePressed,
    Color? disabledBg,
    Color? disabledFg,
    Color? disabledBorder,
  }) {
    return AimSurfaceTheme(
      background: background ?? this.background,
      surface: surface ?? this.surface,
      surfaceRaised: surfaceRaised ?? this.surfaceRaised,
      surfaceSunken: surfaceSunken ?? this.surfaceSunken,
      textPrimary: textPrimary ?? this.textPrimary,
      textSecondary: textSecondary ?? this.textSecondary,
      textMuted: textMuted ?? this.textMuted,
      textOnPrimary: textOnPrimary ?? this.textOnPrimary,
      textLink: textLink ?? this.textLink,
      border: border ?? this.border,
      borderStrong: borderStrong ?? this.borderStrong,
      divider: divider ?? this.divider,
      focusRing: focusRing ?? this.focusRing,
      stateHover: stateHover ?? this.stateHover,
      statePressed: statePressed ?? this.statePressed,
      disabledBg: disabledBg ?? this.disabledBg,
      disabledFg: disabledFg ?? this.disabledFg,
      disabledBorder: disabledBorder ?? this.disabledBorder,
    );
  }

  @override
  AimSurfaceTheme lerp(ThemeExtension<AimSurfaceTheme>? other, double t) {
    if (other is! AimSurfaceTheme) return this;

    return AimSurfaceTheme(
      background: Color.lerp(background, other.background, t)!,
      surface: Color.lerp(surface, other.surface, t)!,
      surfaceRaised: Color.lerp(surfaceRaised, other.surfaceRaised, t)!,
      surfaceSunken: Color.lerp(surfaceSunken, other.surfaceSunken, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      textOnPrimary: Color.lerp(textOnPrimary, other.textOnPrimary, t)!,
      textLink: Color.lerp(textLink, other.textLink, t)!,
      border: Color.lerp(border, other.border, t)!,
      borderStrong: Color.lerp(borderStrong, other.borderStrong, t)!,
      divider: Color.lerp(divider, other.divider, t)!,
      focusRing: Color.lerp(focusRing, other.focusRing, t)!,
      stateHover: Color.lerp(stateHover, other.stateHover, t)!,
      statePressed: Color.lerp(statePressed, other.statePressed, t)!,
      disabledBg: Color.lerp(disabledBg, other.disabledBg, t)!,
      disabledFg: Color.lerp(disabledFg, other.disabledFg, t)!,
      disabledBorder: Color.lerp(disabledBorder, other.disabledBorder, t)!,
    );
  }
}

@immutable
final class AimSoftFillTheme extends ThemeExtension<AimSoftFillTheme> {
  const AimSoftFillTheme({
    required this.primary,
    required this.onPrimary,
    required this.secondary,
    required this.onSecondary,
    required this.accent,
    required this.onAccent,
    required this.success,
    required this.onSuccess,
    required this.warning,
    required this.onWarning,
    required this.error,
    required this.onError,
    required this.info,
    required this.onInfo,
  });

  final Color primary;
  final Color onPrimary;
  final Color secondary;
  final Color onSecondary;
  final Color accent;
  final Color onAccent;
  final Color success;
  final Color onSuccess;
  final Color warning;
  final Color onWarning;
  final Color error;
  final Color onError;
  final Color info;
  final Color onInfo;

  factory AimSoftFillTheme.fromColors(AimColorTheme colors) {
    return AimSoftFillTheme(
      primary: colors.primarySoft,
      onPrimary: colors.primarySoftFg,
      secondary: colors.secondarySoft,
      onSecondary: colors.secondarySoftFg,
      accent: colors.accentSoft,
      onAccent: colors.accentSoftFg,
      success: colors.successSoft,
      onSuccess: colors.successSoftFg,
      warning: colors.warningSoft,
      onWarning: colors.warningSoftFg,
      error: colors.errorSoft,
      onError: colors.errorSoftFg,
      info: colors.infoSoft,
      onInfo: colors.infoSoftFg,
    );
  }

  @override
  AimSoftFillTheme copyWith({
    Color? primary,
    Color? onPrimary,
    Color? secondary,
    Color? onSecondary,
    Color? accent,
    Color? onAccent,
    Color? success,
    Color? onSuccess,
    Color? warning,
    Color? onWarning,
    Color? error,
    Color? onError,
    Color? info,
    Color? onInfo,
  }) {
    return AimSoftFillTheme(
      primary: primary ?? this.primary,
      onPrimary: onPrimary ?? this.onPrimary,
      secondary: secondary ?? this.secondary,
      onSecondary: onSecondary ?? this.onSecondary,
      accent: accent ?? this.accent,
      onAccent: onAccent ?? this.onAccent,
      success: success ?? this.success,
      onSuccess: onSuccess ?? this.onSuccess,
      warning: warning ?? this.warning,
      onWarning: onWarning ?? this.onWarning,
      error: error ?? this.error,
      onError: onError ?? this.onError,
      info: info ?? this.info,
      onInfo: onInfo ?? this.onInfo,
    );
  }

  @override
  AimSoftFillTheme lerp(ThemeExtension<AimSoftFillTheme>? other, double t) {
    if (other is! AimSoftFillTheme) return this;

    return AimSoftFillTheme(
      primary: Color.lerp(primary, other.primary, t)!,
      onPrimary: Color.lerp(onPrimary, other.onPrimary, t)!,
      secondary: Color.lerp(secondary, other.secondary, t)!,
      onSecondary: Color.lerp(onSecondary, other.onSecondary, t)!,
      accent: Color.lerp(accent, other.accent, t)!,
      onAccent: Color.lerp(onAccent, other.onAccent, t)!,
      success: Color.lerp(success, other.success, t)!,
      onSuccess: Color.lerp(onSuccess, other.onSuccess, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      onWarning: Color.lerp(onWarning, other.onWarning, t)!,
      error: Color.lerp(error, other.error, t)!,
      onError: Color.lerp(onError, other.onError, t)!,
      info: Color.lerp(info, other.info, t)!,
      onInfo: Color.lerp(onInfo, other.onInfo, t)!,
    );
  }
}

@immutable
final class AimGradientTheme extends ThemeExtension<AimGradientTheme> {
  const AimGradientTheme({
    required this.ai,
    required this.aiSoft,
    required this.growth,
  });

  final LinearGradient ai;
  final LinearGradient aiSoft;
  final LinearGradient growth;

  static const AimGradientTheme defaults = AimGradientTheme(
    ai: AimGradients.ai,
    aiSoft: AimGradients.aiSoft,
    growth: AimGradients.growth,
  );

  @override
  AimGradientTheme copyWith({
    LinearGradient? ai,
    LinearGradient? aiSoft,
    LinearGradient? growth,
  }) {
    return AimGradientTheme(
      ai: ai ?? this.ai,
      aiSoft: aiSoft ?? this.aiSoft,
      growth: growth ?? this.growth,
    );
  }

  @override
  AimGradientTheme lerp(ThemeExtension<AimGradientTheme>? other, double t) {
    if (other is! AimGradientTheme) return this;

    return AimGradientTheme(
      ai: LinearGradient.lerp(ai, other.ai, t) ?? ai,
      aiSoft: LinearGradient.lerp(aiSoft, other.aiSoft, t) ?? aiSoft,
      growth: LinearGradient.lerp(growth, other.growth, t) ?? growth,
    );
  }
}

@immutable
final class AimShadowTheme extends ThemeExtension<AimShadowTheme> {
  const AimShadowTheme({
    required this.none,
    required this.card,
    required this.cardHover,
    required this.dropdown,
    required this.modal,
    required this.sheet,
    required this.fab,
    required this.focus,
    required this.insetColor,
  });

  final List<BoxShadow> none;
  final List<BoxShadow> card;
  final List<BoxShadow> cardHover;
  final List<BoxShadow> dropdown;
  final List<BoxShadow> modal;
  final List<BoxShadow> sheet;
  final List<BoxShadow> fab;
  final List<BoxShadow> focus;
  final Color insetColor;

  static const AimShadowTheme defaults = AimShadowTheme(
    none: AimShadows.none,
    card: AimShadows.card,
    cardHover: AimShadows.cardHover,
    dropdown: AimShadows.dropdown,
    modal: AimShadows.modal,
    sheet: AimShadows.sheet,
    fab: AimShadows.fab,
    focus: AimShadows.focus,
    insetColor: AimShadows.insetColor,
  );

  @override
  AimShadowTheme copyWith({
    List<BoxShadow>? none,
    List<BoxShadow>? card,
    List<BoxShadow>? cardHover,
    List<BoxShadow>? dropdown,
    List<BoxShadow>? modal,
    List<BoxShadow>? sheet,
    List<BoxShadow>? fab,
    List<BoxShadow>? focus,
    Color? insetColor,
  }) {
    return AimShadowTheme(
      none: none ?? this.none,
      card: card ?? this.card,
      cardHover: cardHover ?? this.cardHover,
      dropdown: dropdown ?? this.dropdown,
      modal: modal ?? this.modal,
      sheet: sheet ?? this.sheet,
      fab: fab ?? this.fab,
      focus: focus ?? this.focus,
      insetColor: insetColor ?? this.insetColor,
    );
  }

  @override
  AimShadowTheme lerp(ThemeExtension<AimShadowTheme>? other, double t) {
    if (other is! AimShadowTheme) return this;

    return AimShadowTheme(
      none: BoxShadow.lerpList(none, other.none, t) ?? none,
      card: BoxShadow.lerpList(card, other.card, t) ?? card,
      cardHover: BoxShadow.lerpList(cardHover, other.cardHover, t) ?? cardHover,
      dropdown: BoxShadow.lerpList(dropdown, other.dropdown, t) ?? dropdown,
      modal: BoxShadow.lerpList(modal, other.modal, t) ?? modal,
      sheet: BoxShadow.lerpList(sheet, other.sheet, t) ?? sheet,
      fab: BoxShadow.lerpList(fab, other.fab, t) ?? fab,
      focus: BoxShadow.lerpList(focus, other.focus, t) ?? focus,
      insetColor: Color.lerp(insetColor, other.insetColor, t)!,
    );
  }
}

AimSurfaceTheme aimSurfacesOf(BuildContext context) {
  final theme = Theme.of(context);
  return theme.extension<AimSurfaceTheme>() ??
      AimSurfaceTheme.fromColors(_fallbackColorsFor(theme.brightness));
}

AimSoftFillTheme aimSoftFillsOf(BuildContext context) {
  final theme = Theme.of(context);
  return theme.extension<AimSoftFillTheme>() ??
      AimSoftFillTheme.fromColors(_fallbackColorsFor(theme.brightness));
}

AimGradientTheme aimGradientsOf(BuildContext context) {
  return Theme.of(context).extension<AimGradientTheme>() ??
      AimGradientTheme.defaults;
}

AimShadowTheme aimShadowsOf(BuildContext context) {
  return Theme.of(context).extension<AimShadowTheme>() ?? AimShadowTheme.defaults;
}

AimColorTheme _fallbackColorsFor(Brightness brightness) {
  return brightness == Brightness.dark
      ? AimColorTheme.dark
      : AimColorTheme.light;
}
