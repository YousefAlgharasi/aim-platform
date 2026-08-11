// FinalExamSummary — a course's final exam (assessments.course_id), gated
// behind every chapter in the course being fully complete. Backend-supplied
// from GET /student/chapters?levelId= (sibling `finalExam` field alongside
// the chapter list). Flutter never computes `unlocked` — it comes verbatim
// from the backend.

class FinalExamSummary {
  const FinalExamSummary({
    required this.assessmentId,
    required this.title,
    required this.unlocked,
    this.passed = false,
    this.score,
  });

  final String assessmentId;
  final String title;

  /// True once every chapter in the course is fully complete (lessons +
  /// any chapter quiz, passed). Backend-computed.
  final bool unlocked;

  /// True when student has passed this final exam in assessment_results.
  final bool passed;

  /// Score percentage (e.g. 78) if passed/taken.
  final int? score;
}
