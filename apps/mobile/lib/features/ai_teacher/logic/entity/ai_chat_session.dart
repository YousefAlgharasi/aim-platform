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
    this.focusRecap,
    this.lastSessionRecap,
  });

  final String sessionId;
  final String studentId;
  final String contextRef;

  /// 'active' | 'closed'. Backend-owned lifecycle state.
  final String status;

  final String createdAt;

  /// P21-012: short "today we're focusing on" recap line. Null when no
  /// active focus directive exists.
  final String? focusRecap;

  /// P21-013: short "welcome back" recap of real skill-state/weakness
  /// progress, present only when reopening a lesson after a prior closed
  /// session. Null on a same-session resume or a brand-new context.
  final String? lastSessionRecap;
}
