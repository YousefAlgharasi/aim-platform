// Phase 8 — P8-081
// AiChatSession — read-only entity for a backend-owned AI Teacher chat
// session.
//
// Mirrors StartChatSessionResult (chat-session-start.types.ts,
// POST /ai-teacher/sessions). studentId is the JWT-resolved owner echoed
// back by the backend; Flutter never supplies it and never computes any
// AIM-owned value here.

class AiChatSession {
  const AiChatSession({
    required this.sessionId,
    required this.studentId,
    required this.contextRef,
    required this.status,
    required this.createdAt,
  });

  final String sessionId;
  final String studentId;
  final String contextRef;

  /// 'active' | 'closed'. Backend-owned lifecycle state.
  final String status;

  final String createdAt;
}
