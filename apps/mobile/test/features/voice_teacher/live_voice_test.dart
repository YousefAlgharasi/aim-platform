// Live conversation: the pure speech detection (Vad), the WAV packaging, and the controller that ties them to the
// microphone stream. The microphone itself is a fake that is fed synthetic audio.

import 'dart:async';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';

import 'package:aim_mobile/features/voice_teacher/logic/live_voice_client.dart';
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_controller.dart';
import 'package:aim_mobile/features/voice_teacher/logic/live_voice_engine.dart';

const double _frame = 80; // ms
const double _loud = 0.2;
const double _quiet = 0.003;

List<VadEvent> _feed(Vad vad, double level, int ms, {bool aiSpeaking = false}) {
  final events = <VadEvent>[];
  for (var t = 0.0; t < ms; t += _frame) {
    final e = vad.process(level, _frame, aiSpeaking);
    if (e != null) events.add(e);
  }
  return events;
}

/// 16-bit mono PCM of [ms] milliseconds whose loudness (RMS) is [amplitude] (a square wave).
Uint8List _pcm(double amplitude, {double ms = _frame}) {
  final samples = (liveSampleRate * ms / 1000).round();
  final out = Uint8List(samples * 2);
  final view = ByteData.sublistView(out);
  final v = (amplitude * 32767).round();
  for (var i = 0; i < samples; i++) {
    view.setInt16(i * 2, i.isEven ? v : -v, Endian.little);
  }
  return out;
}

class _FakeLiveVoiceClient implements LiveVoiceClient {
  _FakeLiveVoiceClient({this.permission = true, this.startThrows = false});

  final bool permission;
  final bool startThrows;
  final _frames = StreamController<Uint8List>.broadcast();
  bool stopped = false;
  bool disposed = false;

  @override
  Future<bool> hasPermission() async => permission;

  @override
  Future<Stream<Uint8List>> start() async {
    if (startThrows) throw StateError('no microphone');
    return _frames.stream;
  }

  @override
  Future<void> stop() async => stopped = true;

  @override
  void dispose() => disposed = true;
}

void main() {
  group('Vad: when the student starts and stops talking', () {
    test('ignores a quiet room', () {
      final vad = Vad();
      expect(_feed(vad, _quiet, 5000), isEmpty);
      expect(vad.talking, isFalse);
    });

    test('hears a sentence start, and ends it after a short silence', () {
      final vad = Vad();
      _feed(vad, _quiet, 800);
      final start = _feed(vad, _loud, 1600);
      expect(start, hasLength(1));
      expect((start.single as SpeechStart).bargeIn, isFalse);
      expect(vad.talking, isTrue);
      expect(_feed(vad, _quiet, 1100 - 2 * 80), isEmpty);
      final end = _feed(vad, _quiet, 3 * 80);
      expect(end, hasLength(1));
      expect((end.single as SpeechEnd).tooShort, isFalse);
      expect(vad.talking, isFalse);
    });

    test('does not cut a sentence at a short pause between words', () {
      final vad = Vad();
      _feed(vad, _quiet, 800);
      _feed(vad, _loud, 800);
      expect(_feed(vad, _quiet, 600), isEmpty);
      expect(_feed(vad, _loud, 800), isEmpty);
      expect(vad.talking, isTrue);
    });

    test('marks a tiny burst (a click or cough) as too short to send', () {
      final vad = Vad();
      _feed(vad, _quiet, 800);
      _feed(vad, _loud, 160);
      final end = _feed(vad, _quiet, 2000);
      expect(end, hasLength(1));
      expect((end.single as SpeechEnd).tooShort, isTrue);
    });

    test('learns a noisy room from the moment the mic opens', () {
      final vad = Vad()..startCalibration();
      expect(_feed(vad, 0.02, 8000), isEmpty);
      expect(vad.threshold(false), greaterThan(0.04));
      expect(_feed(vad, 0.3, 800).single, isA<SpeechStart>());
    });
  });

  group('Vad: talking over the teacher', () {
    test('needs a longer, louder burst while the teacher is speaking', () {
      final vad = Vad();
      _feed(vad, _quiet, 800);
      expect(_feed(vad, vad.threshold(false) * 1.5, 3000, aiSpeaking: true), isEmpty);
      expect(_feed(vad, _loud, 160, aiSpeaking: true), isEmpty);
    });

    test('lets the student interrupt with a clear, sustained voice', () {
      final vad = Vad();
      _feed(vad, _quiet, 800);
      final events = _feed(vad, _loud, 1000, aiSpeaking: true);
      expect(events, hasLength(1));
      expect((events.single as SpeechStart).bargeIn, isTrue);
    });
  });

  group('audio packaging', () {
    test('measures loudness of 16-bit PCM', () {
      expect(pcm16Rms(Uint8List(0)), 0);
      expect(pcm16Rms(_pcm(0.5)), closeTo(0.5, 0.01));
    });

    test('writes a valid 16-bit mono WAV around the audio', () {
      final pcm = _pcm(0.1, ms: 100);
      final wav = wrapPcm16AsWav(pcm);
      expect(wav.lengthInBytes, 44 + pcm.lengthInBytes);
      final v = ByteData.sublistView(wav);
      String tag(int o) => String.fromCharCodes(wav.sublist(o, o + 4));
      expect([tag(0), tag(8), tag(12), tag(36)], ['RIFF', 'WAVE', 'fmt ', 'data']);
      expect(v.getUint32(24, Endian.little), liveSampleRate);
      expect(v.getUint16(22, Endian.little), 1);
      expect(v.getUint32(40, Endian.little), pcm.lengthInBytes);
    });

    test('joins chunks in order', () {
      expect(concatPcm([Uint8List.fromList([1, 2]), Uint8List.fromList([3])]), [1, 2, 3]);
    });
  });

  group('LiveVoiceController', () {
    late List<({Uint8List wav, int ms})> utterances;
    late int barges;
    late bool aiSpeaking;

    LiveVoiceController make(_FakeLiveVoiceClient client) {
      utterances = [];
      barges = 0;
      aiSpeaking = false;
      return LiveVoiceController(
        client: client,
        onUtterance: (wav, ms) => utterances.add((wav: wav, ms: ms)),
        onBargeIn: () => barges++,
        isAiSpeaking: () => aiSpeaking,
      );
    }

    void feed(LiveVoiceController c, double amp, int ms) {
      for (var t = 0.0; t < ms; t += _frame) {
        c.handleFrame(_pcm(amp));
      }
    }

    test('opens the mic and starts listening', () async {
      final client = _FakeLiveVoiceClient();
      final c = make(client);
      expect(c.status, LiveStatus.off);
      await c.start();
      expect(c.status, LiveStatus.listening);
      expect(c.isLive, isTrue);
      c.dispose();
    });

    test('says so when permission is refused, and when the mic cannot start', () async {
      final denied = make(_FakeLiveVoiceClient(permission: false));
      await denied.start();
      expect(denied.status, LiveStatus.denied);
      denied.dispose();

      final broken = make(_FakeLiveVoiceClient(startThrows: true));
      await broken.start();
      expect(broken.status, LiveStatus.error);
      broken.dispose();
    });

    test('sends a finished sentence on its own, as a WAV file', () async {
      final c = make(_FakeLiveVoiceClient());
      await c.start();
      feed(c, _quiet, 800);
      feed(c, _loud, 2000);
      expect(c.status, LiveStatus.hearing);
      feed(c, _quiet, 1300);
      expect(c.status, LiveStatus.listening);
      expect(utterances, hasLength(1));
      final u = utterances.single;
      expect(String.fromCharCodes(u.wav.sublist(0, 4)), 'RIFF');
      // 2 s of speech + about 0.4 s lead-in + 1.1 s of trailing quiet.
      expect(u.ms, inInclusiveRange(3000, 4200));
      c.dispose();
    });

    test('ignores a cough', () async {
      final c = make(_FakeLiveVoiceClient());
      await c.start();
      feed(c, _quiet, 800);
      feed(c, _loud, 160);
      feed(c, _quiet, 2000);
      expect(utterances, isEmpty);
      c.dispose();
    });

    test('sends nothing while muted, and works again when unmuted', () async {
      final c = make(_FakeLiveVoiceClient());
      await c.start();
      feed(c, _quiet, 800);
      c.setMuted(true);
      expect(c.isLive, isFalse);
      feed(c, _loud, 2000);
      feed(c, _quiet, 1500);
      expect(utterances, isEmpty);
      c.setMuted(false);
      feed(c, _quiet, 600);
      feed(c, _loud, 1000);
      feed(c, _quiet, 1500);
      expect(utterances, hasLength(1));
      c.dispose();
    });

    test('talking over the teacher stops the teacher once, and the sentence is still sent', () async {
      final c = make(_FakeLiveVoiceClient());
      await c.start();
      feed(c, _quiet, 800);
      aiSpeaking = true;
      feed(c, _loud, 1000);
      expect(barges, 1);
      aiSpeaking = false; // the teacher was cut off
      feed(c, _quiet, 1300);
      expect(utterances, hasLength(1));
      c.dispose();
    });

    test('stop closes the mic', () async {
      final client = _FakeLiveVoiceClient();
      final c = make(client);
      await c.start();
      await c.stop();
      expect(c.status, LiveStatus.off);
      expect(client.stopped, isTrue);
      c.dispose();
      expect(client.disposed, isTrue);
    });
  });
}
