// The Practice screen: plan banner + four skill tiles, in both themes, on
// small phones, in Arabic and with large text, with every entry working.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/practice_hub/ui/practice_hub_page.dart';
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';

Widget _app({
  required ThemeData theme,
  Locale locale = const Locale('en'),
  double textScale = 1.0,
  int mistakes = 2,
  int due = 3,
  List<String>? visited,
}) {
  Widget stub(String name) => Scaffold(body: Text('went to $name'));
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (_, __) => const PracticeHubPage()),
      for (final p in [
        AppRoutePaths.practiceSpeaking,
        AppRoutePaths.practiceWriting,
        AppRoutePaths.vocabularyLibrary,
        AppRoutePaths.mistakes,
        AppRoutePaths.vocabulary,
        AppRoutePaths.mainShell,
      ])
        GoRoute(
          path: p,
          builder: (_, state) {
            visited?.add(state.uri.toString());
            return stub(p);
          },
        ),
    ],
  );
  return ProviderScope(
    overrides: [
      vocabularyProvider.overrideWith(
        (ref) async => VocabularyList(words: const [], dueCount: due),
      ),
      mistakesProvider.overrideWith(
        (ref, skill) async => MistakeList(total: mistakes, items: const []),
      ),
    ],
    child: MaterialApp.router(
      routerConfig: router,
      theme: theme,
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(textScale)),
        child: child!,
      ),
    ),
  );
}

void main() {
  const sizes = {
    'small phone 320x568': Size(320, 568),
    'phone 360x740': Size(360, 740),
    'large phone 430x932': Size(430, 932),
  };

  for (final entry in sizes.entries) {
    for (final dark in [false, true]) {
      for (final loc in const [Locale('en'), Locale('ar')]) {
        testWidgets(
          'fits ${entry.key} (${dark ? 'dark' : 'light'}, ${loc.languageCode})',
          (tester) async {
            tester.view.physicalSize = entry.value;
            tester.view.devicePixelRatio = 1;
            addTearDown(tester.view.reset);

            await tester.pumpWidget(
              _app(theme: dark ? AppTheme.dark : AppTheme.light, locale: loc, textScale: 1.3),
            );
            await tester.pumpAndSettle();

            // On a short screen the last row is reached by scrolling.
            for (final icon in [
              Icons.mic_rounded,
              Icons.edit_rounded,
              Icons.headphones_rounded,
              Icons.menu_book_rounded,
            ]) {
              await tester.scrollUntilVisible(find.byIcon(icon), 100);
              expect(find.byIcon(icon), findsOneWidget);
            }
            expect(tester.takeException(), isNull);
          },
        );
      }
    }
  }

  testWidgets('the Review & Improve group is gone', (tester) async {
    tester.view.physicalSize = const Size(390, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(_app(theme: AppTheme.light));
    await tester.pumpAndSettle();

    expect(find.text('Remember and fix'), findsNothing);
    expect(find.text('My mistakes'), findsNothing);
    expect(find.text('Practice Skills'), findsOneWidget);
    expect(find.text('Your 5-minute plan'), findsOneWidget);
  });

  testWidgets('each skill and the plan button open the right place', (tester) async {
    tester.view.physicalSize = const Size(390, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    Future<void> tapAndCheck(Finder f, String expected) async {
      final visited = <String>[];
      await tester.pumpWidget(_app(theme: AppTheme.light, visited: visited));
      await tester.pumpAndSettle();
      await tester.tap(f);
      await tester.pumpAndSettle();
      expect(visited.single, expected);
    }

    await tapAndCheck(find.text('Speak'), AppRoutePaths.practiceSpeaking);
    await tapAndCheck(find.text('Write'), AppRoutePaths.practiceWriting);
    await tapAndCheck(find.text('Listen'), AppRoutePaths.vocabularyLibrary);
    await tapAndCheck(find.text('Start now'), '${AppRoutePaths.mistakes}?quick=1');
  });

  testWidgets('Read opens the Courses tab', (tester) async {
    tester.view.physicalSize = const Size(390, 1200);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);

    final visited = <String>[];
    await tester.pumpWidget(_app(theme: AppTheme.light, visited: visited));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Read'));
    await tester.pumpAndSettle();
    expect(visited.single, AppRoutePaths.mainShell);
    final container = ProviderScope.containerOf(tester.element(find.text('went to ${AppRoutePaths.mainShell}')));
    expect(container.read(mainShellTabIndexProvider), 1);
  });
}
