// Phase 6 — P6-079
// lesson_detail_page_test.dart — widget tests for LessonDetailPage.
//
// Covers (the page is a guided lesson player, one card at a time):
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Start screen: live AI lesson first, reading with a named character second.
//   4. Reading mode: hello → description → step → finish cards (voice practice entry point on the last one).
//   5. A lesson with no steps; the back/previous buttons; RTL layout.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson.dart';
import 'package:aim_mobile/features/lessons/logic/entity/lesson_detail.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lesson_detail_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lesson_detail_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/lesson_detail_page.dart';
import 'package:aim_mobile/features/lessons/ui/player/lesson_player.dart';
import 'package:aim_mobile/features/lessons/ui/widgets/lessons_widgets.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) =>
    ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        theme: AppTheme.light,
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _page = LessonDetailPage(
  lessonId: 'lesson-1',
  lessonTitle: 'Lesson 1: Introduction',
);

const _lesson = Lesson(
  id: 'lesson-1',
  chapterId: 'chapter-1',
  title: 'Lesson 1: Introduction',
  description: 'An introduction to basic grammar concepts.',
  status: 'published',
  sortOrder: 1, xpValue: 0,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
);

final _asset = LessonAssetModel.fromJson({
  'id': 'asset-1',
  'lessonId': 'lesson-1',
  'type': 'image',
  'title': 'Grammar Diagram',
  'description': 'Visual aid for grammar rules.',
  'url': 'https://cdn.example.com/diagram.png',
  'mimeType': 'image/png',
  'sizeBytes': null,
  'durationSeconds': null,
  'altText': 'Grammar diagram.',
  'thumbnailUrl': null,
  'order': 1,
  'status': 'published',
  'metadata': null,
  'createdAt': '2025-01-01T00:00:00Z',
  'updatedAt': '2025-06-01T00:00:00Z',
});

LessonDetail get _populated => LessonDetail(lesson: _lesson, assets: [_asset]);

const LessonDetail _empty = LessonDetail(lesson: _lesson, assets: []);

// ── Tests ─────────────────────────────────────────────────────────────────────

Future<void> _open(
  WidgetTester tester,
  AppAsyncState<LessonDetail> state, {
  TextDirection dir = TextDirection.ltr,
}) async {
  await tester.pumpWidget(_wrap(
    _page,
    overrides: [
      lessonDetailProvider.overrideWith((ref) => _FakeLessonDetailNotifier(state)),
    ],
    dir: dir,
  ));
  await tester.pump();
}

/// Moves the lesson player forward one card (bounded pumps: the card transition is animated and the image card
/// calls Image.network, so pumpAndSettle would never settle).
/// Opening a lesson shows the two ways to learn it; this chooses "read it with the character".
Future<void> _read(WidgetTester tester) async {
  await _next(tester, tester.widget<Text>(find.textContaining('Read it with')).data!);
}

Future<void> _next(WidgetTester tester, String label) async {
  await tester.tap(find.text(label));
  await tester.pump();
  await tester.pump(const Duration(milliseconds: 400));
}

void main() {
  group('LessonDetailPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await _open(tester, const AppAsyncState.loading());
      expect(find.byType(LessonDetailPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await _open(tester, const AppAsyncState.failure(message: 'Load failed'));
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('start screen: the live AI lesson first, reading with a named character second', (tester) async {
      await _open(tester, AppAsyncState.success(_populated));
      expect(find.byType(LessonPlayer), findsOneWidget);
      expect(find.text('Lesson 1: Introduction'), findsOneWidget);
      expect(find.text('Start the lesson with your AI teacher'), findsOneWidget);
      expect(find.text('Start live lesson'), findsOneWidget);
      expect(find.textContaining('Read it with'), findsOneWidget);
      // Nothing of the reading player is on screen yet.
      expect(find.text('Let’s go'), findsNothing);
    });

    testWidgets('reading mode: hello card, then description, step and finish cards', (tester) async {
      await _open(tester, AppAsyncState.success(_populated));
      await _read(tester);
      expect(find.textContaining('Hi, I’m '), findsOneWidget);
      expect(find.text('Lesson 1: Introduction'), findsOneWidget);
      expect(find.text('Grammar Diagram'), findsNothing);

      await _next(tester, 'Let’s go');
      expect(find.text('An introduction to basic grammar concepts.'), findsOneWidget);

      await _next(tester, 'Continue');
      expect(find.byType(LessonContentRenderer), findsOneWidget);
      expect(find.text('Grammar Diagram'), findsWidgets);

      await _next(tester, 'Continue');
      expect(find.text('Ready to practice?'), findsOneWidget);
      expect(find.text('Ask AI Tutor'), findsOneWidget);
      // Voice practice entry point (P21-017) is still reachable from the last card.
      expect(find.byIcon(Icons.mic_rounded), findsOneWidget);
    });

    testWidgets('a lesson with no steps goes straight from the description to the finish card', (tester) async {
      await _open(tester, const AppAsyncState.success(_empty));
      await _read(tester);
      await _next(tester, 'Let’s go');
      await _next(tester, 'Continue');
      expect(find.text('Ready to practice?'), findsOneWidget);
    });

    testWidgets('the back arrow on the hello card returns to the start screen', (tester) async {
      await _open(tester, AppAsyncState.success(_populated));
      await _read(tester);
      await tester.tap(find.byIcon(Icons.arrow_back_rounded).first);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('Start live lesson'), findsOneWidget);
    });

    testWidgets('the previous button goes back one card', (tester) async {
      await _open(tester, AppAsyncState.success(_populated));
      await _read(tester);
      await _next(tester, 'Let’s go');
      expect(find.text('An introduction to basic grammar concepts.'), findsOneWidget);
      await tester.tap(find.byIcon(Icons.arrow_back_rounded).last);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 400));
      expect(find.text('Let’s go'), findsOneWidget);
    });

    testWidgets('renders the start screen and every card under RTL directionality', (tester) async {
      await _open(tester, AppAsyncState.success(_populated), dir: TextDirection.rtl);
      expect(find.byType(LessonDetailPage), findsOneWidget);
      await _read(tester);
      await _next(tester, 'Let’s go');
      await _next(tester, 'Continue');
      expect(find.text('Grammar Diagram'), findsWidgets);
      await _next(tester, 'Continue');
      expect(find.text('Ready to practice?'), findsOneWidget);
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeLessonDetailNotifier extends LessonDetailNotifier {
  _FakeLessonDetailNotifier(AppAsyncState<LessonDetail> initialState)
      : super(repository: _FakeLessonDetailRepository()) {
    state = initialState;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String lessonId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String lessonId,
  }) async {}
}

class _FakeLessonDetailRepository implements LessonDetailRepository {
  @override
  Future<LessonDetail> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async =>
      _empty;
}
