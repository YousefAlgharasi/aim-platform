// Voice Teacher remote datasource — concrete implementation.
//
// Every call below targets the backend NestJS API only. No STT/TTS/AI
// provider SDK, key, or endpoint is referenced anywhere in this file.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';

import '../models/start_voice_session_response_model.dart';
import '../models/voice_audio_submit_response_model.dart';
import '../models/voice_feedback_response_model.dart';
import '../models/voice_message_model.dart';
import '../models/voice_session_model.dart';
import 'voice_teacher_remote_datasource.dart';

class VoiceTeacherRemoteDatasourceImpl implements VoiceTeacherRemoteDatasource {
  const VoiceTeacherRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<StartVoiceSessionResponseModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    final envelope = await _apiClient.post<StartVoiceSessionResponseModel>(
      BackendApiPaths.voiceTeacherSessions,
      headers: {'authorization': 'Bearer $bearerToken'},
      body: {'contextRef': contextRef},
      decodeData: (json) =>
          StartVoiceSessionResponseModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<VoiceSessionModel>> listSessions({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<VoiceSessionModel>>(
      BackendApiPaths.voiceTeacherSessions,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) => VoiceSessionModel.listFromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<VoiceMessageModel>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final envelope = await _apiClient.get<List<VoiceMessageModel>>(
      BackendApiPaths.voiceTeacherSessionMessages(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) => VoiceMessageModel.listFromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<VoiceAudioSubmitResponseModel> submitAudio({
    required String bearerToken,
    required String sessionId,
    required List<int> audioBytes,
    required String mimeType,
  }) async {
    final envelope = await _apiClient.postMultipart<VoiceAudioSubmitResponseModel>(
      BackendApiPaths.voiceTeacherSessionAudio(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      fileBytes: audioBytes,
      fieldName: 'audio',
      fileName: 'audio',
      mimeType: mimeType,
      decodeData: (json) =>
          VoiceAudioSubmitResponseModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<int>> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  }) {
    return _apiClient.getBytes(
      BackendApiPaths.voiceTeacherAudio(audioRef),
      headers: {'authorization': 'Bearer $bearerToken'},
    );
  }

  @override
  Future<VoiceFeedbackResponseModel> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async {
    final envelope = await _apiClient.post<VoiceFeedbackResponseModel>(
      BackendApiPaths.voiceTeacherSessionFeedback(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      body: {
        'messageId': messageId,
        'rating': rating,
        if (comment != null) 'comment': comment,
      },
      decodeData: (json) =>
          VoiceFeedbackResponseModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected Voice Teacher response shape');
    }
    return json;
  }
}
