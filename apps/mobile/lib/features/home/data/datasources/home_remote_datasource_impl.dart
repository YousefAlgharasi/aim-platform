// Phase 6 — P6-060
// HomeRemoteDatasourceImpl — concrete implementation.
//
// Scope: Home screen only.
//
// Security rules:
// - studentId passed as URL path parameter; never constructed from user input.
//   It must come from authContextProvider (JWT-resolved by backend).
// - Bearer token injected from provider layer; never stored here.
// - All AIM values (masteryLevel, band, severity, priority, action, reason)
//   parsed verbatim from response — no local computation.
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
      decodeData: (json) => _decodeList(
        json,
        HomeSkillStateModel.fromJson,
      ),
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
      decodeData: (json) => _decodeList(
        json,
        HomeWeaknessRecordModel.fromJson,
      ),
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
      decodeData: (json) => _decodeList(
        json,
        HomeReviewScheduleModel.fromJson,
      ),
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
      decodeData: (json) => _decodeList(
        json,
        HomeRecommendationModel.fromJson,
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
