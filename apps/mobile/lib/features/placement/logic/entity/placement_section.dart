/// Domain entity for a placement test section (student-safe fields only).
///
/// Scope: Phase 4 — Placement Test only.
/// skill_code is one of: grammar, vocabulary, reading, listening.
class PlacementSection {
  const PlacementSection({
    required this.id,
    required this.title,
    required this.skillCode,
    required this.orderIndex,
    required this.totalQuestions,
  });

  /// Backend-generated UUID.
  final String id;

  /// Display title (e.g. "Grammar", "Vocabulary").
  final String title;

  /// One of: grammar, vocabulary, reading, listening.
  final String skillCode;

  /// Display order within the test (1-based, unique per test).
  final int orderIndex;

  /// Computed by backend from linked questions — never set by Flutter.
  final int totalQuestions;
}
