// Domain layer — abstract interface for audio playback.
//
// This interface lives in logic/ (domain) so that notifiers and widget tests
// can depend on it without touching any Flutter plugin. The concrete
// production implementation [RealVoicePlayerClient] lives in
// data/datasources/voice_player_client_impl.dart.
import 'dart:typed_data';

abstract class VoicePlayerClient {
  /// Plays the given audio bytes immediately (replacing whatever was
  /// previously loaded).
  Future<void> playBytes(Uint8List bytes);

  /// Plays audio from a URL source (e.g. TTS endpoint).
  Future<void> playUrl(String url);

  Future<void> pause();

  /// Resumes a paused player. No-op if nothing was ever played.
  Future<void> resume();

  Future<void> stop();

  /// Fires once when the currently-playing audio finishes on its own
  /// (never fires on an explicit stop()/pause()).
  Stream<void> get onComplete;

  void dispose();
}

