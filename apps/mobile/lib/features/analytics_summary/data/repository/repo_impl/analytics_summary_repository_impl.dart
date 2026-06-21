// Phase 15 — P15-072
// AnalyticsSummaryRepositoryImpl — data-layer implementation.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/analytics_summary/data/datasources/analytics_summary_remote_datasource.dart';
import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';
import 'package:aim_mobile/features/analytics_summary/logic/repository/analytics_summary_repository.dart';

class AnalyticsSummaryRepositoryImpl implements AnalyticsSummaryRepository {
  const AnalyticsSummaryRepositoryImpl({
    required AnalyticsSummaryRemoteDatasource datasource,
  }) : _datasource = datasource;

  final AnalyticsSummaryRemoteDatasource _datasource;

  @override
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.getSummary(bearerToken: bearerToken));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
