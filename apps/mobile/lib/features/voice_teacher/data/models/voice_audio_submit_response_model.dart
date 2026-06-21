import '../../logic/entity/voice_turn_result.dart';

class VoiceAudioSubmitResponseModel {
  final String text;
  final String? audioRef;
  final bool isFallback;
  final int latencyMs;

  const VoiceAudioSubmitResponseModel({
    required this.text,
    this.audioRef,
    required this.isFallback,
    required this.latencyMs,
  });

  factory VoiceAudioSubmitResponseModel.fromJson(Map<String, dynamic> json) {
    return VoiceAudioSubmitResponseModel(
      text: json['text'] as String,
      audioRef: json['audioRef'] as String?,
      isFallback: json['isFallback'] as bool? ?? false,
      latencyMs: json['latencyMs'] as int? ?? 0,
    );
  }

  VoiceTurnResult toEntity() {
    return VoiceTurnResult(
      text: text,
      audioRef: audioRef,
      isFallback: isFallback,
      latencyMs: latencyMs,
    );
  }
}
