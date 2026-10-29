// Display helpers for backend-supplied prices and dates.

import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';

import 'package:aim_mobile/l10n/app_localizations.dart';

String formatCurrencyAmount(BuildContext context, double amount, String currency) {
  final l10n = AppLocalizations.of(context);
  final locale = Localizations.localeOf(context).toLanguageTag();
  final number = NumberFormat.decimalPatternDigits(locale: locale, decimalDigits: amount % 1 == 0 ? 0 : 2)
      .format(amount);
  final symbol = switch (currency) {
    'YER' => l10n.billingCurrencyYer,
    'SAR' => l10n.billingCurrencySar,
    'USD' => l10n.billingCurrencyUsd,
    _ => currency,
  };
  return '$number $symbol';
}

String formatBillingDate(BuildContext context, DateTime date) {
  return DateFormat.yMMMd(Localizations.localeOf(context).toLanguageTag()).format(date);
}
