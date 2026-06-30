// Phase 6 — P6-070
// Lesson — domain entity for the lessons feature.
//
// Maps to LessonSummary returned by GET /curriculum/chapters/:chapterId/lessons.
// All fields are backend-supplied verbatim; Flutter never modifies them.

class Lesson {
  const Lesson({
    required this.id,
    required this.chapterId,
    required this.title,
    required this.description,
    required this.status,
    required this.sortOrder,
    required this.xpValue,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;

  /// Parent chapter UUID — backend-assigned; never modified by Flutter.
  final String chapterId;

  final String title;
  final String description;

  /// Backend-controlled lifecycle status (draft, published, archived, …).
  final String status;

  final int sortOrder;

  /// Gamification points awarded on completion. Backend-computed/display-only
  /// — never used by Flutter for mastery, scoring, or AIM Engine logic.
  final int xpValue;

  final String createdAt;
  final String updatedAt;
}
