import '../../logic/entity/voice_session.dart';

class VoiceSessionModel {
  final String sessionId;
  final String createdAt;
  final String? lastActivityAt;
  final int messageCount;

  const VoiceSessionModel({
    required this.sessionId,
    required this.createdAt,
    this.lastActivityAt,
    required this.messageCount,
  });

  factory VoiceSessionModel.fromJson(Map<String, dynamic> json) {
    return VoiceSessionModel(
      sessionId: json['sessionId'] as String,
      createdAt: json['createdAt'] as String,
      lastActivityAt: json['lastActivityAt'] as String?,
      messageCount: json['messageCount'] as int? ?? 0,
    );
  }

  static List<VoiceSessionModel> listFromJson(Map<String, dynamic> json) {
    final list = json['sessions'] as List? ?? const [];
    return list
        .map((e) => VoiceSessionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  VoiceSession toEntity() {
    return VoiceSession(
      sessionId: sessionId,
      createdAt: createdAt,
      lastActivityAt: lastActivityAt,
      messageCount: messageCount,
    );
  }
}
