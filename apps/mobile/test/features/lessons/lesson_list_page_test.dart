// Phase 6 — P6-075
// lesson_list_page_test.dart — widget tests for LessonListPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated state renders lesson titles.
//   5. RTL layout renders without error.
//   6. chapterTitle appears in AppBar.
//   7. xpValue > 0 renders an XP badge; xpValue == 0 renders no badge
//      (real-data-only redesign — no fabricated type/duration/completion).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_list_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/lesson_list_page.dart';

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
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _page = LessonListPage(
  chapterId: 'chapter-1',
  chapterTitle: 'Unit 1: Basics',
);

const _lessons = [
  LessonModel(
    id: 'lesson-1',
    chapterId: 'chapter-1',
    title: 'Lesson 1: Introduction',
    description: 'Basic grammar overview.',
    status: 'published',
    sortOrder: 1, xpValue: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  ),
  LessonModel(
    id: 'lesson-2',
    chapterId: 'chapter-1',
    title: 'Lesson 2: Nouns',
    description: 'Understanding nouns.',
    status: 'published',
    sortOrder: 2, xpValue: 20,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-06-02T00:00:00Z',
  ),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('LessonListPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) => _FakeLessonsListNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(LessonListPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) => _FakeLessonsListNotifier(
                const AppAsyncState.failure(message: 'Network error')),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('shows empty state when lessons list is empty', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) =>
                _FakeLessonsListNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No lessons available'), findsOneWidget);
    });

    testWidgets('shows lesson titles when populated', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) =>
                _FakeLessonsListNotifier(const AppAsyncState.success(_lessons)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Lesson 1: Introduction'), findsOneWidget);
      expect(find.text('Lesson 2: Nouns'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) =>
                _FakeLessonsListNotifier(const AppAsyncState.success(_lessons)),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(LessonListPage), findsOneWidget);
      expect(find.text('Lesson 1: Introduction'), findsOneWidget);
    });

    testWidgets('chapterTitle appears in AppBar', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) =>
                _FakeLessonsListNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Unit 1: Basics'), findsOneWidget);
    });

    testWidgets(
        'shows an XP badge only for lessons with xpValue > 0 '
        '(real-data-only redesign: no fabricated type/duration/completion)',
        (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          lessonsListProvider.overrideWith(
            (ref) =>
                _FakeLessonsListNotifier(const AppAsyncState.success(_lessons)),
          ),
        ],
      ));
      await tester.pump();
      // lesson-2 has xpValue: 20 → badge renders.
      expect(find.text('20 XP'), findsOneWidget);
      // lesson-1 has xpValue: 0 → no badge for it.
      expect(find.text('0 XP'), findsNothing);
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeLessonsListNotifier extends LessonsListNotifier {
  _FakeLessonsListNotifier(AppAsyncState<List<LessonModel>> initialState)
      : super(repository: _FakeLessonsRepository()) {
    state = initialState;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String chapterId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String chapterId,
  }) async {}
}

class _FakeLessonsRepository implements LessonsRepository {
  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async =>
      const [];

  @override
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async =>
      const [];

  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) async =>
      const [];

  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) async =>
      const [];
}
