// Phase 6 — P6-071
// LessonsRemoteDatasourceImpl — concrete implementation.
//
// Scope: Lessons / curriculum browser only.
//
// Security rules:
// - levelId and chapterId come from prior backend responses; never from
//   user input or local computation.
// - Bearer token injected from provider layer; never stored here.
// - All curriculum values (status, sortOrder, hierarchy IDs) parsed verbatim
//   from response — no local computation.
// - No AIM Engine runtime, AI provider URLs, or secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'lessons_remote_datasource.dart';

class LessonsRemoteDatasourceImpl implements LessonsRemoteDatasource {
  const LessonsRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<CourseModel>> getCourses({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<CourseModel>>(
      BackendApiPaths.curriculumCourses,
      queryParameters: const {'status': 'published'},
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeListFromKey(json, 'courses', CourseModel.fromJson),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<ChapterModel>> getChapters({
    required String bearerToken,
    required String levelId,
  }) async {
    final envelope = await _apiClient.get<List<ChapterModel>>(
      BackendApiPaths.curriculumChapters,
      queryParameters: {'levelId': levelId},
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeListFromKey(json, 'chapters', ChapterModel.fromJson),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<LessonModel>> getLessons({
    required String bearerToken,
    required String chapterId,
  }) async {
    final envelope = await _apiClient.get<List<LessonModel>>(
      BackendApiPaths.curriculumLessons,
      queryParameters: {'chapterId': chapterId},
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeListFromKey(json, 'lessons', LessonModel.fromJson),
    );
    return envelope.data ?? const [];
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  /// Extracts a typed list from a paginated envelope using [key]
  /// (e.g. 'courses', 'chapters', 'lessons').
  List<T> _decodeListFromKey<T>(
    Object? json,
    String key,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json is! Map<String, dynamic>) return const [];
    final list = json[key];
    if (list is! List<dynamic>) return const [];
    return list.whereType<Map<String, dynamic>>().map(fromJson).toList();
  }
}
