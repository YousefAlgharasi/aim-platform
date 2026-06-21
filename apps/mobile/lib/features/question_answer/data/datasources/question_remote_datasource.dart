// Phase 6 — P6-086
// QuestionRemoteDatasource — abstract interface (data layer).
//
// Scope: Question/answer session only.
//
// Fetches student-facing question data from the backend.
// Flutter never calls the AIM Engine or AI providers directly.
//
// Security rules:
// - Bearer token injected by provider layer; never stored here.
// - questionId is always a backend-supplied value; never from user input.
// - The response MUST NOT contain is_correct or correct_answer.
//   Backend is responsible for stripping these before sending.
// - Flutter never evaluates correctness from the response.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

abstract class QuestionRemoteDatasource {
  /// GET /curriculum/questions/:questionId
  ///
  /// Returns the student-facing question detail including answer options
  /// (without correctness information).
  ///
  /// [questionId] must be a backend-supplied value; never from user input.
  Future<QuestionModel> getQuestion({
    required String bearerToken,
    required String questionId,
  });
}
