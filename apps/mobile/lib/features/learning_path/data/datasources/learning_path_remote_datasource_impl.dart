// Phase 6 — P6-065
// LearningPathRemoteDatasourceImpl — concrete implementation.
//
// Scope: Learning path screen only.
//
// Security rules:
// - studentId passed as URL path parameter; never constructed from user input.
//   It must come from authContextProvider (JWT-resolved by backend).
// - Bearer token injected from provider layer; never stored here.
// - All AIM values parsed verbatim from response — no local computation.
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
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['skillStates'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(LearningPathSkillStateModel.fromJson)
            .toList();
      },
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
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['weaknessRecords'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(LearningPathWeaknessRecordModel.fromJson)
            .toList();
      },
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
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['recommendations'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(LearningPathRecommendationModel.fromJson)
            .toList();
      },
    );
    return envelope.data ?? const [];
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
