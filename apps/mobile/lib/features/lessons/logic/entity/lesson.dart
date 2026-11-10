// Phase 6 — P6-070
// Lesson — domain entity for the lessons feature.
//
// Maps to LessonSummary returned by GET /curriculum/chapters/:chapterId/lessons.
// All fields are backend-supplied verbatim; Flutter never modifies them.

/// An example sentence inside an explanation section, with an optional note.
class LessonExample {
  const LessonExample({required this.text, this.note});

  final String text;
  final String? note;
}

/// One explained section: heading, markdown-ish body, and examples.
class LessonExplanationSection {
  const LessonExplanationSection({
    required this.heading,
    required this.body,
    this.examples = const [],
  });

  final String heading;
  final String body;
  final List<LessonExample> examples;
}

/// A wrong sentence, the right one and why.
class LessonMistake {
  const LessonMistake({required this.wrong, required this.right, required this.why});

  final String wrong;
  final String right;
  final String why;
}

/// The written teaching content of a lesson (GET /curriculum/lessons/:id),
/// shown verbatim; Flutter never edits or scores it.
class LessonExplanation {
  const LessonExplanation({
    required this.overview,
    required this.sections,
    required this.keyPoints,
    this.commonMistakes = const [],
    this.recap,
  });

  final String overview;
  final List<LessonExplanationSection> sections;
  final List<String> keyPoints;
  final List<LessonMistake> commonMistakes;
  final String? recap;
}

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
    this.explanation,
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

  /// Written teaching content; null until authored.
  final LessonExplanation? explanation;
}
