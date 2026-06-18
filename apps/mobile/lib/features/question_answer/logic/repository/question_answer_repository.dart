// Phase 6 — P6-088
// QuestionAnswerRepository — abstract interface (logic layer).
//
// Scope: Question/answer session only.
//
// Security rules:
// - Flutter never calculates correctness, mastery, difficulty, or any
//   AIM-owned value. All values come from the backend verbatim.
// - questionId and sessionId are always backend-supplied values; never from
//   raw user input.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

abstract class QuestionAnswerRepository {
  /// Fetch a student-facing question (no correctness information).
  /// [questionId] must be a backend-supplied value.
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  });

  /// Submit a student attempt and receive a safe backend acknowledgement.
  /// The response never contains is_correct or AIM-owned values.
  /// [sessionId] must be a backend-issued UUID.
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  });
}
