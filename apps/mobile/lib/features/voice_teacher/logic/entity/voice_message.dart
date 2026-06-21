enum VoiceMessageRole { student, teacher }

class VoiceMessage {
  final String id;
  final VoiceMessageRole role;
  final String text;
  final String? audioRef;
  final String createdAt;

  const VoiceMessage({
    required this.id,
    required this.role,
    required this.text,
    this.audioRef,
    required this.createdAt,
  });
}
