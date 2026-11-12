// Data layer — concrete implementation of [LiveVoiceClient] on the `record` package (an infrastructure concern, so it
// lives in data/; the interface stays in logic/ where notifiers and tests can use it without any plugin).
import 'dart:typed_data';

import 'package:record/record.dart';

import '../../logic/live_voice_client.dart';
import '../../logic/live_voice_engine.dart';

class RealLiveVoiceClient implements LiveVoiceClient {
  AudioRecorder? _recorder;
  AudioRecorder get _instance => _recorder ??= AudioRecorder();

  @override
  Future<bool> hasPermission() => _instance.hasPermission();

  @override
  Future<Stream<Uint8List>> start() => _instance.startStream(
        const RecordConfig(
          encoder: AudioEncoder.pcm16bits,
          sampleRate: liveSampleRate,
          numChannels: 1,
          echoCancel: true,
          noiseSuppress: true,
          autoGain: true,
        ),
      );

  @override
  Future<void> stop() async {
    await _recorder?.stop();
  }

  @override
  void dispose() {
    _recorder?.dispose();
  }
}
