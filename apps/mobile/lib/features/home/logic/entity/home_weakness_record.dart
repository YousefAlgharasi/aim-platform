// Phase 6 — P6-059
// HomeWeaknessRecord — domain entity for a student's weakness strip entry.
//
// [severity] is backend-computed. Flutter must never compute or infer it.

/// Domain entity representing a single weakness-record entry
/// returned by GET /aim/students/:studentId/weakness-records.
///
/// Backend is the sole authority for [severity].
class HomeWeaknessRecord {
  const HomeWeaknessRecord({
    required this.topic,
    required this.severity,
    required this.lastUpdated,
  });

  /// Subject / curriculum topic identifier.
  final String topic;

  /// AIM weakness severity (e.g. "high", "medium", "low"). Backend-computed.
  final String severity;

  /// ISO-8601 timestamp of the last weakness update. Backend-supplied.
  final String lastUpdated;
}
