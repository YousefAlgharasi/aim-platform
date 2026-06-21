// Phase 6 — P6-070
// Course — domain entity for the lessons feature.
//
// Maps to CourseSummary returned by GET /curriculum/courses.
// All fields are backend-supplied verbatim; Flutter never modifies them.

class Course {
  const Course({
    required this.id,
    required this.title,
    required this.status,
    required this.sortOrder,
    required this.createdAt,
    required this.updatedAt,
    this.slug,
    this.description,
  });

  final String id;
  final String title;

  /// Backend-controlled lifecycle status (draft, published, archived, …).
  final String status;

  final int sortOrder;
  final String createdAt;
  final String updatedAt;

  /// Optional URL slug — may be null for unpublished courses.
  final String? slug;

  /// Optional description — may be null.
  final String? description;
}
