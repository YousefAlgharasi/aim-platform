import 'dart:typed_data';

import 'package:flutter/foundation.dart';

enum PlaybackState { idle, loading, playing, paused, completed, error }

class VoicePlaybackNotifier extends ChangeNotifier {
  PlaybackState _state = PlaybackState.idle;
  String? _currentAudioRef;
  double _progress = 0.0;
  String? _duration;
  String? _errorMessage;

  PlaybackState get state => _state;
  String? get currentAudioRef => _currentAudioRef;
  double get progress => _progress;
  String? get duration => _duration;
  String? get errorMessage => _errorMessage;

  Future<void> loadAndPlay({
    required String audioRef,
    required Future<Uint8List> Function(String audioRef) fetchAudioFn,
  }) async {
    if (_currentAudioRef == audioRef && _state == PlaybackState.paused) {
      resume();
      return;
    }

    _currentAudioRef = audioRef;
    _state = PlaybackState.loading;
    _progress = 0.0;
    _errorMessage = null;
    notifyListeners();

    try {
      await fetchAudioFn(audioRef);
      _state = PlaybackState.playing;
      notifyListeners();
    } catch (e) {
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
      _state = PlaybackState.paused;
      notifyListeners();
    }
  }

  void resume() {
    if (_state == PlaybackState.paused) {
      _state = PlaybackState.playing;
      notifyListeners();
    }
  }

  void complete() {
    _state = PlaybackState.completed;
    _progress = 1.0;
    notifyListeners();
  }

  void replay() {
    _progress = 0.0;
    _state = PlaybackState.playing;
    notifyListeners();
  }

  void stop() {
    _state = PlaybackState.idle;
    _currentAudioRef = null;
    _progress = 0.0;
    _duration = null;
    notifyListeners();
  }

  bool isPlayingRef(String audioRef) =>
      _currentAudioRef == audioRef &&
      (_state == PlaybackState.playing || _state == PlaybackState.loading);
}
