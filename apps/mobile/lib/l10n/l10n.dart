import 'package:flutter/widgets.dart';
import 'app_localizations.dart';

export 'app_localizations.dart';

/// Extension on [BuildContext] for safe, ergonomic localization lookup.
///
/// In production, returns the active locale's [AppLocalizations].
/// In test harnesses with bare [MaterialApp], gracefully falls back to [AppLocalizationsEn]
/// instead of throwing a null check exception.
extension AppLocalizationsX on BuildContext {
  AppLocalizations get l10n {
    return Localizations.of<AppLocalizations>(this, AppLocalizations) ??
        lookupAppLocalizations(const Locale('en'));
  }
}

/// Standalone helper for safe localization lookup.
AppLocalizations appL10n(BuildContext context) {
  return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
      lookupAppLocalizations(const Locale('en'));
}
