// CEFR code and localized name for the backend's placement level keys.

import 'package:aim_mobile/l10n/app_localizations.dart';

const Map<String, String> _cefrCodes = {
  'beginner': 'A1',
  'elementary': 'A2',
  'intermediate': 'B1',
  'upper_intermediate': 'B2',
  'advanced': 'C1',
};

/// CEFR code (A1…C1) for a backend level key; the key itself, upper-cased,
/// when it's already a code or unknown.
String placementCefrCode(String level) =>
    _cefrCodes[level] ?? level.toUpperCase();

String placementLevelName(AppLocalizations l10n, String level) {
  return switch (level) {
    'beginner' => l10n.placementLevelBeginner,
    'elementary' => l10n.placementLevelElementary,
    'intermediate' => l10n.placementLevelIntermediate,
    'upper_intermediate' => l10n.placementLevelUpperIntermediate,
    'advanced' => l10n.placementLevelAdvanced,
    _ => level,
  };
}
