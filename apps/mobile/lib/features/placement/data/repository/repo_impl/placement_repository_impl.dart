// Phase 4 — P4-064
// PlacementRepositoryImpl — concrete implementation (data layer).
//
// Scope: Placement Test phase only.
//
// Responsibility:
//   Bridge the datasource layer to the logic layer. Catches ApiClientException
//   and re-throws as AppException so the UI and providers deal with a single
//   error type — consistent with AuthRepositoryImpl and ProfileRepositoryImpl.
//
// Security rules:
// - Flutter never calculates placement scores, CEFR levels, mastery, or weakness maps.
// - Bearer token is injected from the provider layer; never stored in this class.
// - No AIM Engine runtime, AI Teacher, lesson delivery, or progress dashboard logic.
// - No secrets, service-role keys, database credentials, or privileged config here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/placement/data/datasources/placement_remote_datasource.dart';
import 'package:aim_mobile/features/placement/data/models/placement_models.dart';
import 'package:aim_mobile/features/placement/logic/entity/placement_submit_answer_payload.dart';
import 'package:aim_mobile/features/placement/logic/repository/placement_repository.dart';

class PlacementRepositoryImpl implements PlacementRepository {
  const PlacementRepositoryImpl({required PlacementRemoteDatasource datasource})
      : _datasource = datasource;

  final PlacementRemoteDatasource _datasource;

  @override
  Future<PlacementTestModel> getActivePlacementTest(String bearerToken) async {
    try {
      return await _datasource.getActivePlacementTest(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<List<PlacementSectionModel>> getActiveSections(
      String bearerToken) async {
    try {
      return await _datasource.getActiveSections(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<List<PlacementQuestionModel>> getQuestionsForSection(
    String bearerToken, {
    required String sectionId,
  }) async {
    try {
      return await _datasource.getQuestionsForSection(
        bearerToken,
        sectionId: sectionId,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<PlacementAttemptModel> startAttempt(
    String bearerToken, {
    required String placementTestId,
  }) async {
    try {
      return await _datasource.startAttempt(
        bearerToken,
        placementTestId: placementTestId,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<PlacementAnswerModel> submitAnswer(
    String bearerToken, {
    required String attemptId,
    required PlacementSubmitAnswerPayload payload,
  }) async {
    try {
      return await _datasource.submitAnswer(
        bearerToken,
        attemptId: attemptId,
        payload: payload,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<PlacementAttemptModel> completeAttempt(
    String bearerToken, {
    required String attemptId,
  }) async {
    try {
      return await _datasource.completeAttempt(
        bearerToken,
        attemptId: attemptId,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<PlacementResultModel> getResult(
    String bearerToken, {
    required String attemptId,
  }) async {
    try {
      return await _datasource.getResult(
        bearerToken,
        attemptId: attemptId,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<List<int>> getQuestionAudio(
    String bearerToken, {
    required String questionId,
  }) async {
    try {
      return await _datasource.getQuestionAudio(
        bearerToken,
        questionId: questionId,
      );
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }

  @override
  Future<PlacementLatestStatusModel> getLatestStatus(
    String bearerToken,
  ) async {
    try {
      return await _datasource.getLatestStatus(bearerToken);
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
