// Phase 8 — P8-081
// AiChatHistory — read-only entity wrapping the full persisted message
// history for one AI Teacher chat session.
//
// Mirrors GetChatHistoryResult (chat-history-read.types.ts,
// GET /ai-teacher/sessions/:id/messages). messages is backend-ordered
// oldest-first; Flutter never reorders or re-derives it.

import 'ai_chat_message.dart';

class AiChatHistory {
  const AiChatHistory({
    required this.sessionId,
    required this.messages,
  });

  final String sessionId;
  final List<AiChatMessage> messages;
}
