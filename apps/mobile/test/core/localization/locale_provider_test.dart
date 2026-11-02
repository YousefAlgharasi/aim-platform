import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/localization/locale_provider.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test('defaults to English when nothing has been saved yet', () async {
    expect(await loadSavedLocaleCode(), isNull);

    final container = ProviderContainer();
    addTearDown(container.dispose);
    expect(
      container.read(localeProvider).languageCode,
      AppLocale.english,
    );
  });

  test('setLocale updates state and persists the choice', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);

    await container
        .read(localeProvider.notifier)
        .setLocale(const Locale(AppLocale.arabic));

    expect(container.read(localeProvider).languageCode, AppLocale.arabic);
    expect(await loadSavedLocaleCode(), AppLocale.arabic);
  });

  test('loadSavedLocaleCode restores a previously-saved language on the '
      'next app launch', () async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_locale_language_code', AppLocale.arabic);

    expect(await loadSavedLocaleCode(), AppLocale.arabic);
  });

  test('loadSavedLocaleCode ignores an unsupported stored value', () async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('app_locale_language_code', 'fr');

    expect(await loadSavedLocaleCode(), isNull);
  });
}
