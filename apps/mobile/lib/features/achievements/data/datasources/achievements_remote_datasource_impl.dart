// Phase 13 — TASK-13
// AchievementsRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/achievements/data/models/achievement_model.dart';
import 'achievements_remote_datasource.dart';

class AchievementsRemoteDatasourceImpl implements AchievementsRemoteDatasource {
  const AchievementsRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<AchievementModel>> getAchievements({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<AchievementModel>>(
      BackendApiPaths.achievements,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final data = _requireMap(json);
        final items = data['achievements'] as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AchievementModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected achievements response shape');
    }
    return json;
  }
}
