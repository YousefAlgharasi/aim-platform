import 'dart:typed_data';

import 'package:flutter/foundation.dart';

enum RecordSubmitState { idle, recording, submitting, success, error }

class VoiceRecordSubmitResult {
  final String? transcript;
  final String? aiResponseText;
  final String? audioRef;
  final String? fallbackText;
  final String? errorMessage;

  const VoiceRecordSubmitResult({
    this.transcript,
    this.aiResponseText,
    this.audioRef,
    this.fallbackText,
    this.errorMessage,
  });
}

class VoiceRecordSubmitNotifier extends ChangeNotifier {
  RecordSubmitState _state = RecordSubmitState.idle;
  VoiceRecordSubmitResult? _result;
  Uint8List? _recordedAudio;
  String _mimeType = 'audio/webm';

  RecordSubmitState get state => _state;
  VoiceRecordSubmitResult? get result => _result;

  void startRecording() {
    _state = RecordSubmitState.recording;
    _recordedAudio = null;
    _result = null;
    notifyListeners();
  }

  void stopRecording(Uint8List audioData, {String mimeType = 'audio/webm'}) {
    _recordedAudio = audioData;
    _mimeType = mimeType;
    _state = RecordSubmitState.idle;
    notifyListeners();
  }

  void cancelRecording() {
    _recordedAudio = null;
    _state = RecordSubmitState.idle;
    _result = null;
    notifyListeners();
  }

  Future<void> submitToBackend({
    required String sessionId,
    required Future<({String transcript, String aiResponseText, String? audioRef, String? fallbackText})>
        Function(String sessionId, Uint8List audio, String mimeType) submitFn,
  }) async {
    if (_recordedAudio == null || _recordedAudio!.isEmpty) return;

    _state = RecordSubmitState.submitting;
    notifyListeners();

    try {
      final response = await submitFn(sessionId, _recordedAudio!, _mimeType);
      _result = VoiceRecordSubmitResult(
        transcript: response.transcript,
        aiResponseText: response.aiResponseText,
        audioRef: response.audioRef,
        fallbackText: response.fallbackText,
      );
      _state = RecordSubmitState.success;
      _recordedAudio = null;
    } catch (e) {
      _result = VoiceRecordSubmitResult(errorMessage: e.toString());
      _state = RecordSubmitState.error;
    }

    notifyListeners();
  }

  void reset() {
    _state = RecordSubmitState.idle;
    _result = null;
    _recordedAudio = null;
    notifyListeners();
  }

  bool get hasRecordedAudio => _recordedAudio != null && _recordedAudio!.isNotEmpty;
}
