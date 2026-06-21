import 'dart:typed_data';

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/start_voice_session_response_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_audio_submit_response_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_message_model.dart';
import 'package:aim_mobile/features/voice_teacher/data/models/voice_session_model.dart';

import 'voice_teacher_remote_datasource.dart';

class VoiceTeacherRemoteDatasourceImpl implements VoiceTeacherRemoteDatasource {
  const VoiceTeacherRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<StartVoiceSessionResponseModel> startSession({
    required String bearerToken,
    String? contextRef,
  }) async {
    final body = <String, dynamic>{};
    if (contextRef != null) body['contextRef'] = contextRef;

    final response = await _apiClient.post(
      '/voice-teacher/sessions',
      bearerToken: bearerToken,
      body: body,
    );
    return StartVoiceSessionResponseModel.fromJson(
      response as Map<String, dynamic>,
    );
  }

  @override
  Future<List<VoiceSessionModel>> listSessions({
    required String bearerToken,
  }) async {
    final response = await _apiClient.get(
      '/voice-teacher/sessions',
      bearerToken: bearerToken,
    );
    final list = (response as Map<String, dynamic>)['sessions'] as List;
    return list
        .map((e) => VoiceSessionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<VoiceMessageModel>> getSessionHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final response = await _apiClient.get(
      '/voice-teacher/sessions/$sessionId/messages',
      bearerToken: bearerToken,
    );
    final list = (response as Map<String, dynamic>)['messages'] as List;
    return list
        .map((e) => VoiceMessageModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<VoiceAudioSubmitResponseModel> submitAudio({
    required String bearerToken,
    required String sessionId,
    required Uint8List audioBytes,
    required String mimeType,
  }) async {
    final response = await _apiClient.postMultipart(
      '/voice-teacher/sessions/$sessionId/audio',
      bearerToken: bearerToken,
      fileBytes: audioBytes,
      fileName: 'audio',
      mimeType: mimeType,
    );
    return VoiceAudioSubmitResponseModel.fromJson(
      response as Map<String, dynamic>,
    );
  }

  @override
  Future<Uint8List> getAudioPlayback({
    required String bearerToken,
    required String audioRef,
  }) async {
    final response = await _apiClient.getBytes(
      '/voice-teacher/audio/$audioRef',
      bearerToken: bearerToken,
    );
    return response;
  }

  @override
  Future<void> submitFeedback({
    required String bearerToken,
    required String sessionId,
    required String messageId,
    required String rating,
    String? comment,
  }) async {
    final body = <String, dynamic>{
      'messageId': messageId,
      'rating': rating,
      if (comment != null) 'comment': comment,
    };
    await _apiClient.post(
      '/voice-teacher/sessions/$sessionId/feedback',
      bearerToken: bearerToken,
      body: body,
    );
  }
}
