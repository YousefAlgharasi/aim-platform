import '../../logic/entity/voice_message.dart';

class VoiceMessageModel {
  final String id;
  final String role;
  final String text;
  final String? audioRef;
  final String createdAt;

  /// P21-006/P21-015: unified text+voice conversation turn fields, parsed
  /// from the same backend response shape AiChatMessageModel reads.
  final String channel;
  final int? audioDurationMs;
  final bool isGreeting;

  const VoiceMessageModel({
    required this.id,
    required this.role,
    required this.text,
    this.audioRef,
    required this.createdAt,
    this.channel = 'text',
    this.audioDurationMs,
    this.isGreeting = false,
  });

  factory VoiceMessageModel.fromJson(Map<String, dynamic> json) {
    return VoiceMessageModel(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      audioRef: json['audioRef'] as String?,
      createdAt: json['createdAt'] as String,
      channel: json['channel'] as String? ?? 'text',
      audioDurationMs: json['audioDurationMs'] as int?,
      isGreeting: json['isGreeting'] as bool? ?? false,
    );
  }

  static List<VoiceMessageModel> listFromJson(Map<String, dynamic> json) {
    final list = json['messages'] as List? ?? const [];
    return list
        .map((e) => VoiceMessageModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  VoiceMessage toEntity() {
    return VoiceMessage(
      id: id,
      role: role == 'teacher' ? VoiceMessageRole.teacher : VoiceMessageRole.student,
      text: text,
      audioRef: audioRef,
      createdAt: createdAt,
      channel: channel,
      audioDurationMs: audioDurationMs,
      isGreeting: isGreeting,
    );
  }
}
