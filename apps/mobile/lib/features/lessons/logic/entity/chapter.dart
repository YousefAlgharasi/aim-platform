// Phase 6 — P6-070
// Chapter — domain entity for the lessons feature.
//
// Maps to ChapterSummary returned by GET /curriculum/courses/:courseId/levels/:levelId/chapters.
// All fields are backend-supplied verbatim; Flutter never modifies them.

class Chapter {
  const Chapter({
    required this.id,
    required this.levelId,
    required this.title,
    required this.status,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
    this.slug,
    this.description,
  });

  final String id;

  /// Parent level UUID — backend-assigned; never modified by Flutter.
  final String levelId;

  final String title;

  /// Backend-controlled lifecycle status (draft, published, archived, …).
  final String status;

  final int sortOrder;
  final String createdAt;
  final String updatedAt;

  /// Optional URL slug — may be null for unpublished chapters.
  final String? slug;

  /// Optional description — may be null.
  final String? description;
}
