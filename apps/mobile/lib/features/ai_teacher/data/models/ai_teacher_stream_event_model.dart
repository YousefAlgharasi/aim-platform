// Phase 18 — P18-061
// AiTeacherStreamEventModel — parses one decoded SSE event payload from
// GET /ai-teacher/sessions/:id/messages/stream into an
// [AiTeacherStreamEvent].

import '../../logic/entity/ai_teacher_stream_event.dart';

class AiTeacherStreamEventModel {
  /// Parses a single decoded SSE `data:` JSON payload.
  ///
  /// Throws [FormatException] for an unrecognized `type` so a malformed or
  /// unexpected event is never silently displayed as chat content.
  static AiTeacherStreamEvent fromJson(Map<String, dynamic> json) {
    switch (json['type']) {
      case 'chunk':
        return AiTeacherStreamChunk(json['text'] as String);
      case 'done':
        return AiTeacherStreamDone(
          isFallback: json['isFallback'] as bool,
          provider: json['provider'] as String,
          model: json['model'] as String,
        );
      default:
        throw FormatException('Unknown AI Teacher stream event type: ${json['type']}');
    }
  }
}
