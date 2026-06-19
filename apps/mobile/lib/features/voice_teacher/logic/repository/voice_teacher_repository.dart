import 'dart:typed_data';

import '../entity/voice_message.dart';
import '../entity/voice_session.dart';

abstract class VoiceTeacherRepository {
  Future<String> startSession({String? contextRef});
  Future<List<VoiceSession>> listSessions();
  Future<List<VoiceMessage>> getSessionHistory(String sessionId);
  Future<({VoiceMessage studentMessage, VoiceMessage teacherMessage, String? audioRef})> submitAudio({
    required String sessionId,
    required Uint8List audioBytes,
    required String mimeType,
  });
  Future<Uint8List> getAudioPlayback(String audioRef);
  Future<void> submitFeedback({
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
