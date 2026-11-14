import 'dart:typed_data';

/// The always-open microphone behind the live conversation. The concrete implementation (in data/) uses the `record`
/// plugin; tests use a fake that feeds synthetic audio, because the plugin needs a real platform channel.
abstract class LiveVoiceClient {
  /// Checks (and, per the `record` package's own default, requests if not yet granted) microphone permission.
  Future<bool> hasPermission();

  /// Opens the microphone and returns a continuous stream of 16 kHz, mono, 16-bit little-endian PCM audio, with echo
  /// cancellation and noise suppression where the platform offers them.
  Future<Stream<Uint8List>> start();

  Future<void> stop();

  void dispose();
}
