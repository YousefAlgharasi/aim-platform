import '../../logic/entity/voice_message.dart';

class VoiceMessageModel {
  final String id;
  final String role;
  final String text;
  final String? audioRef;
  final String createdAt;

  const VoiceMessageModel({
    required this.id,
    required this.role,
    required this.text,
    this.audioRef,
    required this.createdAt,
  });

  factory VoiceMessageModel.fromJson(Map<String, dynamic> json) {
    return VoiceMessageModel(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      audioRef: json['audioRef'] as String?,
      createdAt: json['createdAt'] as String,
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
    );
  }
}
