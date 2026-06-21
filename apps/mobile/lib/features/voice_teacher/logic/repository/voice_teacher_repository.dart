import '../entity/voice_feedback_result.dart';
import '../entity/voice_message.dart';
import '../entity/voice_session.dart';
import '../entity/voice_turn_result.dart';

abstract class VoiceTeacherRepository {
  Future<String> startSession({
    required String bearerToken,
    required String contextRef,
  });

  Future<List<VoiceSession>> listSessions({required String bearerToken});

  Future<List<VoiceMessage>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  });

  Future<VoiceTurnResult> submitAudio({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  });

  Future<List<int>> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  });

  Future<VoiceFeedbackResult> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
