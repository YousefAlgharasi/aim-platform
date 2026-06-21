// Phase 15 — P15-072
// AnalyticsSummaryReport — entity for a backend-approved report definition
// visible to the authenticated student. Flutter never computes report
// content, mastery, or progress figures — these are backend outputs
// surfaced verbatim from GET /student/analytics/summary.

class AnalyticsSummaryReport {
  const AnalyticsSummaryReport({
    required this.key,
    required this.name,
    required this.category,
    this.description,
  });

  final String key;
  final String name;
  final String category;
  final String? description;
}
