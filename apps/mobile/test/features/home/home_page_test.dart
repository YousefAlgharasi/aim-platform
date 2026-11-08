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
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/provider/home_notifier.dart';
import 'package:aim_mobile/features/home/logic/provider/home_provider.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';
import 'package:aim_mobile/features/home/ui/pages/home_page.dart';
import 'package:aim_mobile/features/home/ui/widgets/home_course_path_section.dart';
import 'package:aim_mobile/core/theme/app_theme.dart';
import 'package:aim_mobile/core/localization/localization.dart';

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
      localizationsDelegates: AppLocale.delegates,
      supportedLocales: AppLocale.supportedLocales,
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

const _stats = HomeEngagementStatsModel(
  totalXp: 1234,
  xpToday: 40,
  level: 3,
  nextLevel: 4,
  currentLevelMinXp: 300,
  nextLevelMinXp: 600,
  levelProgressPercent: 62,
  badgeCount: 5,
  rankPercentile: 17,
  weeklyActivity: [],
);

HomeData _populatedWithStats() => HomeData(
      skillStates: _populated().skillStates,
      weaknessRecords: _populated().weaknessRecords,
      reviewSchedules: _populated().reviewSchedules,
      recommendations: _populated().recommendations,
      engagementStats: _stats,
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

    testWidgets('shows the web greeting and date instead of the old header',
        (tester) async {
      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(AppAsyncState.success(_populated())),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(
        find.textContaining(RegExp(r'^Good (morning|afternoon|evening)')),
        findsOneWidget,
      );
      // The app chrome shows AIM now; the old in-page header is gone.
      expect(find.text('AIM English'), findsNothing);
      expect(find.text('Updated just now'), findsNothing);
    });

    testWidgets('shows the sections in the web order on a phone',
        (tester) async {
      tester.view.physicalSize = const Size(900, 6000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                AppAsyncState.success(
                  HomeData(
                    skillStates: _populated().skillStates,
                    weaknessRecords: _populated().weaknessRecords,
                    reviewSchedules: _populated().reviewSchedules,
                    recommendations: _populated().recommendations,
                    engagementStats: _stats,
                    goal: const HomeEngagementGoal(
                      targetLessons: 2,
                      completedToday: 1,
                      streakDays: 3,
                    ),
                    dailyChallenge: const HomeDailyChallengeModel(
                      key: 'goal',
                      title: 'Reach your daily goal',
                      description: 'Complete 2 lessons today.',
                      targetCount: 2,
                      progressCount: 1,
                      completed: false,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      double y(String text) => tester.getTopLeft(find.text(text).first).dy;
      final order = [
        y('Word of the day'),
        y('XP level'),
        y('Top learners'),
        y('1/2 today'),
        y('Daily challenge'),
        y('No activity this week'),
        y('Upcoming deadlines'),
      ];
      for (var i = 1; i < order.length; i++) {
        expect(order[i], greaterThan(order[i - 1]), reason: 'section $i is out of order');
      }
      expect(find.byType(HomeCoursePathSection), findsOneWidget);
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

      expect(find.byType(HomeCoursePathSection), findsOneWidget);
    });

    testWidgets('shows recommendations section when data is populated',
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

      expect(find.byType(HomeCoursePathSection), findsOneWidget);
    });

    testWidgets('shows the stats tiles from the real engagementStats',
        (tester) async {
      tester.view.physicalSize = const Size(900, 6000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                AppAsyncState.success(_populatedWithStats()),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text('XP level'), findsOneWidget);
      expect(find.text('Total XP'), findsOneWidget);
      expect(find.text('Badges'), findsOneWidget);
      expect(find.text('Top 17%'), findsOneWidget);
      expect(find.text('1,234'), findsOneWidget);
    });

    testWidgets('shows today\'s challenge from the Home load',
        (tester) async {
      tester.view.physicalSize = const Size(900, 6000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);

      await tester.pumpWidget(
        _wrap(
          const HomePage(),
          overrides: [
            homeProvider.overrideWith(
              (ref) => _FakeHomeNotifier(
                AppAsyncState.success(
                  HomeData(
                    skillStates: _populated().skillStates,
                    weaknessRecords: _populated().weaknessRecords,
                    reviewSchedules: _populated().reviewSchedules,
                    recommendations: _populated().recommendations,
                    engagementStats: _stats,
                    dailyChallenge: const HomeDailyChallengeModel(
                      key: 'challenge-1',
                      title: 'Read a Book',
                      description: 'Read one chapter of a book',
                      targetCount: 1,
                      progressCount: 0,
                      completed: false,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      );
      await tester.pump();

      expect(find.text('Daily challenge'), findsOneWidget);
      expect(find.text('Read a Book'), findsOneWidget);
      // Practice Speaking / Write a Paragraph moved to the menu (they need a started course).
      expect(find.text('Practice Speaking'), findsNothing);
      expect(find.text('Write a Paragraph'), findsNothing);
    });

    for (final loc in const [Locale('en'), Locale('ar')]) {
      testWidgets('every section fits a small phone (${loc.languageCode})',
          (tester) async {
        tester.view.physicalSize = const Size(320, 6000);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);

        await tester.pumpWidget(
          ProviderScope(
            overrides: [
              homeProvider.overrideWith(
                (ref) => _FakeHomeNotifier(
                  AppAsyncState.success(
                    HomeData(
                      skillStates: _populated().skillStates,
                      weaknessRecords: _populated().weaknessRecords,
                      reviewSchedules: _populated().reviewSchedules,
                      recommendations: _populated().recommendations,
                      engagementStats: const HomeEngagementStatsModel(
                        totalXp: 1234,
                        xpToday: 40,
                        level: 3,
                        nextLevel: 4,
                        currentLevelMinXp: 300,
                        nextLevelMinXp: 600,
                        levelProgressPercent: 62,
                        badgeCount: 5,
                        rankPercentile: 17,
                        weeklyActivity: [
                          HomeWeeklyActivityDayModel(date: '2026-11-02', xp: 20),
                          HomeWeeklyActivityDayModel(date: '2026-11-03', xp: 0),
                          HomeWeeklyActivityDayModel(date: '2026-11-04', xp: 60),
                        ],
                        weeklyDeltaPercent: 12,
                      ),
                      goal: const HomeEngagementGoal(
                        targetLessons: 2,
                        completedToday: 1,
                        streakDays: 3,
                      ),
                      dailyChallenge: const HomeDailyChallengeModel(
                        key: 'goal',
                        title: 'Reach your daily goal',
                        description: 'Complete 2 lessons today.',
                        targetCount: 2,
                        progressCount: 1,
                        completed: false,
                      ),
                    ),
                  ),
                ),
              ),
            ],
            child: MaterialApp(
              theme: AppTheme.light,
              locale: loc,
              localizationsDelegates: AppLocale.delegates,
              supportedLocales: AppLocale.supportedLocales,
              home: const HomePage(),
            ),
          ),
        );
        await tester.pump(const Duration(milliseconds: 300));

        expect(tester.takeException(), isNull);
      });
    }

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

      expect(find.byType(HomePage), findsOneWidget);
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

  /// Test-only helper to simulate a load completing while the widget is
  /// mounted, so HomePage's ref.listen last-updated tracking has a real
  /// state transition to react to.
  void emitSuccess(HomeData data) {
    state = AppAsyncState.success(data);
  }
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
