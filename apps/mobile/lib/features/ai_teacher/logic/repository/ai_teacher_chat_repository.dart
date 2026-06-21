// Phase 8 — P8-083
// AiTeacherChatRepository — logic-layer interface for backend AI Teacher chat.
//
// Security rules:
// - Flutter never calls an AI provider directly. All methods delegate to the
//   backend AI Teacher gateway via the datasource layer.
// - Flutter never sends studentId. Ownership is resolved by the backend from
//   the bearer token.
// - Flutter never calculates mastery, level, weakness, difficulty,
//   recommendations, or review schedule. AIM Engine remains the authority.
// - Bearer tokens are passed through per call and never stored here.

import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';

abstract class AiTeacherChatRepository {
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  });

  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  });

  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  });

  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  });

  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  });
}
