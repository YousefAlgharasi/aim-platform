import 'dart:ui';

final class AimColors {
  const AimColors._();

  static const Color primary50 = Color(0xFFEDF1FF);
  static const Color primary100 = Color(0xFFDCE4FF);
  static const Color primary200 = Color(0xFFBBC9FF);
  static const Color primary300 = Color(0xFF93A6FF);
  static const Color primary400 = Color(0xFF6B82FB);
  static const Color primary500 = Color(0xFF4762EE);
  static const Color primary600 = Color(0xFF3349D6);
  static const Color primary700 = Color(0xFF2837AC);
  static const Color primary800 = Color(0xFF243189);
  static const Color primary900 = Color(0xFF1F2A6E);

  static const Color secondary50 = Color(0xFFF5F1FE);
  static const Color secondary100 = Color(0xFFEBE3FD);
  static const Color secondary200 = Color(0xFFD7C8FB);
  static const Color secondary300 = Color(0xFFBBA1F6);
  static const Color secondary400 = Color(0xFF9E78EF);
  static const Color secondary500 = Color(0xFF8455E4);
  static const Color secondary600 = Color(0xFF6F3FD0);
  static const Color secondary700 = Color(0xFF5C32AE);
  static const Color secondary800 = Color(0xFF4C2C8C);
  static const Color secondary900 = Color(0xFF3F2772);

  static const Color accent50 = Color(0xFFECFBF8);
  static const Color accent100 = Color(0xFFD2F5EE);
  static const Color accent200 = Color(0xFFA7EBDF);
  static const Color accent300 = Color(0xFF6FDAC9);
  static const Color accent400 = Color(0xFF38C2AF);
  static const Color accent500 = Color(0xFF15A898);
  static const Color accent600 = Color(0xFF0C897C);
  static const Color accent700 = Color(0xFF0E6D64);
  static const Color accent800 = Color(0xFF105751);
  static const Color accent900 = Color(0xFF114945);

  static const Color neutral0 = Color(0xFFFFFFFF);
  static const Color neutral50 = Color(0xFFF7F8FA);
  static const Color neutral100 = Color(0xFFEEF0F4);
  static const Color neutral200 = Color(0xFFE2E5EC);
  static const Color neutral300 = Color(0xFFCDD2DD);
  static const Color neutral400 = Color(0xFFA6AEBF);
  static const Color neutral500 = Color(0xFF7A8499);
  static const Color neutral600 = Color(0xFF5A6377);
  static const Color neutral700 = Color(0xFF424A5C);
  static const Color neutral800 = Color(0xFF2B3140);
  static const Color neutral900 = Color(0xFF181C26);

  static const Color success50 = Color(0xFFE7F7EF);
  static const Color success100 = Color(0xFFC6ECD9);
  static const Color success500 = Color(0xFF1FA971);
  static const Color success600 = Color(0xFF168A5C);
  static const Color success700 = Color(0xFF126E4A);

  static const Color warning50 = Color(0xFFFEF4E2);
  static const Color warning100 = Color(0xFFFCE6BC);
  static const Color warning500 = Color(0xFFF5A524);
  static const Color warning600 = Color(0xFFD8871A);
  static const Color warning700 = Color(0xFFA96512);

  static const Color error50 = Color(0xFFFDECEC);
  static const Color error100 = Color(0xFFFAC9CB);
  static const Color error500 = Color(0xFFE5484D);
  static const Color error600 = Color(0xFFC7363B);
  static const Color error700 = Color(0xFF9E282D);

  static const Color info50 = Color(0xFFE8F2FC);
  static const Color info100 = Color(0xFFC7DFF8);
  static const Color info500 = Color(0xFF3A8DDE);
  static const Color info600 = Color(0xFF2A72BC);
  static const Color info700 = Color(0xFF205893);

  // Gen Z accent colors — see docs/design/ui-for-all-system-mobile/README.md.
  static const Color gzPurple = Color(0xFF6C63FF);
  static const Color gzLime = Color(0xFFC8FF3D);
  static const Color gzCoral = Color(0xFFFF6B8A);
  static const Color gzSky = Color(0xFF5AC8FA);
}

final class AimColorTheme {
  const AimColorTheme({
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
    required this.primarySoft,
    required this.primarySoftFg,
    required this.secondarySoft,
    required this.secondarySoftFg,
    required this.accentSoft,
    required this.accentSoftFg,
    required this.successSoft,
    required this.successSoftFg,
    required this.warningSoft,
    required this.warningSoftFg,
    required this.errorSoft,
    required this.errorSoftFg,
    required this.infoSoft,
    required this.infoSoftFg,
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
  final Color primarySoft;
  final Color primarySoftFg;
  final Color secondarySoft;
  final Color secondarySoftFg;
  final Color accentSoft;
  final Color accentSoftFg;
  final Color successSoft;
  final Color successSoftFg;
  final Color warningSoft;
  final Color warningSoftFg;
  final Color errorSoft;
  final Color errorSoftFg;
  final Color infoSoft;
  final Color infoSoftFg;
  final Color stateHover;
  final Color statePressed;
  final Color disabledBg;
  final Color disabledFg;
  final Color disabledBorder;

  static const AimColorTheme light = AimColorTheme(
    background: AimColors.neutral50,
    surface: AimColors.neutral0,
    surfaceRaised: AimColors.neutral0,
    surfaceSunken: AimColors.neutral100,
    textPrimary: AimColors.neutral900,
    textSecondary: AimColors.neutral600,
    textMuted: AimColors.neutral500,
    textOnPrimary: AimColors.neutral0,
    textLink: AimColors.primary600,
    border: AimColors.neutral200,
    borderStrong: AimColors.neutral300,
    divider: AimColors.neutral100,
    focusRing: AimColors.primary400,
    primarySoft: AimColors.primary50,
    primarySoftFg: AimColors.primary700,
    secondarySoft: AimColors.secondary50,
    secondarySoftFg: AimColors.secondary700,
    accentSoft: AimColors.accent50,
    accentSoftFg: AimColors.accent700,
    successSoft: AimColors.success50,
    successSoftFg: AimColors.success700,
    warningSoft: AimColors.warning50,
    warningSoftFg: AimColors.warning700,
    errorSoft: AimColors.error50,
    errorSoftFg: AimColors.error700,
    infoSoft: AimColors.info50,
    infoSoftFg: AimColors.info700,
    stateHover: Color(0x0F181C26),
    statePressed: Color(0x1F181C26),
    disabledBg: AimColors.neutral100,
    disabledFg: AimColors.neutral400,
    disabledBorder: AimColors.neutral200,
  );

  static const AimColorTheme dark = AimColorTheme(
    background: Color(0xFF0E1118),
    surface: Color(0xFF181C26),
    surfaceRaised: Color(0xFF202533),
    surfaceSunken: Color(0xFF11141C),
    textPrimary: Color(0xFFF2F4F8),
    textSecondary: AimColors.neutral400,
    textMuted: AimColors.neutral500,
    textOnPrimary: AimColors.neutral0,
    textLink: AimColors.primary300,
    border: AimColors.neutral800,
    borderStrong: Color(0xFF3A4253),
    divider: Color(0xFF232838),
    focusRing: AimColors.primary400,
    primarySoft: Color(0xFF222B52),
    primarySoftFg: AimColors.primary200,
    secondarySoft: Color(0xFF302950),
    secondarySoftFg: AimColors.secondary200,
    accentSoft: Color(0xFF173B3F),
    accentSoftFg: AimColors.accent200,
    successSoft: Color(0xFF1A3B37),
    successSoftFg: Color(0xFF7FE0B4),
    warningSoft: Color(0xFF493A26),
    warningSoftFg: Color(0xFFFBD089),
    errorSoft: Color(0xFF45262F),
    errorSoftFg: Color(0xFFF2A6A8),
    infoSoft: Color(0xFF1F354E),
    infoSoftFg: Color(0xFFA8CCF0),
    stateHover: Color(0x14FFFFFF),
    statePressed: Color(0x24FFFFFF),
    disabledBg: Color(0xFF202533),
    disabledFg: AimColors.neutral600,
    disabledBorder: AimColors.neutral800,
  );
}
