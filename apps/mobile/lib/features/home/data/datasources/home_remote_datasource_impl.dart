// Phase 6 — P6-060
// HomeRemoteDatasourceImpl — concrete implementation.
//
// Scope: Home screen only.
//
// Security rules:
// - studentId passed as URL path parameter; never constructed from user input.
//   It must come from authContextProvider (JWT-resolved by backend).
// - Bearer token injected from provider layer; never stored here.
// - All AIM values parsed verbatim from response — no local computation.
// - No AIM Engine runtime, AI provider URLs, or secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'home_remote_datasource.dart';

class HomeRemoteDatasourceImpl implements HomeRemoteDatasource {
  const HomeRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<HomeSkillStateModel>>(
      BackendApiPaths.aimSkillStates(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['skillStates'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(HomeSkillStateModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<HomeWeaknessRecordModel>>(
      BackendApiPaths.aimWeaknessRecords(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['weaknessRecords'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(HomeWeaknessRecordModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<HomeReviewScheduleModel>>(
      BackendApiPaths.aimReviewSchedules(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['reviewSchedules'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(HomeReviewScheduleModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<HomeRecommendationModel>>(
      BackendApiPaths.aimRecommendations(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['recommendations'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(HomeRecommendationModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
  }

  @override
  Future<HomeEngagementSummary> getEngagementSummary({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeEngagementSummary>(
      BackendApiPaths.engagementSummary,
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final goalJson = data['goal'] as Map<String, dynamic>?;
        final challengeJson = data['challenge'] as Map<String, dynamic>?;
        return HomeEngagementSummary(
          goal: goalJson != null
              ? HomeEngagementGoalModel.fromJson(goalJson)
              : const HomeEngagementGoalModel(
                  targetLessons: 1,
                  completedToday: 0,
                  streakDays: 0,
                ),
          dailyChallenge: challengeJson != null
              ? HomeDailyChallengeModel.fromJson(challengeJson)
              : null,
        );
      },
    );
    return envelope.data ??
        const HomeEngagementSummary(
          goal: HomeEngagementGoalModel(
            targetLessons: 1,
            completedToday: 0,
            streakDays: 0,
          ),
        );
  }

  @override
  Future<HomeContinueLearningModel?> getContinueLearning({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeContinueLearningModel?>(
      BackendApiPaths.lessonsContinue,
      headers: _auth(bearerToken),
      decodeData: (json) {
        if (json == null) {
          return null;
        }
        return HomeContinueLearningModel.fromJson(
          json as Map<String, dynamic>,
        );
      },
    );
    return envelope.data;
  }

  @override
  Future<HomeQuickStartLessonModel?> getQuickStartLesson({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeQuickStartLessonModel?>(
      BackendApiPaths.lessonsQuickStart,
      headers: _auth(bearerToken),
      decodeData: (json) {
        if (json == null) return null;
        return HomeQuickStartLessonModel.fromJson(json as Map<String, dynamic>);
      },
    );
    return envelope.data;
  }

  @override
  Future<HomeRecommendedCourseModel?> getRecommendedCourse({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeRecommendedCourseModel?>(
      BackendApiPaths.lessonsRecommendedCourse,
      headers: _auth(bearerToken),
      decodeData: (json) {
        if (json == null) return null;
        return HomeRecommendedCourseModel.fromJson(json as Map<String, dynamic>);
      },
    );
    return envelope.data;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected AIM result response shape');
    }
    return json;
  }
}
