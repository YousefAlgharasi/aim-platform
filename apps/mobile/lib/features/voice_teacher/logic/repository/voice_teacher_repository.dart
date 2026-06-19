import '../entity/voice_message.dart';
import '../entity/voice_session.dart';

abstract class VoiceTeacherRepository {
  Future<String> startSession({String? contextRef});
  Future<List<VoiceSession>> listSessions();
  Future<List<VoiceMessage>> getSessionHistory(String sessionId);
  Future<VoiceMessage> submitAudio(String sessionId, List<int> audioBytes, String mimeType);
  Future<List<int>> getAudioPlayback(String audioRef);
  Future<void> submitFeedback({
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
