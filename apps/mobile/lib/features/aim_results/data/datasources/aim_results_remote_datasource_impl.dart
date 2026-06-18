// Phase 6 — P6-095
// AimResultsRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'aim_results_remote_datasource.dart';

class AimResultsRemoteDatasourceImpl implements AimResultsRemoteDatasource {
  const AimResultsRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<AimSkillStateModel>>(
      BackendApiPaths.aimSkillStates(studentId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['skillStates'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AimSkillStateModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }

  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<AimWeaknessRecordModel>>(
      BackendApiPaths.aimWeaknessRecords(studentId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['weaknessRecords'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AimWeaknessRecordModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }

  @override
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<AimRecommendationModel>>(
      BackendApiPaths.aimRecommendations(studentId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['recommendations'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AimRecommendationModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }

  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) async {
    final envelope = await _apiClient.get<List<AimReviewScheduleModel>>(
      BackendApiPaths.aimReviewSchedules(studentId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['reviewSchedules'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AimReviewScheduleModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected AIM result response shape');
    }
    return json;
  }
}
