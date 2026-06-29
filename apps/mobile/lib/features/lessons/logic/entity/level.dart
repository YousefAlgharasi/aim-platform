// Level — domain entity for the lessons feature.
//
// Maps to LevelSummary returned by GET /curriculum/courses/:courseId/levels.
// All fields are backend-supplied verbatim; Flutter never modifies them.

class Level {
  const Level({
    required this.id,
    required this.courseId,
    required this.title,
    required this.status,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
    this.code,
    this.slug,
    this.description,
  });

  final String id;

  /// Parent course UUID — backend-assigned; never modified by Flutter.
  final String courseId;

  final String title;

  /// Backend-controlled lifecycle status (draft, published, archived, …).
  final String status;

  final int sortOrder;
  final String createdAt;
  final String updatedAt;

  final String? code;

  /// Optional URL slug — may be null for unpublished levels.
  final String? slug;

  /// Optional description — may be null.
  final String? description;
}
