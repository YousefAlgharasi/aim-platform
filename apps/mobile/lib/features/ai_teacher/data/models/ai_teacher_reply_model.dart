// Phase 8 — P8-081
// AiTeacherReplyModel — data-layer model for AiTeacherReply.
//
// Parses the response of POST /ai-teacher/sessions/:id/messages
// (SubmitStudentMessageResult, chat-message-submit.types.ts).

import '../../logic/entity/ai_teacher_reply.dart';

class AiTeacherReplyModel extends AiTeacherReply {
  const AiTeacherReplyModel({
    required super.text,
    required super.isFallback,
    required super.provider,
    required super.model,
    required super.latencyMs,
  });

  factory AiTeacherReplyModel.fromJson(Map<String, dynamic> json) {
    return AiTeacherReplyModel(
      text: json['text'] as String,
      isFallback: json['isFallback'] as bool,
      provider: json['provider'] as String,
      model: json['model'] as String,
      latencyMs: json['latencyMs'] as int,
    );
  }

  Map<String, dynamic> toJson() => {
        'text': text,
        'isFallback': isFallback,
        'provider': provider,
        'model': model,
        'latencyMs': latencyMs,
      };
}
