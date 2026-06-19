// Phase 6 — P6-084
// Question — domain entity for a student-facing question.
//
// Derived from QuestionBankDetail (P3-014).
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER evaluates answer correctness locally.
// - Flutter NEVER calls the AIM Engine or any AI provider directly.
// - difficulty is backend-computed; Flutter renders it as a display hint only —
//   never uses it to adjust logic or compute scores.
// - All content (stem, hint, explanation, options) is backend-supplied verbatim.
// - explanation is ONLY shown after the backend confirms the attempt is done;
//   Flutter never infers when to show it.

import 'answer_option.dart';

class Question {
  const Question({
    required this.id,
    required this.type,
    required this.stem,
    required this.difficulty,
    required this.options,
    this.richStem,
    this.hint,
    this.explanation,
    this.tags = const [],
  });

  /// Backend-issued question UUID. Never constructed or modified by Flutter.
  final String id;

  /// Question type: multiple_choice | multiple_select | true_false |
  /// fill_in_the_blank | short_answer | ordering | matching.
  /// Backend-supplied; Flutter uses it only to select the correct input widget.
  final String type;

  /// Question stem text. Backend-supplied verbatim.
  final String stem;

  /// Optional rich content blob. Backend-supplied; Flutter renders verbatim.
  final Map<String, dynamic>? richStem;

  /// Backend-computed difficulty: beginner | elementary | intermediate |
  /// upper_intermediate | advanced.
  /// NEVER used by Flutter to compute scores or correctness.
  final String difficulty;

  /// Answer choices. Empty for free-text question types.
  /// NEVER contains correctness information — backend strips is_correct.
  final List<AnswerOption> options;

  /// Optional hint text. Backend-supplied. Flutter shows on user request.
  final String? hint;

  /// Optional explanation. Backend-supplied.
  /// Flutter shows ONLY after receiving the attempt response from the backend.
  /// NEVER shown before or inferred locally.
  final String? explanation;

  /// Backend-supplied tag strings. Flutter renders verbatim; never modifies.
  final List<String> tags;
}
