// Web implementation of Speech Synthesis using Web Speech API
import 'dart:async';
import 'dart:js_interop';
import 'package:flutter/foundation.dart';

@JS('window.speechSynthesis.speak')
external void _speak(JSObject utterance);

@JS('window.speechSynthesis.cancel')
external void _cancel();

@JS('SpeechSynthesisUtterance')
extension type _SpeechSynthesisUtterance._(JSObject _) implements JSObject {
  external _SpeechSynthesisUtterance(JSString text);
  external set lang(JSString lang);
  external set onend(JSFunction onend);
  external set onerror(JSFunction onerror);
}

Future<void> speakText({
  required String text,
  required String lang,
  VoidCallback? onComplete,
  VoidCallback? onError,
}) async {
  try {
    _cancel();
    final utterance = _SpeechSynthesisUtterance(text.toJS);
    utterance.lang = lang.toJS;

    if (onComplete != null) {
      utterance.onend = (() {
        onComplete();
      }).toJS;
    }

    if (onError != null) {
      utterance.onerror = (() {
        onError();
      }).toJS;
    }

    _speak(utterance);
  } catch (e) {
    onError?.call();
  }
}

Future<void> stopSpeech() async {
  try {
    _cancel();
  } catch (_) {}
}
