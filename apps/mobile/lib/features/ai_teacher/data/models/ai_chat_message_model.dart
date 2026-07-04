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
    super.channel = 'text',
    super.audioRef,
    super.audioDurationMs,
    super.isGreeting = false,
  });

  factory AiChatMessageModel.fromJson(Map<String, dynamic> json) {
    return AiChatMessageModel(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      createdAt: json['createdAt'] as String,
      channel: json['channel'] as String? ?? 'text',
      audioRef: json['audioRef'] as String?,
      audioDurationMs: json['audioDurationMs'] as int?,
      isGreeting: json['isGreeting'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'role': role,
        'text': text,
        'createdAt': createdAt,
        'channel': channel,
        'audioRef': audioRef,
        'audioDurationMs': audioDurationMs,
        'isGreeting': isGreeting,
      };
}
