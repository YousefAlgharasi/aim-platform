// Phase 6 — P6-085
// AttemptSubmitRequestModel — the payload Flutter sends to
// POST /sessions/:sessionId/attempt.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER includes isCorrect in this request — backend evaluates it.
// - Flutter NEVER includes skillIds — backend resolves from curriculum data.
// - Flutter NEVER includes presentedDifficulty — backend owns this value.
// - Flutter NEVER includes attemptNumberForItem — backend counts attempts.
// - Flutter NEVER includes responseTimeMs — backend computes from timestamps.
// - studentId is NEVER in this payload — backend resolves from JWT.
// - The only student-supplied value is answerValue (the selected option id
//   or free-text string). Everything else is backend-supplied or computed.

/// The minimal payload Flutter sends to submit an attempt.
///
/// Only fields the student can legitimately supply are included here.
/// All backend-owned values (isCorrect, skillIds, difficulty, responseTimeMs,
/// attemptNumber, studentId) are intentionally absent.
class AttemptSubmitRequestModel {
  const AttemptSubmitRequestModel({
    required this.itemId,
    required this.answerValue,
    required this.startedAt,
  });

  /// Backend-issued item UUID from the question presented to the student.
  /// Never constructed or modified by Flutter.
  final String itemId;

  /// The student's answer — either a selected option id (choice-based) or
  /// a free-text string (fill_in_the_blank / short_answer).
  final String answerValue;

  /// ISO-8601 UTC timestamp when the question was presented to the student.
  /// Used by the backend to compute responseTimeMs; never used by Flutter
  /// to compute any timing value.
  final String startedAt;

  Map<String, dynamic> toJson() => {
        'itemId': itemId,
        'answerValue': answerValue,
        'startedAt': startedAt,
      };
}
