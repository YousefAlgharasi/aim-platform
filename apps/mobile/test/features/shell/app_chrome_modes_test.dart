import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/app_locale.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/shell/ui/widgets/app_chrome.dart';

Widget _frame(String location, Widget page, {Locale locale = const Locale('en')}) {
  return ProviderScope(
    child: MaterialApp(
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      home: AppChrome(location: location, child: page),
    ),
  );
}

Future<void> _settle(WidgetTester tester) async {
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 100));
}

void main() {
  test('chromeModeFor sorts locations into main, menu and detail screens', () {
    expect(chromeModeFor('/main'), ChromeBarMode.root);
    expect(chromeModeFor('/main/home'), ChromeBarMode.root);
    expect(chromeModeFor('/improve'), ChromeBarMode.root);
    expect(chromeModeFor('/practice'), ChromeBarMode.root);

    expect(chromeModeFor('/achievements'), ChromeBarMode.section);
    expect(chromeModeFor('/student/assessments'), ChromeBarMode.section);
    expect(chromeModeFor('/support/help'), ChromeBarMode.section);
    expect(chromeModeFor('/profile/settings'), ChromeBarMode.section);

    expect(chromeModeFor('/certificates/detail'), ChromeBarMode.detail);
    expect(chromeModeFor('/practice/speaking'), ChromeBarMode.detail);
    expect(chromeModeFor('/support/tickets/detail'), ChromeBarMode.detail);
    expect(chromeModeFor('/leaderboard'), ChromeBarMode.detail);
  });

  testWidgets('menu screen: ONE bar with back + title + bell, tab bar stays',
      (tester) async {
    await tester.pumpWidget(_frame(
      '/achievements',
      const Scaffold(appBar: AIMTopAppBar(title: 'Achievements')),
    ));
    await _settle(tester);

    // The title appears once (in the frame's bar), not twice.
    expect(find.text('Achievements'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    expect(find.byIcon(Icons.notifications_none_rounded), findsOneWidget);
    expect(find.text('AIM'), findsNothing);
    expect(find.text('Menu'), findsOneWidget); // bottom tab bar
  });

  testWidgets('detail screen: back + title only, no bell and no tab bar',
      (tester) async {
    await tester.pumpWidget(_frame(
      '/certificates/detail',
      const Scaffold(appBar: AIMTopAppBar(title: 'Certificate')),
    ));
    await _settle(tester);

    expect(find.text('Certificate'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_back_rounded), findsOneWidget);
    expect(find.byIcon(Icons.notifications_none_rounded), findsNothing);
    expect(find.text('Menu'), findsNothing);
  });

  testWidgets('main screen: AIM bar, and the page draws its own heading',
      (tester) async {
    await tester.pumpWidget(_frame(
      '/improve',
      Scaffold(body: ListView(children: const [PageTitleBar(title: 'Improve')])),
    ));
    await _settle(tester);

    expect(find.text('AIM'), findsOneWidget);
    expect(find.text('Improve'), findsWidgets); // heading + tab label
    expect(find.byIcon(Icons.arrow_back_rounded), findsNothing);
    expect(find.byIcon(Icons.notifications_none_rounded), findsOneWidget);
  });

  testWidgets('a page action goes to the bar (e.g. Preferences)', (tester) async {
    await tester.pumpWidget(_frame(
      '/notifications/inbox',
      Scaffold(
        body: ListView(
          children: const [
            PageTitleBar(title: 'Notifications', action: Text('Preferences')),
          ],
        ),
      ),
    ));
    await _settle(tester);

    expect(find.text('Notifications'), findsOneWidget);
    expect(find.text('Preferences'), findsOneWidget);
  });

  testWidgets('menu screen mirrors in Arabic without overflow', (tester) async {
    await tester.pumpWidget(_frame(
      '/achievements',
      const Scaffold(appBar: AIMTopAppBar(title: 'الإنجازات')),
      locale: const Locale('ar'),
    ));
    await _settle(tester);

    expect(find.text('الإنجازات'), findsOneWidget);
    expect(find.byIcon(Icons.arrow_forward_rounded), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
