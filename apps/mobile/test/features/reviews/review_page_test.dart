// The Review screens show only the reviews that are due now for weak skills
// (the backend decides which), and each one opens the practice for its skill.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/routing/app_route_paths.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/learner_tools/data/learner_tools_api.dart';
import 'package:aim_mobile/features/progress/ui/pages/review_schedule_page.dart';
import 'package:aim_mobile/features/reviews/ui/pages/review_page.dart';
import 'package:aim_mobile/features/shell/logic/main_shell_tab_provider.dart';

const _withLesson = DueReview(
  scheduleId: 's1',
  skillId: 'en.a1.gra.possessive_adj',
  skillTitle: 'Possessive Adjectives',
  dueAt: '2026-11-01T09:00:00.000Z',
  severity: 'critical',
  masteryScore: 0.3,
  lessonId: 'lesson-1',
  lessonTitle: 'My Family',
);

const _noLesson = DueReview(
  scheduleId: 's2',
  skillId: 'en.a1.gra.articles',
  skillTitle: 'Articles',
  dueAt: '2026-11-02T09:00:00.000Z',
);

Widget _app(
  Widget home, {
  required Future<List<DueReview>> Function() due,
  Locale locale = const Locale('en'),
  ThemeData? theme,
  List<String>? visited,
}) {
  final router = GoRouter(
    routes: [
      GoRoute(path: '/', builder: (_, __) => home),
      GoRoute(
        path: AppRoutePaths.practiceSession,
        builder: (_, state) {
          visited?.add('practice:${(state.extra as Map)['lessonId']}');
          return const Scaffold(body: Text('practice screen'));
        },
      ),
      GoRoute(
        path: AppRoutePaths.mainShell,
        builder: (_, __) {
          visited?.add('courses');
          return const Scaffold(body: Text('courses screen'));
        },
      ),
    ],
  );
  return ProviderScope(
    overrides: [
      dueReviewsProvider.overrideWith((ref) => due()),
      skillTitlesProvider.overrideWith((ref) async => const <String, String>{}),
    ],
    child: MaterialApp.router(
      routerConfig: router,
      theme: theme ?? AppTheme.light,
      locale: locale,
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
    ),
  );
}

void main() {
  for (final entry in {
    'ReviewPage': const ReviewPage(),
    'ReviewSchedulePage': const ReviewSchedulePage(),
  }.entries) {
    group(entry.key, () {
      testWidgets('shows the loading state while the request runs', (tester) async {
        await tester.pumpWidget(_app(entry.value, due: () async {
          await Future<void>.delayed(const Duration(seconds: 1));
          return const [];
        }));
        await tester.pump();
        expect(find.byType(AIMFullScreenLoading), findsOneWidget);
        await tester.pump(const Duration(seconds: 2));
      });

      testWidgets('a failed request shows an error with retry', (tester) async {
        await tester.pumpWidget(_app(entry.value, due: () async => throw Exception('down')));
        await tester.pumpAndSettle();
        expect(find.byType(AIMFullScreenError), findsOneWidget);
        expect(find.text('Could not load your reviews.'), findsOneWidget);
      });

      testWidgets('nothing due is a calm empty state', (tester) async {
        await tester.pumpWidget(_app(entry.value, due: () async => const []));
        await tester.pumpAndSettle();
        expect(find.text('No reviews due'), findsOneWidget);
      });

      testWidgets('lists the due weak skills by their real names', (tester) async {
        await tester.pumpWidget(_app(entry.value, due: () async => [_withLesson, _noLesson]));
        await tester.pumpAndSettle();
        expect(find.text('Possessive Adjectives'), findsOneWidget);
        expect(find.text('Articles'), findsOneWidget);
        expect(find.text('Needs focus'), findsOneWidget);
        expect(find.textContaining('Due 2026-11-01'), findsOneWidget);
      });

      testWidgets('works in dark mode, Arabic and on a small phone', (tester) async {
        tester.view.physicalSize = const Size(320, 700);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);

        await tester.pumpWidget(_app(
          entry.value,
          due: () async => [_withLesson, _noLesson],
          theme: AppTheme.dark,
          locale: const Locale('ar'),
        ));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      });
    });
  }

  testWidgets('tapping a review opens the practice for its lesson', (tester) async {
    final visited = <String>[];
    await tester.pumpWidget(_app(
      const ReviewPage(),
      due: () async => [_withLesson],
      visited: visited,
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Possessive Adjectives'));
    await tester.pumpAndSettle();

    expect(visited, ['practice:lesson-1']);
  });

  testWidgets('a review with no lesson yet opens Courses', (tester) async {
    final visited = <String>[];
    await tester.pumpWidget(_app(
      const ReviewPage(),
      due: () async => [_noLesson],
      visited: visited,
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Articles'));
    await tester.pumpAndSettle();

    expect(visited, ['courses']);
    final container = ProviderScope.containerOf(tester.element(find.text('courses screen')));
    expect(container.read(mainShellTabIndexProvider), 1);
  });
}
