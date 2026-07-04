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
    this.channel = 'text',
    this.audioRef,
    this.audioDurationMs,
    this.isGreeting = false,
  });

  final String id;

  /// 'student' | 'ai_teacher'.
  final String role;

  final String text;
  final String createdAt;

  /// P21-006/P21-015: unified text+voice conversation turn fields, shared by
  /// the AI Teacher chat screen and the Voice Teacher screen reading the
  /// same backend history. 'text' | 'voice' — this message's origin channel.
  final String channel;

  /// Non-null once TTS audio exists for this message — eagerly for the
  /// opening greeting (P21-009), immediately for a voice-originated reply
  /// (P21-010), or lazily on first voice-mode playback request for a
  /// text-originated reply (P21-011). A non-null audioRef is the actual
  /// "voice playback available" signal, independent of `channel`.
  final String? audioRef;
  final int? audioDurationMs;

  /// True only for the single auto-generated opening assistant message
  /// (P21-008).
  final bool isGreeting;

  bool get isFromStudent => role == 'student';
  bool get isFromAiTeacher => role == 'ai_teacher';

  /// Whether this message's audio is already available to play without a
  /// lazy-synthesis round trip (P21-011).
  bool get hasAudio => audioRef != null;
}
