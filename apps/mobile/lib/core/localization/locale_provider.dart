import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app_locale.dart';

/// SharedPreferences key the active language code is persisted under.
const String _localePrefsKey = 'app_locale_language_code';

/// Reads the language code saved by a previous [LocaleNotifier.setLocale]
/// call, if any. Returns `null` when nothing has been saved yet (first
/// launch), in which case the app falls back to [AppLocale.english].
///
/// Called once during app startup (see `main.dart`) so the persisted
/// language can be supplied as the provider's initial state — this avoids a
/// visible flash of the wrong language while `SharedPreferences` loads.
Future<String?> loadSavedLocaleCode() async {
  final prefs = await SharedPreferences.getInstance();
  final code = prefs.getString(_localePrefsKey);
  return AppLocale.supportedLanguageCodes.contains(code) ? code : null;
}

/// [StateNotifier] that holds the active app [Locale] and persists every
/// change to [SharedPreferences], so the user's language choice survives
/// app restarts.
class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier(super.initialLocale);

  /// Switches the active app language and saves the choice so it is
  /// restored on the next app launch.
  Future<void> setLocale(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_localePrefsKey, locale.languageCode);
  }
}

/// Provides the currently active [Locale] for the app, persisted across
/// restarts via [SharedPreferences].
///
/// Defaults to [AppLocale.english] unless a previously-saved language code
/// was supplied as this provider's override (see `main.dart`, which loads it
/// with [loadSavedLocaleCode] before `runApp`). Change it to switch language
/// and text direction across the entire app:
///
/// ```dart
/// // Switch to Arabic (RTL) — persists the choice.
/// await ref.read(localeProvider.notifier).setLocale(const Locale(AppLocale.arabic));
///
/// // Switch back to English (LTR) — persists the choice.
/// await ref.read(localeProvider.notifier).setLocale(const Locale(AppLocale.english));
/// ```
///
/// [MaterialApp] reads this provider to set the app-level [Locale], which
/// drives [TextDirection] automatically — no [Directionality] wrappers needed
/// in feature code.
final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  return LocaleNotifier(const Locale(AppLocale.english));
});
