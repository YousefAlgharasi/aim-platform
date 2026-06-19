import 'dart:typed_data';

import 'package:aim_mobile/features/voice_teacher/data/models/start_voice_session_response_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_audio_submit_response_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_message_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_session_model.dart';

abstract class VoiceTeacherRemoteDatasource {
  /// POST /voice-teacher/sessions
  Future<StartVoiceSessionResponseModel> startSession({
    required String bearerToken,
    String? contextRef,
  });

  /// GET /voice-teacher/sessions
  Future<List<VoiceSessionModel>> listSessions({
    required String bearerToken,
  });

  /// GET /voice-teacher/sessions/:sessionId/messages
  Future<List<VoiceMessageModel>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  });

  /// POST /voice-teacher/sessions/:sessionId/audio
  Future<VoiceAudioSubmitResponseModel> submitAudio({
    required String bearerToken,
    required String sessionId,
    required Uint8List audioBytes,
    required String mimeType,
  });

  /// GET /voice-teacher/audio/:audioRef
  Future<Uint8List> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  });

  /// POST /voice-teacher/sessions/:sessionId/feedback
  Future<void> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  });
}
