// Bugfix: thin seam over the `record` package's `AudioRecorder`.
//
// `AudioRecorder`'s own constructor immediately calls into a real platform
// channel (`RecordPlatform.instance.create(...)`), so it cannot be
// constructed at all in a widget test with no platform channel registered —
// subclassing it wouldn't help, since the superclass constructor still runs.
// This interface lets VoiceTeacherPage depend on just the three operations
// it actually needs, so widget tests can inject a trivial fake
// (voice_teacher_page_test.dart) without ever touching the real plugin,
// while production uses [RealVoiceRecorderClient], which creates the real
// [AudioRecorder] lazily on first use.
import 'package:record/record.dart';

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

class RealVoiceRecorderClient implements VoiceRecorderClient {
  AudioRecorder? _recorder;
  AudioRecorder get _instance => _recorder ??= AudioRecorder();

  @override
  Future<bool> hasPermission() => _instance.hasPermission();

  @override
  Future<void> start(String path) => _instance.start(
        const RecordConfig(encoder: AudioEncoder.wav),
        path: path,
      );

  @override
  Future<String?> stop() => _instance.stop();

  @override
  Stream<double> onAmplitudeChanged(Duration interval) =>
      _instance.onAmplitudeChanged(interval).map((amplitude) => amplitude.current);

  @override
  void dispose() {
    _recorder?.dispose();
  }
}
