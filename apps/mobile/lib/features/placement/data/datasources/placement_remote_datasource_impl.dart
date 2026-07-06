// Phase 4 — P4-063
// PlacementRemoteDatasourceImpl — concrete implementation.
//
// Scope: Placement Test phase only.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - Bearer token is injected from the provider layer — never stored in this class.
// - is_correct and skill_code are never sent or received in student-facing payloads.
// - student_id always resolved from JWT on the backend — never included in request body.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'placement_remote_datasource.dart';

class PlacementRemoteDatasourceImpl implements PlacementRemoteDatasource {
  const PlacementRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  // ---------------------------------------------------------------------------
  // Endpoint #1 — GET /placement/active
  // ---------------------------------------------------------------------------

  @override
  Future<PlacementTestModel> getActivePlacementTest(String bearerToken) async {
    final envelope = await _apiClient.get<PlacementTestModel>(
      BackendApiPaths.placementActive,
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          PlacementTestModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #2 — GET /placement/active/sections
  // ---------------------------------------------------------------------------

  @override
  Future<List<PlacementSectionModel>> getActiveSections(
      String bearerToken) async {
    final envelope = await _apiClient.get<List<PlacementSectionModel>>(
      BackendApiPaths.placementActiveSections,
      headers: _authHeaders(bearerToken),
      decodeData: (json) {
        final list = json as List<dynamic>;
        return list
            .map((item) =>
                PlacementSectionModel.fromJson(item as Map<String, dynamic>))
            .toList();
      },
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #3 — GET /placement/questions?sectionId=:id
  // correct_answer is never included in the response (backend strips it).
  // ---------------------------------------------------------------------------

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  }) async {
    final envelope = await _apiClient.get<List<PlacementQuestionModel>>(
      BackendApiPaths.placementQuestions,
      headers: _authHeaders(bearerToken),
      queryParameters: {'sectionId': sectionId},
      decodeData: (json) {
        final list = json as List<dynamic>;
        return list
            .map((item) =>
                PlacementQuestionModel.fromJson(item as Map<String, dynamic>))
            .toList();
      },
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #4 — POST /placement/attempts
  // student_id is resolved from JWT on the backend — Flutter never sends it.
  // ---------------------------------------------------------------------------

  @override
  Future<PlacementAttemptModel> startAttempt(
    String bearerToken, {
    required String placementTestId,
  }) async {
    final envelope = await _apiClient.post<PlacementAttemptModel>(
      BackendApiPaths.placementAttempts,
      headers: _authHeaders(bearerToken),
      body: {'placement_test_id': placementTestId},
      decodeData: (json) =>
          PlacementAttemptModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #5 — POST /placement/attempts/:id/answers
  // is_correct is never evaluated or returned at this stage.
  // Only placementAttemptId, placementQuestionId, answerValue are sent.
  // ---------------------------------------------------------------------------

  @override
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  }) async {
    final envelope = await _apiClient.post<PlacementAnswerModel>(
      BackendApiPaths.placementAttemptAnswers(attemptId),
      headers: _authHeaders(bearerToken),
      body: payload.toJson(),
      decodeData: (json) =>
          PlacementAnswerModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #6 — POST /placement/attempts/:id/complete
  // Transitions attempt active → submitted. Scoring is server-side only.
  // ---------------------------------------------------------------------------

  @override
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async {
    final envelope = await _apiClient.post<PlacementAttemptModel>(
      BackendApiPaths.placementAttemptComplete(attemptId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          PlacementAttemptModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // Endpoint #7 — GET /placement/attempts/:id/result
  // Only available after attempt status = completed.
  // estimatedLevel and skillSummary are backend-computed — Flutter displays as-is.
  // Flutter never recalculates CEFR level, mastery scores, or weakness maps.
  // ---------------------------------------------------------------------------

  @override
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  }) async {
    final envelope = await _apiClient.get<PlacementResultModel>(
      BackendApiPaths.placementAttemptResult(attemptId),
      headers: _authHeaders(bearerToken),
      decodeData: (json) =>
          PlacementResultModel.fromJson(json as Map<String, dynamic>),
    );
    return envelope.data!;
  }

  // ---------------------------------------------------------------------------
  // GET /placement/questions/:id/audio
  // Returns an empty list on 204 (no listening_script authored yet) — not an
  // error; getBytes only throws for a genuine non-2xx status.
  // ---------------------------------------------------------------------------

  @override
  Future<List<int>> getQuestionAudio(
    String bearerToken, {
    required String questionId,
  }) {
    return _apiClient.getBytes(
      BackendApiPaths.placementQuestionAudio(questionId),
      headers: _authHeaders(bearerToken),
    );
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  Map<String, String> _authHeaders(String bearerToken) {
    return {'authorization': 'Bearer $bearerToken'};
  }
}
