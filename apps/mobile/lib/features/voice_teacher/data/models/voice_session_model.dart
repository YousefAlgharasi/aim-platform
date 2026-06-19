import '../../logic/entity/voice_session.dart';

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
      messageCount: json['messageCount'] as int,
      contextRef: json['contextRef'] as String?,
    );
  }

  VoiceSession toEntity() {
    return VoiceSession(
      sessionId: sessionId,
      createdAt: DateTime.parse(createdAt),
      messageCount: messageCount,
      contextRef: contextRef,
    );
  }
}
