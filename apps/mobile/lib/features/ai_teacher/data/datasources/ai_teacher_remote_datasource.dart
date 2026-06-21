// Phase 8 — P8-082
// AiTeacherRemoteDatasource — abstract interface for all backend AI
// Teacher chat APIs (P8-071..P8-075).
//
// Scope: Start a chat session, send a chat message, read chat history,
// list active sessions, and submit feedback on an AI Teacher reply.
//
// CRITICAL SECURITY RULES:
// - Flutter NEVER calls an AI provider directly. Every call here goes
//   through the backend, which is the sole caller of the AI provider
//   gateway and the sole writer of AIM-owned persistence.
// - studentId is JWT-resolved by the backend from the bearer token.
//   Flutter never sends a studentId — it is not a parameter on any
//   method below.
// - Flutter never computes mastery, level, weakness, difficulty,
//   recommendations, or review schedule. AIM Engine remains sole
//   authority for those values; nothing here touches them.
// - Bearer token is injected by the caller (provider layer); never
//   stored here.

import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';

abstract class AiTeacherRemoteDatasource {
  /// POST /ai-teacher/sessions (P8-071)
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  });

  /// GET /ai-teacher/sessions (P8-074)
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  });

  /// POST /ai-teacher/sessions/:id/messages (P8-072)
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  });

  /// GET /ai-teacher/sessions/:id/messages (P8-073)
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  });

  /// POST /ai-teacher/messages/:id/feedback (P8-075)
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  });

  /// POST /ai-teacher/sessions/:id/messages/stream (P18-043, SSE) (P18-061)
  ///
  /// Streams an already safety-filtered AI Teacher reply. Yields zero or
  /// more chunk events followed by exactly one terminal done event.
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  });

  /// GET /ai-teacher/sessions/:id/safety-status (P18-047) (P18-064)
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  });
}
