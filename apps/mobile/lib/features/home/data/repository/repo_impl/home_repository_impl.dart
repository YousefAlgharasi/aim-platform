// Phase 6 — P6-057
// HomeRepositoryImpl — data-layer implementation of HomeRepository.
//
// Scope: Home screen only.
//
// Wraps HomeRemoteDatasource and maps ApiClientException to AppException
// so that the logic layer deals in domain errors only.
//
// Security rules:
// - All AIM values passed verbatim from datasource to logic layer.
// - No scoring, mastery, or AIM Engine logic here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/entity/home_engagement.dart';
import 'package:aim_mobile/features/home/logic/entity/home_skill_state.dart';
import 'package:aim_mobile/features/home/logic/entity/home_weakness_record.dart';
import 'package:aim_mobile/features/home/logic/entity/home_review_schedule.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommendation.dart';
import 'package:aim_mobile/features/home/logic/entity/home_continue_learning.dart';
import 'package:aim_mobile/features/home/logic/entity/home_quick_start_lesson.dart';
import 'package:aim_mobile/features/home/logic/entity/home_recommended_course.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

class HomeRepositoryImpl implements HomeRepository {
  const HomeRepositoryImpl({required HomeRemoteDatasource datasource})
      : _datasource = datasource;

  final HomeRemoteDatasource _datasource;

  @override
  Future<List<HomeSkillState>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getSkillStates(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeWeaknessRecord>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getWeaknessRecords(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeReviewSchedule>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getReviewSchedules(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeRecommendation>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getRecommendations(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<HomeEngagementSummary> getEngagementSummary({
    required String bearerToken,
  }) async {
    final dsSummary =
        await _wrap(() => _datasource.getEngagementSummary(bearerToken: bearerToken));
    return HomeEngagementSummary(
      goal: dsSummary.goal,
      dailyChallenge: dsSummary.dailyChallenge,
    );
  }

  @override
  Future<HomeEngagementStatsModel?> getEngagementStats({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getEngagementStats(bearerToken: bearerToken));

  @override
  Future<HomeContinueLearningModel?> getContinueLearning({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getContinueLearning(bearerToken: bearerToken));

  @override
  Future<HomeQuickStartLessonModel?> getQuickStartLesson({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getQuickStartLesson(bearerToken: bearerToken));

  @override
  Future<HomeRecommendedCourseModel?> getRecommendedCourse({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getRecommendedCourse(bearerToken: bearerToken));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
