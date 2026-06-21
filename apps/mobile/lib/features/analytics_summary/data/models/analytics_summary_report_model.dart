// Phase 15 — P15-072
// AnalyticsSummaryReportModel — data-layer model for AnalyticsSummaryReport.
//
// Parses report definitions returned by GET /student/analytics/summary.

import '../../logic/entity/analytics_summary_report.dart';

class AnalyticsSummaryReportModel extends AnalyticsSummaryReport {
  const AnalyticsSummaryReportModel({
    required super.key,
    required super.name,
    required super.category,
    super.description,
  });

  factory AnalyticsSummaryReportModel.fromJson(Map<String, dynamic> json) {
    return AnalyticsSummaryReportModel(
      key: json['key'] as String,
      name: json['name'] as String,
      category: json['category'] as String,
      description: json['description'] as String?,
    );
  }
}
