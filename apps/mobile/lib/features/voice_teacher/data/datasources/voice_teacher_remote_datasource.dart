import '../models/voice_message_model.dart';
import '../models/voice_session_model.dart';

abstract class VoiceTeacherRemoteDatasource {
  Future<String> startSession({String? contextRef});
  Future<List<VoiceSessionModel>> listSessions();
  Future<List<VoiceMessageModel>> getSessionHistory(String sessionId);
  Future<VoiceMessageModel> submitAudio(String sessionId, List<int> audioBytes, String mimeType);
  Future<List<int>> getAudioPlayback(String audioRef);
  Future<void> submitFeedback({
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
