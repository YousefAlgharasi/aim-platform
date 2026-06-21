// Phase 6 — P6-087
// AttemptRemoteDatasource — abstract interface (data layer).
//
// Scope: Question/answer session only.
//
// Submits student attempts to the backend and receives safe acknowledgements.
// Flutter never calls the AIM Engine or AI providers directly.
//
// Security rules:
// - Bearer token injected by provider layer; never stored here.
// - sessionId and itemId are always backend-supplied values; never from raw
//   user input.
// - The response NEVER contains is_correct, mastery, difficulty, weakness,
//   or any AIM-owned value. Backend withholds these during an active session.
// - Flutter never evaluates correctness locally.
// - No secrets, service-role keys, or privileged config here.

import 'package:aim_mobile/features/question_answer/data/models/question_answer_models.dart';

abstract class AttemptRemoteDatasource {
  /// POST /sessions/:sessionId/attempt
  ///
  /// Sends the student's answer to the backend and receives a safe
  /// acknowledgement (attemptId, answerId, submittedAt, aimOutcome).
  /// is_correct is never returned; AIM-owned values are never returned.
  ///
  /// [sessionId] must be a backend-issued UUID from the session start call.
  /// [request] carries only itemId, answerValue, startedAt — no correctness
  /// fields, no studentId, no skillIds.
  Future<AttemptSubmitResponseModel> submitAttempt({
    required String bearerToken,
    required String sessionId,
    required AttemptSubmitRequestModel request,
  });
}
