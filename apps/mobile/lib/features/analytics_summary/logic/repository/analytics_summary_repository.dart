// Phase 15 — P15-072
// AnalyticsSummaryRepository — abstract interface (logic layer).
//
// Read-only. Flutter NEVER computes report content; these are
// backend-approved report definitions surfaced verbatim.

import 'package:aim_mobile/features/analytics_summary/data/models/analytics_summary_report_model.dart';

abstract class AnalyticsSummaryRepository {
  Future<List<AnalyticsSummaryReportModel>> getSummary({
    required String bearerToken,
  });
}
