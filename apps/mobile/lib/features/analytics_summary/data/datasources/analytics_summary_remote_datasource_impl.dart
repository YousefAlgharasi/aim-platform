// Phase 15 — P15-072
// AnalyticsSummaryRemoteDatasourceImpl — concrete implementation.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import '../models/analytics_summary_report_model.dart';
import 'analytics_summary_remote_datasource.dart';

class AnalyticsSummaryRemoteDatasourceImpl
    implements AnalyticsSummaryRemoteDatasource {
  const AnalyticsSummaryRemoteDatasourceImpl({
    required BackendApiClient apiClient,
  }) : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<AnalyticsSummaryReportModel>>(
      BackendApiPaths.studentAnalyticsSummary,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) {
        final items = json as List<dynamic>? ?? [];
        return items
            .whereType<Map<String, dynamic>>()
            .map(AnalyticsSummaryReportModel.fromJson)
            .toList();
      },
    );
    return envelope.data!;
  }
}
