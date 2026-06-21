// Phase 8 — P8-083
// AiTeacherChatRepositoryImpl — wraps the backend-only AI Teacher datasource.
//
// This class performs no prompt building, provider calls, or AIM calculations.
// It passes backend-owned chat data through verbatim and maps API transport
// errors into AppException for the logic/UI layers.

import 'package:aim_mobile/core/errors/app_exception.dart';
import 'package:aim_mobile/core/networking/api_client_exception.dart';
import 'package:aim_mobile/features/ai_teacher/data/datasources/ai_teacher_remote_datasource.dart';
import 'package:aim_mobile/features/ai_teacher/data/models/ai_teacher_chat_models.dart';
import 'package:aim_mobile/features/ai_teacher/logic/entity/ai_teacher_stream_event.dart';
import 'package:aim_mobile/features/ai_teacher/logic/repository/ai_teacher_chat_repository.dart';

class AiTeacherChatRepositoryImpl implements AiTeacherChatRepository {
  const AiTeacherChatRepositoryImpl({
    required AiTeacherRemoteDatasource datasource,
  }) : _datasource = datasource;

  final AiTeacherRemoteDatasource _datasource;

  @override
  Future<AiChatSessionModel> startSession({
    required String bearerToken,
    required String contextRef,
  }) =>
      _wrap(() => _datasource.startSession(
            bearerToken: bearerToken,
            contextRef: contextRef,
          ));

  @override
  Future<List<AiChatSessionSummaryModel>> listSessions({
    required String bearerToken,
  }) =>
      _wrap(() => _datasource.listSessions(bearerToken: bearerToken));

  @override
  Future<AiTeacherReplyModel> sendMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) =>
      _wrap(() => _datasource.sendMessage(
            bearerToken: bearerToken,
            sessionId: sessionId,
            message: message,
          ));

  @override
  Future<AiChatHistoryModel> getHistory({
    required String bearerToken,
    required String sessionId,
  }) =>
      _wrap(() => _datasource.getHistory(
            bearerToken: bearerToken,
            sessionId: sessionId,
          ));

  @override
  Future<AiTeacherFeedbackModel> submitFeedback({
    required String bearerToken,
    required String messageId,
    required String rating,
  }) =>
      _wrap(() => _datasource.submitFeedback(
            bearerToken: bearerToken,
            messageId: messageId,
            rating: rating,
          ));

  @override
  Stream<AiTeacherStreamEvent> streamMessage({
    required String bearerToken,
    required String sessionId,
    required String message,
  }) {
    return _datasource
        .streamMessage(
          bearerToken: bearerToken,
          sessionId: sessionId,
          message: message,
        )
        .handleError((Object error, StackTrace stackTrace) {
      if (error is ApiClientException) {
        throw AppException(code: error.code, message: error.message);
      }
      throw error;
    });
  }

  @override
  Future<AiTeacherSafetyStatusModel> getSafetyStatus({
    required String bearerToken,
    required String sessionId,
  }) =>
      _wrap(() => _datasource.getSafetyStatus(
            bearerToken: bearerToken,
            sessionId: sessionId,
          ));

  Future<T> _wrap<T>(Future<T> Function() call) async {
    try {
      return await call();
    } on ApiClientException catch (e) {
      throw AppException(code: e.code, message: e.message);
    }
  }
}
