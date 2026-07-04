import 'dart:async';

import 'package:flutter/foundation.dart';

import '../voice_player_client.dart';

enum PlaybackState { idle, loading, playing, paused, completed, error }

class VoicePlaybackNotifier extends ChangeNotifier {
  // Bugfix: loadAndPlay previously only fetched the audio bytes and flipped
  // the state to "playing" without ever actually playing them through any
  // audio output — there was no audio player anywhere in this class. stop/
  // pause/resume had the same problem: they mutated state but never
  // controlled real playback, so barge-in's "stop playback immediately"
  // never actually stopped any sound either. [player] is injectable for
  // widget tests, which have no real platform channel to back
  // audioplayers' AudioPlayer (its own constructor already calls one).
  VoicePlaybackNotifier({VoicePlayerClient? player})
      : _player = player ?? RealVoicePlayerClient() {
    _completeSubscription = _player.onComplete.listen((_) => complete());
  }

  final VoicePlayerClient _player;
  late final StreamSubscription<void> _completeSubscription;

  PlaybackState _state = PlaybackState.idle;
  String? _currentAudioRef;
  double _progress = 0.0;
  String? _duration;
  String? _errorMessage;

  /// Fires once, the instant *this specific* playback finishes naturally
  /// (never on an explicit stop()/pause()) — lets a caller chain "and then
  /// start listening for the student's next turn" without the caller
  /// needing to diff provider state externally.
  VoidCallback? _onFinished;

  PlaybackState get state => _state;
  String? get currentAudioRef => _currentAudioRef;
  double get progress => _progress;
  String? get duration => _duration;
  String? get errorMessage => _errorMessage;

  Future<void> loadAndPlay({
    required String audioRef,
    required Future<Uint8List> Function(String audioRef) fetchAudioFn,
    VoidCallback? onFinished,
  }) async {
    if (_currentAudioRef == audioRef && _state == PlaybackState.paused) {
      resume();
      return;
    }

    _onFinished = onFinished;
    _currentAudioRef = audioRef;
    _state = PlaybackState.loading;
    _progress = 0.0;
    _errorMessage = null;
    notifyListeners();

    try {
      final bytes = await fetchAudioFn(audioRef);
      await _player.playBytes(bytes);
      _state = PlaybackState.playing;
      notifyListeners();
    } catch (e) {
      _onFinished = null;
      _state = PlaybackState.error;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void updateProgress(double value) {
    _progress = value.clamp(0.0, 1.0);
    notifyListeners();
  }

  void updateDuration(String durationStr) {
    _duration = durationStr;
    notifyListeners();
  }

  void pause() {
    if (_state == PlaybackState.playing) {
      unawaited(_player.pause());
      _state = PlaybackState.paused;
      notifyListeners();
    }
  }

  void resume() {
    if (_state == PlaybackState.paused) {
      unawaited(_player.resume());
      _state = PlaybackState.playing;
      notifyListeners();
    }
  }

  void complete() {
    _state = PlaybackState.completed;
    _progress = 1.0;
    final callback = _onFinished;
    _onFinished = null;
    notifyListeners();
    callback?.call();
  }

  void replay() {
    _progress = 0.0;
    _state = PlaybackState.playing;
    notifyListeners();
  }

  void stop() {
    // An explicit stop (e.g. barge-in) is not a natural finish — never fire
    // a pending onFinished continuation (e.g. "start listening next") for
    // audio that was deliberately cut off instead of allowed to end.
    _onFinished = null;
    unawaited(_player.stop());
    _state = PlaybackState.idle;
    _currentAudioRef = null;
    _progress = 0.0;
    _duration = null;
    notifyListeners();
  }

  bool isPlayingRef(String audioRef) =>
      _currentAudioRef == audioRef &&
      (_state == PlaybackState.playing || _state == PlaybackState.loading);

  @override
  void dispose() {
    unawaited(_completeSubscription.cancel());
    _player.dispose();
    super.dispose();
  }
}
