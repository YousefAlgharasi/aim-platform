import '../models/start_voice_session_response_model.dart';
import '../models/voice_audio_submit_response_model.dart';
import '../models/voice_feedback_response_model.dart';
import '../models/voice_message_model.dart';
import '../models/voice_session_model.dart';

abstract class VoiceTeacherRemoteDatasource {
  Future<StartVoiceSessionResponseModel> startSession({
    required String bearerToken,
    required String contextRef,
  });

  Future<List<VoiceSessionModel>> listSessions({required String bearerToken});

  Future<List<VoiceMessageModel>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  });

  Future<VoiceAudioSubmitResponseModel> submitAudio({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  });

  Future<List<int>> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  });

  /// A typed student turn. Voice and text turns share one session, so this posts to the AI Teacher message endpoint
  /// of the same session id; the reply has the same shape as a voice turn's (without an audioRef).
  Future<VoiceAudioSubmitResponseModel> submitText({
    required String bearerToken,
    required String sessionId,
    required String message,
  });

  /// Spoken audio for a teacher message that has no stored recording yet.
  Future<List<int>> getMessageAudio({
    required String bearerToken,
    required String messageId,
  });

  Future<VoiceFeedbackResponseModel> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
