// Bugfix: thin seam over the `audioplayers` package's `AudioPlayer`.
//
// Like `record`'s AudioRecorder, `AudioPlayer`'s own constructor calls into
// a real platform channel (`_create()`), so it cannot be constructed at all
// in a widget test with no platform channel registered. This interface
// lets VoicePlaybackNotifier depend on just the operations it actually
// needs, so widget tests can inject a trivial fake
// (voice_teacher_page_test.dart) without ever touching the real plugin,
// while production uses [RealVoicePlayerClient], which creates the real
// [AudioPlayer] lazily on first use.
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';

abstract class VoicePlayerClient {
  /// Plays the given audio bytes immediately (replacing whatever was
  /// previously loaded).
  Future<void> playBytes(Uint8List bytes);

  Future<void> pause();

  /// Resumes a paused player. No-op if nothing was ever played.
  Future<void> resume();

  Future<void> stop();

  /// Fires once when the currently-playing audio finishes on its own
  /// (never fires on an explicit stop()/pause()).
  Stream<void> get onComplete;

  void dispose();
}

class RealVoicePlayerClient implements VoicePlayerClient {
  AudioPlayer? _player;
  AudioPlayer get _instance => _player ??= AudioPlayer();

  @override
  Future<void> playBytes(Uint8List bytes) => _instance.play(BytesSource(bytes));

  @override
  Future<void> pause() => _instance.pause();

  @override
  Future<void> resume() => _instance.resume();

  @override
  Future<void> stop() => _instance.stop();

  @override
  Stream<void> get onComplete => _instance.onPlayerComplete;

  @override
  void dispose() {
    _player?.dispose();
  }
}
