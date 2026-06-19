class VoiceMessageModel {
  final String id;
  final String role;
  final String text;
  final String? audioRef;
  final String timestamp;

  const VoiceMessageModel({
    required this.id,
    required this.role,
    required this.text,
    this.audioRef,
    required this.timestamp,
  });

  factory VoiceMessageModel.fromJson(Map<String, dynamic> json) {
    return VoiceMessageModel(
      id: json['id'] as String,
      role: json['role'] as String,
      text: json['text'] as String,
      audioRef: json['audioRef'] as String?,
      timestamp: json['timestamp'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'text': text,
      if (audioRef != null) 'audioRef': audioRef,
      'timestamp': timestamp,
    };
  }
}
