// Phase 6 — P6-084
// AnswerOption — domain entity for a student-facing answer choice.
//
// Derived from QuestionBankChoice (P3-014 Section 5).
//
// CRITICAL SECURITY RULE:
// - Flutter NEVER receives is_correct or correct_answer for answer choices.
// - The backend strips correctness information before sending choices to Flutter.
// - This entity intentionally has no isCorrect or correctAnswer field.
// - Flutter never evaluates, infers, or computes whether an option is correct.

class AnswerOption {
  const AnswerOption({
    required this.id,
    required this.text,
    required this.order,
    this.richText,
  });

  /// Backend-issued choice UUID. Submitted verbatim in the attempt payload.
  final String id;

  /// Display text for this choice. Backend-supplied; never modified by Flutter.
  final String text;

  /// Optional rich text blob — backend-supplied; Flutter renders verbatim.
  final Map<String, dynamic>? richText;

  /// Backend-controlled display order. Flutter never reorders choices.
  final int order;
}
