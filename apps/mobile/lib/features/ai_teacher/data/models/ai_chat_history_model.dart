// Phase 8 — P8-081
// AiChatHistoryModel — data-layer model for AiChatHistory.
//
// Parses the response of GET /ai-teacher/sessions/:id/messages
// (GetChatHistoryResult, chat-history-read.types.ts).

import '../../logic/entity/ai_chat_history.dart';
import 'ai_chat_message_model.dart';

class AiChatHistoryModel extends AiChatHistory {
  const AiChatHistoryModel({
    required super.sessionId,
    required super.messages,
  });

  factory AiChatHistoryModel.fromJson(Map<String, dynamic> json) {
    final rawMessages = json['messages'] as List<dynamic>? ?? const [];
    return AiChatHistoryModel(
      sessionId: json['sessionId'] as String,
      messages: rawMessages
          .map(
            (entry) =>
                AiChatMessageModel.fromJson(entry as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'sessionId': sessionId,
        'messages': messages
            .map((message) => (message as AiChatMessageModel).toJson())
            .toList(),
      };
}
