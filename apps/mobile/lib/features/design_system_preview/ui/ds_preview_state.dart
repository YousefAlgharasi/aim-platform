import 'package:flutter/material.dart';

/// Lightweight in-memory state for the design-system preview.
/// Drives the light/dark toggle and EN/AR toggle — completely
/// isolated from production state management.
class DSPreviewState extends ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.light;
  Locale _locale = const Locale('en');
  TextDirection _textDirection = TextDirection.ltr;

  ThemeMode get themeMode => _themeMode;
  Locale get locale => _locale;
  TextDirection get textDirection => _textDirection;
  bool get isDark => _themeMode == ThemeMode.dark;
  bool get isArabic => _locale.languageCode == 'ar';

  void toggleTheme() {
    _themeMode =
        _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  void toggleLocale() {
    if (_locale.languageCode == 'en') {
      _locale = const Locale('ar');
      _textDirection = TextDirection.rtl;
    } else {
      _locale = const Locale('en');
      _textDirection = TextDirection.ltr;
    }
    notifyListeners();
  }
}
