// Phase 8 — P8-081
// AiTeacherReply — read-only entity for the backend's response to a
// submitted student chat message.
//
// Mirrors SubmitStudentMessageResult (chat-message-submit.types.ts,
// POST /ai-teacher/sessions/:id/messages). text is the AI Teacher's
// pedagogical reply; provider/model/latencyMs are backend-gateway
// metadata for diagnostics only and are never used to compute mastery,
// level, weakness, difficulty, recommendations, or review schedule —
// AIM Engine remains sole authority for those values.

class AiTeacherReply {
  const AiTeacherReply({
    required this.text,
    required this.isFallback,
    required this.provider,
    required this.model,
    required this.latencyMs,
  });

  final String text;

  /// True when the backend safe-failure fallback message was used instead
  /// of a live provider response.
  final bool isFallback;

  final String provider;
  final String model;
  final int latencyMs;
}
