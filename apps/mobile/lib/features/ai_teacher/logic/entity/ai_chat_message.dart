// Phase 8 — P8-081
// AiChatMessage — read-only entity for one persisted message in an AI
// Teacher chat history.
//
// Mirrors ChatHistoryMessage (chat-history-read.types.ts,
// GET /ai-teacher/sessions/:id/messages). text is backend-persisted and
// already safety-filtered for ai_teacher-role messages; Flutter never
// edits or re-derives it.

class AiChatMessage {
  const AiChatMessage({
    required this.id,
    required this.role,
    required this.text,
    required this.createdAt,
  });

  final String id;

  /// 'student' | 'ai_teacher'.
  final String role;

  final String text;
  final String createdAt;

  bool get isFromStudent => role == 'student';
  bool get isFromAiTeacher => role == 'ai_teacher';
}
