import 'package:aim_mobile/features/voice_teacher/data/datasources/voice_player_client_impl.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('detectAudioFormat', () {
    test('MPEG frame (the backend\'s stored TTS MP3) is mp3', () {
      final format = detectAudioFormat([0xFF, 0xF3, 0x64, 0xC4]);
      expect(format.extension, 'mp3');
      expect(format.mimeType, 'audio/mpeg');
    });

    test('ID3-tagged MP3 is mp3', () {
      expect(detectAudioFormat([0x49, 0x44, 0x33, 4, 0]).extension, 'mp3');
    });

    test('Ogg is ogg', () {
      expect(detectAudioFormat([0x4F, 0x67, 0x67, 0x53, 0]).extension, 'ogg');
    });

    test('RIFF/WAVE (live voice replies, older stored audio) is wav', () {
      final format = detectAudioFormat('RIFF\u0000\u0000\u0000\u0000WAVE'.codeUnits);
      expect(format.extension, 'wav');
      expect(format.mimeType, 'audio/wav');
    });

    test('empty or unknown bytes fall back to wav, as before', () {
      expect(detectAudioFormat(const []).extension, 'wav');
      expect(detectAudioFormat([0x00, 0x01]).extension, 'wav');
    });
  });
}
