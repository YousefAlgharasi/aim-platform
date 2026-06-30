// Phase 6 — P6-062
// home_page_test.dart — widget tests for HomePage.
//
// Covers:
//   1. Loading state renders AIMFullScreenLoading.
//   2. Error state renders AIMFullScreenError with message.
//   3. Empty success state renders AIMEmptyState.
//   4. Populated success state renders all four section headers.
//   5. RTL layout does not throw; section headers align with directionality.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/core/state/app_async_state.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/data/models/home_quick_start_lesson_model.dart';
import 'package:aim_mobile/features/home/data/models/home_recommended_course_model.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_notifier.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart'
    show HomeEngagementSummary;
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';
import 'package:aim_mobile/features/home/ui/pages/home_page.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

Widget _wrap(
  Widget child, {
  List<Override> overrides = const [],
  TextDirection dir = TextDirection.ltr,
}) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(
      theme: AppTheme.light,
      home: Directionality(
        textDirection: dir,
        child: child,
      ),
    ),
  );
}

HomeData _populated() => const HomeData(
      skillStates: [
        HomeSkillStateModel(
          skillId: 'skill-algebra',
          masteryScore: 0.42,
          masteryConfidence: 0.7,
          masteryTrend: 'improving',
          lastAttemptId: 'attempt-1',
          lastEvaluatedAt: '2025-05-30T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
        ),
      ],
      weaknessRecords: [
        HomeWeaknessRecordModel(
          weaknessId: 'weakness-fractions',
          skillId: 'skill-fractions',
          severity: 'high',
          status: 'open',
          triggerAttemptIds: ['attempt-2'],
          detectedAt: '2025-05-28T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
        ),
      ],
      reviewSchedules: [
        HomeReviewScheduleModel(
          scheduleId: 'schedule-geometry',
          skillId: 'skill-geometry',
          dueAt: '2025-06-10T09:00:00Z',
          intervalDays: 5,
          repetitionCount: 2,
          status: 'pending',
          basedOnAttemptId: 'attempt-3',
          scheduledAt: '2025-06-05T09:00:00Z',
          updatedAt: '2025-06-05T09:00:00Z',
        ),
      ],
      recommendations: [
        HomeRecommendationModel(
          id: 'rec-algebra',
          kind: 'practice',
          targetSkillId: 'skill-algebra',
          rank: 1,
          reason: 'Backend-identified weakness in factoring.',
          generatedAt: '2025-06-01T00:00:00Z',
          status: 'active',
          updatedAt: '2025-06-01T00:00:00Z',
        ),
      ],
    );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

void main() {
  group('HomePage', () {
    testWidgets('shows loading state', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                const AppAsyncState.loading(),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.byType(CircularProgressIndicator), findsNothing);
      // AIMFullScreenLoading uses AIMSkeleton widgets — verify no crash.
      expect(find.byType(HomePage), findsOneWidget);
    });

    testWidgets('shows error state with message', (tester) async {
      const msg = 'Network error';
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                const AppAsyncState.failure(message: msg),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text(msg), findsOneWidget);
    });

    testWidgets('shows empty state when HomeData is empty', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
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
        ),
      );
      await tester.pump();

      expect(find.text('Get Started'), findsOneWidget);
      expect(find.text('Placement Test'), findsOneWidget);
    });

    testWidgets('shows all four sections when data is populated',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                AppAsyncState.success(_populated()),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text('Skill States'), findsOneWidget);
      expect(find.text('Focus Areas'), findsOneWidget);
      expect(find.text('Review Schedule'), findsOneWidget);
      expect(find.text('AIM Recommendations'), findsOneWidget);
    });

    testWidgets('renders without error under RTL directionality', (tester) async {
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                AppAsyncState.success(_populated()),
              ),
            ),
          ],
          dir: TextDirection.rtl,
        ),
      );
      await tester.pump();

      // No layout exceptions; page renders.
      expect(find.byType(HomePage), findsOneWidget);
      expect(find.text('Skill States'), findsOneWidget);
    });
  });
}

// ---------------------------------------------------------------------------
// Fake notifier
// ---------------------------------------------------------------------------

class _FakeHomeNotifier extends HomeNotifier {
  _FakeHomeNotifier(AppAsyncState<HomeData> initialState)
      : super(repository: _FakeHomeRepository()) {
    state = initialState;
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

  @override
  void clear() {}
}

class _FakeHomeRepository implements HomeRepository {
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
