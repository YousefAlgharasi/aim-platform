// Non-web (mobile/desktop/test) stub implementation of Speech
import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

AudioPlayer? _player;

Future<void> speakText({
  required String text,
  required String lang,
  VoidCallback? onComplete,
  VoidCallback? onError,
}) async {
  try {
    _player ??= AudioPlayer();
    await _player!.stop();
    final encoded = Uri.encodeComponent(text);
    final url =
        'https://translate.google.com/translate_tts?ie=UTF-8&q=$encoded&tl=$lang&client=tw-ob';
    await _player!.play(UrlSource(url));
    _player!.onPlayerComplete.first.then((_) {
      onComplete?.call();
    });
  } catch (e) {
    onError?.call();
  }
}

Future<void> stopSpeech() async {
  try {
    await _player?.stop();
  } catch (_) {}
}
