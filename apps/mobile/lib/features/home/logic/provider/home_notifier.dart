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
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart'
    show HomeEngagementSummary;
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/entity/home_data.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

class HomeNotifier extends AppStateNotifier<HomeData> {
  HomeNotifier({required HomeRepository repository})
      : _repository = repository;

  final HomeRepository _repository;

  /// Fetch all home screen data for [studentId] using [bearerToken].
  ///
  /// Runs the four backend calls in parallel for speed.
  /// Any failure marks the full state as [AppAsyncFailure].
  ///
  /// [studentId] must come from [authContextProvider] (JWT-resolved).
  /// Never pass a user-supplied value here.
  Future<void> load({
    required String bearerToken,
    required String studentId,
  }) async {
    setLoading();
    try {
      // Fetch all four data sets in parallel.
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

      final results = await Future.wait<Object>([
        skillStatesFuture,
        weaknessFuture,
        scheduleFuture,
        recommendFuture,
      ]);

      // Goal, daily challenge, continue-learning, quick-start lesson, and
      // recommended course are supplementary — a failure here must not take
      // down the whole home page.
      final engagementResult = await _repository
          .getEngagementSummary(bearerToken: bearerToken)
          .then<HomeEngagementSummary?>((value) => value)
          .catchError((_) => null);
      final continueLearningResult = await _repository
          .getContinueLearning(bearerToken: bearerToken)
          .catchError((_) => null);
      final quickStartResult = await _repository
          .getQuickStartLesson(bearerToken: bearerToken)
          .catchError((_) => null);
      final recommendedCourseResult = await _repository
          .getRecommendedCourse(bearerToken: bearerToken)
          .catchError((_) => null);

      setSuccess(HomeData(
        skillStates: results[0] as List<HomeSkillStateModel>,
        weaknessRecords: results[1] as List<HomeWeaknessRecordModel>,
        reviewSchedules: results[2] as List<HomeReviewScheduleModel>,
        recommendations: results[3] as List<HomeRecommendationModel>,
        goal: engagementResult?.goal,
        dailyChallenge: engagementResult?.dailyChallenge,
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

  /// Reload home data (same as [load] — alias for clarity in UI).
  Future<void> refresh({
    required String bearerToken,
    required String studentId,
  }) =>
      load(bearerToken: bearerToken, studentId: studentId);

  /// Clear the home state (e.g. on sign-out).
  void clear() => reset();
}
