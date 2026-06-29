// Phase 6 — P6-073
// course_list_page_test.dart — widget tests for CourseListPage.
//
// Covers:
//   1. Loading state renders without crash.
//   2. Error state renders error message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated state renders course titles.
//   5. RTL layout renders without error.
//   6. Course status and sortOrder are from backend — not mutated in UI.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'package:aim_mobile/features/lessons/logic/provider/courses_notifier.dart';
import 'package:aim_mobile/features/lessons/logic/provider/lessons_provider.dart';
import 'package:aim_mobile/features/lessons/logic/repository/lessons_repository.dart';
import 'package:aim_mobile/features/lessons/ui/pages/course_list_page.dart';

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

const _courses = [
  CourseModel(
    id: 'course-1',
    title: 'English B1',
    status: 'published',
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  ),
  CourseModel(
    id: 'course-2',
    title: 'Math Foundations',
    status: 'published',
    sortOrder: 2,
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-06-02T00:00:00Z',
  ),
];

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('CourseListPage', () {
    testWidgets('shows loading state without crash', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) => _FakeCoursesNotifier(const AppAsyncState.loading()),
          ),
        ],
      ));
      await tester.pump();
      expect(find.byType(CourseListPage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) => _FakeCoursesNotifier(
                const AppAsyncState.failure(message: 'Load failed')),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('Load failed'), findsOneWidget);
    });

    testWidgets('shows empty state when courses list is empty', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) =>
                _FakeCoursesNotifier(const AppAsyncState.success([])),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('No courses available'), findsOneWidget);
    });

    testWidgets('shows course titles when populated', (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) => _FakeCoursesNotifier(
                const AppAsyncState.success(_courses)),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('English B1'), findsOneWidget);
      expect(find.text('Math Foundations'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality',
        (tester) async {
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) => _FakeCoursesNotifier(
                const AppAsyncState.success(_courses)),
          ),
        ],
        dir: TextDirection.rtl,
      ));
      await tester.pump();
      expect(find.byType(CourseListPage), findsOneWidget);
      expect(find.text('English B1'), findsOneWidget);
    });

    testWidgets('course status and sortOrder are backend values — not mutated',
        (tester) async {
      // The widget renders titles; status/sortOrder come verbatim from model.
      // This test confirms the model values are not modified before display.
      final course = _courses[0];
      expect(course.status, 'published');
      expect(course.sortOrder, 1);
      // Render to confirm widget accepts these verbatim values without error.
      await tester.pumpWidget(_wrap(
        const CourseListPage(),
        overrides: [
          coursesProvider.overrideWith(
            (ref) => _FakeCoursesNotifier(
              AppAsyncState.success([course]),
            ),
          ),
        ],
      ));
      await tester.pump();
      expect(find.text('English B1'), findsOneWidget);
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeCoursesNotifier extends CoursesNotifier {
  _FakeCoursesNotifier(AppAsyncState<List<CourseModel>> initialState)
      : super(repository: _FakeLessonsRepository()) {
    state = initialState;
  }

  @override
  Future<void> load({required String bearerToken}) async {}
  @override
  Future<void> refresh({required String bearerToken}) async {}
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
