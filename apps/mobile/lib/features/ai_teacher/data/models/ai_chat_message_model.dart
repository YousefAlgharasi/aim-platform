// Phase 8 — P8-081
// AiChatMessageModel — data-layer model for AiChatMessage.
//
// Parses one entry of messages[] in the response of
// GET /ai-teacher/sessions/:id/messages (ChatHistoryMessage,
// chat-history-read.types.ts).

import '../../logic/entity/ai_chat_message.dart';

class AiChatMessageModel extends AiChatMessage {
  const AiChatMessageModel({
    required super.id,
    required super.role,
    required super.text,
    required super.createdAt,
  });

  factory AiChatMessageModel.fromJson(Map<String, dynamic> json) {
    return AiChatMessageModel(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'role': role,
        'text': text,
        'createdAt': createdAt,
      };
}
