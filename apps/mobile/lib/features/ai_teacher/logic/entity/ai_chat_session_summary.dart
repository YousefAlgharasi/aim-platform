// Phase 8 — P8-081
// AiChatSessionSummary — read-only entity for one entry in the
// authenticated student's chat session list.
//
// Mirrors ChatSessionListItem (chat-session-list-read.types.ts,
// GET /ai-teacher/sessions). studentId is implicit — the endpoint only
// ever returns sessions owned by the authenticated caller.

class AiChatSessionSummary {
  const AiChatSessionSummary({
    required this.sessionId,
    required this.contextRef,
    this.contextTitle,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  final String sessionId;
  final String contextRef;

  /// Backend-resolved display title for [contextRef] (e.g. the lesson's
  /// title for `lesson:<uuid>` refs); null when no such title exists.
  final String? contextTitle;

  /// 'active' | 'closed'. Backend-owned lifecycle state.
  final String status;

  final String createdAt;
  final String updatedAt;
}
