// LiveVoiceController — the microphone of the voice lesson.
//
// Two ways to use it:
//  - Tap to talk (what the lesson screen uses): startRecording() opens the mic and keeps everything it hears;
//    finishRecording() closes the mic and hands over the whole recording as one WAV file. No speech detection is
//    involved, so it works whatever the phone's microphone level is.
//  - Hands-free (start()): it hears when the student starts and stops talking, hands over each finished sentence, and
//    reports when the student talks over the teacher. Muting only ignores the mic (the stream stays open). Same
//    behaviour as the student web app's useLiveVoice.

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

  /// A tap-to-talk recording shorter than this (ms) is an accidental tap: it is dropped, not sent.
  static const int minRecordingMs = 400;

  /// A tap-to-talk recording is sent by itself once it reaches this length (ms).
  static const int maxRecordingMs = 60000;

  LiveStatus _status = LiveStatus.off;
  double _level = 0;
  bool _muted = false;
  StreamSubscription<Uint8List>? _sub;
  final List<Uint8List> _preroll = [];
  double _prerollMsTotal = 0;
  final List<Uint8List> _sentence = [];
  DateTime _lastLevelAt = DateTime.fromMillisecondsSinceEpoch(0);
  bool _disposed = false;

  // Tap to talk: everything heard since startRecording().
  bool _recording = false;
  final List<Uint8List> _recorded = [];
  double _recordedMs = 0;

  /// Bumped by every stop/dispose. A start() still waiting for the permission or the microphone checks it afterwards,
  /// so a mic that was switched off (or a screen that was closed) meanwhile is released instead of left open.
  int _startToken = 0;

  LiveStatus get status => _status;

  /// How loud the student is right now (0..1), for a gentle visual cue.
  double get level => _level;
  bool get muted => _muted;

  /// True while a tap-to-talk recording is in progress.
  bool get isRecording => _recording;

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
    final token = ++_startToken;
    try {
      if (!await _client.hasPermission()) {
        if (token == _startToken) _set(LiveStatus.denied);
        return;
      }
      final stream = await _client.start();
      if (token != _startToken) {
        // Stopped (or the screen was left) while the microphone was opening.
        try {
          await _client.stop();
        } catch (_) {
          // Already stopped.
        }
        return;
      }
      _vad
        ..reset()
        ..startCalibration();
      _sub = stream.listen(handleFrame, onError: (_) => _fail(), onDone: () {
        _sub = null;
        if (_status != LiveStatus.denied) _set(LiveStatus.off);
      });
      _set(LiveStatus.listening);
    } catch (_) {
      if (token == _startToken) _fail();
    }
  }

  /// Tap to talk: opens the microphone and keeps everything it hears until [finishRecording].
  Future<void> startRecording() async {
    if (_sub != null || _status == LiveStatus.starting) return;
    _set(LiveStatus.starting);
    final token = ++_startToken;
    try {
      if (!await _client.hasPermission()) {
        if (token == _startToken) _set(LiveStatus.denied);
        return;
      }
      final stream = await _client.start();
      if (token != _startToken) {
        try {
          await _client.stop();
        } catch (_) {
          // Already stopped.
        }
        return;
      }
      _recording = true;
      _recorded.clear();
      _recordedMs = 0;
      _sub = stream.listen(_handleRecordingFrame, onError: (_) => _fail(), onDone: () {
        _sub = null;
        if (_recording) unawaited(finishRecording());
      });
      _set(LiveStatus.hearing);
    } catch (_) {
      if (token == _startToken) _fail();
    }
  }

  void _handleRecordingFrame(Uint8List frame) {
    if (!_recording) return;
    _recorded.add(frame);
    _recordedMs += frame.lengthInBytes / 2 / liveSampleRate * 1000;
    final now = DateTime.now();
    if (now.difference(_lastLevelAt).inMilliseconds > 90) {
      _lastLevelAt = now;
      _level = (pcm16Rms(frame) * 8).clamp(0.0, 1.0);
      if (!_disposed) notifyListeners();
    }
    if (_recordedMs >= maxRecordingMs) unawaited(finishRecording());
  }

  /// Tap to talk: closes the microphone and hands over the whole recording (unless it was just an accidental tap).
  Future<void> finishRecording() async {
    if (!_recording) return;
    final pcm = concatPcm(_recorded);
    final ms = (pcm.lengthInBytes / 2 / liveSampleRate * 1000).round();
    await stop();
    if (ms >= minRecordingMs && !_disposed) onUtterance(wrapPcm16AsWav(pcm), ms);
  }

  void _fail() {
    unawaited(_close());
    _set(LiveStatus.error);
  }

  Future<void> stop() async {
    _startToken++;
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
    _recording = false;
    _recorded.clear();
    _recordedMs = 0;
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
    _startToken++;
    unawaited(_close());
    _client.dispose();
    super.dispose();
  }
}
