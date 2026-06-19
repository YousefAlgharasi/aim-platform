// Phase 6 — P6-074
// chapter_list_page_test.dart — widget tests for ChapterListPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated state renders chapter titles.
//   5. RTL layout renders without error.
//   6. levelId is backend-supplied — widget accepts it as a required param.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/chapters_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/chapter_list_page.dart';

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

const _page = ChapterListPage(
  levelId: 'level-1',
  courseTitle: 'English B1',
);

const _chapters = [
  ChapterModel(
    id: 'chapter-1',
    levelId: 'level-1',
    title: 'Unit 1: Basics',
    status: 'published',
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  ),
  ChapterModel(
    id: 'chapter-2',
    levelId: 'level-1',
    title: 'Unit 2: Grammar',
    status: 'published',
    sortOrder: 2,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-06-02T00:00:00Z',
  ),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('ChapterListPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) => _FakeChaptersNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(ChapterListPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) => _FakeChaptersNotifier(
                const AppAsyncState.failure(message: 'Load failed')),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('shows empty state when chapters list is empty', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) => _FakeChaptersNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No chapters available'), findsOneWidget);
    });

    testWidgets('shows chapter titles when populated', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) =>
                _FakeChaptersNotifier(const AppAsyncState.success(_chapters)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Unit 1: Basics'), findsOneWidget);
      expect(find.text('Unit 2: Grammar'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) =>
                _FakeChaptersNotifier(const AppAsyncState.success(_chapters)),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(ChapterListPage), findsOneWidget);
      expect(find.text('Unit 1: Basics'), findsOneWidget);
    });

    testWidgets('courseTitle appears in AppBar', (tester) async {
      await tester.pumpWidget(_wrap(
        _page,
        overrides: [
          chaptersProvider.overrideWith(
            (ref) => _FakeChaptersNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('English B1'), findsOneWidget);
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeChaptersNotifier extends ChaptersNotifier {
  _FakeChaptersNotifier(AppAsyncState<List<ChapterModel>> initialState)
      : super(repository: _FakeLessonsRepository()) {
    state = initialState;
  }

  Future<void> load({
    required String bearerToken,
    required String levelId,
  }) async {}

  Future<void> refresh({
    required String bearerToken,
    required String levelId,
  }) async {}
}

class _FakeLessonsRepository implements LessonsRepository {
  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async =>
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
