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
//   7. Populated state renders the real, computed '${chapters.length}
//      chapters' subtitle (real-data-only redesign — not fabricated).
//   8. Percent-done badge, filter chips, and status chips are driven by
//      real, backend-computed ChapterProgressModel fields (percent,
//      status), not a client-side mock.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/localization/localization.dart';
import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_notifier.dart';
import 'package:aim_mobile/features/auth/logic/provider/auth_flow_provider.dart';
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
        localizationsDelegates: AppLocale.delegates,
        supportedLocales: AppLocale.supportedLocales,
        home: Directionality(textDirection: dir, child: child),
      ),
    );

const _page = ChapterListPage(
  courseId: 'course-1',
  courseTitle: 'English B1',
);

const _chapters = [
  ChapterProgressModel(
    chapterId: 'chapter-1',
    title: 'Unit 1: Basics',
    description: 'Intro material.',
    levelCode: 'A1',
    lessonCount: 4,
    completedLessonCount: 4,
    quizCount: 0,
    percent: 100,
    status: 'completed',
  ),
  ChapterProgressModel(
    chapterId: 'chapter-2',
    title: 'Unit 2: Grammar',
    description: null,
    levelCode: 'A1',
    lessonCount: 5,
    completedLessonCount: 2,
    quizCount: 0,
    percent: 40,
    status: 'in_progress',
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

    testWidgets(
        'shows real chapter count subtitle when populated', (tester) async {
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
      // _chapters has 2 entries — the subtitle is computed from the real,
      // already-loaded list length, not a fabricated value.
      expect(find.text('2 chapters'), findsOneWidget);
    });

    testWidgets('courseTitle appears in header', (tester) async {
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

    testWidgets(
        'shows real percent-done badge, filter chips, and status chips '
        'when populated', (tester) async {
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
      expect(find.text('All chapters'), findsOneWidget);
      expect(find.text('In progress'), findsWidgets);
      expect(find.text('Completed'), findsWidgets);
      expect(find.text('DONE'), findsOneWidget);
      // Overall percent is the real average of backend-computed per-chapter
      // percent: (100 + 40) / 2 = 70.
      expect(find.text('70%'), findsOneWidget);
    });

    testWidgets('filter chips narrow the visible chapter list using real status',
        (tester) async {
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

      // _chapters[0].status == 'completed', _chapters[1].status == 'in_progress'.
      await tester.tap(find.text('Completed').first);
      await tester.pump();
      expect(find.text('Unit 1: Basics'), findsOneWidget);
      expect(find.text('Unit 2: Grammar'), findsNothing);
    });

    group('final exam card', () {
      const allDone = [
        ChapterProgressModel(
          chapterId: 'chapter-1',
          title: 'Unit 1: Basics',
          description: null,
          levelCode: 'A1',
          lessonCount: 3,
          completedLessonCount: 3,
          quizCount: 1,
          percent: 100,
          status: 'completed',
        ),
      ];

      Future<void> pumpWithExam(WidgetTester tester, FinalExamSummaryModel exam) async {
        await tester.pumpWidget(_wrap(
          _page,
          overrides: [
            authFlowProvider.overrideWith(
              (ref) => AuthFlowNotifier()
                ..signIn('learner@example.com', accessToken: 'tok-abc'),
            ),
            lessonsRepositoryProvider
                .overrideWithValue(_FakeLessonsRepository(finalExam: exam)),
            chaptersProvider.overrideWith(
              (ref) => _FakeChaptersNotifier(const AppAsyncState.success(allDone)),
            ),
          ],
        ));
        await tester.pump();
        await tester.pump();
      }

      testWidgets(
          'finishing every chapter unlocks the exam but does not mark it passed',
          (tester) async {
        await pumpWithExam(
          tester,
          const FinalExamSummaryModel(
            assessmentId: 'exam-1',
            title: 'Starter Course — Final Exam',
            unlocked: true,
          ),
        );

        expect(find.text('Tap to start your final level exam.'), findsOneWidget);
        expect(find.textContaining('FINAL EXAM PASSED'), findsNothing);
      });

      testWidgets('shows the backend percent once the exam is passed',
          (tester) async {
        await pumpWithExam(
          tester,
          const FinalExamSummaryModel(
            assessmentId: 'exam-1',
            title: 'Starter Course — Final Exam',
            unlocked: true,
            passed: true,
            score: 79,
          ),
        );

        expect(find.text('FINAL EXAM PASSED · 79%'), findsOneWidget);
      });
    });
  });
}

// ── Fake notifier ─────────────────────────────────────────────────────────────

class _FakeChaptersNotifier extends ChaptersNotifier {
  _FakeChaptersNotifier(AppAsyncState<List<ChapterProgressModel>> initialState)
      : super(repository: _FakeLessonsRepository()) {
    state = initialState;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String levelId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String levelId,
  }) async {}

  @override
  Future<void> loadForCourse({
    required String bearerToken,
    required String courseId,
  }) async {}
}

class _FakeLessonsRepository implements LessonsRepository {
  _FakeLessonsRepository({this.finalExam});

  final FinalExamSummaryModel? finalExam;

  @override
  Future<List<CourseModel>> getCourses({required String bearerToken}) async =>
      const [];

  @override
  Future<List<LevelModel>> getLevels({
    required String bearerToken,
    required String courseId,
  }) async =>
      finalExam == null ? const [] : [_level];

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

  @override
  Future<List<ChapterProgressModel>> getChaptersWithProgress({
    required String bearerToken,
    required String levelId,
  }) async =>
      const [];

  @override
  Future<List<LessonProgressModel>> getLessonsWithProgress({
    required String bearerToken,
    required String chapterId,
  }) async =>
      const [];

  @override
  Future<FinalExamSummaryModel?> getFinalExamForLevel({
    required String bearerToken,
    required String levelId,
  }) async =>
      finalExam;

  @override
  Future<ChapterQuizSummaryModel?> getChapterQuiz({
    required String bearerToken,
    required String chapterId,
  }) async =>
      null;

  @override
  Future<void> markLessonComplete({
    required String bearerToken,
    required String lessonId,
  }) async {}
}

const _level = LevelModel(
  id: 'level-1',
  courseId: 'course-1',
  title: 'Level 1',
  status: 'published',
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
);
