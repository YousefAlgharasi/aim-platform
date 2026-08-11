// Data layer — concrete implementation of [VoicePlayerClient].
//
// Lives in data/ because it depends on the `audioplayers` third-party
// package — an infrastructure concern. The abstract interface
// [VoicePlayerClient] remains in logic/ (domain) so that notifiers and
// tests can depend only on the interface without touching any plugin.
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';

import '../../logic/voice_player_client.dart';

class RealVoicePlayerClient implements VoicePlayerClient {
  AudioPlayer? _player;
  AudioPlayer get _instance => _player ??= AudioPlayer();

  @override
  Future<void> playBytes(Uint8List bytes) => _instance.play(BytesSource(bytes));

  @override
  Future<void> playUrl(String url) => _instance.play(UrlSource(url));

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
