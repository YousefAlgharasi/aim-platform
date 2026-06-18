// Phase 6 — P6-096
// AimResultsRepositoryImpl — data-layer implementation.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/aim_results/data/datasources/aim_results_remote_datasource.dart';
import 'package:aim_mobile/features/aim_results/data/models/aim_results_models.dart';
import 'package:aim_mobile/features/aim_results/logic/repository/aim_results_repository.dart';

class AimResultsRepositoryImpl implements AimResultsRepository {
  const AimResultsRepositoryImpl({
    required AimResultsRemoteDatasource datasource,
  }) : _datasource = datasource;

  final AimResultsRemoteDatasource _datasource;

  @override
  Future<List<AimSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getSkillStates(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<AimWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getWeaknessRecords(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<AimRecommendationModel>> getRecommendations({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getRecommendations(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<AimReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getReviewSchedules(
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
