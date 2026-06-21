// Phase 6 — P6-065
// LearningPathRemoteDatasourceImpl — concrete implementation.
//
// Scope: Learning path screen only.
//
// Security rules:
// - studentId passed as URL path parameter; never constructed from user input.
//   It must come from authContextProvider (JWT-resolved by backend).
// - Bearer token injected from provider layer; never stored here.
// - All AIM values (band, masteryLevel, coveragePercent, severity,
//   recommendedFocus, action, reason) parsed verbatim from response —
//   no local computation.
// - No AIM Engine runtime, AI provider URLs, or secrets here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'learning_path_remote_datasource.dart';

class LearningPathRemoteDatasourceImpl
    implements LearningPathRemoteDatasource {
  const LearningPathRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<LearningPathSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope =
        await _apiClient.get<List<LearningPathSkillStateModel>>(
      BackendApiPaths.aimSkillStates(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeList(
        json,
        LearningPathSkillStateModel.fromJson,
      ),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<LearningPathWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope =
        await _apiClient.get<List<LearningPathWeaknessRecordModel>>(
      BackendApiPaths.aimWeaknessRecords(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeList(
        json,
        LearningPathWeaknessRecordModel.fromJson,
      ),
    );
    return envelope.data ?? const [];
  }

  @override
  Future<List<LearningPathRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope =
        await _apiClient.get<List<LearningPathRecommendationModel>>(
      BackendApiPaths.aimRecommendations(studentId),
      headers: _auth(bearerToken),
      decodeData: (json) => _decodeList(
        json,
        LearningPathRecommendationModel.fromJson,
      ),
    );
    return envelope.data ?? const [];
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  Map<String, String> _auth(String bearerToken) =>
      {'authorization': 'Bearer $bearerToken'};

  List<T> _decodeList<T>(
    Object? json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    if (json is! List<dynamic>) return const [];
    return json
        .whereType<Map<String, dynamic>>()
        .map(fromJson)
        .toList();
  }
}
