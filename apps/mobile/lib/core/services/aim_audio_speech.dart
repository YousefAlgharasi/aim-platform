import 'package:flutter/foundation.dart';

import 'aim_audio_speech_stub.dart'
    if (dart.library.js_interop) 'aim_audio_speech_web.dart' as impl;

class AimAudioSpeech {
  const AimAudioSpeech._();

  /// Speaks the given [text] in [lang] (default 'en-US').
  /// Invokes [onComplete] when speech finishes.
  static Future<void> speak({
    required String text,
    String lang = 'en-US',
    VoidCallback? onComplete,
    VoidCallback? onError,
  }) async {
    await impl.speakText(
      text: text,
      lang: lang,
      onComplete: onComplete,
      onError: onError,
    );
  }

  /// Stops any ongoing speech.
  static Future<void> stop() async {
    await impl.stopSpeech();
  }
}
