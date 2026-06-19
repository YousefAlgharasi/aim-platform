// Phase 6 — P6-091
// SessionFeedbackRemoteDatasource — abstract interface.
//
// Fetches the backend-approved AIM session state (post-attempt feedback
// aggregate) from GET /aim/students/:studentId/sessions/:sessionId/state.
//
// CRITICAL SECURITY RULES:
// - studentId is JWT-resolved by the backend. Flutter passes it as sourced
//   from authContextProvider only; never from user input.
// - sessionId is a backend-issued UUID; never constructed by Flutter.
// - Response is read-only AIM output. Flutter never mutates it.
// - Bearer token injected from provider layer; never stored here.

import 'package:aim_mobile/features/question_answer/data/models/session_feedback_model.dart';

abstract class SessionFeedbackRemoteDatasource {
  /// GET /aim/students/:studentId/sessions/:sessionId/state
  ///
  /// Returns the backend-persisted AIM session summary.
  /// [found] == false when the pipeline hasn't completed yet.
  Future<SessionFeedbackModel> getSessionState({
    required String bearerToken,
    required String studentId,
    required String sessionId,
  });
}
