import 'package:flutter/widgets.dart';

/// Picks the English or Arabic copy for the active app language.
///
/// Used by the screens that mirror the student web app's menu pages (Improve,
/// Practice, My words, My mistakes, and the certificate), whose copy is the
/// same text the web app shows in each language.
extension InlineTr on BuildContext {
  bool get isArabic => Localizations.localeOf(this).languageCode == 'ar';

  String tr(String en, String ar) => isArabic ? ar : en;
}

/// Replaces `{name}` placeholders in [template].
String fill(String template, Map<String, Object?> values) {
  var out = template;
  values.forEach((k, v) => out = out.replaceAll('{$k}', '$v'));
  return out;
}
