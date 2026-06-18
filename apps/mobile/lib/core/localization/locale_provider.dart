import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_locale.dart';

/// Provides the currently active [Locale] for the app.
///
/// Defaults to [AppLocale.english]. Change it to switch language and text
/// direction across the entire app:
///
/// ```dart
/// // Switch to Arabic (RTL)
/// ref.read(localeProvider.notifier).state = const Locale(AppLocale.arabic);
///
/// // Switch back to English (LTR)
/// ref.read(localeProvider.notifier).state = const Locale(AppLocale.english);
/// ```
///
/// [MaterialApp] reads this provider to set the app-level [Locale], which
/// drives [TextDirection] automatically — no [Directionality] wrappers needed
/// in feature code.
final localeProvider = StateProvider<Locale>((ref) {
  return const Locale(AppLocale.english);
});
