class VoiceAudioSubmitResponseModel {
  final String messageId;
  final String transcript;
  final String aiResponseText;
  final String? audioRef;
  final String? fallbackText;

  const VoiceAudioSubmitResponseModel({
    required this.messageId,
    required this.transcript,
    required this.aiResponseText,
    this.audioRef,
    this.fallbackText,
  });

  factory VoiceAudioSubmitResponseModel.fromJson(Map<String, dynamic> json) {
    return VoiceAudioSubmitResponseModel(
      messageId: json['messageId'] as String,
      transcript: json['transcript'] as String,
      aiResponseText: json['aiResponseText'] as String,
      audioRef: json['audioRef'] as String?,
      fallbackText: json['fallbackText'] as String?,
    );
  }
}
