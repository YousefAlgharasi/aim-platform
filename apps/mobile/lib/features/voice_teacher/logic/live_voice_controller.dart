// LiveVoiceController — a live, hands-free microphone for the voice lesson.
//
// While it is on, it hears when the student starts and stops talking, hands over each finished sentence as a WAV
// file, and reports when the student talks over the teacher. Muting only ignores the mic (the stream stays open), so
// turning it back on is instant. Same behaviour as the student web app's useLiveVoice.

import 'dart:async';

import 'package:flutter/foundation.dart';

import 'live_voice_client.dart';
import 'live_voice_engine.dart';

enum LiveStatus { off, starting, listening, hearing, denied, error }

class LiveVoiceController extends ChangeNotifier {
  LiveVoiceController({
    required LiveVoiceClient client,
    required this.onUtterance,
    required this.onBargeIn,
    required this.isAiSpeaking,
    Vad? vad,
  })  : _client = client,
        _vad = vad ?? Vad();

  final LiveVoiceClient _client;
  final Vad _vad;

  /// The student finished a sentence: a complete WAV file and its length.
  final void Function(Uint8List wav, int durationMs) onUtterance;

  /// The student started talking over the teacher: stop the teacher's audio now.
  final VoidCallback onBargeIn;

  /// Is the teacher's audio playing right now?
  final bool Function() isAiSpeaking;

  static const int _prerollMs = 450;

  LiveStatus _status = LiveStatus.off;
  double _level = 0;
  bool _muted = false;
  StreamSubscription<Uint8List>? _sub;
  final List<Uint8List> _preroll = [];
  double _prerollMsTotal = 0;
  final List<Uint8List> _sentence = [];
  DateTime _lastLevelAt = DateTime.fromMillisecondsSinceEpoch(0);
  bool _disposed = false;

  LiveStatus get status => _status;

  /// How loud the student is right now (0..1), for a gentle visual cue.
  double get level => _level;
  bool get muted => _muted;

  /// True while the microphone is open and not muted.
  bool get isLive => (_status == LiveStatus.listening || _status == LiveStatus.hearing) && !_muted;

  void _set(LiveStatus status) {
    if (_status == status) return;
    _status = status;
    if (!_disposed) notifyListeners();
  }

  Future<void> start() async {
    if (_sub != null || _status == LiveStatus.starting) return;
    _set(LiveStatus.starting);
    try {
      if (!await _client.hasPermission()) {
        _set(LiveStatus.denied);
        return;
      }
      final stream = await _client.start();
      _vad
        ..reset()
        ..startCalibration();
      _sub = stream.listen(handleFrame, onError: (_) => _fail(), onDone: () {
        _sub = null;
        if (_status != LiveStatus.denied) _set(LiveStatus.off);
      });
      _set(LiveStatus.listening);
    } catch (_) {
      _fail();
    }
  }

  void _fail() {
    unawaited(_close());
    _set(LiveStatus.error);
  }

  Future<void> stop() async {
    await _close();
    if (_status != LiveStatus.denied) _set(LiveStatus.off);
  }

  Future<void> _close() async {
    await _sub?.cancel();
    _sub = null;
    try {
      await _client.stop();
    } catch (_) {
      // Already stopped.
    }
    _preroll.clear();
    _prerollMsTotal = 0;
    _sentence.clear();
    _vad.reset();
    _level = 0;
  }

  /// Turns the mic off or on without closing it.
  void setMuted(bool muted) {
    if (_muted == muted) return;
    _muted = muted;
    if (muted) {
      _vad.reset();
      _sentence.clear();
      _preroll.clear();
      _prerollMsTotal = 0;
      if (_status == LiveStatus.hearing) _set(LiveStatus.listening);
    }
    if (!_disposed) notifyListeners();
  }

  /// One buffer of PCM from the microphone. Public so tests can feed synthetic audio.
  @visibleForTesting
  void handleFrame(Uint8List frame) {
    final frameMs = frame.lengthInBytes / 2 / liveSampleRate * 1000;
    final rms = _muted ? 0.0 : pcm16Rms(frame);

    final now = DateTime.now();
    if (now.difference(_lastLevelAt).inMilliseconds > 90) {
      _lastLevelAt = now;
      _level = (rms * 8).clamp(0.0, 1.0);
      if (!_disposed) notifyListeners();
    }
    if (_muted) return;

    final event = _vad.process(rms, frameMs, isAiSpeaking());

    if (event is SpeechStart) {
      _sentence
        ..clear()
        ..addAll(_preroll)
        ..add(frame);
      _preroll.clear();
      _prerollMsTotal = 0;
      _set(LiveStatus.hearing);
      if (event.bargeIn) onBargeIn();
      return;
    }
    if (_vad.talking || event is SpeechEnd) {
      _sentence.add(frame);
      if (event is SpeechEnd) {
        final pcm = concatPcm(_sentence);
        _sentence.clear();
        _set(LiveStatus.listening);
        if (!event.tooShort) {
          onUtterance(wrapPcm16AsWav(pcm), (pcm.lengthInBytes / 2 / liveSampleRate * 1000).round());
        }
      }
      return;
    }

    // Nobody talking: keep the last moments so the first word of the next sentence is not cut off.
    _preroll.add(frame);
    _prerollMsTotal += frameMs;
    while (_prerollMsTotal > _prerollMs && _preroll.length > 1) {
      _prerollMsTotal -= _preroll.removeAt(0).lengthInBytes / 2 / liveSampleRate * 1000;
    }
  }

  @override
  void dispose() {
    _disposed = true;
    unawaited(_close());
    _client.dispose();
    super.dispose();
  }
}
