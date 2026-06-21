/// Result of submitting a recorded audio turn (P9-068 / P18-065).
/// Mirrors the backend's VoiceAudioSubmitResponse — a safety-filtered AI
/// Teacher reply, never a mastery/level/weakness/difficulty/recommendation
/// value.
class VoiceTurnResult {
  final String text;
  final String? audioRef;
  final bool isFallback;
  final int latencyMs;

  const VoiceTurnResult({
    required this.text,
    this.audioRef,
    required this.isFallback,
    required this.latencyMs,
  });
}
