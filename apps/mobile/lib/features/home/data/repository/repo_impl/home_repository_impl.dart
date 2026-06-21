// Phase 6 — P6-057
// HomeRepositoryImpl — data-layer implementation of HomeRepository.
//
// Scope: Home screen only.
//
// Wraps HomeRemoteDatasource and maps ApiClientException to AppException
// so that the logic layer deals in domain errors only.
//
// Security rules:
// - All AIM values passed verbatim from datasource to logic layer.
// - No scoring, mastery, or AIM Engine logic here.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/home/data/datasources/home_remote_datasource.dart';
import 'package:aim_mobile/features/home/data/models/home_models.dart';
import 'package:aim_mobile/features/home/logic/repository/home_repository.dart';

class HomeRepositoryImpl implements HomeRepository {
  const HomeRepositoryImpl({required HomeRemoteDatasource datasource})
      : _datasource = datasource;

  final HomeRemoteDatasource _datasource;

  @override
  Future<List<HomeSkillStateModel>> getSkillStates({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getSkillStates(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeWeaknessRecordModel>> getWeaknessRecords({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getWeaknessRecords(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeReviewScheduleModel>> getReviewSchedules({
    required String bearerToken,
    required String studentId,
  }) =>
      _wrap(() => _datasource.getReviewSchedules(
            bearerToken: bearerToken,
            studentId: studentId,
          ));

  @override
  Future<List<HomeRecommendationModel>> getRecommendations({
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
