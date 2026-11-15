// Data layer — concrete implementation of [LiveVoiceClient] on the `record` package (an infrastructure concern, so it
// lives in data/; the interface stays in logic/ where notifiers and tests can use it without any plugin).
//
// Some phones hand back pure silence when the platform's echo cancelling / noise suppression / auto gain are switched
// on, so the teacher could never hear the student. If the microphone has delivered nothing but silence for a few
// seconds, it is reopened once with those effects off (and stays that way for the rest of the app session).
import 'dart:async';
import 'dart:typed_data';

import 'package:record/record.dart';

import '../../logic/live_voice_client.dart';
import '../../logic/live_voice_engine.dart';

class RealLiveVoiceClient implements LiveVoiceClient {
  /// Once a phone needed the plain microphone, every later lesson opens it that way straight away.
  static bool _plainMicrophone = false;

  /// How long the microphone may deliver only silence before it is reopened without the audio effects.
  static const Duration _silenceLimit = Duration(milliseconds: 3500);

  AudioRecorder? _recorder;
  AudioRecorder get _instance => _recorder ??= AudioRecorder();

  StreamController<Uint8List>? _out;
  StreamSubscription<Uint8List>? _inner;
  Timer? _silenceTimer;
  bool _heardSound = false;
  bool _reopening = false;

  @override
  Future<bool> hasPermission() => _instance.hasPermission();

  RecordConfig _config({required bool effects}) => RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: liveSampleRate,
        numChannels: 1,
        echoCancel: effects,
        noiseSuppress: effects,
        autoGain: effects,
      );

  @override
  Future<Stream<Uint8List>> start() async {
    await _release();
    _heardSound = false;
    final out = _out = StreamController<Uint8List>();
    await _open(out, effects: !_plainMicrophone);
    if (!_plainMicrophone) {
      _silenceTimer = Timer(_silenceLimit, () {
        if (!_heardSound && _out == out && !out.isClosed) unawaited(_reopenPlain(out));
      });
    }
    return out.stream;
  }

  Future<void> _open(StreamController<Uint8List> out, {required bool effects}) async {
    final stream = await _instance.startStream(_config(effects: effects));
    _inner = stream.listen(
      (frame) {
        if (!_heardSound && _hasSound(frame)) _heardSound = true;
        if (!out.isClosed) out.add(frame);
      },
      onError: (Object e) {
        if (!out.isClosed) out.addError(e);
      },
      onDone: () {
        if (!_reopening && !out.isClosed) unawaited(out.close());
      },
    );
  }

  Future<void> _reopenPlain(StreamController<Uint8List> out) async {
    _plainMicrophone = true;
    _reopening = true;
    try {
      await _inner?.cancel();
      _inner = null;
      try {
        await _recorder?.stop();
      } catch (_) {
        // Already stopped.
      }
      if (_out == out && !out.isClosed) await _open(out, effects: false);
    } catch (e) {
      if (!out.isClosed) out.addError(e);
    } finally {
      _reopening = false;
    }
  }

  /// True when the frame holds anything but digital silence (16-bit little-endian samples).
  static bool _hasSound(Uint8List frame) {
    final view = ByteData.sublistView(frame);
    final samples = frame.lengthInBytes ~/ 2;
    for (var i = 0; i < samples; i++) {
      final v = view.getInt16(i * 2, Endian.little);
      if (v > 8 || v < -8) return true;
    }
    return false;
  }

  Future<void> _release() async {
    _silenceTimer?.cancel();
    _silenceTimer = null;
    await _inner?.cancel();
    _inner = null;
    final out = _out;
    _out = null;
    if (out != null && !out.isClosed) await out.close();
  }

  @override
  Future<void> stop() async {
    await _release();
    await _recorder?.stop();
  }

  @override
  void dispose() {
    unawaited(_release());
    _recorder?.dispose();
  }
}
