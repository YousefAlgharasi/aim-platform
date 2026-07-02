// Phase 6 — P6-104 (updated — TASK-14 Progress hub restructure)
// progress_recommendation_checks_test.dart — widget checks for progress and
// recommendation pages.
//
// Covers:
//   1.  ProgressPage loading state renders AIMFullScreenLoading.
//   2.  ProgressPage error state renders AIMFullScreenError.
//   3.  ProgressPage empty success state renders AIMEmptyState.
//   4.  ProgressPage populated state renders the four hub navigation rows.
//   5.  ProgressPage RTL layout does not throw.
//   6.  RecommendationsPage loading state renders AIMFullScreenLoading.
//   7.  RecommendationsPage error state renders AIMFullScreenError.
//   8.  RecommendationsPage empty success state renders AIMEmptyState.
//   9.  RecommendationsPage populated state renders recommendation cards.
//   10. RecommendationsPage RTL layout does not throw.
//   11. ReviewSchedulePage loading state renders AIMFullScreenLoading.
//   12. ReviewSchedulePage error state renders AIMFullScreenError.
//   13. ReviewSchedulePage empty success state renders AIMEmptyState.
//   14. ReviewSchedulePage populated state renders schedule cards.
//   15. ReviewSchedulePage RTL layout does not throw.
//
// ProgressPage now also depends on homeProvider (for the day-streak stat),
// so its wrap helper additionally overrides homeProvider with a stub
// notifier defaulting to a successful, zeroed HomeData — mirroring the fake
// notifier pattern already used in test/features/home/home_page_test.dart.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/core/widgets/widgets.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/entity/aim_results_data.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_notifier.dart';
import 'package:aim_mobile/features/aim_results/logic/provider/aim_results_provider.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart'
    show HomeEngagementSummary;
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_notifier.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';
import 'package:aim_mobile/features/progress/ui/pages/progress_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/recommendations_page.dart';
import 'package:aim_mobile/features/progress/ui/pages/review_schedule_page.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

Widget _wrap(
  Widget child, {
  required AppAsyncState<AimResultsData> state,
  TextDirection dir = TextDirection.ltr,
  AppAsyncState<HomeData>? homeState,
}) {
  return ProviderScope(
    overrides: [
      aimResultsProvider.overrideWith(
        (ref) => _StubNotifier(state),
      ),
      homeProvider.overrideWith(
        (ref) => _StubHomeNotifier(
          homeState ??
              const AppAsyncState.success(
                HomeData(
                  skillStates: [],
                  weaknessRecords: [],
                  reviewSchedules: [],
                  recommendations: [],
                ),
              ),
        ),
      ),
    ],
    child: MaterialApp(
      theme: AppTheme.light,
      home: Directionality(
        textDirection: dir,
        child: child,
      ),
    ),
  );
}

class _StubHomeNotifier extends HomeNotifier {
  _StubHomeNotifier(AppAsyncState<HomeData> initial)
      : super(repository: _NoOpHomeRepo()) {
    state = initial;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) async {}
}

class _NoOpHomeRepo implements HomeRepository {
  @override
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async =>
      const [];

  @override
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async =>
      const [];

  @override
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async =>
      const [];

  @override
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async =>
      const [];

  @override
  Future<HomeEngagementSummary> getEngagementSummary({
    required String bearerToken,
  }) async =>
      const HomeEngagementSummary(
        goal: HomeEngagementGoalModel(
          targetLessons: 1,
          completedToday: 0,
          streakDays: 0,
        ),
      );

  @override
  Future<HomeEngagementStatsModel?> getEngagementStats({
    required String bearerToken,
  }) async =>
      null;

  @override
  Future<HomeContinueLearningModel?> getContinueLearning({
    required String bearerToken,
  }) async =>
      null;

  @override
  Future<HomeQuickStartLessonModel?> getQuickStartLesson({
    required String bearerToken,
  }) async =>
      null;

  @override
  Future<HomeRecommendedCourseModel?> getRecommendedCourse({
    required String bearerToken,
  }) async =>
      null;
}

class _StubNotifier extends AimResultsNotifier {
  _StubNotifier(AppAsyncState<AimResultsData> initial)
      : super(repository: _NoOpRepo()) {
    state = initial;
  }

  @override
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {}

  @override
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) async {}
}

class _NoOpRepo implements AimResultsRepository {
  @override
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];

  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async =>
      [];
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const _skillState = AimSkillStateModel(
  skillId: 'grammar-articles',
  masteryScore: 0.73,
  masteryConfidence: 0.81,
  masteryTrend: 'improving',
  lastAttemptId: 'att-1',
  lastEvaluatedAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
);

const _weakness = AimWeaknessRecordModel(
  weaknessId: 'wr-1',
  skillId: 'grammar-articles',
  severity: 'high',
  status: 'open',
  triggerAttemptIds: ['att-1'],
  detectedAt: '2026-06-01T10:00:00Z',
  updatedAt: '2026-06-01T10:00:00Z',
);

const _recommendation = AimRecommendationModel(
  id: 'rec-1',
  kind: 'lesson',
  targetSkillId: 'grammar-articles',
  rank: 1,
  reason: 'High weakness severity detected by AIM Engine.',
  generatedAt: '2026-06-01T10:00:00Z',
  status: 'active',
  updatedAt: '2026-06-01T10:00:00Z',
);

const _schedule = AimReviewScheduleModel(
  scheduleId: 'rs-1',
  skillId: 'grammar-articles',
  dueAt: '2026-06-10T09:00:00Z',
  intervalDays: 7,
  repetitionCount: 3,
  status: 'pending',
  basedOnAttemptId: 'att-99',
  scheduledAt: '2026-06-03T09:00:00Z',
  updatedAt: '2026-06-03T09:00:00Z',
);

AppAsyncState<AimResultsData> get _loadingState => const AppAsyncLoading();
AppAsyncState<AimResultsData> get _errorState =>
    const AppAsyncFailure(message: 'Network error', code: 'ERR');
AppAsyncState<AimResultsData> get _emptySuccess =>
    const AppAsyncSuccess(AimResultsData(
      skillStates: [],
      weaknessRecords: [],
      recommendations: [],
      reviewSchedules: [],
    ));
AppAsyncState<AimResultsData> get _populatedSuccess =>
    const AppAsyncSuccess(AimResultsData(
      skillStates: [_skillState],
      weaknessRecords: [_weakness],
      recommendations: [_recommendation],
      reviewSchedules: [_schedule],
    ));

// ── Tests ─────────────────────────────────────────────────────────────────────

void main() {
  group('P6-104 — ProgressPage widget checks', () {
    testWidgets('1. loading state renders AIMFullScreenLoading',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const ProgressPage(), state: _loadingState),
      );
      await tester.pump();
      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('2. error state renders AIMFullScreenError', (tester) async {
      await tester.pumpWidget(
        _wrap(const ProgressPage(), state: _errorState),
      );
      await tester.pump();
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('3. empty success state renders AIMEmptyState', (tester) async {
      await tester.pumpWidget(
        _wrap(const ProgressPage(), state: _emptySuccess),
      );
      await tester.pump();
      expect(find.text('No progress data yet'), findsOneWidget);
    });

    testWidgets('4. populated state renders the four hub navigation rows',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const ProgressPage(), state: _populatedSuccess),
      );
      await tester.pump();
      expect(find.text('Skill States'), findsOneWidget);
      expect(find.text('1 skills tracked'), findsOneWidget);
      expect(find.text('Weaknesses'), findsOneWidget);
      expect(find.text('1 focus areas'), findsOneWidget);
      expect(find.text('Recommendations'), findsOneWidget);
      expect(find.text('1 from AIM'), findsOneWidget);
      expect(find.text('Review Schedule'), findsOneWidget);
      expect(find.text('1 reviews scheduled'), findsOneWidget);
    });

    testWidgets('5. RTL layout does not throw', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const ProgressPage(),
          state: _populatedSuccess,
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });

  group('P6-104 — RecommendationsPage widget checks', () {
    testWidgets('6. loading state renders AIMFullScreenLoading',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const RecommendationsPage(), state: _loadingState),
      );
      await tester.pump();
      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('7. error state renders AIMFullScreenError', (tester) async {
      await tester.pumpWidget(
        _wrap(const RecommendationsPage(), state: _errorState),
      );
      await tester.pump();
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('8. empty success state renders AIMEmptyState', (tester) async {
      await tester.pumpWidget(
        _wrap(const RecommendationsPage(), state: _emptySuccess),
      );
      await tester.pump();
      expect(find.text('No recommendations yet'), findsOneWidget);
    });

    testWidgets('9. populated state renders recommendation content',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const RecommendationsPage(), state: _populatedSuccess),
      );
      await tester.pump();
      expect(find.text('grammar-articles'), findsWidgets);
      expect(find.text('High weakness severity detected by AIM Engine.'),
          findsOneWidget);
    });

    testWidgets('10. RTL layout does not throw', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const RecommendationsPage(),
          state: _populatedSuccess,
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });

  group('P6-104 — ReviewSchedulePage widget checks', () {
    testWidgets('11. loading state renders AIMFullScreenLoading',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const ReviewSchedulePage(), state: _loadingState),
      );
      await tester.pump();
      expect(find.byType(AIMFullScreenLoading), findsOneWidget);
    });

    testWidgets('12. error state renders AIMFullScreenError', (tester) async {
      await tester.pumpWidget(
        _wrap(const ReviewSchedulePage(), state: _errorState),
      );
      await tester.pump();
      expect(find.text('Network error'), findsOneWidget);
    });

    testWidgets('13. empty success state renders AIMEmptyState',
        (tester) async {
      await tester.pumpWidget(
        _wrap(const ReviewSchedulePage(), state: _emptySuccess),
      );
      await tester.pump();
      expect(find.text('No reviews scheduled'), findsOneWidget);
    });

    testWidgets('14. populated state renders schedule content', (tester) async {
      await tester.pumpWidget(
        _wrap(const ReviewSchedulePage(), state: _populatedSuccess),
      );
      await tester.pump();
      // dueAt (2026-06-10) is far enough in the past that the relative
      // "Due Today / Due Nd ago" formatting has settled into the stable
      // "Due <Mon> <day>" branch regardless of the exact test run date.
      expect(find.textContaining('Due Jun 10'), findsOneWidget);
      expect(find.textContaining('7d · rep #3'), findsOneWidget);
      expect(find.text('grammar-articles'), findsOneWidget);
    });

    testWidgets('15. RTL layout does not throw', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const ReviewSchedulePage(),
          state: _populatedSuccess,
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });
}
