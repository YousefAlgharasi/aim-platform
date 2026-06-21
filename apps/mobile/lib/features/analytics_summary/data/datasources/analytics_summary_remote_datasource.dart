// Phase 15 — P15-072
// AnalyticsSummaryRemoteDatasource — abstract interface (data layer).

import '../models/analytics_summary_report_model.dart';

abstract class AnalyticsSummaryRemoteDatasource {
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  });
}
