// Data layer — concrete implementation of [VoicePlayerClient].
//
// Lives in data/ because it depends on the `audioplayers` third-party
// package — an infrastructure concern. The abstract interface
// [VoicePlayerClient] remains in logic/ (domain) so that notifiers and
// tests can depend only on the interface without touching any plugin.
import 'dart:io';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';

import '../../logic/voice_player_client.dart';

/// Container format of [bytes], from their leading bytes: stored TTS audio is
/// MP3, live voice replies are WAV. Players pick a decoder from the file
/// extension, so writing MP3 into a `.wav` file can fail on some devices.
({String extension, String mimeType}) detectAudioFormat(List<int> bytes) {
  final isId3 = bytes.length >= 3 && bytes[0] == 0x49 && bytes[1] == 0x44 && bytes[2] == 0x33;
  final isMpegFrame = bytes.length >= 2 && bytes[0] == 0xFF && (bytes[1] & 0xE0) == 0xE0;
  if (isId3 || isMpegFrame) return (extension: 'mp3', mimeType: 'audio/mpeg');
  final isOgg = bytes.length >= 4 && bytes[0] == 0x4F && bytes[1] == 0x67 && bytes[2] == 0x67 && bytes[3] == 0x53;
  if (isOgg) return (extension: 'ogg', mimeType: 'audio/ogg');
  return (extension: 'wav', mimeType: 'audio/wav');
}

class RealVoicePlayerClient implements VoicePlayerClient {
  AudioPlayer? _player;
  AudioPlayer get _instance => _player ??= AudioPlayer();

  @override
  Future<void> playBytes(Uint8List bytes) async {
    final format = detectAudioFormat(bytes);
    try {
      final tempDir = await getTemporaryDirectory();
      final tempFile = File('${tempDir.path}/voice_audio_${DateTime.now().millisecondsSinceEpoch}.${format.extension}');
      await tempFile.writeAsBytes(bytes, flush: true);
      await _instance.play(DeviceFileSource(tempFile.path));
    } catch (_) {
      await _instance.play(BytesSource(bytes, mimeType: format.mimeType));
    }
  }

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
