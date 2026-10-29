import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/locale_provider.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/theme/theme_mode_provider.dart';
import 'package:aim_mobile/features/profile/ui/pages/account_settings_page.dart';
import 'package:aim_mobile/l10n/app_localizations.dart';

Widget _wrap({Locale locale = const Locale('en')}) {
  return ProviderScope(
    overrides: [localeProvider.overrideWith((ref) => locale)],
    child: MaterialApp(
      theme: AppTheme.light,
      locale: locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      home: const AccountSettingsPage(),
    ),
  );
}

void _phone(WidgetTester tester) {
  tester.view.physicalSize = const Size(360 * 3, 780 * 3);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
}

void main() {
  testWidgets('shows only real settings', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap());
    await tester.pump();

    expect(find.text('Full Name'), findsOneWidget);
    expect(find.text('Daily goal'), findsOneWidget);
    expect(find.text('Theme'), findsOneWidget);
    expect(find.text('العربية'), findsOneWidget);

    await tester.scrollUntilVisible(find.text('Sign Out'), 200,
        scrollable: find.byType(Scrollable).first);
    expect(find.text('Study reminders'), findsOneWidget);

    // Removed fake controls.
    expect(find.text('Current Password'), findsNothing);
    expect(find.byType(Switch), findsNothing);
    expect(tester.takeException(), isNull);
  });

  testWidgets('renders in Arabic without overflow', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap(locale: const Locale('ar')));
    await tester.pump();
    expect(find.text('الإعدادات'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('تذكيرات الدراسة'), 200,
        scrollable: find.byType(Scrollable).first);
    expect(tester.takeException(), isNull);
  });

  testWidgets('switching theme segment updates the theme', (tester) async {
    _phone(tester);
    await tester.pumpWidget(_wrap());
    await tester.pump();
    await tester.tap(find.text('Dark'));
    await tester.pumpAndSettle();
    final container = ProviderScope.containerOf(
        tester.element(find.byType(AccountSettingsPage)));
    expect(container.read(themeModeProvider), ThemeMode.dark);
  });
}
