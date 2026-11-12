// LessonExplanation — student-facing written teaching content of a lesson
// (lessons.explanation JSONB, served verbatim by GET /curriculum/lessons/:id).
//
// Overview, explained sections with examples, key points, common mistakes
// and a recap. Backend-authored; Flutter only displays it.

class LessonExplanationExample {
  const LessonExplanationExample({required this.text, this.note});

  final String text;
  final String? note;
}

class LessonExplanationSection {
  const LessonExplanationSection({
    required this.heading,
    required this.body,
    this.examples = const [],
  });

  final String heading;

  /// Light markdown: `**bold**` and lines starting with `- ` / `1. `.
  final String body;
  final List<LessonExplanationExample> examples;
}

class LessonExplanationMistake {
  const LessonExplanationMistake({
    required this.wrong,
    required this.right,
    required this.why,
  });

  final String wrong;
  final String right;
  final String why;
}

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
  final List<LessonExplanationMistake> commonMistakes;
  final String? recap;
}
