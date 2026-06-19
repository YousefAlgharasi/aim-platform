class VoiceSession {
  final String sessionId;
  final DateTime createdAt;
  final int messageCount;
  final String? contextRef;

  const VoiceSession({
    required this.sessionId,
    required this.createdAt,
    required this.messageCount,
    this.contextRef,
  });
}
