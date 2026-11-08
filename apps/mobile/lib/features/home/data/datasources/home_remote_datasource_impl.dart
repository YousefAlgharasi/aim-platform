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

import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'home_remote_datasource.dart';

class HomeRemoteDatasourceImpl implements HomeRemoteDatasource {
  HomeRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  /// Set once the backend answers 404 for `GET /student/home` (an older
  /// backend without the aggregate), so the separate endpoints are used
  /// without retrying the aggregate on every section.
  bool _aggregateUnavailable = false;

  // ── Aggregated Home (GET /student/home) ──────────────────────────────────
  //
  // One request carries every Home section. All section getters below read
  // from it; because identical in-flight GETs are merged and responses are
  // cached by the API client, the nine getters issue a single request. When
  // the backend predates the endpoint the separate endpoints are used instead.

  Future<Map<String, dynamic>?> _aggregate(String bearerToken) async {
    if (_aggregateUnavailable) return null;
    try {
      final envelope = await _apiClient.get<Map<String, dynamic>>(
        BackendApiPaths.studentHome,
        headers: _auth(bearerToken),
        decodeData: _requireMap,
      );
      return envelope.data;
    } on ApiClientException catch (e) {
      if (e.statusCode == 404) {
        _aggregateUnavailable = true;
        return null;
      }
      rethrow;
    }
  }

  /// The section [key] of the aggregate. A section the backend could not load
  /// is reported as failed (not as empty) so callers can degrade just that
  /// section.
  Object? _section(Map<String, dynamic> home, String key) {
    final failed = home['failedSections'];
    if (failed is List && failed.contains(key)) {
      throw ApiClientException(
        code: 'HOME_SECTION_FAILED',
        message: 'Home section "$key" could not be loaded.',
      );
    }
    return home[key];
  }

  List<T> _list<T>(
    Map<String, dynamic> home,
    String key,
    String listKey,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final section = _section(home, key);
    final items = section is Map<String, dynamic> ? section[listKey] : null;
    if (items is! List) return const [];
    return items.whereType<Map<String, dynamic>>().map(fromJson).toList();
  }

  T? _object<T>(
    Map<String, dynamic> home,
    String key,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final section = _section(home, key);
    return section is Map<String, dynamic> ? fromJson(section) : null;
  }

  @override
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) {
      return _legacySkillStates(bearerToken: bearerToken, studentId: studentId);
    }
    return _list(home, 'skillStates', 'skillStates', HomeSkillStateModel.fromJson);
  }

  @override
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) {
      return _legacyWeaknessRecords(
          bearerToken: bearerToken, studentId: studentId);
    }
    return _list(home, 'weaknessRecords', 'weaknessRecords',
        HomeWeaknessRecordModel.fromJson);
  }

  @override
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) {
      return _legacyReviewSchedules(
          bearerToken: bearerToken, studentId: studentId);
    }
    return _list(home, 'reviewSchedules', 'reviewSchedules',
        HomeReviewScheduleModel.fromJson);
  }

  @override
  Future<List<HomeRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) {
      return _legacyRecommendations(
          bearerToken: bearerToken, studentId: studentId);
    }
    return _list(home, 'recommendations', 'recommendations',
        HomeRecommendationModel.fromJson);
  }

  @override
  Future<HomeEngagementSummaryModel> getEngagementSummary({
    required String bearerToken,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) return _legacyEngagementSummary(bearerToken: bearerToken);
    return _object(home, 'engagementSummary', _summaryFrom) ?? _defaultSummary;
  }

  @override
  Future<HomeEngagementStatsModel?> getEngagementStats({
    required String bearerToken,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) return _legacyEngagementStats(bearerToken: bearerToken);
    return _object(home, 'engagementStats', HomeEngagementStatsModel.fromJson);
  }

  @override
  Future<HomeContinueLearningModel?> getContinueLearning({
    required String bearerToken,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) return _legacyContinueLearning(bearerToken: bearerToken);
    return _object(home, 'continueLearning', HomeContinueLearningModel.fromJson);
  }

  @override
  Future<HomeQuickStartLessonModel?> getQuickStartLesson({
    required String bearerToken,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) return _legacyQuickStartLesson(bearerToken: bearerToken);
    return _object(home, 'quickStart', HomeQuickStartLessonModel.fromJson);
  }

  @override
  Future<HomeRecommendedCourseModel?> getRecommendedCourse({
    required String bearerToken,
  }) async {
    final home = await _aggregate(bearerToken);
    if (home == null) {
      return _legacyRecommendedCourse(bearerToken: bearerToken);
    }
    return _object(
        home, 'recommendedCourse', HomeRecommendedCourseModel.fromJson);
  }

  static const HomeEngagementGoalModel _defaultGoal = HomeEngagementGoalModel(
    targetLessons: 1,
    completedToday: 0,
    streakDays: 0,
  );

  static const HomeEngagementSummaryModel _defaultSummary =
      HomeEngagementSummaryModel(goal: _defaultGoal);

  static HomeEngagementSummaryModel _summaryFrom(Map<String, dynamic> data) {
    final goalJson = data['goal'] as Map<String, dynamic>?;
    final challengeJson = data['challenge'] as Map<String, dynamic>?;
    return HomeEngagementSummaryModel(
      goal: goalJson != null
          ? HomeEngagementGoalModel.fromJson(goalJson)
          : _defaultGoal,
      dailyChallenge: challengeJson != null
          ? HomeDailyChallengeModel.fromJson(challengeJson)
          : null,
    );
  }

  Future<List<HomeSkillStateModel>> _legacySkillStates({
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

  Future<List<HomeWeaknessRecordModel>> _legacyWeaknessRecords({
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

  Future<List<HomeReviewScheduleModel>> _legacyReviewSchedules({
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

  Future<List<HomeRecommendationModel>> _legacyRecommendations({
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

  Future<HomeEngagementSummaryModel> _legacyEngagementSummary({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeEngagementSummaryModel>(
      BackendApiPaths.engagementSummary,
      headers: _auth(bearerToken),
      decodeData: (json) {
        final data = _requireMap(json);
        final goalJson = data['goal'] as Map<String, dynamic>?;
        final challengeJson = data['challenge'] as Map<String, dynamic>?;
        return HomeEngagementSummaryModel(
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
        const HomeEngagementSummaryModel(
          goal: HomeEngagementGoalModel(
            targetLessons: 1,
            completedToday: 0,
            streakDays: 0,
          ),
        );
  }

  Future<HomeEngagementStatsModel?> _legacyEngagementStats({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<HomeEngagementStatsModel>(
      BackendApiPaths.engagementStats,
      headers: _auth(bearerToken),
      decodeData: (json) => HomeEngagementStatsModel.fromJson(_requireMap(json)),
    );
    return envelope.data;
  }

  Future<HomeContinueLearningModel?> _legacyContinueLearning({
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

  Future<HomeQuickStartLessonModel?> _legacyQuickStartLesson({
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

  Future<HomeRecommendedCourseModel?> _legacyRecommendedCourse({
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
