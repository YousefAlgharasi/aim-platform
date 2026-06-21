import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

/// Locale constants and app-level localization configuration.
///
/// AIM Mobile supports English (LTR) and Arabic (RTL). Direction is driven
/// entirely by the active [Locale] — never hard-coded in feature widgets.
///
/// Usage in [MaterialApp]:
/// ```dart
/// MaterialApp(
///   locale: ref.watch(localePr),
///   supportedLocales: AppLocale.supportedLocales,
///   localizationsDelegates: AppLocale.delegates,
/// )
/// ```
class AppLocale {
  const AppLocale._();

  static const String english = 'en';
  static const String arabic = 'ar';

  static const List<String> supportedLanguageCodes = <String>[
    english,
    arabic,
  ];

  /// [Locale] objects for [MaterialApp.supportedLocales].
  static const List<Locale> supportedLocales = <Locale>[
    Locale(english),
    Locale(arabic),
  ];

  /// Localization delegates that enable Material, Widgets, and Cupertino
  /// components to render correctly in all supported locales, including
  /// full RTL support for Arabic.
  static const List<LocalizationsDelegate<dynamic>> delegates =
      <LocalizationsDelegate<dynamic>>[
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
  ];

  /// Returns `true` when [locale] implies an RTL text direction.
  static bool isRtl(Locale locale) =>
      locale.languageCode == arabic;

  /// Returns the [TextDirection] for the given [locale].
  static TextDirection directionFor(Locale locale) =>
      isRtl(locale) ? TextDirection.rtl : TextDirection.ltr;
}
