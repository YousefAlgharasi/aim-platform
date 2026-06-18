// Phase 6 — P6-066
// LearningPathRepositoryImpl — data-layer implementation of
// LearningPathRepository.
//
// Scope: Learning path screen only.
//
// Wraps LearningPathRemoteDatasource and maps ApiClientException to
// AppException so that the logic layer deals in domain errors only.
//
// Security rules:
// - All AIM values passed verbatim from datasource to logic layer.
// - No scoring, mastery, or AIM Engine logic here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/learning_path/data/datasources/learning_path_remote_datasource.dart';
import 'package:aim_mobile/features/learning_path/data/models/learning_path_models.dart';
import 'package:aim_mobile/features/learning_path/logic/repository/learning_path_repository.dart';

class LearningPathRepositoryImpl implements LearningPathRepository {
  const LearningPathRepositoryImpl({
    required LearningPathRemoteDatasource datasource,
  }) : _datasource = datasource;

  final LearningPathRemoteDatasource _datasource;

  @override
  Future<List<LearningPathSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getSkillStates(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<LearningPathWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getWeaknessRecords(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<LearningPathRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getRecommendations(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
