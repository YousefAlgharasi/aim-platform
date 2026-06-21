// Phase 6 — P6-077
// LessonDetailRemoteDatasourceImpl — concrete implementation.
//
// Scope: Lesson detail screen only.
//
// Security rules:
// - lessonId comes from a prior backend LessonModel response; never from
//   user input or local computation.
// - Bearer token injected from provider layer; never stored here.
// - All asset values (type, status, order, url) parsed verbatim —
//   no local computation.
// - status=published query param ensures only published assets are fetched;
//   Flutter never filters or alters the backend-returned asset list.
// - No AIM Engine runtime, AI provider URLs, or secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/lessons/data/models/lessons_models.dart';
import 'lesson_detail_remote_datasource.dart';

class LessonDetailRemoteDatasourceImpl implements LessonDetailRemoteDatasource {
  const LessonDetailRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<LessonModel> getLessonDetail({
    required String bearerToken,
    required String lessonId,
  }) async {
    final envelope = await _apiClient.get<LessonModel>(
      BackendApiPaths.curriculumLessonDetail(lessonId),
      headers: _auth(bearerToken),
      decodeData: (json) {
        if (json is! Map<String, dynamic>) {
          throw const FormatException('Unexpected lesson detail response shape');
        }
        return LessonModel.fromJson(json);
      },
    );
    // envelope.data is non-null on success; FormatException propagates on bad shape
    return envelope.data!;
  }

  @override
  Future<List<LessonAssetModel>> getLessonAssets({
    required String bearerToken,
    required String lessonId,
  }) async {
    final envelope = await _apiClient.get<List<LessonAssetModel>>(
      BackendApiPaths.curriculumLessonAssets,
      queryParameters: {
        'lessonId': lessonId,
        'status': 'published',
      },
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeAssetList(json),
    );
    return envelope.data ?? const [];
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  List<LessonAssetModel> _decodeAssetList(Object? json) {
    if (json is! Map<String, dynamic>) return const [];
    final list = json['assets'];
    if (list is! List<dynamic>) return const [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(LessonAssetModel.fromJson)
        .toList();
  }
}
