enum VoiceMessageRole { student, teacher }

/// P21-015: `VoiceMessage` stays a distinct entity from the AI Teacher
/// chat screen's `AiChatMessage` rather than being replaced by it, even
/// though both now read the same unified `ai_chat_messages` backend rows
/// (P21-006/P21-010) — the Voice Teacher screen's role vocabulary
/// (`VoiceMessageRole.student`/`.teacher`) and its UI (waveforms, playback
/// controls) are different enough from the chat bubble list that forcing
/// one shared model would mean either the voice UI branching on chat-only
/// fields it doesn't use, or the chat UI dragging in voice-only enum
/// mapping. Both models are kept in sync field-for-field (channel,
/// audioRef, audioDurationMs, isGreeting) since they parse the same
/// backend response shape (ChatHistoryMessage / GET
/// /ai-teacher/sessions/:id/messages).
class VoiceMessage {
  final String id;
  final VoiceMessageRole role;
  final String text;
  final String? audioRef;
  final String createdAt;

  /// 'text' | 'voice' — this message's origin channel (P21-006).
  final String channel;
  final int? audioDurationMs;

  /// True only for the single auto-generated opening assistant message
  /// (P21-008) — lets the voice screen recognize the greeting and offer
  /// its "ready to play" state (P21-017) instead of the idle "tap to
  /// speak" state.
  final bool isGreeting;

  const VoiceMessage({
    required this.id,
    required this.role,
    required this.text,
    this.audioRef,
    required this.createdAt,
    this.channel = 'text',
    this.audioDurationMs,
    this.isGreeting = false,
  });

  /// Whether this message's audio is already available to play without a
  /// lazy-synthesis round trip (P21-011).
  bool get hasAudio => audioRef != null;
}
