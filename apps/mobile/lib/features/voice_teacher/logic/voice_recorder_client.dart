// Domain layer — abstract interface for audio recording.
//
// This interface lives in logic/ (domain) so that notifiers and widget tests
// can depend on it without touching any Flutter plugin. The concrete
// production implementation [RealVoiceRecorderClient] lives in
// data/datasources/voice_recorder_client_impl.dart.
abstract class VoiceRecorderClient {
  /// Checks (and, per the `record` package's own default, requests if not
  /// already granted) microphone permission.
  Future<bool> hasPermission();

  /// Starts recording to [path] as a WAV file (audio/wav is in the
  /// backend's ALLOWED_AUDIO_TYPES allow-list —
  /// voice-audio-submit.controller.ts).
  Future<void> start(String path);

  /// Stops the current recording, returning the output file path.
  Future<String?> stop();

  /// Current input amplitude in dBFS (very negative = silence, closer to 0
  /// = louder), sampled at [interval] — used for hands-free voice-activity
  /// detection (start/stop speaking without tapping a button).
  Stream<double> onAmplitudeChanged(Duration interval);

  void dispose();
}

