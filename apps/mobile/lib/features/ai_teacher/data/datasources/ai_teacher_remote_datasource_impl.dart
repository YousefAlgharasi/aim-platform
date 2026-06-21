// Phase 8 — P8-082
// AiTeacherRemoteDatasourceImpl — concrete implementation.
//
// Every call below targets the backend NestJS API only. No AI provider
// SDK, key, or endpoint is referenced anywhere in this file.

import 'package:aim_mobile/core/networking/backend_api_client.dart';
import 'package:aim_mobile/core/networking/backend_api_paths.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';
import 'ai_teacher_remote_datasource.dart';

class AiTeacherRemoteDatasourceImpl implements AiTeacherRemoteDatasource {
  const AiTeacherRemoteDatasourceImpl({required BackendApiClient apiClient})
      : _apiClient = apiClient;

  final BackendApiClient _apiClient;

  @override
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) async {
    final envelope = await _apiClient.post<AiChatSessionModel>(
      BackendApiPaths.aiTeacherSessions,
      headers: {'authorization': 'Bearer $bearerToken'},
      body: {'contextRef': contextRef},
      decodeData: (json) => AiChatSessionModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  }) async {
    final envelope = await _apiClient.get<List<AiChatSessionSummaryModel>>(
      BackendApiPaths.aiTeacherSessions,
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) =>
          AiChatSessionSummaryModel.listFromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) async {
    final envelope = await _apiClient.post<AiTeacherReplyModel>(
      BackendApiPaths.aiTeacherSessionMessages(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      body: {'message': message},
      decodeData: (json) => AiTeacherReplyModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  }) async {
    final envelope = await _apiClient.get<AiChatHistoryModel>(
      BackendApiPaths.aiTeacherSessionMessages(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) => AiChatHistoryModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) async {
    final envelope = await _apiClient.post<AiTeacherFeedbackModel>(
      BackendApiPaths.aiTeacherMessageFeedback(messageId),
      headers: {'authorization': 'Bearer $bearerToken'},
      body: {'rating': rating},
      decodeData: (json) => AiTeacherFeedbackModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  @override
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) {
    return _apiClient
        .streamSse(
          BackendApiPaths.aiTeacherSessionMessagesStream(sessionId),
          headers: {'authorization': 'Bearer $bearerToken'},
          body: {'message': message},
        )
        .map(AiTeacherStreamEventModel.fromJson);
  }

  @override
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) async {
    final envelope = await _apiClient.get<AiTeacherSafetyStatusModel>(
      BackendApiPaths.aiTeacherSessionSafetyStatus(sessionId),
      headers: {'authorization': 'Bearer $bearerToken'},
      decodeData: (json) =>
          AiTeacherSafetyStatusModel.fromJson(_requireMap(json)),
    );
    return envelope.data!;
  }

  Map<String, dynamic> _requireMap(Object? json) {
    if (json is! Map<String, dynamic>) {
      throw const FormatException('Unexpected AI Teacher response shape');
    }
    return json;
  }
}
