// Phase 6 — P6-089
// QuestionSessionState — UI state for an active question/answer session.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER computes correctness, mastery, or any AIM-owned value.
// - selectedOptionId is the student's local selection; it is NOT evaluated
//   locally. It is submitted to the backend verbatim.
// - attemptResult is a backend acknowledgement only (no is_correct field).
// - writtenAnswer is free-text input collected for fill_blank/free_text types.
// - All AIM values (difficulty, mastery, etc.) are backend-owned; none exist
//   here.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

/// Describes whether the student has submitted the current question.
enum QuestionSubmitStatus {
  /// Not yet submitted.
  idle,

  /// Submission in flight.
  submitting,

  /// Backend has acknowledged the attempt (no correctness shown yet).
  submitted,

  /// Submission failed — backend returned an error.
  failed,
}

/// All mutable UI state for the active question/answer session.
class QuestionSessionState {
  const QuestionSessionState({
    this.question,
    this.isLoadingQuestion = false,
    this.questionError,
    this.selectedOptionId,
    this.writtenAnswer = '',
    this.submitStatus = QuestionSubmitStatus.idle,
    this.submitError,
    this.attemptResult,
    this.itemShownAt,
  });

  /// Current question from backend. null while loading.
  final QuestionModel? question;

  /// True while GET /curriculum/questions/:id is in flight.
  final bool isLoadingQuestion;

  /// Error message from a failed question fetch.
  final String? questionError;

  /// The option id the student tapped for MCQ/true_false questions.
  /// Collected locally; submitted verbatim — never evaluated locally.
  final String? selectedOptionId;

  /// Student's typed answer for fill_blank/free_text questions.
  final String writtenAnswer;

  /// Submission lifecycle.
  final QuestionSubmitStatus submitStatus;

  /// Error message from a failed attempt submission.
  final String? submitError;

  /// Backend acknowledgement after a successful submission.
  /// Never contains is_correct.
  final AttemptSubmitResponseModel? attemptResult;

  /// ISO-8601 timestamp when the question was shown to the student.
  /// Passed verbatim to the backend as startedAt; never used for scoring.
  final String? itemShownAt;

  bool get hasQuestion => question != null;
  bool get isSubmitting => submitStatus == QuestionSubmitStatus.submitting;
  bool get isSubmitted => submitStatus == QuestionSubmitStatus.submitted;
  bool get canSubmit =>
      !isSubmitting &&
      !isSubmitted &&
      hasQuestion &&
      (selectedOptionId != null || writtenAnswer.isNotEmpty);

  QuestionSessionState copyWith({
    QuestionModel? question,
    bool? isLoadingQuestion,
    String? questionError,
    String? selectedOptionId,
    bool clearSelectedOption = false,
    String? writtenAnswer,
    QuestionSubmitStatus? submitStatus,
    String? submitError,
    AttemptSubmitResponseModel? attemptResult,
    String? itemShownAt,
  }) {
    return QuestionSessionState(
      question: question ?? this.question,
      isLoadingQuestion: isLoadingQuestion ?? this.isLoadingQuestion,
      questionError: questionError ?? this.questionError,
      selectedOptionId: clearSelectedOption
          ? null
          : selectedOptionId ?? this.selectedOptionId,
      writtenAnswer: writtenAnswer ?? this.writtenAnswer,
      submitStatus: submitStatus ?? this.submitStatus,
      submitError: submitError ?? this.submitError,
      attemptResult: attemptResult ?? this.attemptResult,
      itemShownAt: itemShownAt ?? this.itemShownAt,
    );
  }
}
