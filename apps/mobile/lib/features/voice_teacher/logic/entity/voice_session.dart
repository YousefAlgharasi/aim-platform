class VoiceSession {
  final String sessionId;
  final String createdAt;
  final String? lastActivityAt;
  final int messageCount;

  const VoiceSession({
    required this.sessionId,
    required this.createdAt,
    this.lastActivityAt,
    required this.messageCount,
  });
}
