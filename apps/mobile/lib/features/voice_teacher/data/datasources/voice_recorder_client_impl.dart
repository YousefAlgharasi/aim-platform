// Data layer — concrete implementation of [VoiceRecorderClient].
//
// Lives in data/ because it depends on the `record` third-party package —
// an infrastructure concern. The abstract interface [VoiceRecorderClient]
// remains in logic/ (domain) so that notifiers and tests can depend only
// on the interface without touching any plugin.
import 'package:record/record.dart';

import '../../logic/voice_recorder_client.dart';

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
