class VoiceSessionModel {
  final String sessionId;
  final String createdAt;
  final int messageCount;
  final String? contextRef;

  const VoiceSessionModel({
    required this.sessionId,
    required this.createdAt,
    required this.messageCount,
    this.contextRef,
  });

  factory VoiceSessionModel.fromJson(Map<String, dynamic> json) {
    return VoiceSessionModel(
      sessionId: json['sessionId'] as String,
      createdAt: json['createdAt'] as String,
      messageCount: json['messageCount'] as int? ?? 0,
      contextRef: json['contextRef'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'createdAt': createdAt,
      'messageCount': messageCount,
      if (contextRef != null) 'contextRef': contextRef,
    };
  }
}
