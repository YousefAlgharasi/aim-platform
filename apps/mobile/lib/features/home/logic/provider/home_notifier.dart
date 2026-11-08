// Phase 6 — P6-061
// HomeNotifier.
//
// Scope: Home screen only.
//
// Responsibilities:
//   1. Fetch all home screen data from the backend in a single load call.
//   2. Expose [AppAsyncState<HomeData>] to the UI.
//   3. Support refresh (reload).
//
// Security rules:
// - Flutter never calculates mastery, band, severity, priority, action, or
//   reason. All AIM values come from the backend verbatim via HomeRepository.
// - studentId is sourced from authContextProvider (JWT-resolved by backend)
//   and passed as a URL path parameter — never from user input.
// - Bearer token is read from authFlowProvider; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/state/app_state_notifier.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/entity/home_skill_state.dart';
import 'package:aim_mobile/features/home/logic/entity/home_weakness_record.dart';
import 'package:aim_mobile/features/home/logic/entity/home_review_schedule.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommendation.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

class HomeNotifier extends AppStateNotifier<HomeData> {
  HomeNotifier({required HomeRepository repository})
      : _repository = repository;

  final HomeRepository _repository;

  /// Fetch all home screen data for [studentId] using [bearerToken].
  ///
  /// Runs the backend calls in parallel for speed. A failing section is
  /// left empty ([HomeData.hasFailedSections]); only when every core call
  /// fails is the full state an [AppAsyncFailure].
  ///
  /// [studentId] must come from [authContextProvider] (JWT-resolved).
  /// Never pass a user-supplied value here.
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {
    setLoading();
    try {
      // Start every request at once. The supplementary calls (engagement,
      // continue-learning, quick-start, recommended course) used to be
      // awaited one after another *after* the core four finished, adding
      // five serial round trips to every home load. They have no data
      // dependency on each other, so they now run concurrently with the
      // core calls; a failure in a supplementary call still resolves to
      // null instead of failing the whole page.
      final skillStatesFuture = _repository.getSkillStates(
        bearerToken: bearerToken,
        studentId: studentId,
      );
      final weaknessFuture = _repository.getWeaknessRecords(
        bearerToken: bearerToken,
        studentId: studentId,
      );
      final scheduleFuture = _repository.getReviewSchedules(
        bearerToken: bearerToken,
        studentId: studentId,
      );
      final recommendFuture = _repository.getRecommendations(
        bearerToken: bearerToken,
        studentId: studentId,
      );

      final engagementFuture = _repository
          .getEngagementSummary(bearerToken: bearerToken)
          .then<HomeEngagementSummary?>((value) => value)
          .catchError((_) => null);
      final engagementStatsFuture = _repository
          .getEngagementStats(bearerToken: bearerToken)
          .catchError((_) => null);
      final continueLearningFuture = _repository
          .getContinueLearning(bearerToken: bearerToken)
          .catchError((_) => null);
      final quickStartFuture = _repository
          .getQuickStartLesson(bearerToken: bearerToken)
          .catchError((_) => null);
      final recommendedCourseFuture = _repository
          .getRecommendedCourse(bearerToken: bearerToken)
          .catchError((_) => null);

      // Each core section settles on its own: one failing call degrades just
      // that section (the web dashboard does the same). The page only fails
      // when every core call fails.
      // All four are wrapped before the first await so none of them can
      // fail with no listener attached.
      final skillStatesSettled = _settle(skillStatesFuture);
      final weaknessSettled = _settle(weaknessFuture);
      final scheduleSettled = _settle(scheduleFuture);
      final recommendSettled = _settle(recommendFuture);
      final skillStatesResult = await skillStatesSettled;
      final weaknessResult = await weaknessSettled;
      final scheduleResult = await scheduleSettled;
      final recommendResult = await recommendSettled;
      final coreResults = [
        skillStatesResult,
        weaknessResult,
        scheduleResult,
        recommendResult,
      ];
      if (coreResults.every((r) => r.error != null)) {
        throw skillStatesResult.error!;
      }
      // Show the page as soon as the core sections are in; the supplementary
      // cards fill in when they arrive instead of holding everything back.
      // `hasFailedSections` stays true meanwhile so the getting-started
      // promos are not shown for data that has not arrived yet.
      setSuccess(HomeData(
        skillStates: skillStatesResult.value ?? const <HomeSkillState>[],
        weaknessRecords: weaknessResult.value ?? const <HomeWeaknessRecord>[],
        reviewSchedules: scheduleResult.value ?? const <HomeReviewSchedule>[],
        recommendations: recommendResult.value ?? const <HomeRecommendation>[],
        hasFailedSections: true,
      ));
      final engagementResult = await engagementFuture;
      final engagementStatsResult = await engagementStatsFuture;
      final continueLearningResult = await continueLearningFuture;
      final quickStartResult = await quickStartFuture;
      final recommendedCourseResult = await recommendedCourseFuture;

      setSuccess(HomeData(
        skillStates: skillStatesResult.value ?? const <HomeSkillState>[],
        weaknessRecords: weaknessResult.value ?? const <HomeWeaknessRecord>[],
        reviewSchedules: scheduleResult.value ?? const <HomeReviewSchedule>[],
        recommendations: recommendResult.value ?? const <HomeRecommendation>[],
        hasFailedSections: coreResults.any((r) => r.error != null),
        goal: engagementResult?.goal,
        dailyChallenge: engagementResult?.dailyChallenge,
        engagementStats: engagementStatsResult,
        continueLearning: continueLearningResult,
        quickStartLesson: quickStartResult,
        recommendedCourse: recommendedCourseResult,
      ));
    } on AppException catch (e) {
      setFailure(message: e.message, code: e.code);
    } catch (e) {
      setFailure(
        message: e is Exception ? e.toString() : 'Failed to load home data',
        code: 'HOME_LOAD_FAILED',
      );
    }
  }

  /// Awaits [future] and captures its outcome instead of throwing, so the
  /// other sections can still render. The future is already running, so
  /// awaiting the results one after another does not serialise the requests.
  static Future<({T? value, Object? error})> _settle<T>(Future<T> future) async {
    try {
      return (value: await future, error: null);
    } catch (e) {
      return (value: null, error: e);
    }
  }

  /// Reload home data (same as [load] — alias for clarity in UI).
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) =>
      load(bearerToken: bearerToken, studentId: studentId);

  /// Clear the home state (e.g. on sign-out).
  void clear() => reset();
}
