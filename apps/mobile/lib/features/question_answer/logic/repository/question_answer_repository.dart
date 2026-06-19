// Phase 6 — P6-088 / P6-091
// QuestionAnswerRepository — abstract interface (logic layer).
//
// Scope: Question/answer session only.
//
// Security rules:
// - Flutter never calculates correctness, mastery, difficulty, or any
//   AIM-owned value. All values come from the backend verbatim.
// - questionId and sessionId are always backend-supplied values.
// - Bearer token is passed from the provider layer; never stored here.
// - No AIM Engine runtime, AI Teacher, or AI provider calls from Flutter.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

abstract class QuestionAnswerRepository {
  /// Fetch a student-facing question (no correctness information).
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  });

  /// Submit a student attempt and receive a safe backend acknowledgement.
  /// The response never contains is_correct or AIM-owned values.
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  });

  /// GET /aim/students/:studentId/sessions/:sessionId/state
  ///
  /// Returns backend-persisted AIM session summary after pipeline runs.
  /// [found] == false when not yet available. Read-only; never mutated.
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  });
}
