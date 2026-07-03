// Design ref: docs/design/ui-for-all-system-mobile/screenshots/light/19-screen.png,
//   .../20-screen.png (and their dark/ counterparts).
//
// Purely presentational lookups shared by placement_start_page.dart and
// placement_section_page.dart — skillCode is a real backend field; the
// icon/category-label/duration-estimate below are cosmetic-only and never
// sent to or read from the backend as scored data.
import 'package:flutter/material.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';

/// Icon shown in a section's avatar circle, keyed by `skillCode`.
IconData placementSkillIcon(String skillCode) {
  return switch (skillCode) {
    'vocabulary' => Icons.menu_book_outlined,
    'grammar' => Icons.rule_outlined,
    'reading' => Icons.chrome_reader_mode_outlined,
    'listening' => Icons.headphones_outlined,
    _ => Icons.quiz_outlined,
  };
}

/// Short category label shown alongside a section's question count, e.g.
/// "Lexis · 10 questions" for a `vocabulary` section.
String placementSkillCategoryLabel(AppLocalizations loc, String skillCode) {
  return switch (skillCode) {
    'vocabulary' => loc.placementCategoryLexis,
    'grammar' => loc.placementCategoryStructures,
    'reading' => loc.placementCategoryComprehension,
    'listening' => loc.placementCategoryAudio,
    _ => skillCode.isEmpty
        ? loc.placementCategoryGeneral
        : skillCode[0].toUpperCase() + skillCode.substring(1),
  };
}

/// Rough client-side pacing estimate (~36 seconds/question) shown as
/// "about N minutes" — a display-only estimate, never a scored or
/// backend-computed value.
int placementEstimatedMinutes(int totalQuestions) {
  final minutes = (totalQuestions * 36 / 60).round();
  return minutes < 1 ? 1 : minutes;
}
