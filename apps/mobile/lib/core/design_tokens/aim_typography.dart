import 'package:flutter/material.dart';

final class AimFontFamilies {
  const AimFontFamilies._();

  static const String english = 'Inter';
  static const String arabic = 'IBM Plex Sans Arabic';
  static const String arabicFallback = 'Noto Sans Arabic';
  static const String mono = 'monospace';

  // CSS --font-sans changes under [dir="rtl"]; Flutter should select the
  // Arabic family through locale, Directionality, or explicit text styles.
  static const String sansDefault = english;
  static const String sansRtl = arabic;
}

final class AimFontAssets {
  const AimFontAssets._();

  static const String interRegular = 'assets/fonts/inter/Inter-Regular.ttf';
  static const String interMedium = 'assets/fonts/inter/Inter-Medium.ttf';
  static const String interSemiBold = 'assets/fonts/inter/Inter-SemiBold.ttf';
  static const String interBold = 'assets/fonts/inter/Inter-Bold.ttf';
  static const String interExtraBold = 'assets/fonts/inter/Inter-ExtraBold.ttf';

  static const String ibmPlexSansArabicRegular =
      'assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Regular.ttf';
  static const String ibmPlexSansArabicMedium =
      'assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Medium.ttf';
  static const String ibmPlexSansArabicSemiBold =
      'assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-SemiBold.ttf';
  static const String ibmPlexSansArabicBold =
      'assets/fonts/ibm_plex_sans_arabic/IBMPlexSansArabic-Bold.ttf';
}

final class AimFontWeights {
  const AimFontWeights._();

  static const FontWeight regular = FontWeight.w400;
  static const FontWeight medium = FontWeight.w500;
  static const FontWeight semibold = FontWeight.w600;
  static const FontWeight bold = FontWeight.w700;
  static const FontWeight extrabold = FontWeight.w800;
}

final class AimTypography {
  const AimTypography._();

  static const double displaySize = 34;
  static const double displayLine = 40;
  static const FontWeight displayWeight = AimFontWeights.extrabold;
  static const double displayTracking = -0.68;

  static const double h1Size = 28;
  static const double h1Line = 34;
  static const FontWeight h1Weight = AimFontWeights.bold;
  static const double h1Tracking = -0.28;

  static const double h2Size = 23;
  static const double h2Line = 30;
  static const FontWeight h2Weight = AimFontWeights.bold;
  static const double h2Tracking = -0.23;

  static const double h3Size = 19;
  static const double h3Line = 26;
  static const FontWeight h3Weight = AimFontWeights.semibold;
  static const double h3Tracking = 0;

  static const double titleSize = 17;
  static const double titleLine = 24;
  static const FontWeight titleWeight = AimFontWeights.semibold;
  static const double titleTracking = 0;

  static const double bodyLgSize = 17;
  static const double bodyLgLine = 26;
  static const FontWeight bodyLgWeight = AimFontWeights.regular;
  static const double bodyLgTracking = 0;

  static const double bodyMdSize = 16;
  static const double bodyMdLine = 24;
  static const FontWeight bodyMdWeight = AimFontWeights.regular;
  static const double bodyMdTracking = 0;

  static const double bodySmSize = 14;
  static const double bodySmLine = 21;
  static const FontWeight bodySmWeight = AimFontWeights.regular;
  static const double bodySmTracking = 0;

  static const double captionSize = 12;
  static const double captionLine = 16;
  static const FontWeight captionWeight = AimFontWeights.medium;
  static const double captionTracking = 0.12;

  static const double buttonSize = 15;
  static const double buttonLine = 20;
  static const FontWeight buttonWeight = AimFontWeights.semibold;
  static const double buttonTracking = 0.15;

  static const double labelSize = 13;
  static const double labelLine = 18;
  static const FontWeight labelWeight = AimFontWeights.semibold;
  static const double labelTracking = 0.13;

  static const double helperSize = 12;
  static const double helperLine = 16;
  static const FontWeight helperWeight = AimFontWeights.regular;
  static const double helperTracking = 0;

  static const double arabicLineScale = 1.18;
}

final class AimTextStyles {
  const AimTextStyles._();

  static const List<String> englishFallbacks = <String>[
    AimFontFamilies.arabic,
    AimFontFamilies.arabicFallback,
  ];

  static const List<String> arabicFallbacks = <String>[
    AimFontFamilies.arabicFallback,
  ];

  static const TextStyle display = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.displaySize,
    height: AimTypography.displayLine / AimTypography.displaySize,
    fontWeight: AimTypography.displayWeight,
    letterSpacing: AimTypography.displayTracking,
  );

  static const TextStyle h1 = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.h1Size,
    height: AimTypography.h1Line / AimTypography.h1Size,
    fontWeight: AimTypography.h1Weight,
    letterSpacing: AimTypography.h1Tracking,
  );

  static const TextStyle h2 = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.h2Size,
    height: AimTypography.h2Line / AimTypography.h2Size,
    fontWeight: AimTypography.h2Weight,
    letterSpacing: AimTypography.h2Tracking,
  );

  static const TextStyle h3 = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.h3Size,
    height: AimTypography.h3Line / AimTypography.h3Size,
    fontWeight: AimTypography.h3Weight,
    letterSpacing: AimTypography.h3Tracking,
  );

  static const TextStyle title = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.titleSize,
    height: AimTypography.titleLine / AimTypography.titleSize,
    fontWeight: AimTypography.titleWeight,
    letterSpacing: AimTypography.titleTracking,
  );

  static const TextStyle bodyLg = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.bodyLgSize,
    height: AimTypography.bodyLgLine / AimTypography.bodyLgSize,
    fontWeight: AimTypography.bodyLgWeight,
    letterSpacing: AimTypography.bodyLgTracking,
  );

  static const TextStyle bodyMd = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.bodyMdSize,
    height: AimTypography.bodyMdLine / AimTypography.bodyMdSize,
    fontWeight: AimTypography.bodyMdWeight,
    letterSpacing: AimTypography.bodyMdTracking,
  );

  static const TextStyle bodySm = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.bodySmSize,
    height: AimTypography.bodySmLine / AimTypography.bodySmSize,
    fontWeight: AimTypography.bodySmWeight,
    letterSpacing: AimTypography.bodySmTracking,
  );

  static const TextStyle caption = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.captionSize,
    height: AimTypography.captionLine / AimTypography.captionSize,
    fontWeight: AimTypography.captionWeight,
    letterSpacing: AimTypography.captionTracking,
  );

  static const TextStyle button = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.buttonSize,
    height: AimTypography.buttonLine / AimTypography.buttonSize,
    fontWeight: AimTypography.buttonWeight,
    letterSpacing: AimTypography.buttonTracking,
  );

  static const TextStyle label = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.labelSize,
    height: AimTypography.labelLine / AimTypography.labelSize,
    fontWeight: AimTypography.labelWeight,
    letterSpacing: AimTypography.labelTracking,
  );

  static const TextStyle helper = TextStyle(
    fontFamily: AimFontFamilies.english,
    fontFamilyFallback: englishFallbacks,
    fontSize: AimTypography.helperSize,
    height: AimTypography.helperLine / AimTypography.helperSize,
    fontWeight: AimTypography.helperWeight,
    letterSpacing: AimTypography.helperTracking,
  );

  static const TextStyle arabicH1 = TextStyle(
    fontFamily: AimFontFamilies.arabic,
    fontFamilyFallback: arabicFallbacks,
    fontSize: AimTypography.h1Size,
    height: (AimTypography.h1Line * AimTypography.arabicLineScale) /
        AimTypography.h1Size,
    fontWeight: AimTypography.h1Weight,
    letterSpacing: 0,
  );

  static const TextStyle arabicH3 = TextStyle(
    fontFamily: AimFontFamilies.arabic,
    fontFamilyFallback: arabicFallbacks,
    fontSize: AimTypography.h3Size,
    height: (AimTypography.h3Line * AimTypography.arabicLineScale) /
        AimTypography.h3Size,
    fontWeight: AimTypography.h3Weight,
    letterSpacing: 0,
  );

  static const TextStyle arabicBodyMd = TextStyle(
    fontFamily: AimFontFamilies.arabic,
    fontFamilyFallback: arabicFallbacks,
    fontSize: AimTypography.bodyMdSize,
    height: (AimTypography.bodyMdLine * AimTypography.arabicLineScale) /
        AimTypography.bodyMdSize,
    fontWeight: AimTypography.bodyMdWeight,
    letterSpacing: 0,
  );

  static const TextStyle arabicBodySm = TextStyle(
    fontFamily: AimFontFamilies.arabic,
    fontFamilyFallback: arabicFallbacks,
    fontSize: AimTypography.bodySmSize,
    height: (AimTypography.bodySmLine * AimTypography.arabicLineScale) /
        AimTypography.bodySmSize,
    fontWeight: AimTypography.bodySmWeight,
    letterSpacing: 0,
  );
}
