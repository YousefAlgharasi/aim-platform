/// Domain entity for a placement test (student-safe fields only).
///
/// All fields are backend-controlled. Flutter must not mutate or infer
/// test availability from local state — it must call GET /placement/active.
///
/// Scope: Phase 4 — Placement Test only.
class PlacementTest {
  const PlacementTest({
    required this.id,
    required this.title,
    required this.status,
    required this.totalSections,
    required this.estimatedMinutes,
  });

  /// Backend-generated UUID.
  final String id;

  /// Display title of the placement test.
  final String title;

  /// Always "published" for students (they cannot see drafts).
  final String status;

  /// Computed by backend from linked sections — never set by Flutter.
  final int totalSections;

  /// Estimated completion time in minutes.
  final int estimatedMinutes;

  bool get isPublished => status == 'published';
}
